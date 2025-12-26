// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{Manager, PhysicalPosition};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get the main window by its label (default is "main")
            let window = app.get_webview_window("main").unwrap();

            // Get the primary monitor to determine screen dimensions
            if let Some(monitor) = window.primary_monitor().unwrap() {
                let screen_size = monitor.size();
                let window_size = window.outer_size().unwrap();

                // Calculate the bottom-right position:
                // X = Screen Width - Window Width
                // Y = Screen Height - Window Height
                let x = screen_size.width as i32 - window_size.width as i32;
                let y = screen_size.height as i32 - window_size.height as i32;

                // Move the window to the calculated position
                window.set_position(PhysicalPosition::new(x+5, y-55)).unwrap();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}