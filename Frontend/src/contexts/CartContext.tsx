import { createContext, useCallback, useContext, useEffect, useState } from "react";

const API = "http://localhost:3000";

interface CartItem {
  _id: string;
  title?: string;
  category: string;
  price: number;
}

interface CheckoutResult {
  count: number;
  total: number;
  transactionIds: string[];
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (componentId: string) => Promise<void>;
  removeFromCart: (componentId: string) => Promise<void>;
  checkout: () => Promise<CheckoutResult>;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const token = () => localStorage.getItem("authToken");

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const refreshCart = useCallback(async () => {
    if (!token()) {
      setCartItems([]);
      return;
    }
    try {
      const res = await fetch(`${API}/shop/cart`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch {
      // silent
    }
  }, []);

  // Initial load + listen for auth changes (login / logout)
  useEffect(() => {
    refreshCart();
    window.addEventListener("auth-changed", refreshCart);
    return () => window.removeEventListener("auth-changed", refreshCart);
  }, [refreshCart]);

  const addToCart = async (componentId: string) => {
    const res = await fetch(`${API}/shop/cart/${componentId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Không thể thêm vào giỏ");
    }
    await refreshCart();
  };

  const removeFromCart = async (componentId: string) => {
    await fetch(`${API}/shop/cart/${componentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    await refreshCart();
  };

  const checkout = async (): Promise<CheckoutResult> => {
    const res = await fetch(`${API}/shop/checkout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Thanh toán thất bại");
    }
    const result = await res.json();
    await refreshCart();
    // Tell Home / Detail to re-check owned components
    window.dispatchEvent(new Event("purchases-updated"));
    return result;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.length,
        addToCart,
        removeFromCart,
        checkout,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
