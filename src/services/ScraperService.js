import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import Institution from "../models/Institution";
import Notice from "../models/Notice";
import User from "../models/User";
import Mail from "../lib/Mail";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
};

const REGEX_INCLUI = /(redistribui[cç][aã]o|remo[cç][aã]o|vac[aâ]ncia|movimenta[cç][aã]o)/i;

const REGEX_EXCLUI =
  /(aluno|discente|matr[ií]cula|p[oó]s-gradua[cç][aã]o|mestrado|doutorado|bolsa|est[aá]gio|vestibular|login|autentica[cç][aã]o|formul[aá]rio|extens[aã]o|comprovante)/i;

const REGEX_PROCESSO_ENCERRADO =
  /resultado\s+(da|do)\s+(homologa[çc][ãa]o|processo|prova)|processo\s+encerrado|inscri[çc][õo]es\s+encerradas|homologa[çc][ãa]o\s+(final|do\s+resultado)/i;

async function analisarPaginaDestino(link) {
  try {
    const response = await axios.get(link, {
      headers: HEADERS,
      timeout: 10000,
      httpsAgent,
    });
    const $ = cheerio.load(response.data);
    const textoPagina = $("body").text();

    const encerrado = REGEX_PROCESSO_ENCERRADO.test(textoPagina);

    const rotulos = [
      /publicad[oa][^0-9]*(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      /atualiza[çc][ãa]o[^0-9]*(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
    ];

    for (const padrao of rotulos) {
      const match = textoPagina.match(padrao);
      if (match) {
        const [, dia, mes, ano] = match;
        const data = new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`);
        if (!isNaN(data.getTime())) return { data, encerrado };
      }
    }

    const inicioTexto = textoPagina.slice(0, 1500);
    const matchGenerico = inicioTexto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (matchGenerico) {
      const [, dia, mes, ano] = matchGenerico;
      const data = new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`);
      if (!isNaN(data.getTime())) return { data, encerrado };
    }

    return { data: null, encerrado };
  } catch (e) {
    return { data: null, encerrado: false }; 
  }
}

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
        if (REGEX_INCLUI.test(texto)) {
          prioridade = 0;
        } else if (/progep|gest[ãa]o de pessoas|desenvolvimento de pessoas/.test(texto)) {
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
    const candidatos = [];

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

        if (link.endsWith("#") || link === url) return;

        candidatos.push({ texto, link });
      }
    });

    const doisAnosAtras = new Date();
    doisAnosAtras.setFullYear(doisAnosAtras.getFullYear() - 2);

    let salvos = 0;
    const novos = [];

    for (const { texto, link } of candidatos) {
      const { data: dataEncontrada, encerrado } = await analisarPaginaDestino(link);

      if (encerrado) {
        continue;
      }
      if (dataEncontrada && dataEncontrada < doisAnosAtras) {
        continue;
      }

      const idOrigemUnico = Buffer.from(link).toString("base64").substring(0, 24);
      const titulo = `${inst.sigla} - ${texto}`;

      const jaExistia = await Notice.exists({ id_origem: idOrigemUnico });

      await Notice.findOneAndUpdate(
        { id_origem: idOrigemUnico },
        {
          id_origem: idOrigemUnico,
          titulo,
          url_documento: link,
          instituicao: inst.sigla,
          uf: inst.uf,
          orgao: "PROGEP",
          categoria: "Editais",
          capturado_em: new Date(),
          ...(dataEncontrada ? { data_publicacao: dataEncontrada } : {}),
        },
        { upsert: true }
      );

      salvos++;

      if (!jaExistia) {
        novos.push({ titulo, url_documento: link, instituicao: inst.sigla, uf: inst.uf });
      }
    }

    return { salvos, novos };
  }

  async varrerInstituicao(inst) {
    const resultado = {
      sigla: inst.sigla,
      encontrados: 0,
      erro: null,
      paginas_visitadas: [],
      novos: [],
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
        const { salvos, novos } = await this.extrairDaPagina(url, inst);
        resultado.encontrados += salvos;
        resultado.novos.push(...novos);
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
      const todosNovos = [];

      for (const inst of instituicoes) {
        console.log(`[BOT] Processando: ${inst.sigla}`);

        const resultado = await this.varrerInstituicao(inst);
        relatorio.push(resultado);
        todosNovos.push(...resultado.novos);

        if (resultado.erro) {
          console.error(`[BOT] ${inst.sigla}: ${resultado.erro}`);
        } else {
          console.log(`[BOT] ${inst.sigla}: ${resultado.encontrados} editais encontrados/atualizados`);
        }

        await new Promise((r) => setTimeout(r, 1000)); 
      }

      const totalSincronizado = relatorio.reduce((acc, r) => acc + r.encontrados, 0);

      if (todosNovos.length > 0) {
        console.log(`[BOT] ${todosNovos.length} editais novos — verificando quem avisar por e-mail...`);
        await this.notificarNovosEditais(todosNovos);
      }

      return { sucesso: true, total_itens: totalSincronizado, detalhes: relatorio };
    } catch (error) {
      console.error("Erro fatal na varredura:", error);
      return { sucesso: false, erro: error.message };
    }
  }

  async notificarNovosEditais(novosEditais) {
    try {
      const usuarios = await User.find({
        active: true,
        notificar_email_edital: { $ne: false },
        $or: [
          { estado_destino: { $exists: true, $ne: null, $ne: "" } },
          { instituicao: { $exists: true, $ne: null, $ne: "" } },
        ],
      });

      for (const usuario of usuarios) {
        const relevantes = novosEditais.filter(
          (e) =>
            (usuario.estado_destino && e.uf === usuario.estado_destino) ||
            (usuario.instituicao && e.instituicao === usuario.instituicao)
        );

        if (relevantes.length === 0) continue;

        try {
          await Mail.sendMail({
            to: `${usuario.name} <${usuario.email}>`,
            subject:
              relevantes.length === 1
                ? "Novo edital encontrado para você - Sistema WOLF"
                : `${relevantes.length} novos editais encontrados para você - Sistema WOLF`,
            template: "novos_editais",
            context: { nome: usuario.name, editais: relevantes },
          });
        } catch (err) {
          console.error(`[BOT] Erro ao notificar ${usuario.email} sobre editais novos:`, err.message);
        }
      }
    } catch (error) {
      console.error("Erro ao notificar sobre editais novos:", error.message);
    }
  }
}

export default new ScraperService();