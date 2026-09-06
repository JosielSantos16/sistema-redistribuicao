import mongoose from 'mongoose';
import Institution from '../models/Institution';

const mongoURL = 'mongodb://localhost:27017/sistema-redistribuicao';

const federais = [
  { sigla: "UFAC", uf: "AC", url_progep: "https://www.ufac.br" },
  { sigla: "UNIFAP", uf: "AP", url_progep: "https://www2.unifap.br" },
  { sigla: "UFAM", uf: "AM", url_progep: "https://ufam.edu.br" },
  { sigla: "UFOPA", uf: "PA", url_progep: "https://www.ufopa.edu.br" },
  { sigla: "UFPA", uf: "PA", url_progep: "https://portal.ufpa.br" },
  { sigla: "UNIR", uf: "RO", url_progep: "https://www.unir.br" },
  { sigla: "UFRR", uf: "RR", url_progep: "https://ufrr.br" },
  { sigla: "UNIFESSPA", uf: "PA", url_progep: "https://unifesspa.edu.br" },
  { sigla: "UFT", uf: "TO", url_progep: "https://www.uft.edu.br" },
  { sigla: "UFRA", uf: "PA", url_progep: "https://www.ufra.edu.br" },
  { sigla: "UNILAB", uf: "CE", url_progep: "https://unilab.edu.br" },
  { sigla: "UFAL", uf: "AL", url_progep: "https://www.ufal.br" },
  { sigla: "UFBA", uf: "BA", url_progep: "https://www.ufba.br" },
  { sigla: "UFCG", uf: "PB", url_progep: "https://www.ufcg.edu.br" },
  { sigla: "UFC", uf: "CE", url_progep: "https://www.ufc.br" },
  { sigla: "UFERSA", uf: "RN", url_progep: "https://ufersa.edu.br" },
  { sigla: "UFMA", uf: "MA", url_progep: "https://portais.ufma.br" },
  { sigla: "UFPB", uf: "PB", url_progep: "https://www.ufpb.br" },
  { sigla: "UFPE", uf: "PE", url_progep: "https://www.ufpe.br" },
  { sigla: "UFRPE", uf: "PE", url_progep: "https://www.ufrpe.br" },
  { sigla: "UFPI", uf: "PI", url_progep: "https://ufpi.br" },
  { sigla: "UFRN", uf: "RN", url_progep: "https://www.ufrn.br" },
  { sigla: "UFRB", uf: "BA", url_progep: "https://www.ufrb.edu.br" },
  { sigla: "UFS", uf: "SE", url_progep: "https://www.ufs.br" },
  { sigla: "UNIVASF", uf: "PE", url_progep: "https://www.univasf.edu.br" },
  { sigla: "UFABC", uf: "SP", url_progep: "https://www.ufabc.edu.br" },
  { sigla: "UFES", uf: "ES", url_progep: "https://www.ufes.br" },
  { sigla: "UFJF", uf: "MG", url_progep: "https://www2.ufjf.br" },
  { sigla: "UFLA", uf: "MG", url_progep: "https://ufla.br" },
  { sigla: "UFMG", uf: "MG", url_progep: "https://ufmg.br" },
  { sigla: "UFOP", uf: "MG", url_progep: "https://www.ufop.br" },
  { sigla: "UFRJ", uf: "RJ", url_progep: "https://ufrj.br" },
  { sigla: "UFRRJ", uf: "RJ", url_progep: "https://portal.ufrrj.br" },
  { sigla: "UFF", uf: "RJ", url_progep: "https://www.uff.br" },
  { sigla: "UFSCAR", uf: "SP", url_progep: "https://www.ufscar.br" },
  { sigla: "UFSJ", uf: "MG", url_progep: "https://www.ufsj.edu.br" },
  { sigla: "UFTM", uf: "MG", url_progep: "https://www.uftm.edu.br" },
  { sigla: "UFU", uf: "MG", url_progep: "https://www.ufu.br" },
  { sigla: "UFV", uf: "MG", url_progep: "https://www.ufv.br" },
  { sigla: "UFVJM", uf: "MG", url_progep: "https://www.ufvjm.edu.br" },
  { sigla: "UNIFAL", uf: "MG", url_progep: "https://unifal-mg.edu.br" },
  { sigla: "UNIFEI", uf: "MG", url_progep: "https://unifei.edu.br" },
  { sigla: "UNIRIO", uf: "RJ", url_progep: "https://www.unirio.br" },
  { sigla: "FURG", uf: "RS", url_progep: "https://www.furg.br" },
  { sigla: "UFCSPA", uf: "RS", url_progep: "https://www.ufcspa.edu.br" },
  { sigla: "UFPEL", uf: "RS", url_progep: "https://wp.ufpel.edu.br" },
  { sigla: "UFRGS", uf: "RS", url_progep: "https://www.ufrgs.br" },
  { sigla: "UFSM", uf: "RS", url_progep: "https://www.ufsm.br" },
  { sigla: "UNIPAMPA", uf: "RS", url_progep: "https://unipampa.edu.br" },
  { sigla: "UFFS", uf: "SC", url_progep: "https://www.uffs.edu.br" },
  { sigla: "UFPR", uf: "PR", url_progep: "https://www.ufpr.br" },
  { sigla: "UTFPR", uf: "PR", url_progep: "https://www.utfpr.edu.br" },
  { sigla: "UFSC", uf: "SC", url_progep: "https://www.ufsc.br" },
  { sigla: "UFCAT", uf: "GO", url_progep: "https://www.ufcat.edu.br" },
  { sigla: "UFJ", uf: "GO", url_progep: "https://www.ufj.edu.br" },
  { sigla: "UFG", uf: "GO", url_progep: "https://www.ufg.br" },
  { sigla: "UFMS", uf: "MS", url_progep: "https://www.ufms.br" },
  { sigla: "UFMT", uf: "MT", url_progep: "https://www.ufmt.br" },
  { sigla: "UNB", uf: "DF", url_progep: "https://www.unb.br" },
  { sigla: "IFAC", uf: "AC", url_progep: "https://www.ifac.edu.br" },
  { sigla: "IFAP", uf: "AP", url_progep: "https://www.ifap.edu.br" },
  { sigla: "IFAM", uf: "AM", url_progep: "https://www.ifam.edu.br" },
  { sigla: "IFPA", uf: "PA", url_progep: "https://ifpa.edu.br" },
  { sigla: "IFRR", uf: "RR", url_progep: "https://www.ifrr.edu.br" },
  { sigla: "IFRO", uf: "RO", url_progep: "https://portal.ifro.edu.br" },
  { sigla: "IFTO", uf: "TO", url_progep: "https://www.ifto.edu.br" },
  { sigla: "IFAL", uf: "AL", url_progep: "https://www2.ifal.edu.br" },
  { sigla: "IFBA", uf: "BA", url_progep: "https://portal.ifba.edu.br" },
  { sigla: "IFCE", uf: "CE", url_progep: "https://ifce.edu.br" },
  { sigla: "IFMA", uf: "MA", url_progep: "https://ifma.edu.br" },
  { sigla: "IFPB", uf: "PB", url_progep: "https://www.ifpb.edu.br" },
  { sigla: "IFPE", uf: "PE", url_progep: "https://ifpe.edu.br" },
  { sigla: "IFPI", uf: "PI", url_progep: "https://www.ifpi.edu.br" },
  { sigla: "IFRN", uf: "RN", url_progep: "https://portal.ifrn.edu.br" },
  { sigla: "IFS", uf: "SE", url_progep: "https://www.ifs.edu.br" },
  { sigla: "IFSERTAO-PE", uf: "PE", url_progep: "https://www.ifsertao-pe.edu.br" },
  { sigla: "IFBAIANO", uf: "BA", url_progep: "https://www.ifbaiano.edu.br" },
  { sigla: "IFES", uf: "ES", url_progep: "https://www.ifes.edu.br" },
  { sigla: "IFMG", uf: "MG", url_progep: "https://www.ifmg.edu.br" },
  { sigla: "IFF", uf: "RJ", url_progep: "https://portal.iff.edu.br" },
  { sigla: "IFRJ", uf: "RJ", url_progep: "https://www.ifrj.edu.br" },
  { sigla: "IFSUDESTEMG", uf: "MG", url_progep: "https://www.ifsudestemg.edu.br" },
  { sigla: "IFTM", uf: "MG", url_progep: "https://www.iftm.edu.br" },
  { sigla: "IFSP", uf: "SP", url_progep: "https://ifsp.edu.br" },
  { sigla: "IFPR", uf: "PR", url_progep: "https://ifpr.edu.br" },
  { sigla: "IFRS", uf: "RS", url_progep: "https://ifrs.edu.br" },
  { sigla: "IFSC", uf: "SC", url_progep: "https://www.ifsc.edu.br" },
  { sigla: "IFSUL", uf: "RS", url_progep: "https://www.ifsul.edu.br" },
  { sigla: "IFFARROUPILHA", uf: "RS", url_progep: "https://www.iffarroupilha.edu.br" },
  { sigla: "IFB", uf: "DF", url_progep: "https://www.ifb.edu.br" },
  { sigla: "IFG", uf: "GO", url_progep: "https://www.ifg.edu.br" },
  { sigla: "IFGOIANO", uf: "GO", url_progep: "https://www.ifgoiano.edu.br" },
  { sigla: "IFMT", uf: "MT", url_progep: "https://www.ifmt.edu.br" },
  { sigla: "IFMS", uf: "MS", url_progep: "https://www.ifms.edu.br" },
  { sigla: "CEFETMG", uf: "MG", url_progep: "https://www.cefetmg.br" },
  { sigla: "CEFETRJ", uf: "RJ", url_progep: "https://www.cefet-rj.br" },
];

