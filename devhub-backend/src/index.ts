import express = require('express');
import cors = require('cors');
import dotenv = require('dotenv');
import { initDatabase } from "./config/database";
import projectRoutes from "./routes/projectRoutes";

// Chargement des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes de l'API
app.use('/api/projects', projectRoutes);

app.get('/api/status', (req, res) => {
    res.json({ status: 'online', message: 'Bienvenue sur l\'API DevHub' });
});

// Lancement du serveur aprus initialisation de la DB
async function startServer() {
    try {
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`Serveur en cours d'exécurtion sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Échec du lancement du serveur :', error);
        process.exit(1);
    }
}

startServer();