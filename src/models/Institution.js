import mongoose from "mongoose";

const InstitutionSchema = new mongoose.Schema(
  {
    nome_antigo: String, 
    sigla: { type: String, required: true, unique: true }, 
    uf: { type: String, required: true },
    url_progep: { type: String, required: false }, 
    tipo_estrutura: { 
      type: String, 
      enum: ["padrao_gov", "tabela_simples", "dinamico_api"], 
      default: "padrao_gov" 
    },
    seletor_css: { type: String, default: "a" }, 
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Institution", InstitutionSchema);