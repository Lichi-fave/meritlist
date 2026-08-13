import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

// __dirname resolves to src/docs when run via tsx (dev) and to
// dist/docs when run as compiled JS (production on Azure) — so
// building the glob off __dirname works correctly in both cases,
// unlike a hardcoded "./src/..." path which only exists in dev.
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MeritList API",
      version: "1.0.0",
      description:
        "An organic, merit-ranked AI tools directory API — no pay-to-win rankings, no noise.",
    },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../features/**/*.routes.js"),
    path.join(__dirname, "../features/**/*.routes.ts"),
  ],
});
