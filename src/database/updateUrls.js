import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Institution from '../models/Institution';

const mongoURL = 'mongodb://localhost:27017/sistema-redistribuicao';

async function atualizarUrls() {
  await mongoose.connect(mongoURL);
  const jsonPath = path.resolve(process.cwd(), 'universidades-br.json');
  const dados = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log("=== [WOLF BOT] CORRIGINDO URLs DO TCC ===");
  
  for (const inst of dados) {
    // Só atualiza se o campo url_progep no JSON existir
    if (inst.url_progep) { 
      await Institution.updateOne(
        { sigla: inst.sigla },
        { $set: { url_progep: inst.url_progep } }
      );
      console.log(`[OK] ${inst.sigla} atualizada.`);
    }
  }
  
  console.log("=== [WOLF BOT] TODAS AS URLs ATUALIZADAS ===");
  process.exit(0);
}

atualizarUrls();