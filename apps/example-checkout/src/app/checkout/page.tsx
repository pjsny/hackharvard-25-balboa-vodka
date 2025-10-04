"use client";

import { useBalboaVerification, VoiceVerificationDialog } from "@balboa/web";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import type { CartItem, CheckoutData, FraudRisk } from "@/types";

export default function Checkout() {
	const router = useRouter();
	const { cart, clearCart } = useCart();
	const [step, setStep] = useState<"form" | "risk-assessment" | "success">(
		"form",
	);
	const [checkoutData, setCheckoutData] = useState<CheckoutData>({
		email: "test@test.com",
		firstName: "test",
		lastName: "ttest",
		address: "test",
		city: "test",
		state: "test",
		zipCode: "213123",
		cardNumber: "123123123123123",
		expiryDate: "123123",
		cvv: "123",
	});
	const [fraudRisk, setFraudRisk] = useState<FraudRisk | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);

	const {
		startVerification,
		isOpen,
		currentOptions,
		handleSuccess,
		handleClose,
	} = useBalboaVerification({
		onSuccess: () => {
			setPurchasedItems([...cart.items]);
			setStep("success");
			clearCart();
		},
	});

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

		let riskScore = riskFactors.filter(Boolean).length;
		riskScore += 10000;
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
				startVerification({
					transactionId: `txn_${Date.now()}`,
					customerData: checkoutData as unknown as Record<string, unknown>,
					riskLevel: risk.riskScore,
				});
			} else {
				setPurchasedItems([...cart.items]);
				setStep("success");
				clearCart();
			}

			setIsProcessing(false);
		}, 2000);
	};

	const handleVoiceVerificationSuccess = () => {
		setPurchasedItems([...cart.items]);
		setStep("success");
		clearCart();
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
					Complete your secure purchase of Harvard merchandise with Balboa
					verification
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

					{/* Success */}
					{step === "success" && (
						<Card>
							<CardContent className="text-center py-16">
								<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
									<span className="text-4xl">✅</span>
								</div>
								<h2 className="text-4xl font-bold mb-6 text-primary">
									Thanks for shopping with us!
								</h2>
								<p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
									Your Harvard merchandise order has been processed
									successfully. You will receive a confirmation email shortly.
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

			{/* Voice Verification Dialog */}
			{currentOptions && (
				<VoiceVerificationDialog
					isOpen={isOpen}
					onClose={handleClose}
					onSuccess={handleSuccess}
					transactionId={currentOptions.transactionId}
					customerData={currentOptions.customerData}
					riskLevel={currentOptions.riskLevel}
				/>
			)}
		</div>
	);
}
