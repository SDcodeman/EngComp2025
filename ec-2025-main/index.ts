import express from "express";
import cors from "cors";

const server: express.Express = express();

server.use(cors());
server.use(express.static("dist"));

server.get("/api/json", async (req, res) => {
  let edge = await import("./api/json");

  edge.response(req, res);
});

server.get("/api/csv", async (req, res) => {
  let edge = await import("./api/csv");

  edge.response(req, res);
});

server.listen(3000, () => {
  console.log("Server Ready at http://localhost:3000");
});
