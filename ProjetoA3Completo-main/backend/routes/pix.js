const express = require("express")
const router = express.Router()
const db = require("../models")
const { Usuario, Transacao } = db
const { randomUUID } = require("crypto")

function gerarE2EId() {
  const agora = new Date()
  const ispb = "00000000"
  const pad = (n) => String(n).padStart(2, "0")
  const dataFormatada =
    agora.getFullYear() +
    pad(agora.getMonth() + 1) +
    pad(agora.getDate()) +
    pad(agora.getHours()) +
    pad(agora.getMinutes())
  const aleatorio = randomUUID().replace(/-/g, "").slice(0, 11).toUpperCase()
  return `E${ispb}${dataFormatada}${aleatorio}`
}

router.post("/", async (req, res) => {
  const { remetenteId, destinatarioId, valor, idempotencyKey } = req.body

  if (!remetenteId || !destinatarioId || valor == null) {
    return res.status(400).json({ erro: "Dados inválidos para transferência." })
  }

  if (remetenteId === destinatarioId) {
    return res.status(400).json({ erro: "Não é possível transferir para si mesmo." })
  }

  const valorCentavos = Math.round(Number(valor) * 100)

  if (!Number.isInteger(valorCentavos) || valorCentavos <= 0) {
    return res.status(400).json({ erro: "Valor inválido." })
  }

  // Idempotência: se já existe uma transação com essa chave, retorna o resultado anterior
  if (idempotencyKey) {
    try {
      const existente = await Transacao.findOne({
        where: { idempotency_key: idempotencyKey },
        include: [
          { model: Usuario, as: "origem" },
          { model: Usuario, as: "destino" },
        ],
      })
      if (existente) {
        return res.status(200).json({
          sucesso: true,
          e2e_id: existente.e2e_id,
          transacao_id: existente.id,
          data_transacao: existente.data_transacao,
          remetente: existente.origem,
          destinatario: existente.destino,
        })
      }
    } catch (_) {
      // falha silenciosa na checagem de idempotência — prossegue com a transação normal
    }
  }

  try {
    const resultado = await db.sequelize.transaction(async (t) => {
      const remetente = await Usuario.findByPk(remetenteId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      })
      const destinatario = await Usuario.findByPk(destinatarioId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      if (!remetente || !destinatario) {
        throw Object.assign(new Error("Usuário(s) não encontrado(s)."), { status: 400 })
      }

      const saldoAtual = Math.round(Number(remetente.saldo) * 100)

      if (saldoAtual < valorCentavos) {
        throw Object.assign(new Error("Saldo insuficiente para realizar esta transferência."), { status: 400 })
      }

      remetente.saldo = (saldoAtual - valorCentavos) / 100
      destinatario.saldo = (Math.round(Number(destinatario.saldo) * 100) + valorCentavos) / 100

      await remetente.save({ transaction: t })
      await destinatario.save({ transaction: t })

      const e2e_id = gerarE2EId()

      const transacao = await Transacao.create(
        {
          valor: valorCentavos / 100,
          origem_id: remetenteId,
          destino_id: destinatarioId,
          descricao: "Pix realizado",
          e2e_id,
          status: "PROCESSADO",
          idempotency_key: idempotencyKey || null,
        },
        { transaction: t }
      )

      return { e2e_id, transacao, remetente, destinatario }
    })

    return res.status(200).json({
      sucesso: true,
      e2e_id: resultado.e2e_id,
      transacao_id: resultado.transacao.id,
      data_transacao: resultado.transacao.data_transacao,
      remetente: resultado.remetente,
      destinatario: resultado.destinatario,
    })
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message })
    }

    if (erro.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ erro: "Transação duplicada detectada. Tente novamente." })
    }

    console.error("[ERRO PIX]", erro)
    return res.status(500).json({ erro: erro.message || "Erro interno ao processar PIX." })
  }
})

module.exports = router
