import { useState } from "react";
import { useCart } from "../store/CartContext";
import { useAuth } from "../store/AuthContext";
import { Check, Loader2 } from "lucide-react";

export default function ProductCard({ item }) {
  const { user } = useAuth();
  const { add } = useCart();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const onAdd = async () => {
    if (!user || adding) return;
    setAdding(true);
    setAdded(true); // optimistic
    try {
      await add(item.id, 1);
      setTimeout(() => setAdded(false), 1200);
    } catch {
      setAdded(false);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`card overflow-hidden flex flex-col transition transform hover:-translate-y-1 will-change-transform ${added ? "ring-1 ring-green-300 animate-added" : ""}`}>
      <img src={item.image} alt={item.title} className="h-44 w-full object-cover" loading="lazy" />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-2">{item.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
        <p className="mt-auto text-lg font-bold">₹{item.price}</p>

        <button
          disabled={!user || adding}
          onClick={onAdd}
          className={`mt-3 relative overflow-hidden rounded-xl border transition-all duration-200 active:scale-[0.98]
            ${added
              ? "bg-green-600 border-green-600 text-white"
              : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"}
            ${!user ? "opacity-60 cursor-not-allowed" : ""} h-10 flex items-center justify-center gap-2`}
        >
          {added ? <Check size={18}/> : (adding ? <Loader2 className="animate-spin" size={18}/> : null)}
          <span className="font-medium">
            {user ? (added ? "Added" : (adding ? "Adding..." : "Add to Cart")) : "Login to add"}
          </span>
          {added && <span className="absolute inset-0 pointer-events-none added-sheen" />}
        </button>
      </div>
    </div>
  );
}
