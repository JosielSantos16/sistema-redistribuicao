import Parceria from "../models/Parceria";
import Mail from "../lib/Mail";

const EMAIL_SUPORTE = "josielufopa@gmail.com";

class ParceriaController {
  async store(req, res) {
    const { nome, email, proposta } = req.body;

    if (!nome || !email || !proposta) {
      return res.status(400).json({ error: "Preencha nome, e-mail e a proposta." });
    }

    const registro = await Parceria.create({ nome, email, proposta });

    try {
      await Mail.sendMail({
        to: EMAIL_SUPORTE,
        subject: `Nova proposta de parceria de ${nome}`,
        template: "parceria_recebida",
        context: { nome, email, proposta },
      });
    } catch (err) {
      console.error("Erro ao enviar e-mail de parceria:", err.message);
    }

    return res.status(201).json({ id: registro._id, message: "Proposta enviada com sucesso!" });
  }
}

export default new ParceriaController();