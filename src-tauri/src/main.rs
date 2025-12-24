// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// filepath: c:\Users\jando\Documents\Programming\Tauri\my-tauri-app\src-tauri\src\main.rs
// ...existing code...
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init()) // Add this plugin
        .setup(|app| {
            // Handle deep links
            app.listen_global("deep-link-received", |event| {
                println!("Deep link: {:?}", event.payload());
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
