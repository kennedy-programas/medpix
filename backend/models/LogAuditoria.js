module.exports = (sequelize, DataTypes) => {
  const LogAuditoria = sequelize.define(
    "LogAuditoria",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      denuncia_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      auditor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      decisao: {
        type: DataTypes.ENUM("APROVADA", "RECUSADA"),
        allowNull: false,
      },
      motivo: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      valor_devolvido: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
    },
    {
      tableName: "LogsAuditoria",
      timestamps: true,
      createdAt: "criado_em",
      updatedAt: false,
    }
  )

  // sem FK formal para evitar incompatibilidade de tipo UNSIGNED no MySQL
  LogAuditoria.associate = () => {}

  return LogAuditoria
}
