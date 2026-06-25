const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const paymentRoutes = require("./routes/payments");
app.use("/api/payments", paymentRoutes);

const transactionRoutes = require("./routes/transactions");
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => res.json({ message: "EscrowNG API running" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log(err));