async function seedFederais() {
  try {
    console.log("=== [WOLF BOT] SEED DE UNIVERSIDADES E INSTITUTOS FEDERAIS ===");
    await mongoose.connect(mongoURL);

    let inseridas = 0;
    let atualizadas = 0;
    let preservadas = 0;

    for (const inst of federais) {
      const existente = await Institution.findOne({ sigla: inst.sigla });

      const temUrlValida =
        existente &&
        existente.url_progep &&
        existente.url_progep.trim() !== "" &&
        !existente.url_progep.includes("google.com");

      if (temUrlValida) {
        preservadas++;
        continue;
      }

      const resultado = await Institution.updateOne(
        { sigla: inst.sigla },
        {
          $set: {
            sigla: inst.sigla,
            uf: inst.uf,
            url_progep: inst.url_progep,
            seletor_css: "a",
            tipo_estrutura: "padrao_gov",
            ativo: true,
          },
        },
        { upsert: true }
      );

      if (resultado.upsertedCount > 0) {
        inseridas++;
      } else {
        atualizadas++;
      }
    }

    console.log(`[✓] ${inseridas} instituições novas inseridas e ativadas.`);
    console.log(`[✓] ${atualizadas} instituições existentes (vazias/inativas) foram preenchidas e ativadas.`);
    console.log(`[i] ${preservadas} já tinham URL válida configurada e foram preservadas sem alteração.`);
    console.log("Rode o scraper e confira o campo 'pagina_visitada' de cada uma pra corrigir URLs erradas.");

    process.exit(0);
  } catch (error) {
    console.error("Erro crítico no seed de federais:", error.message);
    process.exit(1);
  }
}

seedFederais();