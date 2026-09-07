import mongoose from 'mongoose';
import Notice from '../models/Notice';

const mongoURL = 'mongodb://localhost:27017/sistema-redistribuicao';

const REGEX_INCLUI = /(redistribui[cç][aã]o|remo[cç][aã]o|vac[aâ]ncia|movimenta[cç][aã]o)/i;
const REGEX_EXCLUI =
  /(aluno|discente|matr[ií]cula|p[oó]s-gradua[cç][aã]o|mestrado|doutorado|bolsa|est[aá]gio|vestibular|login|autentica[cç][aã]o|formul[aá]rio|extens[aã]o|comprovante)/i;

async function limpar() {
  try {
    console.log("=== [WOLF BOT] LIMPANDO EDITAIS INVÁLIDOS/DESATUALIZADOS ===");
    await mongoose.connect(mongoURL);

    const todos = await Notice.find({});
    let removidos = 0;

    for (const n of todos) {
      const semLinkValido =
        !n.url_documento ||
        n.url_documento.trim() === "" ||
        n.url_documento.trim().endsWith("#");

      const textoInvalido =
        !REGEX_INCLUI.test(n.titulo || "") || REGEX_EXCLUI.test(n.titulo || "");

      if (semLinkValido || textoInvalido) {
        await Notice.deleteOne({ _id: n._id });
        removidos++;
      }
    }

    console.log(`[✓] ${removidos} editais inválidos ou desatualizados removidos.`);
    console.log(`[i] ${todos.length - removidos} editais continuam válidos no banco.`);

    process.exit(0);
  } catch (error) {
    console.error("Erro ao limpar editais:", error.message);
    process.exit(1);
  }
}

limpar();