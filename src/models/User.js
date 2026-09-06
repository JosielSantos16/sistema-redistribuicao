import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cpf: {
      type: String,
      required: true,
      unique: true,
      minlength: 11,
      maxlength: 11,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    data_nascimento: {
      type: Date,
      required: true,
    },
    password_hash: {
      type: String,
    },
    instituicao: {
      type: String,
    },
    departamento: {
      type: String,
    },
    cargo: {
      type: String,
      enum: ['Magistério Superior', 'EBTT'], 
    },
    curso: {
      type: String,
    },
    lattes: {
      type: String,
    },
    bio: {
      type: String,
    },
    foto_url: {
      type: String,
    },
    // NOVO — necessário para o Mapa de Interesse por Estado e para a Busca
    // de Perfis (match): sem isso não existe dado real pra essas telas.
    interesse_redistribuicao: {
      type: Boolean,
      default: false,
    },
    // Sigla do estado (UF) para onde o usuário deseja ser redistribuído/removido.
    estado_destino: {
      type: String,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    registration_token: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", UserSchema);