import Institution from '../models/Institution';

async function bulkConfigure() {
  // Configura automaticamente todas que contêm "FEDERAL" no nome
  await Institution.updateMany(
    { universidade: { $regex: /FEDERAL|INSTITUTO/i } },
    { 
      $set: { 
        ativo: true, 
        seletor_css: "a", // O seletor global que criamos no ScraperService
        url_progep: "https://www.google.com/search?q=editais+progep+instituicao" // A jogada de mestre
      } 
    }
  );
}