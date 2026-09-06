import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import Institution from "../models/Institution";
import Notice from "../models/Notice";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
};

const REGEX_INCLUI = /(redistribui[cç][aã]o|remo[cç][aã]o|vac[aâ]ncia|movimenta[cç][aã]o)/i;

const REGEX_EXCLUI =
  /(aluno|discente|matr[ií]cula|p[oó]s-gradua[cç][aã]o|mestrado|doutorado|bolsa|est[aá]gio|vestibular|login|autentica[cç][aã]o|formul[aá]rio|extens[aã]o|comprovante)/i;

class ScraperService {
  async encontrarPaginasDeEditais(dominio) {
    const url = dominio.startsWith("http") ? dominio : `https://${dominio}`;

    try {
      const response = await axios.get(url, {
        timeout: 8000,
        httpsAgent,
        headers: HEADERS,
      });
      const $ = cheerio.load(response.data);

      const candidatos = [];

      $("a").each((_, el) => {
        const texto = $(el).text().toLowerCase();
        const href = $(el).attr("href");
        if (!href || href.trim().toLowerCase().startsWith("javascript:") || href.trim() === "#") return;

        let prioridade = null;
        if (/progep|gest[ãa]o de pessoas|desenvolvimento de pessoas/.test(texto)) {
          prioridade = 1;
        } else if (/editais/.test(texto)) {
          prioridade = 2;
        } else if (/concursos?/.test(texto)) {
          prioridade = 3;
        }

        if (prioridade !== null) {
          try {
            candidatos.push({ href: new URL(href, url).href, prioridade });
          } catch {
          }
        }
      });

      if (candidatos.length === 0) return [url];

      candidatos.sort((a, b) => a.prioridade - b.prioridade);

      const vistos = new Set();
      const unicos = [];
      for (const c of candidatos) {
        if (!vistos.has(c.href)) {
          vistos.add(c.href);
          unicos.push(c.href);
        }
        if (unicos.length >= 3) break;
      }

      return unicos;
    } catch (e) {
      return [url];
    }
  }

  async extrairDaPagina(url, inst) {
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 12000,
      httpsAgent,
    });

    const $ = cheerio.load(response.data);
    const seletor = inst.seletor_css || "a";
    const promises = [];

    $(seletor).each((_, element) => {
      const texto = $(element).text().replace(/\s+/g, " ").trim();
      let link = $(element).attr("href");
      if (!link || texto.length < 10) return;

      if (REGEX_INCLUI.test(texto) && !REGEX_EXCLUI.test(texto)) {
        try {
          link = new URL(link, url).href;
        } catch {
          return; 
        }

        const idOrigemUnico = Buffer.from(link).toString("base64").substring(0, 24);

        promises.push(
          Notice.findOneAndUpdate(
            { id_origem: idOrigemUnico },
            {
              id_origem: idOrigemUnico,
              titulo: `${inst.sigla} - ${texto}`,
              url_documento: link,
              instituicao: inst.sigla,
              uf: inst.uf,
              orgao: "PROGEP",
              categoria: "Editais",
              capturado_em: new Date(),
            },
            { upsert: true }
          )
        );
      }
    });

    await Promise.all(promises);
    return promises.length;
  }

  async varrerInstituicao(inst) {
    const resultado = {
      sigla: inst.sigla,
      encontrados: 0,
      erro: null,
      paginas_visitadas: [],
    };

    if (!inst.url_progep || inst.url_progep.includes("google.com")) {
      resultado.erro = "URL de editais não configurada";
      return resultado;
    }

    const candidatos = await this.encontrarPaginasDeEditais(inst.url_progep);
    resultado.paginas_visitadas = candidatos;

    const erros = [];

    for (const url of candidatos) {
      try {
        const encontrados = await this.extrairDaPagina(url, inst);
        resultado.encontrados += encontrados;
      } catch (err) {
        erros.push(`${url} -> ${err.message}`);
      }
    }

    if (erros.length === candidatos.length) {
      resultado.erro = erros.join(" | ");
    }

    return resultado;
  }


  async varrerTodosPortais() {
    try {
      const instituicoes = await Institution.find({ ativo: true });
      const relatorio = [];

      for (const inst of instituicoes) {
        console.log(`[BOT] Processando: ${inst.sigla}`);

        const resultado = await this.varrerInstituicao(inst);
        relatorio.push(resultado);

        if (resultado.erro) {
          console.error(`[BOT] ${inst.sigla}: ${resultado.erro}`);
        } else {
          console.log(`[BOT] ${inst.sigla}: ${resultado.encontrados} editais encontrados/atualizados`);
        }

        await new Promise((r) => setTimeout(r, 1000)); 
      }

      const totalSincronizado = relatorio.reduce((acc, r) => acc + r.encontrados, 0);

      return { sucesso: true, total_itens: totalSincronizado, detalhes: relatorio };
    } catch (error) {
      console.error("Erro fatal na varredura:", error);
      return { sucesso: false, erro: error.message };
    }
  }
}

export default new ScraperService();