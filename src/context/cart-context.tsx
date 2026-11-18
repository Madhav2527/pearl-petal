"use client";
// ==============================================================================
// PETAL & PEARL — SHOPPING CART CONTEXT
// Domain: https://thepearlpetals.in
// State management, localStorage persistence & live pricing
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import { PublicProduct, ProductVariant, CartItem } from "../lib/types";
import { calculateShippingFee, DEFAULT_PRICING_SETTINGS } from "../lib/pricing-engine";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: PublicProduct, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  totalPayable: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "petal_pearl_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fallback
    }
  }, [items, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (product: PublicProduct, variant?: ProductVariant, quantity = 1) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && (variant ? i.variant?.id === variant.id : !i.variant)
      );

      if (existingIdx !== -1) {
        const next = [...prev];
        const newQty = next[existingIdx].quantity + quantity;
        // Check stock boundary
        const maxStock = variant ? variant.stock : product.stock;
        next[existingIdx].quantity = Math.min(newQty, maxStock);
        return next;
      }

      return [...prev, { product, variant, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.product.id === productId && (variantId ? i.variant?.id === variantId : !i.variant))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id === productId && (variantId ? i.variant?.id === variantId : !i.variant)) {
          const maxStock = i.variant ? i.variant.stock : i.product.stock;
          return { ...i, quantity: Math.min(quantity, maxStock) };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.variant?.price_override ?? item.product.selling_price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const shippingFee = calculateShippingFee(subtotal, DEFAULT_PRICING_SETTINGS);
  const freeShippingThreshold = DEFAULT_PRICING_SETTINGS.freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const totalPayable = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shippingFee,
        freeShippingThreshold,
        amountNeededForFreeShipping,
        totalPayable,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
