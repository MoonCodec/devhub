import { useEffect, useState } from 'react';
import { Terminal, RefreshCw, HardDrive, Folder } from 'lucide-react';
import './App.css';

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    local_path?: string;
    github_url?: string;
}

function App() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // URL de ton API DevHub Backend
    const API_URL = 'http://localhost:3000';

    const fetchLocalRepos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/projects`);
            if (!response.ok) throw new Error('Erreur réseau');
            const data = await response.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur de liaison avec l'API:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocalRepos();
    }, []);

    return (
        <div className="desktop-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Terminal color="#3b82f6" size={24} /> DevHub Desktop Daemon
                    </h1>
                    <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '0.85rem' }}>Liaison API et détection Git locale</p>
                </div>
                <button
                    onClick={fetchLocalRepos}
                    disabled={loading}
                    style={{ background: '#1e2937', color: 'white', border: '1px solid #374151', padding: '8px 12px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}
                >
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    {loading ? 'Connexion...' : 'Scan Local'}
                </button>
            </header>

            <main style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} color="#10b981" /> Projets synchronisés sur ce PC
                </h2>

                {loading ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Interrogations du daemon en cours...</p>
                ) : projects.length === 0 ? (
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Aucun projet répertorié dans l'API pour le moment.</p>
                ) : (
                    <div className="repo-list">
                        {projects.map((project) => (
                            <div key={project.id} className="repo-card">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Folder size={16} color="#3b82f6" />
                                        <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{project.name}</h3>
                                    </div>
                                    <code style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                        {project.local_path || 'Aucun chemin local configuré'}
                                    </code>
                                </div>
                                <span className="sync-badge" style={{
                                    backgroundColor: project.status === 'active' ? '#064e3b' : '#1e3a8a',
                                    color: project.status === 'active' ? '#34d399' : '#60a5fa'
                                }}>
                  {project.status.toUpperCase()}
                </span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;