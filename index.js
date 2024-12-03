// const express = require("express");
// const dotenv = require("dotenv");
// dotenv.config();
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const mysql = require("./dbConfig");
// const tableRoutes = require("./src/routes/table-routes");

// const app = express();
// const port = 4000;

// app.use((req, res, next) => {
//   req.setTimeout(0); // Disable timeout
//   next();
// });
// app.use(bodyParser.json());
// app.use(cors());
// app.use("/api", tableRoutes);

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");
const tableRoutes = require("./src/routes/table-routes");

const app = express();
const port = 4242;

// Middleware
app.use(cors());
app.use(compression()); // Enable gzip compression
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Custom timeout
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes timeout
  next();
});

// Routes
app.use("/api", tableRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
