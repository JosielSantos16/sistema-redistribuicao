import User from "../models/User";

// Mascara o email pra exibição pública, ex: joao@email.com -> j****@email.com
function mascararEmail(email) {
  if (!email) return "";
  const [usuario, dominio] = email.split("@");
  if (!dominio) return email;
  const visivel = usuario.slice(0, 1);
  return `${visivel}${"*".repeat(Math.max(usuario.length - 1, 3))}@${dominio}`;
}

class MatchController {
  // GET /perfis/buscar?instituicao=UFOPA&cargo=EBTT&estado=SP
  // Busca reais no banco: usuários ativos com interesse de redistribuição
  // declarado, filtrados pelos critérios informados (todos opcionais).
  async index(req, res) {
    try {
      const { instituicao, cargo, estado } = req.query;
      const filtro = { active: true, interesse_redistribuicao: true };

      if (instituicao) filtro.instituicao = instituicao.toUpperCase();
      if (cargo) filtro.cargo = cargo;
      if (estado) filtro.estado_destino = estado.toUpperCase();

      const usuarios = await User.find(filtro).limit(50);

      const resultados = usuarios.map((u) => ({
        id: u._id,
        nome: u.name,
        email: mascararEmail(u.email),
        origem: u.instituicao,
        cargo: u.cargo,
        curso: u.curso,
        lattes: u.lattes,
        destino: u.estado_destino,
        criadoEm: u.createdAt,
      }));

      return res.json(resultados);
    } catch (err) {
      return res.status(500).json({ error: "Erro ao buscar perfis." });
    }
  }
}

export default new MatchController();