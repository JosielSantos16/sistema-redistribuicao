import mongoose from 'mongoose';
import Institution from '../models/Institution';

const mongoURL = 'mongodb://localhost:27017/sistema-redistribuicao';

const correcoes = [
  { sigla: "UFJ", url_progep: "https://ufj.edu.br" },
  { sigla: "UFRPE", url_progep: "https://ufrpe.br" },
  { sigla: "UFRB", url_progep: "https://ufrb.edu.br" },
  { sigla: "IFS", url_progep: "https://ifs.edu.br" },
  { sigla: "UNIFAP", url_progep: "https://www2.unifap.br" },
  { sigla: "UFRR", url_progep: "https://ufrr.br" },
  { sigla: "UFAC", url_progep: "https://ufac.br" },
];

async function corrigirUrls() {
  try {
    console.log("=== [WOLF BOT] CORRIGINDO URLs COM ERRO CONHECIDO ===");
    await mongoose.connect(mongoURL);

    for (const c of correcoes) {
      const resultado = await Institution.updateOne(
        { sigla: c.sigla },
        { $set: { url_progep: c.url_progep, ativo: true } }
      );
      console.log(`[${resultado.matchedCount > 0 ? "OK" : "NÃO ENCONTRADA"}] ${c.sigla} -> ${c.url_progep}`);
    }

    console.log("=== Concluído. Rode o scraper de novo pra testar. ===");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao corrigir URLs:", error.message);
    process.exit(1);
  }
}

corrigirUrls();