import mongoose from "mongoose";

const MensagemSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    remetente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    texto: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    lida: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Mensagem", MensagemSchema);