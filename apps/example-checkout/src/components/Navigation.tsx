"use client";

import { Home, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export function Navigation() {
	const { cart } = useCart();

	// Debug cart state
	console.log("Navigation: Cart state", cart);

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center space-x-8">
						<Link href="/" className="flex items-center space-x-2">
							<Home className="h-6 w-6" />
							<span className="text-xl font-bold">Harvard Crimson Store</span>
						</Link>
					</div>

					<div className="flex items-center space-x-4">
						<Link href="/cart">
							<Button variant="outline" className="relative">
								<ShoppingCart className="h-4 w-4" />
								<span className="ml-2">Cart</span>
								{cart.items.length > 0 && (
									<span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
										{cart.items.reduce((sum, item) => sum + item.quantity, 0)}
									</span>
								)}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
