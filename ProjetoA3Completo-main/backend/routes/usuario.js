const express = require("express")
const router = express.Router()
const db = require("../models")

const Usuario = db.Usuario

router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ["id", "nome", "cpf", "saldo", "denuncia", "recebeu_denuncia"],
    })
    res.json(usuarios)
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: "Erro ao buscar usuários." })
  }
})

router.post("/", async (req, res) => {
  const { nome, cpf, saldo } = req.body

  if (!nome || !cpf) {
    return res.status(400).json({ erro: "nome e cpf são obrigatórios." })
  }

  try {
    const usuario = await Usuario.create({ nome, cpf, saldo: saldo || 0 })
    res.status(201).json(usuario)
  } catch (erro) {
    if (erro.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ erro: "CPF já cadastrado." })
    }
    console.error(erro)
    res.status(400).json({ erro: "Erro ao criar usuário." })
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  if (isNaN(Number(id))) {
    return res.status(400).json({ erro: "ID inválido." })
  }

  try {
    const usuario = await Usuario.findByPk(id, {
      include: [
        {
          model: db.Denuncia,
          as: "denunciasRecebidas",
          attributes: ["id"],
        },
      ],
    })

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." })
    }

    const usuarioJson = usuario.toJSON()
    const recebeu_denuncia = usuarioJson.denunciasRecebidas
      ? usuarioJson.denunciasRecebidas.length
      : usuarioJson.recebeu_denuncia || 0

    const { denunciasRecebidas, ...dadosUsuario } = usuarioJson
    res.json({ ...dadosUsuario, recebeu_denuncia })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: "Erro ao buscar usuário." })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { nome } = req.body

  if (!nome) {
    return res.status(400).json({ erro: "Nenhum campo válido para atualização." })
  }

  try {
    const usuario = await Usuario.findByPk(id)
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." })
    }

    await usuario.update({ nome })
    res.json({ id: usuario.id, nome: usuario.nome, cpf: usuario.cpf })
  } catch (erro) {
    console.error(erro)
    res.status(400).json({ erro: "Erro ao atualizar usuário." })
  }
})

module.exports = router
