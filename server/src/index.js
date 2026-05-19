const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { corsOrigin, port } = require("./config/env");

const app = express();

app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    name: "ORIS - Orbital Risk Intelligence System",
    api: "/api",
    health: "/api/health"
  });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path
  });
});

app.use((error, req, res, next) => {
  console.error(`[ORIS] ${error.stack || error.message}`);
  res.status(error.status || 500).json({
    error: "ORIS_API_ERROR",
    message: error.message || "Unexpected API error"
  });
});

app.listen(port, () => {
  console.log(`[ORIS] API listening on http://localhost:${port}`);
});
