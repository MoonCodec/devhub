import { Router } from 'express';
import { getAllTodos, getTodosByProject, createTodo } from "../controllers/todoController";

const router = Router();

router.get('/', getAllTodos);
router.get('/project/:projectId', getTodosByProject);
router.post('/', createTodo);

export default router;