import ScraperService from '../services/ScraperService';
import Notice from '../models/Notice';

class NoticeController {
  // Dispara a varredura e retorna o total
  async store(req, res) {
  try {
    const resultado = await ScraperService.varrerTodosPortais();
    
    // Proteção extra: se o ScraperService falhar silenciosamente
    if (!resultado) {
      return res.status(500).json({ sucesso: false, erro: "O serviço de scraping não retornou resposta." });
    }
    
    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ sucesso: false, erro: err.message });
  }
}
  // Busca os dados para exibir no seu frontend (ordenado!)
  // Altere o método index no seu NoticeController
async index(req, res) {
  try {
    // Adicione .limit(200) para garantir que você exiba uma boa amostra sem estourar a memória
    const notices = await Notice.find().sort({ capturado_em: -1 }).limit(200);
    return res.json(notices);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar editais.' });
  }
}
}

export default new NoticeController();