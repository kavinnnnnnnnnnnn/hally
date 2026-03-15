const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Step = sequelize.define("Step", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: DataTypes.STRING,
  step_type: DataTypes.STRING,
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  metadata: DataTypes.JSON
})

module.exports = Step