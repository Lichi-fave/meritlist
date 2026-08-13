import app from "./app";
import { config } from "./config/env";

app.listen(config.port, () => {
  console.log(`MeritList API running on http://localhost:${config.port}`);
  console.log(`Swagger docs at http://localhost:${config.port}/docs`);
});
