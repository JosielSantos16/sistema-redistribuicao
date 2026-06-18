import mongoose from "mongoose";

const InstitutionSchema = new mongoose.Schema(
  {
    nome_antigo: String, // Ex: "Universidade Federal do Oeste do Pará"
    sigla: { type: String, required: true, unique: true }, // Ex: "UFOPA"
    uf: { type: String, required: true }, // Ex: "PA"
    url_progep: { type: String, required: false }, // A URL da página de editais/documentos
    tipo_estrutura: { 
      type: String, 
      enum: ["padrao_gov", "tabela_simples", "dinamico_api"], 
      default: "padrao_gov" 
    },
    seletor_css: { type: String, default: "a" }, // O que o Cheerio deve buscar na página
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Institution", InstitutionSchema);