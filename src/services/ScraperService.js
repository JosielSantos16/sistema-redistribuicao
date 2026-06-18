import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import Institution from "../models/Institution";
import Notice from "../models/Notice";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

class ScraperService {
  
  // Método auxiliar para encontrar a melhor URL de editais
  async encontrarPaginaDeEditais(dominio) {
    try {
      const url = dominio.startsWith("http") ? dominio : `https://${dominio}`;
      const response = await axios.get(url, { timeout: 5000, httpsAgent });
      const $ = cheerio.load(response.data);
      
      let linkAlvo = null;
      $('a').each((_, el) => {
        const texto = $(el).text().toLowerCase();
        if (texto.includes('editais') || texto.includes('concursos') || texto.includes('progep')) {
          linkAlvo = $(el).attr('href');
          return false; // Interrompe o loop no primeiro achado
        }
      });
      return linkAlvo ? (linkAlvo.startsWith('http') ? linkAlvo : new URL(linkAlvo, url).href) : url;
    } catch (e) { 
      return dominio; 
    }
  }

  async varrerTodosPortais() {
    try {
      const instituicoes = await Institution.find({ ativo: true });
      let totalSincronizado = 0;

      const regexFiltro = /(redistribuição|remoção|vacância|movimentação)/i;
      const regexExclusao = /(aluno|discente|matrícula|pós-graduação|mestrado|doutorado|bolsa|estágio|vestibular|login|autenticação|formulário|extensão|comprovante)/i;

      for (const inst of instituicoes) {
        console.log(`[BOT] Processando: ${inst.sigla}`);
        
        // Tenta descobrir a URL real, se falhar, usa a do banco
        const urlFinal = await this.encontrarPaginaDeEditais(inst.url_progep || inst.sigla.toLowerCase() + ".edu.br");
        
        try {
          const response = await axios.get(urlFinal, { 
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }, 
            timeout: 10000, 
            httpsAgent 
          });

          const $ = cheerio.load(response.data);
          const promises = [];

          $('a').each((_, element) => {
            const texto = $(element).text().replace(/\s+/g, ' ').trim();
            let link = $(element).attr("href");
            if (!link || texto.length < 10) return;

            if (regexFiltro.test(texto) && !regexExclusao.test(texto)) {
              if (link.startsWith("/")) link = new URL(urlFinal).origin + link;

              const idOrigemUnico = Buffer.from(link).toString("base64").substring(0, 24);

              promises.push(
                Notice.findOneAndUpdate(
                  { id_origem: idOrigemUnico },
                  { 
                    id_origem: idOrigemUnico,
                    titulo: `${inst.sigla} - ${texto}`,
                    url_documento: link,
                    instituicao: inst.sigla,
                    orgao: "PROGEP",
                    categoria: "Editais",
                    capturado_em: new Date()
                  },
                  { upsert: true }
                )
              );
            }
          });

          await Promise.all(promises);
          totalSincronizado += promises.length;
          await new Promise(r => setTimeout(r, 1000)); // Delay entre instituições

        } catch (err) {
          console.error(`Erro em ${inst.sigla}: ${err.message}`);
        }
      }
      
      return { sucesso: true, total_itens: totalSincronizado };
    } catch (error) {
      console.error("Erro fatal na varredura:", error);
      return { sucesso: false, erro: error.message };
    }
  }
}

export default new ScraperService();