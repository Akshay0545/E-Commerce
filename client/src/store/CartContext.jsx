import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export default function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  useEffect(() => {
    (async () => {
      if (!user) return setCart({ items: [] });
      try { setCart(await api.getCart()); } catch { setCart({ items: [] }); }
    })();
  }, [user]);

  const add = async (itemId, qty=1) => setCart(await api.addToCart(itemId, qty));
  const update = async (itemId, qty) => setCart(await api.updateCart(itemId, qty));
  const remove = async (itemId) => setCart(await api.removeFromCart(itemId));

  return <CartCtx.Provider value={{ cart, add, update, remove }}>
    {children}
  </CartCtx.Provider>;
}
