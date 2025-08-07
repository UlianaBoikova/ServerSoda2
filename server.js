const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Храним прогресс
let progress = 0;
let fullAmount = 10;

// Когда клиент подключается через WebSocket
wss.on("connection", (ws) => {
  console.log("✅ WebSocket клиент подключен");

  // Отправляем текущее состояние
  ws.send(JSON.stringify({
    type: "update",
    progress,
    fullAmount
  }));
});

// Когда Shopify вызывает webhook
app.post("/webhook", (req, res) => {
  progress += 1;

  // Отправить обновление всем клиентам
  const update = JSON.stringify({
    type: "update",
    progress,
    fullAmount
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(update);
    }
  });

  console.log("📦 Новый заказ! Прогресс:", progress + "/" + fullAmount);
  res.status(200).send("OK");
});

// Используем переменную окружения PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("✅ Сервер запущен на порту", PORT);
});
