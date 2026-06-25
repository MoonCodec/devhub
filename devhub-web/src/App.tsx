import { useEffect, useState } from 'react';
import { Folder, RefreshCw } from 'lucide-react';
import './App.css';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Erreur de récupération des projets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
      <div className="dashboard">
        <header style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
          <div>
            <h1>💻 DevHub Workspace</h1>
            <p>Gestion centrale de tes projets et tâches</p>
          </div>
          <button onClick={fetchProjects} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <RefreshCw size={16} /> Rafraîchir
          </button>
        </header>

        {loading ? (
            <p>Chargement des projets...</p>
        ) : (
            <div className="project-grid">
              {projects.length === 0 ? (
                  <p>Aucun projet trouvé. Ajoute ton premier projet via l'API !</p>
              ) : (
                  projects.map((project) => (
                      <div key={project.id} className="project-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <Folder color="#3b82f6" />
                          <h3 style={{ margin: 0 }}>{project.name}</h3>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{project.description || 'Aucune description.'}</p>
                        <span style={{ fontSize: '0.8rem', background: '#334155', padding: '3px 8px', borderRadius: '12px' }}>
                  {project.status}
                </span>
                      </div>
                  ))
              )}
            </div>
        )}
      </div>
  );
}

export default App;