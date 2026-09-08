import mongoose from "mongoose";

const SuporteSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: { type: String },
    mensagem: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Suporte", SuporteSchema);