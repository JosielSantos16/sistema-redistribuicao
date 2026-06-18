import mongoose from 'mongoose';
import Institution from '../models/Institution'; // Case-sensitive corrigido

const mongoURL = 'mongodb://localhost:27017/sistema-redistribuicao'; 

const universidadesNacionais = [
  {
    sigla: "UFOPA",
    uf: "PA",
    url_progep: "https://progep.ufopa.edu.br/progep/documentos-1/formularios-1/14-redistribuicao-remocao-vacancia-movimentacao-e-exoneracao/",
    seletor_css: "a",
    tipo_estrutura: "padrao_gov",
    ativo: true
  },
  {
    sigla: "IFPA",
    uf: "PA",
    url_progep: "https://ifpa.edu.br/index.php/editais-concursos", // Rota Plone permanente
    seletor_css: "a",
    tipo_estrutura: "padrao_gov",
    ativo: true
  },
  {
    sigla: "UFPI",
    uf: "PI",
    url_progep: "https://ufpi.br/editais-ufpi",
    seletor_css: "a",
    tipo_estrutura: "padrao_gov",
    ativo: true
  },
  {
    sigla: "UFAM",
    uf: "AM",
    url_progep: "https://ufam.edu.br/editais-ufam.html", // Sem subdomínio quebrado
    seletor_css: "a",
    tipo_estrutura: "padrao_gov",
    ativo: true
  },
  {
    sigla: "UNIFAP",
    uf: "AP",
    url_progep: "https://www.unifap.br/category/progep/", // Feed de notícias permanente da pró-reitoria
    seletor_css: "a",
    tipo_estrutura: "padrao_gov",
    ativo: true
  },
  {
    sigla: "UFRR",
    uf: "RR",
    url_progep: "https://ufrr.br/concursos", // Concentrador permanente da UFRR
    seletor_css: "a",
    tipo_estrutura: "padrao_gov",
    ativo: true
  },
  {
    sigla: "UFAC",
    uf: "AC",
    url_progep: "https://www.ufac.br/editais/progep", // Rota direta da pasta pública da UFAC
    seletor_css: "a",
    tipo_estrutura: "padrao_gov",
    ativo: true
  },
  {
    sigla: "UFMA",
    uf: "MA",
    url_progep: "https://portais.ufma.br/PortalUfma/paginas/noticias/noticia.jsf", // Página centralizada de notícias institucionais
    seletor_css: "a",
    tipo_estrutura: "padrao_gov",
    ativo: true
  }
];

async function rodarCargaInicial() {
  try {
    console.log("Conectando ao MongoDB para rodar a carga inicial estável...");
    await mongoose.connect(mongoURL);

    await Institution.deleteMany({}); 
    console.log("Banco de dados limpo para atualização...");

    await Institution.insertMany(universidadesNacionais);
    console.log(`Sucesso! ${universidadesNacionais.length} instituições atualizadas em definitivo.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Erro crítico ao executar o seed:", error.message);
    process.exit(1);
  }
}

rodarCargaInicial();