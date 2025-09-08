import { db } from "./db.js";
import { nanoid } from "nanoid";

const categories = ["Electronics","Books","Fashion","Home","Sports"];

const run = () => {
  const data = db.get();
  if ((data.items || []).length) {
    console.log("Items already exist:", data.items.length);
    return;
  }
  const items = Array.from({ length: 24 }).map((_, i) => ({
    id: nanoid(),
    title: `Sample Item ${i + 1}`,
    category: categories[i % categories.length],
    price: Number((Math.random() * 900 + 100).toFixed(0)),
    image: `https://picsum.photos/seed/sample${i}/600/400`,
    description: "A great product for demo purposes."
  }));
  db.set({ users: data.users || [], items, carts: data.carts || [] });
  console.log("Seeded", items.length, "items.");
};
run();
