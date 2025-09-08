import { useEffect, useState } from "react";
import { ShoppingCart, LogOut, LogIn, UserPlus, Store, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useCart } from "../store/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const count = cart.items?.reduce((a,b)=>a + (b.qty||0), 0) || 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all ${scrolled ? "shadow-sm" : ""}`}>
      <div className="glass border-b">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:opacity-90 transition">
            <Store size={20}/> <span className="text-lg">E-Shop</span>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/cart" className="btn-ghost relative">
              <ShoppingCart size={18}/>
              <span className="ml-2">Cart</span>
              <span className="badge absolute -right-2 -top-2">{count}</span>
            </Link>

            {user ? (
              <>
                <span className="hidden lg:block text-sm text-gray-600">Hi, {user.name}</span>
                <button
                  className="btn"
                  onClick={() => { logout(); navigate("/"); }}
                >
                  <LogOut size={18}/> <span className="ml-2">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost"><LogIn size={18}/><span className="ml-2">Login</span></Link>
                <Link to="/signup" className="btn"><UserPlus size={18}/><span className="ml-2">Signup</span></Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden btn-ghost"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${menuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <nav className="px-4 pb-3 flex flex-col gap-2 animate-dropin">
            <Link to="/" onClick={()=>setMenuOpen(false)} className="btn w-full justify-start">Home</Link>
            <Link to="/cart" onClick={()=>setMenuOpen(false)} className="btn w-full justify-start relative">
              <ShoppingCart size={18}/>
              <span className="ml-2">Cart</span>
              <span className="badge absolute right-3">{count}</span>
            </Link>
            {user ? (
              <button
                className="btn w-full justify-start"
                onClick={()=>{ setMenuOpen(false); logout(); navigate("/"); }}
              >
                <LogOut size={18}/> <span className="ml-2">Logout</span>
              </button>
            ) : (
              <>
                <Link to="/login" onClick={()=>setMenuOpen(false)} className="btn w-full justify-start"><LogIn size={18}/><span className="ml-2">Login</span></Link>
                <Link to="/signup" onClick={()=>setMenuOpen(false)} className="btn w-full justify-start"><UserPlus size={18}/><span className="ml-2">Signup</span></Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
