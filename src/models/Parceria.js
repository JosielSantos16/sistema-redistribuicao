import mongoose from "mongoose";

const ParceriaSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    proposta: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Parceria", ParceriaSchema);