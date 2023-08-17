require("dotenv").config();
const express = require("express");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const credentials = require("./middleware/credentials");
const corsOption = require("./config/cors");
const authMiddleware = require("./middleware/authentication");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieparser());
app.use(authMiddleware);
app.use(credentials);
app.use(cors(corsOption));
const MONGO_URL = process.env.MONGODB_URL;
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const port = 8000;
app.use("/api/auth", require("./routes/auth.js"));
app.all("*", (req, res) => {
  res.status(404).send({ message: "Halaman itu tidak ada" });
});
mongoose.connection.once("open", () => {
  console.log("Berhasil terhubung ke database");
  app.listen(port, () => {
    console.log(`Aplikasi berjalan di port ${port}`);
  });
});
