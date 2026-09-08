import Suporte from "../models/Suporte";
import Mail from "../lib/Mail";

const EMAIL_SUPORTE = "josielufopa@gmail.com";

class SuporteController {
  async store(req, res) {
    const { nome, email, telefone, mensagem } = req.body;

    if (!nome || !email || !mensagem) {
      return res.status(400).json({ error: "Preencha nome, e-mail e mensagem." });
    }

    const registro = await Suporte.create({ nome, email, telefone, mensagem });

    try {
      await Mail.sendMail({
        to: EMAIL_SUPORTE,
        subject: `Nova mensagem de suporte de ${nome}`,
        template: "suporte_recebido",
        context: { nome, email, telefone: telefone || "Não informado", mensagem },
      });
    } catch (err) {
      console.error("Erro ao enviar e-mail de suporte:", err.message);
    }

    return res.status(201).json({ id: registro._id, message: "Mensagem enviada com sucesso!" });
  }
}

export default new SuporteController();