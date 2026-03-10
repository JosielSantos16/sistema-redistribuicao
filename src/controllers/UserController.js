import * as Yup from "yup";
import User from "../models/User";
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
      token: jwt.sign({ id }, "SISTEMA_WOLF_SECRET", {
        expiresIn: "7d",
      }),
    });
  }

  async show(req, res) {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const { id, name, email, cpf, instituicao, campus, cargo, lotacao, bio } =
      user;

    return res.json({
      id,
      name,
      email,
      cpf,
      instituicao,
      campus,
      cargo,
      lotacao,
      bio,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      instituicao: Yup.string().required(),
      departamento: Yup.string().required(),
      cargo: Yup.string().oneOf(["Magistério Superior", "EBTT"]).required(),
      curso: Yup.string().required(),
      bio: Yup.string().max(200),
      lattes: Yup.string(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const updatedUser = await user.updateOne(req.body);

    return res.json({ message: "Perfil atualizado com sucesso!" });
  }
}

export default new UserController();
