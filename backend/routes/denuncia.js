const express = require("express")
const router = express.Router()
const db = require("../models")

const Denuncia = db.Denuncia
const Usuario = db.Usuario
const Transacao = db.Transacao

const MOTIVOS_VALIDOS = ["FRAUDE", "GOLPE", "ENGANO", "INVASAO_CONTA", "OUTROS"]

router.get("/", async (req, res) => {
  const { id_denunciante } = req.query

  try {
    const denuncias = await Denuncia.findAll({
      where: id_denunciante ? { id_denunciante } : undefined,
      include: [
        {
          model: Usuario,
          as: "denunciado",
          attributes: ["id", "nome", "cpf"],
        },
      ],
      order: [["data_denuncia", "DESC"]],
    })

    res.json(denuncias)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: "Erro ao buscar denúncias." })
  }
})

router.post("/", async (req, res) => {
  const { id_denunciante, id_denunciado, valor_roubado, e2e_id, transacao_id, motivo, descricao } = req.body

  if (!id_denunciante || !id_denunciado) {
    return res.status(400).json({ erro: "id_denunciante e id_denunciado são obrigatórios." })
  }

  if (Number(id_denunciante) === Number(id_denunciado)) {
    return res.status(400).json({ erro: "Não é possível denunciar a si mesmo." })
  }

  if (!e2e_id && !transacao_id) {
    return res.status(400).json({ erro: "e2e_id ou transacao_id da transação é obrigatório." })
  }

  const motivoFinal = motivo && MOTIVOS_VALIDOS.includes(motivo) ? motivo : "FRAUDE"

  try {
    const resultado = await db.sequelize.transaction(async (t) => {
      // Localiza a transação pelo e2e_id (código de operação) ou pelo transacao_id
      let transacao
      if (e2e_id) {
        transacao = await Transacao.findOne({ where: { e2e_id }, transaction: t })
      }
      if (!transacao && transacao_id) {
        transacao = await Transacao.findByPk(transacao_id, { transaction: t })
      }

      if (!transacao) {
        throw Object.assign(new Error("Transação não encontrada."), { status: 404 })
      }

      // Previne duplicata pela transacao_id (garantia única independente do e2e_id)
      const existente = await Denuncia.findOne({
        where: { transacao_id: transacao.id },
        transaction: t,
      })
      if (existente) {
        throw Object.assign(new Error("Este PIX já foi denunciado."), { status: 409 })
      }

      if (Number(transacao.origem_id) !== Number(id_denunciante)) {
        throw Object.assign(
          new Error("Você só pode denunciar transações das quais foi remetente."),
          { status: 403 }
        )
      }

      const slaLimite = new Date()
      slaLimite.setDate(slaLimite.getDate() + 7)

      const denuncia = await Denuncia.create(
        {
          id_denunciante,
          id_denunciado,
          transacao_id: transacao.id,
          valor_roubado: valor_roubado || transacao.valor,
          e2e_id: e2e_id || transacao.e2e_id || null,
          motivo: motivoFinal,
          descricao: motivoFinal === "OUTROS" ? (descricao || null) : null,
          data_denuncia: new Date(),
          sla_limite: slaLimite,
        },
        { transaction: t }
      )

      const usuarioDenunciado = await Usuario.findByPk(id_denunciado, { transaction: t })
      if (usuarioDenunciado) {
        usuarioDenunciado.recebeu_denuncia = (usuarioDenunciado.recebeu_denuncia || 0) + 1
        usuarioDenunciado.denuncia = true
        await usuarioDenunciado.save({ transaction: t })
      }

      return denuncia
    })

    return res.status(201).json({ sucesso: true, denuncia: resultado })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ erro: err.message })
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ erro: "Este PIX já foi denunciado." })
    }

    console.error(err)
    return res.status(500).json({ erro: "Erro interno ao registrar denúncia." })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  const { id_denunciante } = req.query

  try {
    await db.sequelize.transaction(async (t) => {
      const denuncia = await Denuncia.findByPk(id, { transaction: t })

      if (!denuncia) {
        throw Object.assign(new Error("Denúncia não encontrada."), { status: 404 })
      }

      if (id_denunciante && Number(denuncia.id_denunciante) !== Number(id_denunciante)) {
        throw Object.assign(new Error("Sem permissão para remover esta denúncia."), { status: 403 })
      }

      const usuarioDenunciado = await Usuario.findByPk(denuncia.id_denunciado, { transaction: t })
      if (usuarioDenunciado) {
        usuarioDenunciado.recebeu_denuncia = Math.max(0, (usuarioDenunciado.recebeu_denuncia || 1) - 1)
        if (usuarioDenunciado.recebeu_denuncia === 0) {
          usuarioDenunciado.denuncia = false
        }
        await usuarioDenunciado.save({ transaction: t })
      }

      await denuncia.destroy({ transaction: t })
    })

    res.json({ sucesso: true })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ erro: err.message })
    }
    console.error(err)
    res.status(500).json({ erro: "Erro ao remover denúncia." })
  }
})

module.exports = router
