import { useEffect, useMemo, useState } from "react";
import { useCart } from "../store/CartContext";
import { api } from "../api";

export default function Cart() {
  const { cart, update, remove } = useCart();
  const [lookup, setLookup] = useState({});
  useEffect(()=>{ (async()=>{
    const list = await api.listItems();
    setLookup(Object.fromEntries(list.map(i=>[i.id,i])));
  })(); }, []);

  const rows = cart.items.map(ci => ({ ...lookup[ci.itemId], qty: ci.qty, itemId: ci.itemId }))
                         .filter(Boolean);

  const totals = useMemo(()=> rows.reduce((a,b)=>a + b.price * b.qty, 0), [rows]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {rows.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(r=>(
            <div key={r.itemId} className="card p-3 flex items-center gap-3">
              <img src={r.image} className="w-24 h-16 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="font-medium">{r.title}</div>
                <div className="text-sm text-gray-500">{r.category}</div>
              </div>
              <div className="w-24 text-right font-semibold">₹{r.price}</div>
              <input className="input w-20" type="number" min="1" value={r.qty}
                     onChange={e=>update(r.itemId, Number(e.target.value))}/>
              <button className="btn" onClick={()=>remove(r.itemId)}>Remove</button>
            </div>
          ))}
          <div className="flex justify-end">
            <div className="card p-4 w-full sm:w-80">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">₹{totals}</span>
              </div>
              <button className="btn w-full mt-3">Checkout (mock)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
