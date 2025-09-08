import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "./db.js";

dotenv.config();
const app = express();

app.use(cors());                   // allow all origins in dev
app.use(express.json());           // parse application/json

// Fallback: accept text/plain that actually contains JSON for /api/auth
app.use("/api/auth", express.text({ type: "text/plain" }));
app.use("/api/auth", (req, _res, next) => {
  if (typeof req.body === "string") {
    try { req.body = JSON.parse(req.body); } catch { /* keep as string */ }
  }
  next();
});

// avoid stale responses
app.use((_, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Helpers
function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// --- Auth (hardened) ---
app.post("/api/auth/signup", async (req, res) => {
  const b = req.body || {};
  const name = (b.name ?? "").toString().trim();
  const email = (b.email ?? "").toString().trim();
  const password = (b.password ?? "").toString();

  if (!email || !password) {
    return res.status(400).json({ message: "Email & password required" });
  }
  if (password.trim().length < 4) {
    return res.status(400).json({ message: "Password must be at least 4 characters" });
  }
  if (db.findUserByEmail(email)) {
    return res.status(409).json({ message: "Email already used" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: nanoid(),
    name: name || email.split("@")[0],
    email,
    password: hashed,
    role: "user",
  };
  db.upsertUser(user);
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post("/api/auth/login", async (req, res) => {
  const b = req.body || {};
  const email = (b.email ?? "").toString().trim();
  const password = (b.password ?? "").toString();

  if (!email || !password) {
    return res.status(400).json({ message: "Email & password required" });
  }
  const user = db.findUserByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// --- Items CRUD + filters ---
app.get("/api/items", (req, res) => {
  const { q, category, min, max } = req.query;
  const items = db.listItems({ q, category, min, max });
  res.json(items);
});

app.get("/api/items/:id", (req, res) => {
  const item = db.getItem(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
});

app.post("/api/items", auth, (req, res) => {
  const { title, category, price, image, description } = req.body || {};
  if (!title || price === undefined) return res.status(400).json({ message: "title & price required" });
  const item = {
    id: nanoid(),
    title: String(title),
    category: category ? String(category) : "Misc",
    price: Number(price),
    image,
    description
  };
  db.createItem(item);
  res.status(201).json(item);
});

app.put("/api/items/:id", auth, (req, res) => {
  const updated = db.updateItem(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

app.delete("/api/items/:id", auth, (req, res) => {
  const ok = db.deleteItem(req.params.id);
  if (!ok) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});

// --- Cart (server-persisted) ---
app.get("/api/cart", auth, (req, res) => {
  const cart = db.getCart(req.user.id);
  res.json(cart);
});

app.post("/api/cart", auth, (req, res) => {
  const { itemId, qty = 1 } = req.body || {};
  const item = db.getItem(itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });
  const cart = db.getCart(req.user.id);
  const idx = cart.items.findIndex(i => i.itemId === itemId);
  if (idx === -1) cart.items.push({ itemId, qty: Number(qty) });
  else cart.items[idx].qty += Number(qty);
  db.saveCart(cart);
  res.status(201).json(cart);
});

app.patch("/api/cart/:itemId", auth, (req, res) => {
  const { qty } = req.body || {};
  const cart = db.getCart(req.user.id);
  const idx = cart.items.findIndex(i => i.itemId === req.params.itemId);
  if (idx === -1) return res.status(404).json({ message: "Not in cart" });
  cart.items[idx].qty = Math.max(1, Number(qty));
  db.saveCart(cart);
  res.json(cart);
});

app.delete("/api/cart/:itemId", auth, (req, res) => {
  const cart = db.getCart(req.user.id);
  cart.items = cart.items.filter(i => i.itemId !== req.params.itemId);
  db.saveCart(cart);
  res.json(cart);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
