use serde::{Deserialize, Serialize};
use std::sync::{Mutex, OnceLock};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DesktopSessionNotification {
    title: String,
    body: String,
    session_id: String,
    sound: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopSessionNotificationOpen {
    session_id: String,
}

fn open_desktop_session_notification(app: &AppHandle, session_id: String) {
    let payload = DesktopSessionNotificationOpen { session_id };

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
        let _ = window.emit("happy-session-notification-open", payload);
    }
}

#[cfg(target_os = "macos")]
static DESKTOP_NOTIFICATION_APP: OnceLock<Mutex<Option<AppHandle>>> = OnceLock::new();

#[cfg(target_os = "macos")]
fn set_desktop_notification_app(app: AppHandle) {
    let app_slot = DESKTOP_NOTIFICATION_APP.get_or_init(|| Mutex::new(None));
    if let Ok(mut stored_app) = app_slot.lock() {
        *stored_app = Some(app);
    }
}

#[cfg(target_os = "macos")]
fn open_desktop_session_notification_from_delegate(session_id: String) {
    let Some(app_slot) = DESKTOP_NOTIFICATION_APP.get() else {
        return;
    };
    let app = match app_slot.lock() {
        Ok(stored_app) => stored_app.clone(),
        Err(_) => None,
    };
    if let Some(app) = app {
        open_desktop_session_notification(&app, session_id);
    }
}

#[cfg(target_os = "macos")]
#[allow(non_snake_case)]
mod macos_notifications {
    use super::open_desktop_session_notification_from_delegate;
    use block2::DynBlock;
    use objc2::rc::{autoreleasepool, Retained};
    use objc2::runtime::ProtocolObject;
    use objc2::{define_class, msg_send, AnyThread};
    use objc2_foundation::{NSObject, NSObjectProtocol};
    use objc2_user_notifications::{
        UNNotification, UNNotificationPresentationOptions, UNNotificationResponse,
        UNUserNotificationCenter, UNUserNotificationCenterDelegate,
    };
    use std::sync::OnceLock;

    define_class!(
        #[unsafe(super(NSObject))]
        #[ivars = ()]
        struct HappyNotificationDelegate;

        unsafe impl NSObjectProtocol for HappyNotificationDelegate {}

        unsafe impl UNUserNotificationCenterDelegate for HappyNotificationDelegate {
            #[unsafe(method(userNotificationCenter:willPresentNotification:withCompletionHandler:))]
            fn userNotificationCenter_willPresentNotification_withCompletionHandler(
                &self,
                _center: &UNUserNotificationCenter,
                _notification: &UNNotification,
                completion_handler: &DynBlock<dyn Fn(UNNotificationPresentationOptions)>,
            ) {
                completion_handler.call((
                    UNNotificationPresentationOptions::Banner
                        | UNNotificationPresentationOptions::List
                        | UNNotificationPresentationOptions::Sound,
                ));
            }

            #[unsafe(method(userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:))]
            fn userNotificationCenter_didReceiveNotificationResponse_withCompletionHandler(
                &self,
                _center: &UNUserNotificationCenter,
                response: &UNNotificationResponse,
                completion_handler: &DynBlock<dyn Fn()>,
            ) {
                let session_id = autoreleasepool(|pool| {
                    let notification = response.notification();
                    let request = notification.request();
                    let content = request.content();
                    let thread_identifier = content.threadIdentifier();
                    unsafe { thread_identifier.to_str(pool) }.to_string()
                });

                if !session_id.is_empty() {
                    open_desktop_session_notification_from_delegate(session_id);
                }

                completion_handler.call(());
            }
        }
    );

    impl HappyNotificationDelegate {
        fn new() -> Retained<Self> {
            let this = Self::alloc().set_ivars(());
            unsafe { msg_send![super(this), init] }
        }
    }

    static NOTIFICATION_DELEGATE: OnceLock<Retained<HappyNotificationDelegate>> = OnceLock::new();

    pub fn install_notification_delegate(center: &UNUserNotificationCenter) {
        let delegate = NOTIFICATION_DELEGATE.get_or_init(HappyNotificationDelegate::new);
        let delegate: &ProtocolObject<dyn UNUserNotificationCenterDelegate> =
            ProtocolObject::from_ref(&**delegate);
        center.setDelegate(Some(delegate));
    }
}

#[cfg(windows)]
#[tauri::command]
fn show_desktop_session_notification(
    app: tauri::AppHandle,
    notification: DesktopSessionNotification,
) -> Result<(), String> {
    use tauri_winrt_notification::{Duration, Sound, Toast};

    let app_id = app.config().identifier.clone();
    let session_id = notification.session_id.clone();
    let app_for_activation = app.clone();

    let mut toast = Toast::new(&app_id)
        .title(&notification.title)
        .text1(&notification.body)
        .duration(Duration::Short)
        .on_activated(move |_| {
            open_desktop_session_notification(&app_for_activation, session_id.clone());

            Ok(())
        });

    if let Some(sound) = notification.sound.as_deref() {
        let parsed_sound = sound.parse::<Sound>().map_err(|error| error.to_string())?;
        toast = toast.sound(Some(parsed_sound));
    }

    toast.show().map_err(|error| error.to_string())
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn show_desktop_session_notification(
    app: tauri::AppHandle,
    notification: DesktopSessionNotification,
) -> Result<(), String> {
    use objc2_foundation::NSString;
    use objc2_user_notifications::{
        UNMutableNotificationContent, UNNotificationRequest, UNNotificationSound,
        UNUserNotificationCenter,
    };

    set_desktop_notification_app(app.clone());
    let session_id = notification.session_id.clone();

    std::thread::spawn(move || {
        let center = UNUserNotificationCenter::currentNotificationCenter();
        macos_notifications::install_notification_delegate(&center);

        let content = UNMutableNotificationContent::new();
        content.setTitle(&NSString::from_str(&notification.title));
        content.setBody(&NSString::from_str(&notification.body));
        content.setThreadIdentifier(&NSString::from_str(&notification.session_id));

        if let Some(sound) = notification.sound.as_deref() {
            if sound == "Default" {
                content.setSound(Some(&UNNotificationSound::defaultSound()));
            } else {
                content.setSound(Some(&UNNotificationSound::soundNamed(&NSString::from_str(sound))));
            }
        }

        let timestamp_millis = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|duration| duration.as_millis())
            .unwrap_or_default();
        let identifier = format!("happy-session-{session_id}-{timestamp_millis}");
        let request = UNNotificationRequest::requestWithIdentifier_content_trigger(
            &NSString::from_str(&identifier),
            &content,
            None,
        );
        center.addNotificationRequest_withCompletionHandler(&request, None);
    });

    Ok(())
}

#[cfg(not(any(windows, target_os = "macos")))]
#[tauri::command]
fn show_desktop_session_notification(
    _app: tauri::AppHandle,
    _notification: DesktopSessionNotification,
) -> Result<(), String> {
    Err("desktop session notification command is only implemented on Windows and macOS".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![show_desktop_session_notification])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
