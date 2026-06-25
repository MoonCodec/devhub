import { Request, Response } from 'express';
import { getDb } from "../config/database";

// Récupérer tous les projets
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb();
        const projects = await db.all('SELECT * FROM projects ORDER BY created_at DESC');
        res.json(projects);
    } catch (error) {
        console.error('Erreur getAllProjects:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des projets.' });
    }
};

// Créer un nouveau projet
export const createProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, name, description,local_path, github_url } = req.body;

        if (!id || !name) {
            res.status(400).json({ error: 'Le champ "id" (slug unique) et "name" sont obligatoires.' });
            return;
        }

        const db = getDb();

        await db.run(
            ` INSERT INTO projects (id, name, description, local_path, github_url)
            VALUES (?, ?, ?, ?, ?)`,
            [id, name, description || null, local_path || null, github_url || null]
        );

        const newProject = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
        res.status(200).json(newProject);
    } catch (error: any) {
        console.error('Erreur createProject:', error);
        if (error.message?.includes('UNIQUE constraint faimed')) {
            res.status(400).json({ error: 'Un projet avec cet ID existe déjà.' });
            return;
        }
        res.status(500).json({ error: 'Erreur lors de la création du projet.' });
    }
};