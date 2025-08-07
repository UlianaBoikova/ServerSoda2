const express = require("express");
const bodyParser = require("body-parser");
const WebSocket = require("ws");

const app = express();
app.use(bodyParser.json());

let socket;
let isConnected = false;

function connectWebSocket() {
  socket = new WebSocket("wss://serverforsoda-production.up.railway.app/");

  socket.on("open", () => {
    console.log("✅ WebSocket connected");
    isConnected = true;
  });

  socket.on("close", () => {
    console.warn("⚠️ WebSocket disconnected, retrying in 5 seconds...");
    isConnected = false;
    setTimeout(connectWebSocket, 5000);
  });

  socket.on("error", (err) => {
    console.error("❌ WebSocket error:", err);
    socket.close(); // Принудительно закрываем, чтобы вызвать reconnect
  });
}

// Инициализируем WebSocket при запуске
connectWebSocket();

// Webhook
app.post("/webhook", (req, res) => {
  if (isConnected && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "increment" }));
    console.log("📨 Sent increment command to WebSocket server.");
  } else {
    console.warn("🚫 WebSocket not connected.");
  }
  res.status(200).send("OK");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("🌐 Server running on port", port);
});
