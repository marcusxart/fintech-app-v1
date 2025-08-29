const express = require("express");
require("dotenv").config();
const { sequelize } = require("./database/models");
const globalErrorHandler = require("./middlewares/error.middleware");

const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;
const DEV_ENV = process.env.NODE_ENV === "development";

app.use(express.json());

app.use("/public", express.static("public"));
app.use("/api", routes);

app.use(globalErrorHandler);

(async () => {
  await sequelize.sync({ alter: DEV_ENV });
  if (DEV_ENV) console.log("✅ Database connected and synced");
  app.listen(PORT, () => {
    if (DEV_ENV) console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
