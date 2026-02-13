import express, { type Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { router } from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();
const PORT = parseInt(process.env.PORT || "8000", 10);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use(router);

export { app };

const server = app.listen(PORT, () => {
  console.log("syncserver listening on port %d", PORT);
});

export { server };
