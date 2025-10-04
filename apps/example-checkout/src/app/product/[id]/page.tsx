"use client";

import { ArrowLeft, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { getProductById } from "@/data/products";

export default function ProductDetail() {
	const params = useParams();
	const productId = params.id as string;
	const product = getProductById(productId);
	const { addToCart } = useCart();
	const [quantity, setQuantity] = useState(1);

	if (!product) {
		return (
			<div className="container mx-auto px-4 py-8 text-center">
				<h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
				<p className="text-muted-foreground mb-6">
					The product you're looking for doesn't exist.
				</p>
				<Button asChild>
					<Link href="/">Back to Store</Link>
				</Button>
			</div>
		);
	}

	const handleAddToCart = () => {
		addToCart(product, quantity);
		// Reset quantity after adding
		setQuantity(1);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<Button variant="outline" asChild className="mb-4">
					<Link href="/">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Harvard Store
					</Link>
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Product Image */}
				<div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
					<Image
						src={product.image}
						alt={product.name}
						fill
						className="object-cover"
					/>
				</div>

				{/* Product Details */}
				<div className="space-y-6">
					<div>
						<span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
							{product.category}
						</span>
						<h1 className="text-3xl font-bold mt-2 mb-4">{product.name}</h1>
						<p className="text-lg text-muted-foreground mb-6">
							{product.description}
						</p>
						<div className="text-4xl font-bold text-primary mb-6">
							${product.price.toFixed(2)}
						</div>
					</div>

					{/* Quantity Selector */}
					<div className="space-y-4">
						<div className="flex items-center space-x-4">
							<span className="text-sm font-medium">Quantity:</span>
							<div className="flex items-center border rounded-md">
								<Button
									variant="outline"
									size="icon"
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									disabled={quantity <= 1}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="px-4 py-2 min-w-[3rem] text-center">
									{quantity}
								</span>
								<Button
									variant="outline"
									size="icon"
									onClick={() => setQuantity(quantity + 1)}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* Add to Cart Button */}
						<Button onClick={handleAddToCart} className="w-full" size="lg">
							Add to Cart - ${(product.price * quantity).toFixed(2)}
						</Button>
					</div>

					{/* Product Features */}
					<Card>
						<CardHeader>
							<CardTitle>Harvard Store Benefits</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm">
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
									Authentic Harvard University merchandise
								</li>
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
									Free shipping on orders over $50
								</li>
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
									30-day money-back guarantee
								</li>
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
									Secure checkout with Balboa verification
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
