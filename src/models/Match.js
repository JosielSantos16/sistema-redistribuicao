import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema(
  {
    solicitante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destinatario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pendente", "aceito", "recusado"],
      default: "pendente",
    },
  },
  {
    timestamps: true,
  }
);

MatchSchema.index({ solicitante: 1, destinatario: 1 }, { unique: true });

export default mongoose.model("Match", MatchSchema);