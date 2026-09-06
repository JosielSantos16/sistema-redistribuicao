import User from "../models/User";
import Institution from "../models/Institution";
import Notice from "../models/Notice";

class MapaController {
  async index(req, res) {
    try {
      const porEstadoAgg = await User.aggregate([
        {
          $match: {
            active: true,
            interesse_redistribuicao: true,
            estado_destino: { $exists: true, $ne: null, $ne: "" },
          },
        },
        { $group: { _id: "$estado_destino", total: { $sum: 1 } } },
      ]);

      const por_estado = {};
      porEstadoAgg.forEach((item) => {
        por_estado[item._id] = item.total;
      });

      const [
        docentesCadastrados,
        instituicoesParticipantes,
        solicitacoesRedistribuicao,
        editaisCapturados,
      ] = await Promise.all([
        User.countDocuments({ active: true }),
        Institution.countDocuments({ ativo: true }),
        User.countDocuments({ active: true, interesse_redistribuicao: true }),
        Notice.countDocuments({}),
      ]);

      return res.json({
        totais: {
          docentes_cadastrados: docentesCadastrados,
          instituicoes_participantes: instituicoesParticipantes,
          solicitacoes_redistribuicao: solicitacoesRedistribuicao,
          editais_capturados: editaisCapturados,
        },
        por_estado,
      });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao carregar dados do mapa." });
    }
  }
}

export default new MapaController();