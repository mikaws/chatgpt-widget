// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{Manager, PhysicalPosition, PhysicalSize, Position, Size, Window, WindowEvent};

#[tauri::command]
fn set_window_size(window: Window, width: u32, height: u32) {
    window
        .set_size(Size::Physical(PhysicalSize { width, height }))
        .unwrap();
}

#[tauri::command]
fn get_window_size(window: Window) -> PhysicalSize<u32>{
    return window.inner_size().unwrap();
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            main_window.set_decorations(false).unwrap();
            main_window
                .set_position(Position::Physical(PhysicalPosition { x: 10000, y: 200 }))
                .unwrap();
            Ok(())
        })
        .on_window_event(|e| {
            if let WindowEvent::Resized(_) = e.event() {
                std::thread::sleep(std::time::Duration::from_nanos(1));
            }
        })
        .invoke_handler(tauri::generate_handler![set_window_size, get_window_size])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
