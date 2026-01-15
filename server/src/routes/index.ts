import { Router } from 'express';
import customersRouter from './customers';
import projectsRouter from './projects';
import tasksRouter from './tasks';
import professionalsRouter from './professionals';
import formsRouter from './forms';
import documentsRouter from './documents';
import auditRouter from './audit';
import notificationsRouter from './notifications';
import monitoringRouter from './monitoring';

const router = Router();

router.use('/customers', customersRouter);
router.use('/projects', projectsRouter);
router.use('/tasks', tasksRouter);
router.use('/professionals', professionalsRouter);
router.use('/forms', formsRouter);
router.use('/documents', documentsRouter);
router.use('/audit', auditRouter);
router.use('/notifications', notificationsRouter);
router.use('/monitoring', monitoringRouter);

export default router;
