import { useEffect, useState } from "react";

export default function Filters({ onChange }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  useEffect(()=>{ onChange({ q, category, min, max }); }, [q,category,min,max]);

  return (
    <div className="card p-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
      <input className="input col-span-2" placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
      <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option>Electronics</option><option>Books</option><option>Fashion</option>
        <option>Home</option><option>Sports</option>
      </select>
      <input className="input" type="number" min="0" placeholder="Min ₹" value={min} onChange={e=>setMin(e.target.value)} />
      <input className="input" type="number" min="0" placeholder="Max ₹" value={max} onChange={e=>setMax(e.target.value)} />
    </div>
  );
}
