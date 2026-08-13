import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./features/auth/auth.routes";
import toolsRoutes from "./features/tools/tools.routes";
import upvotesRoutes from "./features/upvotes/upvotes.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/tools", toolsRoutes);
app.use("/api/tools", upvotesRoutes);


app.use(errorHandler);

export default app;
