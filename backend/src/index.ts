import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { sequelize } from "./configs/database";
import routes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DEV_ENV = process.env.NODE_ENV === "development";

app.use(express.json());

app.use("/public", express.static("public"));
app.use("/api", routes);

app.use(globalErrorHandler);

sequelize.sync({ alter: true }).then(() => {
  if (DEV_ENV) console.log("✅ Database connected and synced");

  app.listen(PORT, () => {
    if (DEV_ENV) console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
