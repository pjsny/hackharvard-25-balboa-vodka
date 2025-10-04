"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { mockProducts } from "@/data/products";
import { useState } from "react";

export default function Home() {
	const { addToCart } = useCart();
	const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

	const handleAddToCart = (product: any) => {
		console.log("Adding to cart:", product);
		addToCart(product);
		setAddedItems(prev => new Set(prev).add(product.id));
		// Reset the visual feedback after 2 seconds
		setTimeout(() => {
			setAddedItems(prev => {
				const newSet = new Set(prev);
				newSet.delete(product.id);
				return newSet;
			});
		}, 2000);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold mb-4">Harvard Crimson Store</h1>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Discover authentic Harvard and Boston merchandise with secure checkout powered by Balboa voice
					verification. Experience the future of online payments with our
					innovative fraud protection system.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{mockProducts.map((product) => (
					<Card key={product.id} className="overflow-hidden">
						<CardHeader className="p-0">
							<div className="aspect-square relative bg-muted">
								<Image
									src={product.image}
									alt={product.name}
									fill
									className="object-cover"
								/>
							</div>
						</CardHeader>
						<CardContent className="p-6">
							<CardTitle className="text-xl mb-2">{product.name}</CardTitle>
							<CardDescription className="mb-4">
								{product.description}
							</CardDescription>
							<div className="flex items-center justify-between">
								<span className="text-2xl font-bold text-primary">
									${product.price.toFixed(2)}
								</span>
								<span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
									{product.category}
								</span>
							</div>
						</CardContent>
						<CardFooter className="p-6 pt-0 flex gap-2">
							<Button 
								onClick={() => handleAddToCart(product)} 
								className="flex-1"
								variant={addedItems.has(product.id) ? "default" : "default"}
							>
								{addedItems.has(product.id) ? "✓ Added!" : "Add to Cart"}
							</Button>
							<Button variant="outline" asChild>
								<Link href={`/product/${product.id}`}>View Details</Link>
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>

			<div className="text-center mt-12">
				<h2 className="text-2xl font-semibold mb-4">Why Choose Harvard Crimson Store?</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
					<div className="text-center">
						<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">🎓</span>
						</div>
						<h3 className="font-semibold mb-2">Authentic Harvard Merchandise</h3>
						<p className="text-sm text-muted-foreground">
							Official Harvard University merchandise and Boston-themed items
						</p>
					</div>
					<div className="text-center">
						<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">🏛️</span>
						</div>
						<h3 className="font-semibold mb-2">Boston Heritage</h3>
						<p className="text-sm text-muted-foreground">
							Celebrating the rich history and culture of Boston and Cambridge
						</p>
					</div>
					<div className="text-center">
						<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">⚡</span>
						</div>
						<h3 className="font-semibold mb-2">Secure Checkout</h3>
						<p className="text-sm text-muted-foreground">
							Powered by Balboa voice verification for safe transactions
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
