const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const ExecutionLog = sequelize.define("ExecutionLog", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  execution_id: DataTypes.UUID,
  step_name: DataTypes.STRING,
  rule_evaluated: DataTypes.TEXT,
  result: DataTypes.TEXT,
  selected_next_step: DataTypes.STRING,
  status: DataTypes.STRING,
  approver_id: DataTypes.UUID,
  error_message: DataTypes.TEXT,
  started_at: DataTypes.DATE,
  ended_at: DataTypes.DATE
})

module.exports = ExecutionLog