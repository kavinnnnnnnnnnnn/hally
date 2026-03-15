const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Rule = sequelize.define("Rule", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  condition: DataTypes.STRING,
  priority: DataTypes.INTEGER,
  next_step_id: DataTypes.UUID
})

module.exports = Rule