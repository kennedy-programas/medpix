const express = require("express")
const router = express.Router()
const db = require("../models")
const { Transacao, Usuario } = db

router.get("/", async (req, res) => {
  const { usuarioId } = req.query
  const where = usuarioId
    ? {
        [db.Sequelize.Op.or]: [
          { origem_id: usuarioId },
          { destino_id: usuarioId },
        ],
      }
    : undefined

  try {
    const transacoes = await Transacao.findAll({
      where,
      include: [
        { model: Usuario, as: "origem", attributes: ["id", "nome"] },
        { model: Usuario, as: "destino", attributes: ["id", "nome"] },
      ],
      order: [["data_transacao", "DESC"]],
    })
    res.json(transacoes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

module.exports = router
