import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    id_origem: {
      type: String,
      required: true,
      unique: true, 
    },
    titulo: {
      type: String,
      required: true,
    },
    url_documento: {
      type: String,
      required: true,
    },
    instituicao: {
      type: String,
      required: true,
      default: "UFOPA",
    },
    orgao: {
      type: String,
      required: true,
      default: "PROGEP",
    },
    categoria: {
      type: String,
      required: true,
      default: "Formulários e Documentos",
    },
    capturado_em: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notice", NoticeSchema);