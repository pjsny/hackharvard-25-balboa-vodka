"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import type { CheckoutData, FraudRisk, CartItem } from "@/types";

export default function Checkout() {
	const router = useRouter();
	const { cart, clearCart } = useCart();
	const [step, setStep] = useState<
		"form" | "risk-assessment" | "balboa-verification" | "success"
	>("form");
	const [checkoutData, setCheckoutData] = useState<CheckoutData>({
		email: "",
		firstName: "",
		lastName: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		cardNumber: "",
		expiryDate: "",
		cvv: "",
	});
	const [fraudRisk, setFraudRisk] = useState<FraudRisk | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);

	// Redirect if cart is empty (but not if we're in success state)
	useEffect(() => {
		if (cart.items.length === 0 && step !== "success") {
			router.push("/cart");
		}
	}, [cart.items.length, router, step]);

	const simulateFraudAssessment = (): FraudRisk => {
		// Simulate fraud detection based on various factors
		const riskFactors = [
			checkoutData.cardNumber.includes("1111"), // Suspicious card pattern
			checkoutData.email.includes("test"), // Test email
			cart.total > 500, // High value transaction
			checkoutData.zipCode === "12345", // Suspicious zip
		];

		const riskScore = riskFactors.filter(Boolean).length;
		const isHighRisk = riskScore >= 2;

		return {
			isHighRisk,
			riskScore: riskScore * 25, // Convert to percentage
			reason: isHighRisk
				? "Multiple risk factors detected"
				: "Low risk transaction",
		};
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsProcessing(true);

		// Simulate API call delay
		setTimeout(() => {
			const risk = simulateFraudAssessment();
			setFraudRisk(risk);

			if (risk.isHighRisk) {
				setStep("balboa-verification");
			} else {
				setPurchasedItems([...cart.items]);
				setStep("success");
				clearCart();
			}

			setIsProcessing(false);
		}, 2000);
	};

	const handleBalboaVerification = () => {
		setIsProcessing(true);

		// Simulate Balboa verification process
		setTimeout(() => {
			setPurchasedItems([...cart.items]);
			setStep("success");
			clearCart();
			setIsProcessing(false);
		}, 3000);
	};

	const handleInputChange = (field: keyof CheckoutData, value: string) => {
		setCheckoutData((prev) => ({ ...prev, [field]: value }));
	};

	if (cart.items.length === 0) {
		return null; // Will redirect
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold mb-2">Harvard Crimson Checkout</h1>
				<p className="text-muted-foreground">
					Complete your secure purchase of Harvard merchandise with Balboa verification
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Checkout Form */}
				<div className="lg:col-span-2">
					{step === "form" && (
						<Card>
							<CardHeader>
								<CardTitle>Payment Information</CardTitle>
								<CardDescription>
									Enter your payment details securely
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleFormSubmit} className="space-y-6">
									{/* Personal Information */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label
												htmlFor="firstName"
												className="block text-sm font-medium mb-2"
											>
												First Name
											</label>
											<input
												id="firstName"
												type="text"
												required
												value={checkoutData.firstName}
												onChange={(e) =>
													handleInputChange("firstName", e.target.value)
												}
												className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
											/>
										</div>
										<div>
											<label
												htmlFor="lastName"
												className="block text-sm font-medium mb-2"
											>
												Last Name
											</label>
											<input
												id="lastName"
												type="text"
												required
												value={checkoutData.lastName}
												onChange={(e) =>
													handleInputChange("lastName", e.target.value)
												}
												className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
											/>
										</div>
									</div>

									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium mb-2"
										>
											Email
										</label>
										<input
											id="email"
											type="email"
											required
											value={checkoutData.email}
											onChange={(e) =>
												handleInputChange("email", e.target.value)
											}
											className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</div>

									{/* Address */}
									<div>
										<label
											htmlFor="address"
											className="block text-sm font-medium mb-2"
										>
											Address
										</label>
										<input
											id="address"
											type="text"
											required
											value={checkoutData.address}
											onChange={(e) =>
												handleInputChange("address", e.target.value)
											}
											className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label
												htmlFor="city"
												className="block text-sm font-medium mb-2"
											>
												City
											</label>
											<input
												id="city"
												type="text"
												required
												value={checkoutData.city}
												onChange={(e) =>
													handleInputChange("city", e.target.value)
												}
												className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
											/>
										</div>
										<div>
											<label
												htmlFor="state"
												className="block text-sm font-medium mb-2"
											>
												State
											</label>
											<input
												id="state"
												type="text"
												required
												value={checkoutData.state}
												onChange={(e) =>
													handleInputChange("state", e.target.value)
												}
												className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
											/>
										</div>
										<div>
											<label
												htmlFor="zipCode"
												className="block text-sm font-medium mb-2"
											>
												ZIP Code
											</label>
											<input
												id="zipCode"
												type="text"
												required
												value={checkoutData.zipCode}
												onChange={(e) =>
													handleInputChange("zipCode", e.target.value)
												}
												className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
											/>
										</div>
									</div>

									{/* Payment Information */}
									<div>
										<label
											htmlFor="cardNumber"
											className="block text-sm font-medium mb-2"
										>
											Card Number
										</label>
										<input
											id="cardNumber"
											type="text"
											required
											placeholder="1234 5678 9012 3456"
											value={checkoutData.cardNumber}
											onChange={(e) =>
												handleInputChange("cardNumber", e.target.value)
											}
											className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label
												htmlFor="expiryDate"
												className="block text-sm font-medium mb-2"
											>
												Expiry Date
											</label>
											<input
												id="expiryDate"
												type="text"
												required
												placeholder="MM/YY"
												value={checkoutData.expiryDate}
												onChange={(e) =>
													handleInputChange("expiryDate", e.target.value)
												}
												className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
											/>
										</div>
										<div>
											<label
												htmlFor="cvv"
												className="block text-sm font-medium mb-2"
											>
												CVV
											</label>
											<input
												id="cvv"
												type="text"
												required
												placeholder="123"
												value={checkoutData.cvv}
												onChange={(e) =>
													handleInputChange("cvv", e.target.value)
												}
												className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
											/>
										</div>
									</div>

									<Button
										type="submit"
										className="w-full"
										size="lg"
										disabled={isProcessing}
									>
										{isProcessing ? "Processing..." : "Complete Purchase"}
									</Button>
								</form>
							</CardContent>
						</Card>
					)}

					{/* Balboa Verification */}
					{step === "balboa-verification" && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span className="text-2xl">🎤</span>
									Balboa Voice Verification Required
								</CardTitle>
								<CardDescription>
									High-risk transaction detected. Please complete voice
									verification to proceed.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
									<h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
										Risk Assessment Results
									</h3>
									<p className="text-sm text-yellow-700 dark:text-yellow-300">
										Risk Score: {fraudRisk?.riskScore}% - {fraudRisk?.reason}
									</p>
								</div>

								<div className="text-center space-y-4">
									<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
										<span className="text-2xl">🎤</span>
									</div>
									<h3 className="text-xl font-semibold">Voice Verification</h3>
									<p className="text-muted-foreground">
										Please speak the secret phrase:{" "}
										<strong>"Balboa verification complete"</strong>
									</p>
									<p className="text-sm text-muted-foreground">
										Our system will verify your voice matches the enrollment
										data and check the audio fingerprint.
									</p>
								</div>

								<div className="space-y-4">
									<Button
										onClick={handleBalboaVerification}
										className="w-full"
										size="lg"
										disabled={isProcessing}
									>
										{isProcessing ? "Verifying..." : "Start Voice Verification"}
									</Button>

									<div className="text-xs text-muted-foreground text-center">
										<p>✓ Secret phrase verification</p>
										<p>✓ Voice embedding similarity check</p>
										<p>✓ Audio fingerprint validation</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Success */}
					{step === "success" && (
						<Card>
							<CardContent className="text-center py-16">
								<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
									<span className="text-4xl">✅</span>
								</div>
								<h2 className="text-4xl font-bold mb-6 text-primary">Thanks for shopping with us!</h2>
								<p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
									Your Harvard merchandise order has been processed successfully. 
									You will receive a confirmation email shortly.
								</p>
								<Button asChild size="lg">
									<a href="/">Continue Shopping</a>
								</Button>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Order Summary */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{cart.items.map((item) => (
								<div
									key={item.product.id}
									className="flex justify-between items-center"
								>
									<div>
										<p className="font-medium">{item.product.name}</p>
										<p className="text-sm text-muted-foreground">
											Qty: {item.quantity}
										</p>
									</div>
									<p className="font-medium">
										${(item.product.price * item.quantity).toFixed(2)}
									</p>
								</div>
							))}

							<hr />

							<div className="flex justify-between">
								<span>Subtotal</span>
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
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
