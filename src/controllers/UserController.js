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

    const {
      id,
      name,
      email,
      cpf,
      instituicao,
      campus,
      cargo,
      lotacao,
      bio,
      interesse_redistribuicao,
      estado_destino,
      comprovante_url,
      foto_url,
    } = user;

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
      interesse_redistribuicao,
      estado_destino,
      comprovante_url,
      foto_url,
    });
  }

  async update(req, res) {
    const interesseBooleano =
      req.body.interesse_redistribuicao === true ||
      req.body.interesse_redistribuicao === "true";

    const payload = {
      ...req.body,
      interesse_redistribuicao: interesseBooleano,
    };

    const schema = Yup.object().shape({
      instituicao: Yup.string().required(),
      departamento: Yup.string().required(),
      cargo: Yup.string().oneOf(["Magistério Superior", "EBTT"]).required(),
      curso: Yup.string().required(),
      bio: Yup.string().max(200),
      lattes: Yup.string(),
      interesse_redistribuicao: Yup.boolean(),
      estado_destino: Yup.string().length(2).when("interesse_redistribuicao", {
        is: true,
        then: (s) => s.required("Informe o estado de destino desejado."),
      }),
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
      payload.comprovante_url = `/uploads/comprovantes/${req.file.filename}`;
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

    const foto_url = `/uploads/avatares/${req.file.filename}`;
    await user.updateOne({ foto_url });

    return res.json({ foto_url });
  }
}

export default new UserController();