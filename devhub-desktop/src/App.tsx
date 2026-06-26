import { useEffect, useState } from 'react';
import { Terminal, RefreshCw, HardDrive, Folder, Search } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core'; // Import crucial pour communiquer avec Rust
import './App.css';

interface Project {
    id: string;
    name: string;
    status: string;
    local_path?: string;
}

interface DiscoveredFolder {
    name: string;
    path: string;
    is_git: boolean;
}

function App() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [discovered, setDiscovered] = useState<DiscoveredFolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);

    // Modifie ce chemin par défaut si tu veux cibler directement ton sous-dossier
    const [scanPath, setScanPath] = useState('C:/Users/moonc/Desktop/Projets');

    const API_URL = 'http://localhost:3000';

    const fetchApiProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/projects`);
            if (response.ok) {
                const data = await response.json();
                setProjects(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("Impossible de joindre l'API", e);
        } finally {
            setLoading(false);
        }
    };

    // Appel de la commande Rust !
    const handleLocalScan = async () => {
        try {
            setScanning(true);
            const result: DiscoveredFolder[] = await invoke('scan_local_directory', { basePath: scanPath });
            setDiscovered(result);
        } catch (error) {
            alert(`Erreur de scan : ${error}`);
        } finally {
            setScanning(false);
        }
    };

    useEffect(() => {
        fetchApiProjects();
    }, []);

    return (
        <div className="desktop-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Terminal color="#3b82f6" size={24} /> DevHub Desktop Daemon
                    </h1>
                    <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '0.85rem' }}>Scanner natif synchro Git</p>
                </div>
                <button onClick={fetchApiProjects} disabled={loading} style={{ background: '#1e2937', color: 'white', border: '1px solid #374151', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                </button>
            </header>

            {/* Section de configuration du Scan local */}
            <section style={{ marginTop: '1.5rem', background: '#111827', padding: '1rem', borderRadius: '6px', border: '1px solid #1f2937' }}>
                <h2 style={{ fontSize: '1rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Search size={16} color="#3b82f6"/> Scanner un répertoire local</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" value={scanPath} onChange={(e) => setScanPath(e.target.value)} style={{ flex: 1, padding: '8px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '4px', color: 'white', fontFamily: 'monospace' }} />
                    <button onClick={handleLocalScan} disabled={scanning} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {scanning ? 'Scan...' : 'Lancer le Scan'}
                    </button>
                </div>
            </section>

            <main style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} color="#10b981" /> Résultats du Scanner Rust
                </h2>

                <div className="repo-list">
                    {discovered.map((dir, i) => (
                        <div key={i} className="repo-card">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Folder size={16} color={dir.is_git ? '#10b981' : '#64748b'} />
                                    <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{dir.name}</h3>
                                </div>
                                <code style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>{dir.path}</code>
                            </div>
                            <span className="sync-badge" style={{ backgroundColor: dir.is_git ? '#064e3b' : '#334155', color: dir.is_git ? '#34d399' : '#94a3b8' }}>
                {dir.is_git ? 'Dépôt Git' : 'Dossier Simple'}
              </span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default App;