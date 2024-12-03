const mysql = require("mysql2");

const dbConn = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  multipleStatements: true,
  connectTimeout: 600000, // 10 minutes
  acquireTimeout: 600000, // 10 minutes
});

dbConn.getConnection((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  } else {
    console.log("Database connected successfully!");
  }
});

module.exports = dbConn;
