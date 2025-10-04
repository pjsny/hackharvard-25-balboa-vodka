import type { Product } from "@/types";

export const mockProducts: Product[] = [
	{
		id: "1",
		name: "Harvard Crimson Sweatshirt",
		price: 89.99,
		description:
			"Classic Harvard University sweatshirt in authentic crimson color. Perfect for showing your Harvard pride.",
		image: "https://m.media-amazon.com/images/I/61S22quTItL._UY1000_.jpg",
		category: "Apparel",
	},
	{
		id: "2",
		name: "Boston Red Sox Cap",
		price: 34.99,
		description:
			"Official Boston Red Sox baseball cap. Support the home team with this classic Boston accessory.",
		image:
			"https://fanatics.frgimages.com/boston-red-sox/mens-new-era-navy-boston-red-sox-game-authentic-collection-on-field-59fifty-fitted-hat_pi2659000_altimages_ff_2659230alt1_full.jpg?_hv=2&w=900",
		category: "Accessories",
	},
	{
		id: "3",
		name: "Harvard Yard Coffee Mug",
		price: 19.99,
		description:
			"Ceramic coffee mug featuring Harvard Yard. Start your day with a taste of Cambridge.",
		image:
			"https://www.theharvardshop.com/cdn/shop/files/The-Red-Harvard-Mug-Quality-199911398_grande.jpg?v=1720621461",
		category: "Drinkware",
	},
	{
		id: "4",
		name: "Charles River Tote Bag",
		price: 24.99,
		description:
			"Canvas tote bag with Charles River design. Perfect for carrying your books around campus.",
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxjeN9OYikmqlyk_iPbSFlVpkFfd2iEPMeAw&s",
		category: "Accessories",
	},
	{
		id: "5",
		name: "Boston Tea Party Book",
		price: 29.99,
		description:
			"Historical book about the Boston Tea Party. Learn about Boston's revolutionary history.",
		image: "https://images.randomhouse.com/cover/9780823429158",
		category: "Books",
	},
	{
		id: "6",
		name: "Harvard Logo Water Bottle",
		price: 22.99,
		description:
			"Insulated water bottle with Harvard University logo. Stay hydrated in style.",
		image:
			"https://images.footballfanatics.com/harvard-crimson/harvard-crimson-24oz-frosted-sport-bottle_pi4251000_ff_4251184-b8113f0f0ebe01dc153c_full.jpg?_hv=2",
		category: "Drinkware",
	},
];

export const getProductById = (id: string): Product | undefined => {
	return mockProducts.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
	return mockProducts.filter((product) => product.category === category);
};
