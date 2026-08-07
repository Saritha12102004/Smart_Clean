const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", require("./routes/authRoutes"));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});