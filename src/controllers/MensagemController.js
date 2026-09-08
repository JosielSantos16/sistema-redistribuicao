import Match from "../models/Match";
import Mensagem from "../models/Mensagem";

async function verificarAcesso(matchId, userId) {
  const match = await Match.findById(matchId);
  if (!match) return null;
  if (match.status !== "aceito") return null;

  const souParte =
    String(match.solicitante) === String(userId) ||
    String(match.destinatario) === String(userId);

  return souParte ? match : null;
}

class MensagemController {
  async index(req, res) {
    const match = await verificarAcesso(req.params.id, req.userId);
    if (!match) {
      return res.status(403).json({ error: "Você não tem acesso a essa conversa." });
    }

    await Mensagem.updateMany(
      { match: req.params.id, remetente: { $ne: req.userId }, lida: false },
      { $set: { lida: true } }
    );

    const mensagens = await Mensagem.find({ match: req.params.id })
      .sort({ createdAt: 1 })
      .limit(200);

    return res.json(
      mensagens.map((m) => ({
        id: m._id,
        texto: m.texto,
        deVoce: String(m.remetente) === String(req.userId),
        criadoEm: m.createdAt,
      }))
    );
  }

  async store(req, res) {
    const match = await verificarAcesso(req.params.id, req.userId);
    if (!match) {
      return res.status(403).json({ error: "Você não tem acesso a essa conversa." });
    }

    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: "Mensagem vazia." });
    }

    const mensagem = await Mensagem.create({
      match: req.params.id,
      remetente: req.userId,
      texto: texto.trim().slice(0, 1000),
    });

    return res.status(201).json({
      id: mensagem._id,
      texto: mensagem.texto,
      deVoce: true,
      criadoEm: mensagem.createdAt,
    });
  }

  async destroy(req, res) {
    const match = await verificarAcesso(req.params.id, req.userId);
    if (!match) {
      return res.status(403).json({ error: "Você não tem acesso a essa conversa." });
    }

    await Mensagem.deleteMany({ match: req.params.id });

    return res.json({ message: "Conversa apagada." });
  }
}

export default new MensagemController();