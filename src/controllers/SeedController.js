import bcrypt from "bcryptjs";
import User from "../models/User";
import Institution from "../models/Institution";

const usuariosDemo = [
  { name: "Ana Souza", cpf: "10000000001", email: "ana.souza@demo.wolf", instituicao: "UFOPA", departamento: "Ciência da Computação", cargo: "Magistério Superior", curso: "Sistemas de Informação", estado_destino: "SP", lattes: "http://lattes.cnpq.br/0000000000001", foto_url: "https://i.pravatar.cc/300?u=ana.souza@demo.wolf" },
  { name: "Bruno Lima", cpf: "10000000002", email: "bruno.lima@demo.wolf", instituicao: "IFPA", departamento: "Eletromecânica", cargo: "EBTT", curso: "Técnico em Eletromecânica", estado_destino: "SP", lattes: "http://lattes.cnpq.br/0000000000002", foto_url: "https://i.pravatar.cc/300?u=bruno.lima@demo.wolf" },
  { name: "Carla Nunes", cpf: "10000000003", email: "carla.nunes@demo.wolf", instituicao: "UFPI", departamento: "Letras", cargo: "Magistério Superior", curso: "Letras", estado_destino: "CE", lattes: "http://lattes.cnpq.br/0000000000003", foto_url: "https://i.pravatar.cc/300?u=carla.nunes@demo.wolf" },
  { name: "Daniel Rocha", cpf: "10000000004", email: "daniel.rocha@demo.wolf", instituicao: "UFPE", departamento: "Engenharia", cargo: "Magistério Superior", curso: "Engenharia Civil", estado_destino: "PE", lattes: "http://lattes.cnpq.br/0000000000004", foto_url: "https://i.pravatar.cc/300?u=daniel.rocha@demo.wolf" },
  { name: "Elisa Martins", cpf: "10000000005", email: "elisa.martins@demo.wolf", instituicao: "UFRGS", departamento: "Química", cargo: "Magistério Superior", curso: "Química", estado_destino: "RS", lattes: "http://lattes.cnpq.br/0000000000005", foto_url: "https://i.pravatar.cc/300?u=elisa.martins@demo.wolf" },
  { name: "Fábio Alves", cpf: "10000000006", email: "fabio.alves@demo.wolf", instituicao: "UFMG", departamento: "Administração", cargo: "EBTT", curso: "Administração", estado_destino: "MG", lattes: "http://lattes.cnpq.br/0000000000006", foto_url: "https://i.pravatar.cc/300?u=fabio.alves@demo.wolf" },
  { name: "Gabriela Dias", cpf: "10000000007", email: "gabriela.dias@demo.wolf", instituicao: "UFRJ", departamento: "Direito", cargo: "Magistério Superior", curso: "Direito", estado_destino: "RJ", lattes: "http://lattes.cnpq.br/0000000000007", foto_url: "https://i.pravatar.cc/300?u=gabriela.dias@demo.wolf" },
  { name: "Henrique Costa", cpf: "10000000008", email: "henrique.costa@demo.wolf", instituicao: "IFBAIANO", departamento: "Agropecuária", cargo: "EBTT", curso: "Técnico em Agropecuária", estado_destino: "BA", lattes: "http://lattes.cnpq.br/0000000000008", foto_url: "https://i.pravatar.cc/300?u=henrique.costa@demo.wolf" },
  { name: "Isabela Freitas", cpf: "10000000009", email: "isabela.freitas@demo.wolf", instituicao: "UFC", departamento: "Enfermagem", cargo: "Magistério Superior", curso: "Enfermagem", estado_destino: "CE", lattes: "http://lattes.cnpq.br/0000000000009", foto_url: "https://i.pravatar.cc/300?u=isabela.freitas@demo.wolf" },
  { name: "João Pereira", cpf: "10000000010", email: "joao.pereira@demo.wolf", instituicao: "UFABC", departamento: "Física", cargo: "Magistério Superior", curso: "Física", estado_destino: "SP", lattes: "http://lattes.cnpq.br/0000000000010", foto_url: "https://i.pravatar.cc/300?u=joao.pereira@demo.wolf" },
  { name: "Karina Melo", cpf: "10000000011", email: "karina.melo@demo.wolf", instituicao: "UFOPA", departamento: "Pedagogia", cargo: "Magistério Superior", curso: "Pedagogia", estado_destino: "PA", lattes: "http://lattes.cnpq.br/0000000000011", foto_url: "https://i.pravatar.cc/300?u=karina.melo@demo.wolf" },
  { name: "Lucas Ferreira", cpf: "10000000012", email: "lucas.ferreira@demo.wolf", instituicao: "UFPA", departamento: "Matemática", cargo: "Magistério Superior", curso: "Matemática", estado_destino: "PA", lattes: "http://lattes.cnpq.br/0000000000012", foto_url: "https://i.pravatar.cc/300?u=lucas.ferreira@demo.wolf" },
  { name: "Mariana Ramos", cpf: "10000000013", email: "mariana.ramos@demo.wolf", instituicao: "UFRRJ", departamento: "Veterinária", cargo: "Magistério Superior", curso: "Medicina Veterinária", estado_destino: "RJ", lattes: "http://lattes.cnpq.br/0000000000013", foto_url: "https://i.pravatar.cc/300?u=mariana.ramos@demo.wolf" },
  { name: "Nicolas Barros", cpf: "10000000014", email: "nicolas.barros@demo.wolf", instituicao: "UFRN", departamento: "Turismo", cargo: "EBTT", curso: "Turismo", estado_destino: "RN", lattes: "http://lattes.cnpq.br/0000000000014", foto_url: "https://i.pravatar.cc/300?u=nicolas.barros@demo.wolf" },
  { name: "Olívia Cardoso", cpf: "10000000015", email: "olivia.cardoso@demo.wolf", instituicao: "UFLA", departamento: "Agronomia", cargo: "Magistério Superior", curso: "Agronomia", estado_destino: "MG", lattes: "http://lattes.cnpq.br/0000000000015", foto_url: "https://i.pravatar.cc/300?u=olivia.cardoso@demo.wolf" },
  { name: "Pedro Vieira", cpf: "10000000016", email: "pedro.vieira@demo.wolf", instituicao: "IFPR", departamento: "Informática", cargo: "EBTT", curso: "Técnico em Informática", estado_destino: "PR", lattes: "http://lattes.cnpq.br/0000000000016", foto_url: "https://i.pravatar.cc/300?u=pedro.vieira@demo.wolf" },
  { name: "Queila Santos", cpf: "10000000017", email: "queila.santos@demo.wolf", instituicao: "UFMS", departamento: "Zootecnia", cargo: "Magistério Superior", curso: "Zootecnia", estado_destino: "MS", lattes: "http://lattes.cnpq.br/0000000000017", foto_url: "https://i.pravatar.cc/300?u=queila.santos@demo.wolf" },
  { name: "Rafael Teixeira", cpf: "10000000018", email: "rafael.teixeira@demo.wolf", instituicao: "UFPE", departamento: "Odontologia", cargo: "Magistério Superior", curso: "Odontologia", estado_destino: "PE", lattes: "http://lattes.cnpq.br/0000000000018", foto_url: "https://i.pravatar.cc/300?u=rafael.teixeira@demo.wolf" },
  { name: "Sofia Andrade", cpf: "10000000019", email: "sofia.andrade@demo.wolf", instituicao: "UFOPA", departamento: "Biologia", cargo: "Magistério Superior", curso: "Ciências Biológicas", estado_destino: "SP", lattes: "http://lattes.cnpq.br/0000000000019", foto_url: "https://i.pravatar.cc/300?u=sofia.andrade@demo.wolf" },
  { name: "Thiago Moreira", cpf: "10000000020", email: "thiago.moreira@demo.wolf", instituicao: "IFS", departamento: "Química", cargo: "EBTT", curso: "Técnico em Química", estado_destino: "SE", lattes: "http://lattes.cnpq.br/0000000000020", foto_url: "https://i.pravatar.cc/300?u=thiago.moreira@demo.wolf" },
];

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

class SeedController {
  async usuariosDemo(req, res) {
    try {
      const senhaHash = await bcrypt.hash("Demo1234", 8);
      let criados = 0;
      let atualizados = 0;

      for (const u of usuariosDemo) {
        const existente = await User.findOne({ email: u.email });

        if (existente) {
          await User.updateOne(
            { email: u.email },
            { $set: { lattes: u.lattes, foto_url: u.foto_url } }
          );
          atualizados++;
          continue;
        }

        await User.create({
          ...u,
          data_nascimento: new Date("1990-01-01"),
          password_hash: senhaHash,
          interesse_redistribuicao: true,
          active: true,
        });
        criados++;
      }

      return res.json({
        mensagem: "Seed de usuários demo executado com sucesso.",
        criados,
        atualizados,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async instituicoes(req, res) {
    try {
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

      return res.json({
        mensagem: "Seed de instituições executado com sucesso.",
        inseridas,
        atualizadas,
        preservadas,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new SeedController();