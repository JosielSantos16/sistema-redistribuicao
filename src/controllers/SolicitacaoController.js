import Match from "../models/Match";
import User from "../models/User";
import Mensagem from "../models/Mensagem";
import Mail from "../lib/Mail";

function mascararEmail(email) {
  if (!email) return "";
  const [usuario, dominio] = email.split("@");
  if (!dominio) return email;
  const visivel = usuario.slice(0, 1);
  return `${visivel}${"*".repeat(Math.max(usuario.length - 1, 3))}@${dominio}`;
}

async function enviarEmailSeguro(opcoes, notificar = true) {
  if (!notificar) return; 
  try {
    await Mail.sendMail(opcoes);
  } catch (err) {
    console.error("Erro ao enviar e-mail de notificação de match:", err.message);
  }
}

class SolicitacaoController {

  async store(req, res) {
    const { destinatario_id } = req.body;

    if (!destinatario_id) {
      return res.status(400).json({ error: "Informe o usuário de destino." });
    }

    if (destinatario_id === req.userId) {
      return res.status(400).json({ error: "Você não pode dar match em si mesmo." });
    }

    const destinatario = await User.findById(destinatario_id);
    if (!destinatario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const jaExiste = await Match.findOne({
      solicitante: req.userId,
      destinatario: destinatario_id,
    });

    if (jaExiste) {
      return res.status(400).json({ error: "Você já enviou uma solicitação para esse perfil." });
    }

    const pedidoReverso = await Match.findOne({
      solicitante: destinatario_id,
      destinatario: req.userId,
      status: "pendente",
    });

    const solicitante = await User.findById(req.userId);

    if (pedidoReverso) {
      pedidoReverso.status = "aceito";
      await pedidoReverso.save();

      await enviarEmailSeguro({
        to: `${destinatario.name} <${destinatario.email}>`,
        subject: "Você tem um novo match! - Sistema WOLF",
        template: "match_aceito",
        context: { nome: destinatario.name, outroNome: solicitante.name, outroEmail: solicitante.email },
      }, destinatario.notificar_email_match !== false);
      await enviarEmailSeguro({
        to: `${solicitante.name} <${solicitante.email}>`,
        subject: "Você tem um novo match! - Sistema WOLF",
        template: "match_aceito",
        context: { nome: solicitante.name, outroNome: destinatario.name, outroEmail: destinatario.email },
      }, solicitante.notificar_email_match !== false);

      return res.status(201).json({ status: "aceito", match: pedidoReverso });
    }

    const novoPedido = await Match.create({
      solicitante: req.userId,
      destinatario: destinatario_id,
      status: "pendente",
    });

    await enviarEmailSeguro({
      to: `${destinatario.name} <${destinatario.email}>`,
      subject: "Alguém tem interesse em você no Sistema WOLF",
      template: "match_recebido",
      context: { nome: destinatario.name },
    }, destinatario.notificar_email_match !== false);

    return res.status(201).json({ status: "pendente", match: novoPedido });
  }

  async recebidos(req, res) {
    const pedidos = await Match.find({
      destinatario: req.userId,
      status: "pendente",
    })
      .sort({ createdAt: -1 })
      .populate("solicitante", "name instituicao cargo curso estado_destino foto_url");

    const resultado = pedidos.map((p) => ({
      id: p._id,
      nome: p.solicitante?.name,
      instituicao: p.solicitante?.instituicao,
      cargo: p.solicitante?.cargo,
      curso: p.solicitante?.curso,
      destino: p.solicitante?.estado_destino,
      foto_url: p.solicitante?.foto_url,
      criadoEm: p.createdAt,
    }));

    return res.json(resultado);
  }

  async confirmados(req, res) {
    const matches = await Match.find({
      status: "aceito",
      $or: [{ solicitante: req.userId }, { destinatario: req.userId }],
    })
      .sort({ updatedAt: -1 })
      .populate("solicitante", "name email instituicao cargo curso estado_destino foto_url")
      .populate("destinatario", "name email instituicao cargo curso estado_destino foto_url");

    const resultado = await Promise.all(
      matches.map(async (m) => {
        const souEuQueSolicitei = String(m.solicitante._id) === String(req.userId);
        const outraPessoa = souEuQueSolicitei ? m.destinatario : m.solicitante;

        const naoLidas = await Mensagem.countDocuments({
          match: m._id,
          remetente: { $ne: req.userId },
          lida: false,
        });

        return {
          matchId: m._id,
          nome: outraPessoa?.name,
          email: outraPessoa?.email,
          instituicao: outraPessoa?.instituicao,
          cargo: outraPessoa?.cargo,
          curso: outraPessoa?.curso,
          destino: outraPessoa?.estado_destino,
          foto_url: outraPessoa?.foto_url,
          desde: m.updatedAt,
          naoLidas,
        };
      })
    );

    return res.json(resultado);
  }

  async enviados(req, res) {
    const pedidos = await Match.find({ solicitante: req.userId })
      .sort({ createdAt: -1 })
      .populate("destinatario", "name email instituicao cargo curso estado_destino foto_url");

    const resultado = pedidos.map((p) => ({
      id: p._id,
      nome: p.destinatario?.name,
      email: p.status === "aceito" ? p.destinatario?.email : null,
      instituicao: p.destinatario?.instituicao,
      cargo: p.destinatario?.cargo,
      curso: p.destinatario?.curso,
      destino: p.destinatario?.estado_destino,
      foto_url: p.destinatario?.foto_url,
      status: p.status,
      criadoEm: p.createdAt,
    }));

    return res.json(resultado);
  }

  async aceitar(req, res) {
    const match = await Match.findById(req.params.id).populate("solicitante destinatario");

    if (!match) {
      return res.status(404).json({ error: "Solicitação não encontrada." });
    }

    if (String(match.destinatario._id) !== String(req.userId)) {
      return res.status(403).json({ error: "Você não pode responder essa solicitação." });
    }

    match.status = "aceito";
    await match.save();

    await enviarEmailSeguro({
      to: `${match.solicitante.name} <${match.solicitante.email}>`,
      subject: "Seu pedido de match foi aceito! - Sistema WOLF",
      template: "match_aceito",
      context: {
        nome: match.solicitante.name,
        outroNome: match.destinatario.name,
        outroEmail: match.destinatario.email,
      },
    }, match.solicitante.notificar_email_match !== false);

    return res.json({ message: "Match aceito com sucesso." });
  }

  async recusar(req, res) {
    const match = await Match.findById(req.params.id).populate("solicitante destinatario");

    if (!match) {
      return res.status(404).json({ error: "Solicitação não encontrada." });
    }

    if (String(match.destinatario._id) !== String(req.userId)) {
      return res.status(403).json({ error: "Você não pode responder essa solicitação." });
    }

    match.status = "recusado";
    await match.save();

    await enviarEmailSeguro({
      to: `${match.solicitante.name} <${match.solicitante.email}>`,
      subject: "Atualização sobre sua solicitação - Sistema WOLF",
      template: "match_recusado",
      context: { nome: match.solicitante.name },
    }, match.solicitante.notificar_email_match !== false);

    return res.json({ message: "Solicitação recusada." });
  }
}

export default new SolicitacaoController();