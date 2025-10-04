"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
	const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

	if (cart.items.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-16">
					<ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
					<h1 className="text-2xl font-bold mb-4">Your Harvard cart is empty</h1>
					<p className="text-muted-foreground mb-6">
						Looks like you haven't added any Harvard or Boston merchandise to your cart yet.
					</p>
					<Button asChild>
						<Link href="/">Continue Shopping</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold mb-2">Harvard Crimson Cart</h1>
				<p className="text-muted-foreground">
					Review your Harvard and Boston merchandise before proceeding to checkout
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Cart Items */}
				<div className="lg:col-span-2 space-y-4">
					{cart.items.map((item) => (
						<Card key={item.product.id}>
							<CardContent className="p-6">
								<div className="flex items-center space-x-4">
									<div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden">
										<Image
											src={item.product.image}
											alt={item.product.name}
											fill
											className="object-cover"
										/>
									</div>

									<div className="flex-1">
										<h3 className="font-semibold text-lg">
											{item.product.name}
										</h3>
										<p className="text-sm text-muted-foreground mb-2">
											{item.product.category}
										</p>
										<p className="text-lg font-bold text-primary">
											${item.product.price.toFixed(2)}
										</p>
									</div>

									<div className="flex items-center space-x-2">
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												updateQuantity(item.product.id, item.quantity - 1)
											}
											disabled={item.quantity <= 1}
										>
											<Minus className="h-4 w-4" />
										</Button>
										<span className="w-8 text-center">{item.quantity}</span>
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												updateQuantity(item.product.id, item.quantity + 1)
											}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>

									<div className="text-right">
										<p className="text-lg font-bold">
											${(item.product.price * item.quantity).toFixed(2)}
										</p>
										<Button
											variant="outline"
											size="icon"
											onClick={() => removeFromCart(item.product.id)}
											className="mt-2"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}

					<div className="flex justify-between items-center pt-4">
						<Button variant="outline" onClick={clearCart}>
							Clear Cart
						</Button>
						<Button variant="outline" asChild>
							<Link href="/">Continue Shopping</Link>
						</Button>
					</div>
				</div>

				{/* Order Summary */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span>
									Subtotal (
									{cart.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
									items)
								</span>
								<span>${cart.total.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span>Shipping</span>
								<span className="text-green-600">Free</span>
							</div>
							<div className="flex justify-between">
								<span>Tax</span>
								<span>${(cart.total * 0.08).toFixed(2)}</span>
							</div>
							<hr />
							<div className="flex justify-between text-lg font-bold">
								<span>Total</span>
								<span>${(cart.total * 1.08).toFixed(2)}</span>
							</div>

							<Button className="w-full" size="lg" asChild>
								<Link href="/checkout">Proceed to Checkout</Link>
							</Button>

							<p className="text-xs text-muted-foreground text-center">
								Secure Harvard merchandise checkout powered by Balboa voice verification
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
