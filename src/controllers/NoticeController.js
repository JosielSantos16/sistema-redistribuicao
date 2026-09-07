import ScraperService from '../services/ScraperService';
import Notice from '../models/Notice';

class NoticeController {
  async store(req, res) {
    try {
      const resultado = await ScraperService.varrerTodosPortais();

      if (!resultado) {
        return res.status(500).json({ sucesso: false, erro: "O serviço de scraping não retornou resposta." });
      }

      return res.json(resultado);
    } catch (err) {
      return res.status(500).json({ sucesso: false, erro: err.message });
    }
  }

  async index(req, res) {
    try {
      const { instituicao, uf, pagina, limite } = req.query;
      const filtro = {};

      if (instituicao) {
        const lista = instituicao
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
        if (lista.length > 0) filtro.instituicao = { $in: lista };
      }

      if (uf) {
        filtro.uf = uf.toUpperCase();
      }

      const paginaAtual = Math.max(parseInt(pagina, 10) || 1, 1);
      const porPagina = Math.min(Math.max(parseInt(limite, 10) || 12, 1), 100);

      const total = await Notice.countDocuments(filtro);

      const notices = await Notice.find(filtro)
        .sort({ capturado_em: -1 })
        .skip((paginaAtual - 1) * porPagina)
        .limit(porPagina);

      return res.json({
        editais: notices,
        total,
        pagina: paginaAtual,
        totalPaginas: Math.max(Math.ceil(total / porPagina), 1),
      });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar editais.' });
    }
  }
}

export default new NoticeController();