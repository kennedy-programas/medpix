const express = require("express")
const router = express.Router()
const db = require("../models")

const Denuncia = db.Denuncia
const Usuario = db.Usuario
const LogAuditoria = db.LogAuditoria

const MOTIVOS_APROVACAO = [
  "FRAUDE_CONFIRMADA",
  "GOLPE_CONFIRMADO",
  "INVASAO_CONFIRMADA",
  "ENGANO_CONFIRMADO",
  "OUTRO",
]

const MOTIVOS_RECUSA = [
  "PROVA_INSUFICIENTE",
  "DESACORDO_COMERCIAL",
  "OPERACAO_RECONHECIDA",
  "DENUNCIA_DUPLICADA",
  "OUTRO",
]

async function verificarAuditor(id) {
  const usuario = await Usuario.findByPk(id)
  return usuario && usuario.role === "auditor" ? usuario : null
}

// GET /auditoria/denuncias — lista pendentes ordenadas por SLA
router.get("/denuncias", async (req, res) => {
  const { auditor_id } = req.query
  if (!auditor_id) return res.status(400).json({ erro: "auditor_id é obrigatório." })

  const auditor = await verificarAuditor(auditor_id)
  if (!auditor) return res.status(403).json({ erro: "Acesso restrito a auditores." })

  try {
    const denuncias = await Denuncia.findAll({
      where: { status: "PENDENTE" },
      include: [
        { model: Usuario, as: "denunciado", attributes: ["id", "nome", "cpf", "saldo"] },
        { model: Usuario, as: "denunciante", attributes: ["id", "nome", "cpf"] },
      ],
      order: [
        [db.Sequelize.literal("ISNULL(sla_limite)"), "ASC"],
        ["sla_limite", "ASC"],
      ],
    })
    res.json(denuncias)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: "Erro ao buscar denúncias para auditoria." })
  }
})

// POST /auditoria/denuncias/:id/aprovar
router.post("/denuncias/:id/aprovar", async (req, res) => {
  const { id } = req.params
  const { auditor_id, motivo, observacoes } = req.body

  if (!auditor_id || !motivo) {
    return res.status(400).json({ erro: "auditor_id e motivo são obrigatórios." })
  }
  if (!MOTIVOS_APROVACAO.includes(motivo)) {
    return res.status(400).json({ erro: "Motivo inválido para aprovação." })
  }

  const auditor = await verificarAuditor(auditor_id)
  if (!auditor) return res.status(403).json({ erro: "Acesso restrito a auditores." })

  try {
    const resultado = await db.sequelize.transaction(async (t) => {
      const denuncia = await Denuncia.findByPk(id, { transaction: t })
      if (!denuncia) throw Object.assign(new Error("Denúncia não encontrada."), { status: 404 })
      if (denuncia.status !== "PENDENTE") {
        throw Object.assign(new Error("Apenas denúncias pendentes podem ser analisadas."), { status: 409 })
      }

      const denunciado = await Usuario.findByPk(denuncia.id_denunciado, { transaction: t })
      const denunciante = await Usuario.findByPk(denuncia.id_denunciante, { transaction: t })
      if (!denunciado || !denunciante) {
        throw Object.assign(new Error("Usuário não encontrado."), { status: 404 })
      }

      const valorDenuncia = parseFloat(denuncia.valor_roubado)
      const saldoDenunciado = parseFloat(denunciado.saldo)

      let valorDevolvido = 0
      let novoStatus

      if (saldoDenunciado >= valorDenuncia) {
        valorDevolvido = valorDenuncia
        denunciado.saldo = parseFloat((saldoDenunciado - valorDenuncia).toFixed(2))
        denunciante.saldo = parseFloat((parseFloat(denunciante.saldo) + valorDenuncia).toFixed(2))
        novoStatus = "CONFIRMADA"
      } else if (saldoDenunciado > 0) {
        valorDevolvido = saldoDenunciado
        denunciante.saldo = parseFloat((parseFloat(denunciante.saldo) + saldoDenunciado).toFixed(2))
        denunciado.saldo = 0
        novoStatus = "APROVADA_AGUARDANDO_FUNDOS"
      } else {
        novoStatus = "APROVADA_AGUARDANDO_FUNDOS"
      }

      await denunciado.save({ transaction: t })
      await denunciante.save({ transaction: t })

      denuncia.status = novoStatus
      await denuncia.save({ transaction: t })

      const log = await LogAuditoria.create(
        {
          denuncia_id: denuncia.id,
          auditor_id,
          decisao: "APROVADA",
          motivo,
          observacoes: observacoes || null,
          valor_devolvido: valorDevolvido,
        },
        { transaction: t }
      )

      return { status: novoStatus, valor_devolvido: valorDevolvido, log_id: log.id }
    })

    res.json({ sucesso: true, ...resultado })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ erro: err.message })
    console.error(err)
    res.status(500).json({ erro: "Erro ao aprovar denúncia." })
  }
})

// POST /auditoria/denuncias/:id/recusar
router.post("/denuncias/:id/recusar", async (req, res) => {
  const { id } = req.params
  const { auditor_id, motivo, observacoes } = req.body

  if (!auditor_id || !motivo) {
    return res.status(400).json({ erro: "auditor_id e motivo são obrigatórios." })
  }
  if (!MOTIVOS_RECUSA.includes(motivo)) {
    return res.status(400).json({ erro: "Motivo inválido para recusa." })
  }

  const auditor = await verificarAuditor(auditor_id)
  if (!auditor) return res.status(403).json({ erro: "Acesso restrito a auditores." })

  try {
    await db.sequelize.transaction(async (t) => {
      const denuncia = await Denuncia.findByPk(id, { transaction: t })
      if (!denuncia) throw Object.assign(new Error("Denúncia não encontrada."), { status: 404 })
      if (denuncia.status !== "PENDENTE") {
        throw Object.assign(new Error("Apenas denúncias pendentes podem ser analisadas."), { status: 409 })
      }

      const denunciado = await Usuario.findByPk(denuncia.id_denunciado, { transaction: t })
      if (denunciado) {
        denunciado.recebeu_denuncia = Math.max(0, (denunciado.recebeu_denuncia || 1) - 1)
        if (denunciado.recebeu_denuncia === 0) denunciado.denuncia = false
        await denunciado.save({ transaction: t })
      }

      denuncia.status = "RECUSADA"
      await denuncia.save({ transaction: t })

      await LogAuditoria.create(
        {
          denuncia_id: denuncia.id,
          auditor_id,
          decisao: "RECUSADA",
          motivo,
          observacoes: observacoes || null,
          valor_devolvido: 0,
        },
        { transaction: t }
      )
    })

    res.json({ sucesso: true })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ erro: err.message })
    console.error(err)
    res.status(500).json({ erro: "Erro ao recusar denúncia." })
  }
})

module.exports = router
