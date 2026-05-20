use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager};

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
            let payload = DesktopSessionNotificationOpen {
                session_id: session_id.clone(),
            };

            if let Some(window) = app_for_activation.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
                let _ = window.emit("happy-session-notification-open", payload);
            }

            Ok(())
        });

    if let Some(sound) = notification.sound.as_deref() {
        let parsed_sound = sound.parse::<Sound>().map_err(|error| error.to_string())?;
        toast = toast.sound(Some(parsed_sound));
    }

    toast.show().map_err(|error| error.to_string())
}

#[cfg(not(windows))]
#[tauri::command]
fn show_desktop_session_notification(
    _app: tauri::AppHandle,
    _notification: DesktopSessionNotification,
) -> Result<(), String> {
    Err("desktop session notification command is only implemented on Windows".to_string())
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
