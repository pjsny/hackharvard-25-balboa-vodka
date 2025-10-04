"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer } from "react";
import type { Cart, CartItem, Product } from "@/types";

interface CartContextType {
	cart: Cart;
	addToCart: (product: Product, quantity?: number) => void;
	removeFromCart: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
	| { type: "ADD_TO_CART"; payload: { product: Product; quantity: number } }
	| { type: "REMOVE_FROM_CART"; payload: { productId: string } }
	| {
			type: "UPDATE_QUANTITY";
			payload: { productId: string; quantity: number };
	  }
	| { type: "CLEAR_CART" };

const cartReducer = (state: Cart, action: CartAction): Cart => {
	console.log("CartReducer: Received action", action, "Current state", state);
	switch (action.type) {
		case "ADD_TO_CART": {
			const { product, quantity } = action.payload;
			const existingItem = state.items.find(
				(item) => item.product.id === product.id,
			);

			if (existingItem) {
				const updatedItems = state.items.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + quantity }
						: item,
				);
				return {
					items: updatedItems,
					total: updatedItems.reduce(
						(sum, item) => sum + item.product.price * item.quantity,
						0,
					),
				};
			} else {
				const newItems = [...state.items, { product, quantity }];
				return {
					items: newItems,
					total: newItems.reduce(
						(sum, item) => sum + item.product.price * item.quantity,
						0,
					),
				};
			}
		}

		case "REMOVE_FROM_CART": {
			const updatedItems = state.items.filter(
				(item) => item.product.id !== action.payload.productId,
			);
			return {
				items: updatedItems,
				total: updatedItems.reduce(
					(sum, item) => sum + item.product.price * item.quantity,
					0,
				),
			};
		}

		case "UPDATE_QUANTITY": {
			const { productId, quantity } = action.payload;
			if (quantity <= 0) {
				return cartReducer(state, {
					type: "REMOVE_FROM_CART",
					payload: { productId },
				});
			}

			const updatedItems = state.items.map((item) =>
				item.product.id === productId ? { ...item, quantity } : item,
			);
			return {
				items: updatedItems,
				total: updatedItems.reduce(
					(sum, item) => sum + item.product.price * item.quantity,
					0,
				),
			};
		}

		case "CLEAR_CART":
			return { items: [], total: 0 };

		default:
			return state;
	}
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
	const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

	const addToCart = (product: Product, quantity: number = 1) => {
		console.log("CartContext: Adding to cart", { product, quantity });
		dispatch({ type: "ADD_TO_CART", payload: { product, quantity } });
	};

	const removeFromCart = (productId: string) => {
		dispatch({ type: "REMOVE_FROM_CART", payload: { productId } });
	};

	const updateQuantity = (productId: string, quantity: number) => {
		dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
	};

	const clearCart = () => {
		dispatch({ type: "CLEAR_CART" });
	};

	return (
		<CartContext.Provider
			value={{
				cart,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};
