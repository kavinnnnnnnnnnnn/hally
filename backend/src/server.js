require("dotenv").config()

const app = require("./app")
const sequelize = require("./config/db")
require("./models") // Load models and associations

const PORT = process.env.PORT || 5000

sequelize.sync({ alter: true }).then(() => {

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
  })

})