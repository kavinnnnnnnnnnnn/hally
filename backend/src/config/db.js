const { Sequelize } = require("sequelize")

const dbUrl = process.env.MYSQL_PUBLIC_URL || null;

const sequelize = dbUrl 
  ? new Sequelize(dbUrl, {
      dialect: "mysql"
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        dialect: "mysql"
      }
    );

module.exports = sequelize