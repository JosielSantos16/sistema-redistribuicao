import User from "../models/User";
import Institution from "../models/Institution";
import Match from "../models/Match";

function mascararEmail(email) {
  if (!email) return "";
  const [usuario, dominio] = email.split("@");
  if (!dominio) return email;
  const visivel = usuario.slice(0, 1);
  return `${visivel}${"*".repeat(Math.max(usuario.length - 1, 3))}@${dominio}`;
}

class MatchController {
  async index(req, res) {
    try {
      const { instituicao, cargo, estado, pagina, limite } = req.query;

      const filtro = { active: true, interesse_redistribuicao: true, visivel_busca: { $ne: false } };

      if (instituicao) filtro.instituicao = instituicao.toUpperCase();
      if (cargo) filtro.cargo = cargo;
      if (estado) filtro.estado_destino = estado.toUpperCase();
      if (req.userId) filtro._id = { $ne: req.userId };

      const paginaAtual = Math.max(parseInt(pagina, 10) || 1, 1);
      const porPagina = Math.min(Math.max(parseInt(limite, 10) || 12, 1), 50);

      const total = await User.countDocuments(filtro);

      const usuarios = await User.find(filtro)
        .sort({ createdAt: -1 })
        .skip((paginaAtual - 1) * porPagina)
        .limit(porPagina);

      const siglas = [...new Set(usuarios.map((u) => u.instituicao).filter(Boolean))];
      const instituicoes = await Institution.find({ sigla: { $in: siglas } });
      const ufPorSigla = {};
      instituicoes.forEach((inst) => {
        ufPorSigla[inst.sigla] = inst.uf;
      });

      const idsResultado = usuarios.map((u) => u._id);
      const matchesExistentes = req.userId
        ? await Match.find({
            $or: [
              { solicitante: req.userId, destinatario: { $in: idsResultado } },
              { solicitante: { $in: idsResultado }, destinatario: req.userId },
            ],
          })
        : [];

      const statusPorUsuario = {};
      matchesExistentes.forEach((m) => {
        const outroId =
          String(m.solicitante) === String(req.userId)
            ? String(m.destinatario)
            : String(m.solicitante);
        statusPorUsuario[outroId] = m.status;
      });

      const resultados = usuarios.map((u) => ({
        id: u._id,
        nome: u.name,
        email: mascararEmail(u.email),
        instituicao: u.instituicao,
        cargo: u.cargo,
        curso: u.curso,
        lattes: u.lattes,
        origem: ufPorSigla[u.instituicao] || null,
        destino: u.estado_destino,
        criadoEm: u.createdAt,
        foto_url: u.foto_url,
        matchStatus: statusPorUsuario[String(u._id)] || null,
      }));

      return res.json({
        resultados,
        total,
        pagina: paginaAtual,
        totalPaginas: Math.max(Math.ceil(total / porPagina), 1),
      });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao buscar perfis." });
    }
  }
}

export default new MatchController();