import { Router } from 'express';
import UserController from './controllers/UserController'; 
import SessionController from './controllers/SessionController';
import NoticeController from './controllers/NoticeController';
import MapaController from './controllers/MapaController';
import MatchController from './controllers/MatchController';
import authMiddleware from './middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.put('/activate', UserController.activate);
routes.post('/sessions', SessionController.store);
routes.post('/scraper/PROGEP', NoticeController.store); 
routes.get('/notices', NoticeController.index);
routes.get('/mapa/interesse', MapaController.index);
routes.get('/perfis/buscar', MatchController.index);

routes.use(authMiddleware);

routes.get('/profile', UserController.show);
routes.put('/profile', UserController.update);

export default routes;