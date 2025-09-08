import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import AuthProvider from "./store/AuthContext";
import CartProvider from "./store/CartContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
