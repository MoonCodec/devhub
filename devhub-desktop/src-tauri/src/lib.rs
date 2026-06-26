use std::fs;
use std::path::Path;
use std::process::Command;

// Structure alignée avec le Frontend
#[derive(serde::Serialize)]
struct LocalFolder {
    name: String,
    path: String,
    is_git: bool,
}

// Commande Tauri qui scanne un répertoire
#[tauri::command]
fn scan_local_directory(base_path: &str) -> Result<Vec<LocalFolder>, String> {
    let mut discovered = Vec::new();
    let path = Path::new(base_path);

    if !path.exists() || !path.is_dir() {
        return Err("Le chemin spécifié n'existe pas ou n'est pas un dossier".to_string());
    }

    // Lecture du dossier racine
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let folder_path = entry.path();
            if folder_path.is_dir() {
                let name = entry.file_name().to_string_lossy().into_owned();
                // Vérification de la présence d'un dossier .git
                let git_path = folder_path.join(".git");
                let is_git = git_path.exists() && git_path.is_dir();

                discovered.push(LocalFolder {
                    name,
                    path: folder_path.to_string_lossy().into_owned(),
                    is_git,
                });
            }
        }
    }

    Ok(discovered)
}

// Commande pour lancé l'IDE
#[tauri::command]
fn open_project_in_ide(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(&["/C", "code", $path])
            .spawn()
            .map_err(|e| format!("Impossible de lancer VS Code : {}", e))?;
    }

    // Version macOS/Linux
    #[cfg(not(target_os = "windows")]
    {
        Command::new("code")
            .arg($path)
            .spawn()
            .map_err(|e| format!("Impossible de lancer VS Code : {}, e"))?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![scan_local_directory, open_project_in_ide])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}