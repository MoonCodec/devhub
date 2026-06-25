import { Request, Response } from 'express';
import { getDb } from "../config/database";

//Récupérer toutes les tâches (tout proj confondu)
export const getAllTodos = async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const todos = await db.all('SELECT * FROM todos ORDER BY due_date ASC, created_at DESC');
        res.json(todos);
    } catch (error) {
        console.error('Erreur getAllTodos:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des tâches.' });
    }
};

// Récupérer les taches d'un projet spécifique
export const getTodosByProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const db = getDb();
        const todos = await db.all('SELECT * FROM todos WHERE project_id = ? ORDER BY created_at DESC', [projectId]);
        res.json(todos);
    } catch (error) {
        console.error('Erreur getTodosByProject:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des tâches du projet.' });
    }
};

// Créer une nouvelle tâche
export const createTodo = async (req: Request, res: Response) => {
    try {
        const { project_id, title, description, due_date } = req.body;

        if (!title) {
            res.status(400).json({ error: 'Le titre de la tâche est obligatoire.' })
            return;
        }

        const db = getDb();

        // Si un project_id est fourni, on vérifie que le projet existe
        if (project_id) {
            const project = await db.get('SELECT id FROM projects WHERE id = ?', [project_id]);
            if (!project) {
                res.status(400).json({ error: 'Le projet associé n\'existe pas.' });
                return;
            }
        }

        const result = await db.run(
            `INSERT INTO todos (project_id, title, description, due_date)
            VALUES (?, ?, ?, ?)`,
            [project_id || null, title, description || null, due_date || null]
        );

        const newTodo = await db.get('SELECT * FROM todos WHERE id = ?', [result.lastID]);
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Erreur createTodo', error);
        res.status(500).json({ error: 'Erreur lors de la création de la tâche.' });
    }
};