import { useState } from "react";
import { Terminal, RefreshCw, HardDrive } from "lucide-react";
import './App.css'

interface LocalRepo {
    name: string;
    path: string;
    status: 'up-to-date' | 'sync-required' | 'unknown';
}

function App() {
    const [repos] = useState<LocalRepo[]>([
        { name: 'Alystria Plugin', path: 'C:/Dev/Minecraft/alystria', status: 'up-to-date' },
        { name: 'AstroCore Discord', path: 'C:/Dev/Discord/astrocore', status: 'up-to-date' }
    ]);

    return (
        <div className="desktop-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Terminal color="#3b82f6" /> DevHub Desktop Daemon
                    </h1>
                    <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '0.85rem' }}>Synchronisation et détection Git locale</p>
                </div>
                <button style={{ background: '#1e2937', color: 'white', border: '1px solid #374151', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                    <RefreshCw size={14} /> Scan Local
                </button>
            </header>

            <main style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} color="#10b981" /> Dépôts détectés sur ce PC
                </h2>

                <div className="repo-list">
                    {repos.map((repo, i) => (
                        <div key={i} className="repo-card">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>{repo.name}</h3>
                                <code style={{ fontSize: '0.75rem', color: '#6b7280' }}>{repo.path}</code>
                            </div>
                            <span className="sync-badge" style={{ backgroundColor: repo.status === 'sync-required' ? '#7c2d12' : '#1e3a8a', color: repo.status === 'sync-required' ? '#f97316' : '#60a5fa' }}>
                {repo.status === 'sync-required' ? 'Sync Requis' : 'À jour'}
              </span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default App;