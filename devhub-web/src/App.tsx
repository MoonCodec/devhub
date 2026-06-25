import { useEffect, useState } from 'react';
import { Folder, RefreshCw, Plus, X } from 'lucide-react';
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
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    local_path: '',
    github_url: ''
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/projects`);
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur de récupération des projets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ id: '', name: '', description: '', local_path: '', github_url: '' });
        setShowForm(false);
        fetchProjects();
      } else {
        const errData = await response.json();
        alert(`Erreur : ${errData.error}`);
      }
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
    }
  };

  return (
      <div className="dashboard">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0 }}>💻 DevHub Workspace</h1>
            <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Gestion centrale de tes projets et tâches</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowForm(!showForm)} style={{ background: showForm ? '#ef4444' : '#10b981', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
              {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Annuler' : 'Nouveau Projet'}
            </button>
            <button onClick={fetchProjects} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <RefreshCw size={16} /> Rafraîchir
            </button>
          </div>
        </header>

        {showForm && (
            <form onSubmit={handleSubmit} style={{ background: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Ajouter un nouveau projet</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="ID Unique (ex: alystria)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} required style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }} />
                <input type="text" placeholder="Nom du projet" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }} />
              </div>
              <textarea placeholder="Description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white', minHeight: '60px' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Chemin local" value={formData.local_path} onChange={e => setFormData({...formData, local_path: e.target.value})} style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }} />
                <input type="text" placeholder="URL GitHub" value={formData.github_url} onChange={e => setFormData({...formData, github_url: e.target.value})} style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }} />
              </div>
              <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Enregistrer
              </button>
            </form>
        )}

        {loading ? (
            <p>Chargement des projets...</p>
        ) : (
            <div className="project-grid">
              {projects.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>Aucun projet trouvé. Cliquez sur "Nouveau Projet" pour commencer !</p>
              ) : (
                  projects.map((project) => (
                      <div key={project.id} className="project-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Folder color="#3b82f6" />
                            <h3 style={{ margin: 0 }}>{project.name}</h3>
                          </div>
                          <span style={{ fontSize: '0.75rem', background: '#334155', padding: '3px 8px', borderRadius: '12px', color: '#10b981' }}>
                    {project.status.toUpperCase()}
                  </span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{project.description || 'Aucune description.'}</p>
                        {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#60a5fa', textDecoration: 'none' }}>
                              🌐 GitHub
                            </a>
                        )}
                      </div>
                  ))
              )}
            </div>
        )}
      </div>
  );
}

export default App;