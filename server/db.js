import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "data", "db.json");

function ensureFile() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], items: [], carts: [] }, null, 2));
  }
}
ensureFile();

function read() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw || "{}");
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      items: Array.isArray(parsed.items) ? parsed.items : [],
      carts: Array.isArray(parsed.carts) ? parsed.carts : []
    };
  } catch {
    return { users: [], items: [], carts: [] };
  }
}
function write(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  get: () => read(),
  set: (next) => write(next),

  upsertUser(u) {
    const data = read();
    const idx = data.users.findIndex(x => x.id === u.id);
    if (idx === -1) data.users.push(u); else data.users[idx] = u;
    write(data); return u;
  },

  findUserByEmail(email) {
    if (!email || typeof email !== "string") return undefined;
    const e = email.toLowerCase();
    const data = read();
    return (data.users || []).find(
      u => u && typeof u.email === "string" && u.email.toLowerCase() === e
    );
  },

  getUserById(id) {
    return read().users.find(u => u.id === id);
  },

  listItems({ q, category, min, max } = {}) {
    let items = read().items;
    if (q) items = items.filter(i => (i.title || "").toLowerCase().includes(String(q).toLowerCase()));
    if (category) items = items.filter(i => (i.category || "").toLowerCase() === String(category).toLowerCase());
    if (min !== undefined && min !== "") items = items.filter(i => i.price >= Number(min));
    if (max !== undefined && max !== "") items = items.filter(i => i.price <= Number(max));
    return items;
  },

  getItem(id) { return read().items.find(i => i.id === id); },
  createItem(item) { const data = read(); data.items.push(item); write(data); return item; },
  updateItem(id, patch) {
    const data = read(); const idx = data.items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    data.items[idx] = { ...data.items[idx], ...patch, id };
    write(data); return data.items[idx];
  },
  deleteItem(id) {
    const data = read(); const before = data.items.length;
    data.items = data.items.filter(i => i.id !== id); write(data);
    return data.items.length !== before;
  },

  getCart(userId) {
    const data = read();
    let cart = data.carts.find(c => c.userId === userId);
    if (!cart) { cart = { userId, items: [] }; data.carts.push(cart); write(data); }
    return cart;
  },
  saveCart(cart) {
    const data = read();
    const idx = data.carts.findIndex(c => c.userId === cart.userId);
    if (idx === -1) data.carts.push(cart); else data.carts[idx] = cart;
    write(data); return cart;
  }
};
