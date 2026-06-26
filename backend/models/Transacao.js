module.exports = (sequelize, DataTypes) => {

  const Transacao = sequelize.define(
    "Transacao",
    {

      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      e2e_id: {
        type: DataTypes.STRING(35),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },

      valor: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },

      tipo: {
        type: DataTypes.ENUM(
          "PIX",
          "TED",
          "DOC",
          "BOLETO",
          "TRANSFERENCIA_INTERNA"
        ),
        defaultValue: "PIX",
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
          "PROCESSANDO",
          "PROCESSADO",
          "EM_ANALISE",
          "SUSPEITO",
          "DEVOLVIDO",
          "FALHOU"
        ),
        defaultValue: "PROCESSANDO",
        allowNull: false,
      },

      descricao: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      data_transacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      ip_origem: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      dispositivo: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      idempotency_key: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },

      codigo_autorizacao: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      saldo_anterior_origem: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      saldo_posterior_origem: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      saldo_anterior_destino: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      saldo_posterior_destino: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

    },
    {
      tableName: "Transacoes",
      timestamps: false,

      indexes: [
        {
          unique: true,
          fields: ["e2e_id"],
        },

        {
          unique: true,
          fields: ["idempotency_key"],
        },

        {
          fields: ["origem_id"],
        },

        {
          fields: ["destino_id"],
        },

        {
          fields: ["status"],
        },

        {
          fields: ["data_transacao"],
        },
      ],
    }
  )

  Transacao.associate = (models) => {

    Transacao.belongsTo(models.Usuario, {
      as: "origem",
      foreignKey: "origem_id",
    })

    Transacao.belongsTo(models.Usuario, {
      as: "destino",
      foreignKey: "destino_id",
    })

    Transacao.hasOne(models.Denuncia, {
      as: "denuncia",
      foreignKey: "transacao_id",
    })
  }

  return Transacao
}