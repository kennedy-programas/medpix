module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cpf: {
        type: DataTypes.STRING(14),
        allowNull: false,
        unique: true,
      },
      saldo: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },
      denuncia: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      recebeu_denuncia: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      role: {
        type: DataTypes.ENUM("usuario", "auditor"),
        defaultValue: "usuario",
        allowNull: false,
      },
    },
    {
      tableName: "Usuario",
      timestamps: false,
    }
  )

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Denuncia, {
      as: "denunciasFeitas",
      foreignKey: "id_denunciante",
    })
    Usuario.hasMany(models.Denuncia, {
      as: "denunciasRecebidas",
      foreignKey: "id_denunciado",
    })
  }

  return Usuario
}
