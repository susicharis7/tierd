const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running !");
});

const healthRoutes = require("./routes/health");
app.use("/api", healthRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



