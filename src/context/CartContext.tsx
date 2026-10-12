import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, Food } from '../types';
import { api } from '../services/api';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface CartContextType {
  cart: Cart;
  cartCount: number;
  loading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (food: Food, quantity?: number) => Promise<void>;
  batchAddToCart: (items: { food: Food; quantity: number }[], customNotice?: string) => Promise<void>;
  updateQuantity: (foodId: string, quantity: number) => Promise<void>;
  removeFromCart: (foodId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, deliveryFee: 0, total: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 4);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    async function fetchCart() {
      try {
        const data = await api.getCart();
        setCart(data);
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  const addToCart = async (food: Food, quantity = 1) => {
    try {
      const updated = await api.addToCart(food._id, quantity);
      setCart(updated);
      addToast('Added to Cart', `${food.name} (x${quantity}) added from ${food.restaurantName}`, 'success');
    } catch (err: any) {
      addToast('Error', err.message || 'Could not add to cart', 'warning');
    }
  };

  const batchAddToCart = async (items: { food: Food; quantity: number }[], customNotice?: string) => {
    try {
      const payload = items.map(it => ({ foodId: it.food._id, quantity: it.quantity }));
      const res = await api.batchAddToCart(payload);
      setCart(res.cart);
      addToast(
        customNotice || "Today's Diet Plan Added!",
        `Added ${items.length} meals to your cart. Ready for seamless checkout.`,
        'success'
      );
      setIsCartOpen(true);
    } catch (err: any) {
      addToast('Error', err.message || 'Could not add diet plan to cart', 'warning');
    }
  };

  const updateQuantity = async (foodId: string, quantity: number) => {
    try {
      const updated = await api.updateCartItem(foodId, quantity);
      setCart(updated);
    } catch (err: any) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (foodId: string) => {
    try {
      const updated = await api.removeCartItem(foodId);
      setCart(updated);
    } catch (err: any) {
      console.error('Failed to remove cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const cleared = await api.clearCart();
      setCart(cleared);
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        batchAddToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toasts,
        dismissToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
