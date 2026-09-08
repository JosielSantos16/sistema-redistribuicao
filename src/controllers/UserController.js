import * as Yup from "yup";
import User from "../models/User";
import Match from "../models/Match";
import Mensagem from "../models/Mensagem";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Mail from "../lib/Mail";

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required().trim(),
      cpf: Yup.string().required(),
      email: Yup.string().email().required(),
      data_nascimento: Yup.date().required(),
      admin: Yup.boolean(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const { email, cpf } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { cpf }],
    });

    if (userExists) {
      return res.status(400).json({ error: "Usuário ou CPF já cadastrado." });
    }

    const registration_token = crypto.randomBytes(20).toString("hex");

    const user = await User.create({
      ...req.body,
      registration_token,
      active: false,
    });

    try {
      await Mail.sendMail({
        to: `${user.name} <${user.email}>`,
        subject: "Confirmação de Cadastro - Sistema Redistribuição",
        template: "registration",
        context: {
          name: user.name,
          token: registration_token,
        },
      });
    } catch (err) {
      console.log("Erro ao enviar e-mail:", err);
    }

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      registration_token,
    });
  }

  async activate(req, res) {
    const { token, password } = req.body;

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ error: "A senha deve ter no mínimo 8 caracteres." });
    }

    const regexComplexidade = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!regexComplexidade.test(password)) {
      return res
        .status(400)
        .json({ error: "A senha deve conter letras e números." });
    }

    const user = await User.findOne({ registration_token: token });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Token de ativação inválido ou expirado." });
    }

    const password_hash = await bcrypt.hash(password, 8);

    user.password_hash = password_hash;
    user.active = true;
    user.registration_token = undefined;

    await user.save();

    const { id, name, email } = user;

    return res.json({
      user: { id, name, email },
      token: jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      }),
    });
  }

  async show(req, res) {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const {
      id,
      name,
      email,
      cpf,
      data_nascimento,
      instituicao,
      departamento,
      cargo,
      curso,
      lattes,
      telefone,
      bio,
      interesse_redistribuicao,
      estado_destino,
      comprovante_url,
      foto_url,
      visivel_busca,
      notificar_email_match,
      notificar_email_edital,
    } = user;

    return res.json({
      id,
      name,
      email,
      cpf,
      data_nascimento,
      instituicao,
      departamento,
      cargo,
      curso,
      lattes,
      telefone,
      bio,
      interesse_redistribuicao,
      estado_destino,
      comprovante_url,
      foto_url,
      visivel_busca,
      notificar_email_match,
      notificar_email_edital,
    });
  }

  async update(req, res) {
    const payload = {
      ...req.body,
      interesse_redistribuicao: true,
    };

    const schema = Yup.object().shape({
      instituicao: Yup.string().required(),
      departamento: Yup.string().required(),
      cargo: Yup.string().oneOf(["Magistério Superior", "EBTT"]).required(),
      curso: Yup.string().required(),
      bio: Yup.string().max(200),
      lattes: Yup.string(),
      telefone: Yup.string(),
      estado_destino: Yup.string().length(2).required("Informe o estado de destino desejado."),
    });

    try {
      await schema.validate(payload, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (req.file) {
      payload.comprovante_url = req.file.path;
    }

    await user.updateOne(payload);

    return res.json({ message: "Perfil atualizado com sucesso!" });
  }

  async updateFoto(req, res) {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada." });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const foto_url = req.file.path;
    await user.updateOne({ foto_url });

    return res.json({ foto_url });
  }

  async updateSenha(req, res) {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ error: "Informe a senha atual e a nova senha." });
    }

    if (novaSenha.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d).+$/.test(novaSenha)) {
      return res.status(400).json({ error: "A nova senha deve ter no mínimo 8 caracteres, com letras e números." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, user.password_hash);
    if (!senhaCorreta) {
      return res.status(400).json({ error: "Senha atual incorreta." });
    }

    user.password_hash = await bcrypt.hash(novaSenha, 8);
    await user.save();

    return res.json({ message: "Senha atualizada com sucesso!" });
  }

  async updateConfiguracoes(req, res) {
    const { visivel_busca, notificar_email_match, notificar_email_edital } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const payload = {};
    if (visivel_busca !== undefined) payload.visivel_busca = !!visivel_busca;
    if (notificar_email_match !== undefined) payload.notificar_email_match = !!notificar_email_match;
    if (notificar_email_edital !== undefined) payload.notificar_email_edital = !!notificar_email_edital;

    await user.updateOne(payload);

    return res.json({ message: "Preferências atualizadas com sucesso!" });
  }

  async exportarDados(req, res) {
    const user = await User.findById(req.userId).select("-password_hash -registration_token");
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const matches = await Match.find({
      $or: [{ solicitante: req.userId }, { destinatario: req.userId }],
    });

    const mensagens = await Mensagem.find({ remetente: req.userId });

    return res.json({
      exportado_em: new Date(),
      perfil: user,
      matches,
      mensagens_enviadas: mensagens,
    });
  }

  async excluirConta(req, res) {
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({ error: "Confirme sua senha para excluir a conta." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.password_hash);
    if (!senhaCorreta) {
      return res.status(400).json({ error: "Senha incorreta." });
    }

    const marcador = crypto.randomBytes(8).toString("hex");

    await user.updateOne({
      name: "Usuário removido",
      email: `removido-${marcador}@wolf.local`,
      cpf: marcador.padStart(11, "0").slice(0, 11),
      telefone: undefined,
      foto_url: undefined,
      comprovante_url: undefined,
      lattes: undefined,
      bio: undefined,
      active: false,
    });

    return res.json({ message: "Conta excluída com sucesso." });
  }
}

export default new UserController();