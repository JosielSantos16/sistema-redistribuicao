import { Router } from 'express';
import UserController from './controllers/UserController'; 
import SessionController from './controllers/SessionController';
import authMiddleware from './middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.put('/activate', UserController.activate);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.get('/profile', UserController.show);
routes.put('/profile', UserController.update);

export default routes;