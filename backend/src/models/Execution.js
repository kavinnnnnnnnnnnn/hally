const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Execution = sequelize.define("Execution", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  workflow_id: DataTypes.UUID,
  workflow_version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "RUNNING"
  },
  data: DataTypes.JSON,
  current_step_id: DataTypes.UUID,
  retries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  triggered_by: {
    type: DataTypes.STRING
  },
  approver_id: {
    type: DataTypes.UUID
  },
  error_message: {
    type: DataTypes.TEXT
  }
})

module.exports = Execution