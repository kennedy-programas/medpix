const express = require("express")
const cors = require("cors")

const db = require("./models")

const app = express()
app.use(cors())
app.use(express.json())

app.use("/usuarios", require("./routes/usuario"))
app.use("/denuncias", require("./routes/denuncia"))
app.use("/transacoes", require("./routes/transacao"))
app.use("/pix", require("./routes/pix"))
app.use("/auditoria", require("./routes/auditoria"))

db.sequelize.sync({ alter: true }).then(async () => {
  console.log("DB sincronizado")
  // Garante que o usuário 1 seja auditor para demonstração
  await db.Usuario.update({ role: "auditor" }, { where: { id: 1 } })
  app.listen(3001, () => console.log("API rodando em http://localhost:3001"))
})
