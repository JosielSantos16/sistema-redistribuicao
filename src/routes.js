import { Router } from 'express';
import multer from 'multer';
import UserController from './controllers/UserController'; 
import SessionController from './controllers/SessionController';
import NoticeController from './controllers/NoticeController';
import MapaController from './controllers/MapaController';
import MatchController from './controllers/MatchController';
import SolicitacaoController from './controllers/SolicitacaoController';
import MensagemController from './controllers/MensagemController';
import SuporteController from './controllers/SuporteController';
import ParceriaController from './controllers/ParceriaController';
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
routes.post('/suporte', SuporteController.store);
routes.post('/parcerias', ParceriaController.store);

routes.use(authMiddleware);

routes.get('/profile', UserController.show);
routes.put('/profile', upload.single('comprovante'), UserController.update);
routes.put('/profile/foto', uploadAvatar.single('foto'), UserController.updateFoto);
routes.put('/profile/senha', UserController.updateSenha);
routes.put('/profile/configuracoes', UserController.updateConfiguracoes);
routes.get('/profile/exportar', UserController.exportarDados);
routes.delete('/profile', UserController.excluirConta);
routes.get('/perfis/buscar', MatchController.index);

routes.post('/matches', SolicitacaoController.store);
routes.get('/matches/recebidos', SolicitacaoController.recebidos);
routes.get('/matches/enviados', SolicitacaoController.enviados);
routes.get('/matches/confirmados', SolicitacaoController.confirmados);
routes.put('/matches/:id/aceitar', SolicitacaoController.aceitar);
routes.put('/matches/:id/recusar', SolicitacaoController.recusar);

routes.get('/matches/:id/mensagens', MensagemController.index);
routes.post('/matches/:id/mensagens', MensagemController.store);
routes.delete('/matches/:id/mensagens', MensagemController.destroy);

export default routes;