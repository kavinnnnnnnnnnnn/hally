const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Workflow = sequelize.define("Workflow", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  input_schema: {
    type: DataTypes.JSON
  },
  start_step_id: {
    type: DataTypes.UUID
  }
})

module.exports = Workflow