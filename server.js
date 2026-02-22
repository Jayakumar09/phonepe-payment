import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

// 🔎 Debug check
console.log("ENV CHECK:", process.env.PHONEPE_BASE_URL);

app.use(cors());
app.use(express.json());
app.use("/api/payment", paymentRoutes);

let PORT = process.env.PORT || 5000;

// Function to start server on given port
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is busy. Trying next port...`);
      startServer(port + 1); // try next port
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer(PORT);