import mongoose from 'mongoose';
import Institution from '../models/Institution';

const mongoURL = 'mongodb://localhost:27017/sistema-redistribuicao';

async function bulkConfigure() {
  try {
    console.log("=== [WOLF BOT] ATIVANDO INSTITUIÇÕES COM URL VÁLIDA ===");
    await mongoose.connect(mongoURL);

    const resultado = await Institution.updateMany(
      {
        universidade: { $regex: /FEDERAL|INSTITUTO/i },
        url_progep: { $exists: true, $ne: "", $not: /google\.com/i },
      },
      {
        $set: {
          ativo: true,
          seletor_css: "a",
        },
      }
    );

    console.log(`[✓] ${resultado.modifiedCount} instituições ativadas para varredura.`);
    console.log("Instituições Federais/Institutos SEM url_progep cadastrada continuam inativas.");
    console.log("Cadastre a URL real (ex: via updateUrls.js) antes de ativá-las.");

    process.exit(0);
  } catch (error) {
    console.error("Erro ao configurar instituições:", error.message);
    process.exit(1);
  }
}

bulkConfigure();