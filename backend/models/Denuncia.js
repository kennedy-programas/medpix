module.exports = (sequelize, DataTypes) => {

  const Denuncia = sequelize.define(
    "Denuncia",
    {

      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      transacao_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      e2e_id: {
        type: DataTypes.STRING(35),
        allowNull: true,
        unique: true,
      },

      valor_roubado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },

      motivo: {
        type: DataTypes.ENUM(
          "FRAUDE",
          "GOLPE",
          "ENGANO",
          "INVASAO_CONTA",
          "OUTROS"
        ),
        allowNull: false,
      },

      descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "PENDENTE",
          "EM_ANALISE",
          "CONFIRMADA",
          "RECUSADA",
          "APROVADA_AGUARDANDO_FUNDOS"
        ),
        defaultValue: "PENDENTE",
      },
      sla_limite: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      data_denuncia: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      ip_origem: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

    },
    {
      tableName: "Denuncias",
      timestamps: false,

      indexes: [
        {
          unique: true,
          fields: ["e2e_id"],
        },
        {
          fields: ["transacao_id"],
        },
        {
          fields: ["id_denunciado"],
        },
        {
          fields: ["id_denunciante"],
        },
      ],
    }
  )

  Denuncia.associate = (models) => {

    Denuncia.belongsTo(models.Usuario, {
      as: "denunciado",
      foreignKey: "id_denunciado",
    })

    Denuncia.belongsTo(models.Usuario, {
      as: "denunciante",
      foreignKey: "id_denunciante",
    })

    Denuncia.belongsTo(models.Transacao, {
      as: "transacao",
      foreignKey: "transacao_id",
    })
  }

  return Denuncia
}