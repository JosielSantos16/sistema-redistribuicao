import { Router } from 'express';
import multer from 'multer';
import UserController from './controllers/UserController'; 
import SessionController from './controllers/SessionController';
import NoticeController from './controllers/NoticeController';
import MapaController from './controllers/MapaController';
import MatchController from './controllers/MatchController';
import authMiddleware from './middlewares/auth';
import multerConfig from './config/multer';
import multerAvatarConfig from './config/multerAvatar';

const routes = new Router();
const upload = multer(multerConfig);
const uploadAvatar = multer(multerAvatarConfig);

routes.post('/users', UserController.store);
routes.put('/activate', UserController.activate);
routes.post('/sessions', SessionController.store);
routes.post('/scraper/PROGEP', NoticeController.store); 
routes.get('/notices', NoticeController.index);
routes.get('/mapa/interesse', MapaController.index);

routes.use(authMiddleware);

routes.get('/profile', UserController.show);
routes.put('/profile', upload.single('comprovante'), UserController.update);
routes.put('/profile/foto', uploadAvatar.single('foto'), UserController.updateFoto);
routes.get('/perfis/buscar', MatchController.index);

export default routes;