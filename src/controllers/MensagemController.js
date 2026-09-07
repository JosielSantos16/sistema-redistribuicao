import Match from "../models/Match";
import Mensagem from "../models/Mensagem";

// Confirma que o usuário logado faz parte desse match E que ele já foi
// aceito — sem isso, ninguém pode ler ou mandar mensagem numa conversa
// que não é sua ou que ainda nem virou match de verdade.
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
  // GET /matches/:matchId/mensagens
  async index(req, res) {
    const match = await verificarAcesso(req.params.id, req.userId);
    if (!match) {
      return res.status(403).json({ error: "Você não tem acesso a essa conversa." });
    }

    // Abrir a conversa marca como lida qualquer mensagem que a OUTRA
    // pessoa mandou — é isso que faz o indicador de "não lida" sumir.
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

  // POST /matches/:matchId/mensagens
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
  // DELETE /matches/:id/mensagens — apaga todo o histórico da conversa
  // (o match em si continua existindo, só limpa as mensagens).
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