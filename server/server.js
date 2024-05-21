import { createServer } from "http";
import { WebSocketServer } from "ws";
import redis from "redis";

const server = createServer();
const wss = new WebSocketServer({ server });
const client = redis.createClient();

client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (message) => {
    const gameState = JSON.parse(message);
    await client.set("gameState", JSON.stringify(gameState));

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(8080, () => {
  console.log("WebSocket server is listening on ws://localhost:8080");
});
