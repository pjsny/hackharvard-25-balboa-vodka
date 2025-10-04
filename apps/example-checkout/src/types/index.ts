export interface Product {
	id: string;
	name: string;
	price: number;
	description: string;
	image: string;
	category: string;
}

export interface CartItem {
	product: Product;
	quantity: number;
}

export interface Cart {
	items: CartItem[];
	total: number;
}

export interface CheckoutData {
	email: string;
	firstName: string;
	lastName: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	cardNumber: string;
	expiryDate: string;
	cvv: string;
}

export interface FraudRisk {
	isHighRisk: boolean;
	riskScore: number;
	reason?: string;
}
