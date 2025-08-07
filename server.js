const express = require("express");
const bodyParser = require("body-parser");
const WebSocket = require("ws");

const app = express();
app.use(bodyParser.json());

const socket = new WebSocket("wss://serverforsoda-production.up.railway.app/");

socket.on("open", () => {
  console.log("Connected to WebSocket server.");
});

app.post("/webhook", (req, res) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "increment" }));
    console.log("Sent increment command to WebSocket server.");
  } else {
    console.warn("WebSocket not connected.");
  }
  res.status(200).send("OK");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port", port);
});
