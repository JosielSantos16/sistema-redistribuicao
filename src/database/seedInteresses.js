import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const mongoURL = 'mongodb://localhost:27017/sistema-redistribuicao';

/**
 * SEED DE DEMONSTRAÇÃO — cria usuários fictícios ATIVOS com interesse de
 * redistribuição/remoção declarado, pra popular o Mapa de Interesse e a
 * Busca de Perfis enquanto não há cadastros reais suficientes.
 *
 * IMPORTANTE: isso é dado de demonstração para desenvolvimento/apresentação
 * do TCC, não para produção. Antes de uma entrega/demo real com usuários
 * de verdade, rode um script de limpeza (ex: apagar todos com
 * email terminando em "@demo.wolf") ou remova manualmente esses registros.
 */
const usuariosDemo = [
  { name: "Ana Souza", cpf: "10000000001", email: "ana.souza@demo.wolf", instituicao: "UFOPA", departamento: "Ciência da Computação", cargo: "Magistério Superior", curso: "Sistemas de Informação", estado_destino: "SP" },
  { name: "Bruno Lima", cpf: "10000000002", email: "bruno.lima@demo.wolf", instituicao: "IFPA", departamento: "Eletromecânica", cargo: "EBTT", curso: "Técnico em Eletromecânica", estado_destino: "SP" },
  { name: "Carla Nunes", cpf: "10000000003", email: "carla.nunes@demo.wolf", instituicao: "UFPI", departamento: "Letras", cargo: "Magistério Superior", curso: "Letras", estado_destino: "CE" },
  { name: "Daniel Rocha", cpf: "10000000004", email: "daniel.rocha@demo.wolf", instituicao: "UFPE", departamento: "Engenharia", cargo: "Magistério Superior", curso: "Engenharia Civil", estado_destino: "PE" },
  { name: "Elisa Martins", cpf: "10000000005", email: "elisa.martins@demo.wolf", instituicao: "UFRGS", departamento: "Química", cargo: "Magistério Superior", curso: "Química", estado_destino: "RS" },
  { name: "Fábio Alves", cpf: "10000000006", email: "fabio.alves@demo.wolf", instituicao: "UFMG", departamento: "Administração", cargo: "EBTT", curso: "Administração", estado_destino: "MG" },
  { name: "Gabriela Dias", cpf: "10000000007", email: "gabriela.dias@demo.wolf", instituicao: "UFRJ", departamento: "Direito", cargo: "Magistério Superior", curso: "Direito", estado_destino: "RJ" },
  { name: "Henrique Costa", cpf: "10000000008", email: "henrique.costa@demo.wolf", instituicao: "IFBAIANO", departamento: "Agropecuária", cargo: "EBTT", curso: "Técnico em Agropecuária", estado_destino: "BA" },
  { name: "Isabela Freitas", cpf: "10000000009", email: "isabela.freitas@demo.wolf", instituicao: "UFC", departamento: "Enfermagem", cargo: "Magistério Superior", curso: "Enfermagem", estado_destino: "CE" },
  { name: "João Pereira", cpf: "10000000010", email: "joao.pereira@demo.wolf", instituicao: "UFABC", departamento: "Física", cargo: "Magistério Superior", curso: "Física", estado_destino: "SP" },
  { name: "Karina Melo", cpf: "10000000011", email: "karina.melo@demo.wolf", instituicao: "UFOPA", departamento: "Pedagogia", cargo: "Magistério Superior", curso: "Pedagogia", estado_destino: "PA" },
  { name: "Lucas Ferreira", cpf: "10000000012", email: "lucas.ferreira@demo.wolf", instituicao: "UFPA", departamento: "Matemática", cargo: "Magistério Superior", curso: "Matemática", estado_destino: "PA" },
  { name: "Mariana Ramos", cpf: "10000000013", email: "mariana.ramos@demo.wolf", instituicao: "UFRRJ", departamento: "Veterinária", cargo: "Magistério Superior", curso: "Medicina Veterinária", estado_destino: "RJ" },
  { name: "Nicolas Barros", cpf: "10000000014", email: "nicolas.barros@demo.wolf", instituicao: "UFRN", departamento: "Turismo", cargo: "EBTT", curso: "Turismo", estado_destino: "RN" },
  { name: "Olívia Cardoso", cpf: "10000000015", email: "olivia.cardoso@demo.wolf", instituicao: "UFLA", departamento: "Agronomia", cargo: "Magistério Superior", curso: "Agronomia", estado_destino: "MG" },
  { name: "Pedro Vieira", cpf: "10000000016", email: "pedro.vieira@demo.wolf", instituicao: "IFPR", departamento: "Informática", cargo: "EBTT", curso: "Técnico em Informática", estado_destino: "PR" },
  { name: "Queila Santos", cpf: "10000000017", email: "queila.santos@demo.wolf", instituicao: "UFMS", departamento: "Zootecnia", cargo: "Magistério Superior", curso: "Zootecnia", estado_destino: "MS" },
  { name: "Rafael Teixeira", cpf: "10000000018", email: "rafael.teixeira@demo.wolf", instituicao: "UFPE", departamento: "Odontologia", cargo: "Magistério Superior", curso: "Odontologia", estado_destino: "PE" },
  { name: "Sofia Andrade", cpf: "10000000019", email: "sofia.andrade@demo.wolf", instituicao: "UFOPA", departamento: "Biologia", cargo: "Magistério Superior", curso: "Ciências Biológicas", estado_destino: "SP" },
  { name: "Thiago Moreira", cpf: "10000000020", email: "thiago.moreira@demo.wolf", instituicao: "IFS", departamento: "Química", cargo: "EBTT", curso: "Técnico em Química", estado_destino: "SE" },
];

async function seedInteresses() {
  try {
    console.log("=== [WOLF BOT] SEED DE USUÁRIOS DE DEMONSTRAÇÃO (Mapa de Interesse) ===");
    await mongoose.connect(mongoURL);

    const senhaHash = await bcrypt.hash("Demo1234", 8);
    let criados = 0;
    let jaExistiam = 0;

    for (const u of usuariosDemo) {
      const existente = await User.findOne({ email: u.email });
      if (existente) {
        jaExistiam++;
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

    console.log(`[✓] ${criados} usuários de demonstração criados.`);
    console.log(`[i] ${jaExistiam} já existiam e foram ignorados.`);
    console.log("Todos com senha 'Demo1234' (apenas para testes locais).");

    process.exit(0);
  } catch (error) {
    console.error("Erro ao criar usuários de demonstração:", error.message);
    process.exit(1);
  }
}

seedInteresses();