import { BalboaServerClient } from "@balboa/server-sdk";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const PlaceOrderSchema = z.object({
	email: z.string().email(),
	cartItems: z.array(
		z.object({
			product: z.object({
				id: z.string(),
				name: z.string(),
				price: z.number(),
			}),
			quantity: z.number(),
		}),
	),
	verificationSessionId: z.string().optional(),
});

// Initialize Balboa server client
const balboaClient = new BalboaServerClient();

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, cartItems, verificationSessionId } =
			PlaceOrderSchema.parse(body);

		// Calculate total
		const total = cartItems.reduce(
			(sum, item) => sum + item.product.price * item.quantity,
			0,
		);

		console.log(`Placing order for ${email}, total: $${total}`);

		// If we have a verification session ID, verify it completed successfully
		if (verificationSessionId) {
			try {
				const verificationStatus = await balboaClient.getVerificationStatus(
					verificationSessionId,
				);

				if (!verificationStatus.verified) {
					return NextResponse.json(
						{
							success: false,
							error: "Voice verification required but not completed",
						},
						{ status: 400 },
					);
				}

				console.log(
					`Voice verification successful for ${email}, confidence: ${verificationStatus.confidence}`,
				);
			} catch (error) {
				console.error("Failed to verify voice verification:", error);
				return NextResponse.json(
					{
						success: false,
						error: "Failed to verify voice verification",
					},
					{ status: 400 },
				);
			}
		}

		// Process payment (mock)
		const paymentSuccess = Math.random() > 0.05; // 95% success rate

		if (!paymentSuccess) {
			return NextResponse.json(
				{
					success: false,
					error: "Payment processing failed",
				},
				{ status: 400 },
			);
		}

		// Generate order ID
		const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		console.log(`Order placed successfully! Order ID: ${orderId}`);

		return NextResponse.json({
			success: true,
			orderId,
			total,
			message: "Order placed successfully!",
		});
	} catch (error) {
		console.error("Place order error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid request data",
					details: error.errors,
				},
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 },
		);
	}
}
