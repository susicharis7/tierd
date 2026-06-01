const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { parseAllowedOrigins, buildCorsOptions } = require("./lib/http");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = parseAllowedOrigins(process.env.FRONTEND_URL);

app.use(cors(buildCorsOptions(allowedOrigins)));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running !");
});

const healthRoutes = require("./routes/health");
app.use("/api", healthRoutes);

const syncRoutes = require("./routes/sync");
app.use("/api/sync", syncRoutes);

const auth2faRoutes = require("./routes/auth2fa");
app.use("/api/auth/2fa", auth2faRoutes);

const evaluationRoutes = require("./routes/evaluation");
app.use("/api/evaluation", evaluationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
