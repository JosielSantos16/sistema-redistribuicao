import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import Institution from '../models/Institution';

const mongoURL = 'mongodb://localhost:27017/sistema-redistribuicao';

// Lê o arquivo JSON com segurança absoluta
const jsonPath = path.resolve(process.cwd(), 'universidades-br.json');
const listaUniversidades = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

async function importarLista() {
  try {
    console.log("=== [WOLF BOT] INICIANDO SINCRONIZAÇÃO NACIONAL ===");
    await mongoose.connect(mongoURL);

    // Mapeamento das operações para evitar o erro E11000 (duplicatas)
    const operations = listaUniversidades.map(inst => ({
      updateOne: {
        filter: { sigla: inst.sigla },
        update: { 
          $set: { 
            sigla: inst.sigla,
            universidade: inst.universidade,
            uf: inst.uf,
            seletor_css: "a",
            tipo_estrutura: "padrao_gov"
          },
          // Só define o estado inicial se a instituição for nova no banco
          $setOnInsert: { 
            ativo: false, 
            url_progep: "" 
          } 
        },
        upsert: true
      }
    }));

    const resultado = await Institution.bulkWrite(operations);
    
    console.log(`[✓] Sincronização concluída com sucesso!`);
    console.log(`- Total processado: ${listaUniversidades.length}`);
    console.log(`- Instituições novas criadas: ${resultado.upsertedCount}`);
    console.log(`- Instituições atualizadas: ${resultado.modifiedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error("\n[X] Erro crítico na sincronização:", error.message);
    process.exit(1);
  }
}

importarLista();