import { Router } from 'express';
import customersRouter from './customers';
import projectsRouter from './projects';
import tasksRouter from './tasks';
import professionalsRouter from './professionals';
import formsRouter from './forms';
import documentsRouter from './documents';
import usersRouter from './users';
import auditRouter from './audit';

const router = Router();

router.use('/customers', customersRouter);
router.use('/projects', projectsRouter);
router.use('/tasks', tasksRouter);
router.use('/professionals', professionalsRouter);
router.use('/forms', formsRouter);
router.use('/documents', documentsRouter);
router.use('/users', usersRouter);
router.use('/audit', auditRouter);

export default router;
