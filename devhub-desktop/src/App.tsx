import { useEffect, useState } from 'react';
import { Terminal, RefreshCw, HardDrive, Folder, Search, LayoutDashboard, Link2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    local_path?: string;
}

interface DiscoveredFolder {
    name: string;
    path: string;
    is_git: boolean;
}

function App() {
    const [activeTab, setActiveTab] = useState<'workspace' | 'scanner'>('workspace');
    const [projects, setProjects] = useState<Project[]>([]);
    const [discovered, setDiscovered] = useState<DiscoveredFolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
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

    // Lie un dossier local scanné à la base de données globale
    const handleLinkToApi = async (folder: DiscoveredFolder) => {
        try {
            const response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: folder.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name: folder.name,
                    description: `Projet importé localement depuis ${folder.path}`,
                    local_path: folder.path
                })
            });

            if (response.ok) {
                alert(`Le projet "${folder.name}" a bien été lié à ton DevHub !`);
                fetchApiProjects(); // Rafraîchit la liste du Workspace
            } else {
                const err = await response.json();
                alert(`Erreur lors de la liaison : ${err.error}`);
            }
        } catch (error) {
            console.error("Erreur réseau lors de la liaison:", error);
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
                    <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '0.85rem' }}>Gestionnaire natif d'environnement</p>
                </div>

                {/* Navigation par Onglets */}
                <nav style={{ display: 'flex', gap: '10px', background: '#111827', padding: '4px', borderRadius: '6px', border: '1px solid #1f2937' }}>
                    <button
                        onClick={() => setActiveTab('workspace')}
                        style={{ background: activeTab === 'workspace' ? '#1e2937' : 'transparent', color: activeTab === 'workspace' ? '#3b82f6' : '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                        <LayoutDashboard size={14} /> Workspace
                    </button>
                    <button
                        onClick={() => setActiveTab('scanner')}
                        style={{ background: activeTab === 'scanner' ? '#1e2937' : 'transparent', color: activeTab === 'scanner' ? '#3b82f6' : '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                        <Search size={14} /> Scanner Local
                    </button>
                </nav>
            </header>

            {/* VUE 1 : WORKSPACE */}
            {activeTab === 'workspace' && (
                <main style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HardDrive size={18} color="#3b82f6" /> Base de données DevHub ({projects.length})
                        </h2>
                        <button onClick={fetchApiProjects} disabled={loading} style={{ background: '#111827', color: 'white', border: '1px solid #1f2937', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                            <RefreshCw size={12} className={loading ? 'spin' : ''} />
                        </button>
                    </div>

                    <div className="repo-list">
                        {loading ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chargement...</p>
                        ) : projects.length === 0 ? (
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Aucun projet en base. Va dans l'onglet Scanner pour en ajouter !</p>
                        ) : (
                            projects.map((project) => (
                                <div key={project.id} className="repo-card">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Folder size={16} color="#3b82f6" />
                                            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{project.name}</h3>
                                        </div>
                                        <code style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                            {project.local_path || 'Pas de chemin local lié'}
                                        </code>
                                    </div>
                                    <span className="sync-badge">{project.status.toUpperCase()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            )}

            {/* VUE 2 : SCANNER LOCAL */}
            {activeTab === 'scanner' && (
                <main style={{ marginTop: '1.5rem' }}>
                    <section style={{ background: '#111827', padding: '1rem', borderRadius: '6px', border: '1px solid #1f2937', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.95rem', margin: '0 0 10px 0', color: '#94a3b8' }}>Dossier cible pour la recherche</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" value={scanPath} onChange={(e) => setScanPath(e.target.value)} style={{ flex: 1, padding: '8px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '4px', color: 'white', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                            <button onClick={handleLocalScan} disabled={scanning} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                {scanning ? 'Scan en cours...' : 'Lancer le Scan'}
                            </button>
                        </div>
                    </section>

                    <h2 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={18} color="#10b981" /> Répertoires locaux trouvés ({discovered.length})
                    </h2>

                    <div className="repo-list">
                        {discovered.length === 0 ? (
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Aucun scan effectué ou dossier vide.</p>
                        ) : (
                            discovered.map((dir, i) => {
                                const isAlreadyLinked = projects.some(p => p.local_path === dir.path);
                                return (
                                    <div key={i} className="repo-card">
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Folder size={16} color={dir.is_git ? '#10b981' : '#64748b'} />
                                                <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{dir.name}</h3>
                                            </div>
                                            <code style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>{dir.path}</code>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="sync-badge" style={{ backgroundColor: dir.is_git ? '#064e3b' : '#334155', color: dir.is_git ? '#34d399' : '#94a3b8' }}>
                        {dir.is_git ? 'Git' : 'Normal'}
                      </span>
                                            {dir.is_git && (
                                                <button
                                                    onClick={() => handleLinkToApi(dir)}
                                                    disabled={isAlreadyLinked}
                                                    style={{ background: isAlreadyLinked ? '#1f2937' : '#10b981', color: isAlreadyLinked ? '#4b5563' : 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: isAlreadyLinked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}
                                                >
                                                    <Link2 size={12} /> {isAlreadyLinked ? 'Lié' : 'Lier'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </main>
            )}
        </div>
    );
}

export default App;