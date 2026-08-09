use serde::{Deserialize, Serialize};
use std::sync::{Mutex, OnceLock};
use tauri::{AppHandle, Emitter, Manager};

const MAX_GITHUB_ISSUES_CREDENTIAL_BYTES: usize = 16 * 1024;
const GITHUB_ISSUES_CREDENTIAL_ACCOUNT: &str = "github-issues-device-flow-v1";
static GITHUB_ISSUES_CREDENTIAL_LOCK: OnceLock<Mutex<()>> = OnceLock::new();

fn github_issues_credential_entry(app: &AppHandle) -> Result<keyring::Entry, String> {
    keyring::Entry::new(&app.config().identifier, GITHUB_ISSUES_CREDENTIAL_ACCOUNT)
        .map_err(|_| "secure credential storage is unavailable".to_string())
}

fn with_github_issues_credential_lock<T>(
    operation: impl FnOnce() -> Result<T, String>,
) -> Result<T, String> {
    let lock = GITHUB_ISSUES_CREDENTIAL_LOCK.get_or_init(|| Mutex::new(()));
    let _guard = lock
        .lock()
        .map_err(|_| "secure credential storage is unavailable".to_string())?;
    operation()
}

fn assert_main_window(window: &tauri::WebviewWindow) -> Result<(), String> {
    if window.label() == "main" {
        Ok(())
    } else {
        Err("GitHub Issues credential access is unavailable from this window".to_string())
    }
}

#[tauri::command]
fn get_github_issues_credential(
    app: AppHandle,
    window: tauri::WebviewWindow,
) -> Result<Option<String>, String> {
    assert_main_window(&window)?;
    with_github_issues_credential_lock(|| {
        let entry = github_issues_credential_entry(&app)?;
        match entry.get_password() {
            Ok(value) => Ok(Some(value)),
            Err(keyring::Error::NoEntry) => Ok(None),
            Err(_) => Err("secure credential storage is unavailable".to_string()),
        }
    })
}

#[tauri::command]
fn set_github_issues_credential(
    app: AppHandle,
    window: tauri::WebviewWindow,
    value: String,
) -> Result<(), String> {
    assert_main_window(&window)?;
    if value.is_empty() || value.len() > MAX_GITHUB_ISSUES_CREDENTIAL_BYTES {
        return Err("invalid GitHub Issues credential payload".to_string());
    }
    with_github_issues_credential_lock(|| {
        github_issues_credential_entry(&app)?
            .set_password(&value)
            .map_err(|_| "secure credential storage is unavailable".to_string())
    })
}

#[tauri::command]
fn delete_github_issues_credential(
    app: AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    assert_main_window(&window)?;
    with_github_issues_credential_lock(|| {
        let entry = github_issues_credential_entry(&app)?;
        match entry.delete_credential() {
            Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
            Err(_) => Err("secure credential storage is unavailable".to_string()),
        }
    })
}

#[cfg(target_os = "macos")]
mod webview_recovery {
    use objc2::runtime::{AnyObject, Imp, Sel};
    use objc2::{msg_send, sel};
    use objc2_web_kit::WKWebView;
    use std::fs::{self, File, OpenOptions};
    use std::io::Write;
    use std::path::PathBuf;
    use std::sync::OnceLock;
    use std::time::{SystemTime, UNIX_EPOCH};
    use tauri::{Manager, WebviewWindow};

    const MAX_RECOVERY_LOG_BYTES: u64 = 64 * 1024;

    type WebContentProcessDidTerminate = unsafe extern "C-unwind" fn(&AnyObject, Sel, &WKWebView);

    static ORIGINAL_TERMINATION_HANDLER: OnceLock<usize> = OnceLock::new();
    static RECOVERY_LOG_PATH: OnceLock<PathBuf> = OnceLock::new();

    fn append_recovery_log(message: &str) {
        let Some(path) = RECOVERY_LOG_PATH.get() else {
            return;
        };

        if path
            .metadata()
            .map(|metadata| metadata.len() >= MAX_RECOVERY_LOG_BYTES)
            .unwrap_or(false)
        {
            let _ = File::create(path);
        }

        let timestamp_millis = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_millis())
            .unwrap_or_default();

        if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
            let _ = writeln!(file, "{timestamp_millis} {message}");
        }
    }

    unsafe extern "C-unwind" fn recover_terminated_web_content(
        delegate: &AnyObject,
        selector: Sel,
        webview: &WKWebView,
    ) {
        if let Some(original) = ORIGINAL_TERMINATION_HANDLER.get().copied() {
            // SAFETY: The stored pointer is the implementation replaced for this exact
            // Objective-C selector, so it has the same delegate/selector/webview ABI.
            let original: WebContentProcessDidTerminate = unsafe { std::mem::transmute(original) };
            unsafe { original(delegate, selector, webview) };
        }

        append_recovery_log("web-content-process-terminated; reloading");

        // SAFETY: WebKit invokes this delegate on the main thread with the WKWebView
        // whose content process terminated. Reloading creates a fresh content process.
        let _: *mut AnyObject = unsafe { msg_send![webview, reload] };
    }

    fn prepare_recovery_log(app: &tauri::App) -> tauri::Result<()> {
        let log_dir = app.path().app_log_dir()?;
        fs::create_dir_all(&log_dir)?;
        let _ = RECOVERY_LOG_PATH.set(log_dir.join("webview-recovery.log"));
        Ok(())
    }

    fn install_on_webview(webview: &WebviewWindow) -> tauri::Result<()> {
        webview.with_webview(|platform_webview| {
            if ORIGINAL_TERMINATION_HANDLER.get().is_some() {
                return;
            }

            // SAFETY: Tauri documents this cast for macOS PlatformWebview handles.
            let webview: &WKWebView = unsafe { &*platform_webview.inner().cast() };
            // SAFETY: navigationDelegate is a weak Objective-C property exposed by
            // WKWebView. Wry retains its delegate for the webview lifetime.
            let Some(delegate) = (unsafe { webview.navigationDelegate() }) else {
                append_recovery_log("recovery-install-failed; missing-navigation-delegate");
                return;
            };

            let selector = sel!(webViewWebContentProcessDidTerminate:);
            let delegate_object: &AnyObject = AsRef::<AnyObject>::as_ref(&*delegate);
            let Some(method) = delegate_object.class().instance_method(selector) else {
                append_recovery_log("recovery-install-failed; missing-termination-selector");
                return;
            };

            let replacement: WebContentProcessDidTerminate = recover_terminated_web_content;
            // SAFETY: Both implementations use the Objective-C method ABI for
            // `webViewWebContentProcessDidTerminate:`.
            let replacement: Imp = unsafe { std::mem::transmute(replacement) };
            // SAFETY: The replacement preserves the original method contract and calls
            // the previous implementation before adding reload recovery.
            let original = unsafe { method.set_implementation(replacement) };
            let _ = ORIGINAL_TERMINATION_HANDLER.set(original as *const () as usize);
        })
    }

    pub fn install(app: &tauri::App) -> tauri::Result<()> {
        prepare_recovery_log(app)?;
        let Some(main_window) = app.get_webview_window("main") else {
            append_recovery_log("recovery-install-failed; missing-main-window");
            return Ok(());
        };
        install_on_webview(&main_window)
    }
}

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
            #[cfg(target_os = "macos")]
            webview_recovery::install(app)?;

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_desktop_session_notification,
            get_github_issues_credential,
            set_github_issues_credential,
            delete_github_issues_credential,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
