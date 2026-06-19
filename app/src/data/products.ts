export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  description: string;
  images: string[];
  category: string;
  colors?: ProductColor[];
  sizes?: string[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  countdownEnd?: string;
  gender?: 'women' | 'men' | 'unisex';
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Simona Glossed-Leather Shoulder Bag',
    slug: 'simona-glossed-leather-shoulder-bag',
    price: 72,
    description: 'A sleek cylindrical silhouette crafted from high-shine glossed leather. Features a thin adjustable strap and minimalist hardware for everyday sophistication.',
    images: ['/product-bag-black.jpg', '/product-bag-black.jpg', '/product-bag-black.jpg', '/product-bag-black.jpg'],
    category: 'Bags',
    colors: [
      { name: 'Pink', hex: '#E8B4B8' },
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Brown', hex: '#8B6914' },
      { name: 'Green', hex: '#2D5A3D' },
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 12,
    gender: 'women',
  },
  {
    id: '2',
    name: 'Fringed Wool-Blend Turtleneck Top',
    slug: 'fringed-wool-blend-turtleneck-top',
    price: 75,
    salePrice: 60,
    description: 'A cozy statement piece in a premium wool blend. The chunky cable-knit pattern and dramatic fringe hem bring texture and movement to cold-weather dressing.',
    images: ['/product-turtleneck.jpg', '/product-turtleneck.jpg', '/product-turtleneck.jpg', '/product-turtleneck.jpg'],
    category: 'Women',
    colors: [
      { name: 'Cream', hex: '#F5F0E8' },
      { name: 'Charcoal', hex: '#4A4A4A' },
    ],
    sizes: ['S', 'M', 'L'],
    inStock: true,
    rating: 5,
    reviewCount: 8,
    badge: '-20%',
    gender: 'women',
  },
  {
    id: '3',
    name: 'Triomphe Cat-Eye Acetate Sunglasses',
    slug: 'triomphe-cat-eye-acetate-sunglasses',
    price: 60,
    description: 'Bold angular frames in glossy acetate with signature gold-tone temple detailing. UV400 protection with a distinctive cat-eye silhouette.',
    images: ['/product-sunglasses.jpg', '/product-sunglasses.jpg', '/product-sunglasses.jpg', '/product-sunglasses.jpg'],
    category: 'Glases',
    colors: [
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Tortoise', hex: '#6B4423' },
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 24,
    gender: 'women',
  },
  {
    id: '4',
    name: 'Althea Belted Cow Hair Trench Coat',
    slug: 'althea-belted-cow-hair-trench-coat',
    price: 150,
    salePrice: 80,
    description: 'A luxurious take on the classic trench in distinctive cow hair. Double-breasted silhouette with storm flaps, belted waist, and rich burgundy patina.',
    images: ['/product-trench.jpg', '/product-trench.jpg', '/product-trench.jpg', '/product-trench.jpg'],
    category: 'Women',
    colors: [
      { name: 'Burgundy', hex: '#6B1A2A' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    rating: 4.5,
    reviewCount: 6,
    badge: '-46%',
    gender: 'women',
  },
  {
    id: '5',
    name: 'Wool Coat',
    slug: 'wool-coat',
    price: 110,
    salePrice: 80,
    description: 'Curabitur egestas malesuada volutpat. Nunc vel vestibulum odio, ac pellentesque lacus. Pellentesque dapibus nunc nec est imperdiet, a malesuada sem rutrum.',
    images: ['/product-wool-coat.jpg', '/product-wool-coat.jpg', '/product-wool-coat.jpg', '/product-wool-coat.jpg'],
    category: 'Women',
    colors: [
      { name: 'Navy', hex: '#1E3A5F' },
      { name: 'Purple', hex: '#6B4C7F' },
      { name: 'Yellow', hex: '#D4A843' },
    ],
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    rating: 5,
    reviewCount: 4,
    badge: '-27%',
    countdownEnd: '2026-12-31T23:59:59',
    gender: 'women',
  },
  {
    id: '6',
    name: 'Luxury-Touch Polo',
    slug: 'luxury-touch-polo',
    price: 50,
    description: 'Elevated polo in premium pique cotton with contrast tipping at the collar and cuffs. A refined essential for smart-casual dressing.',
    images: ['/product-polo.jpg', '/product-polo.jpg', '/product-polo.jpg', '/product-polo.jpg'],
    category: 'Men',
    colors: [
      { name: 'Navy', hex: '#1E3A5F' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    inStock: true,
    rating: 4.2,
    reviewCount: 15,
    gender: 'men',
  },
  {
    id: '7',
    name: 'Jacquard Chore Coat',
    slug: 'jacquard-chore-coat',
    price: 70,
    description: 'A modern workwear staple in textured jacquard. Boxy silhouette with patch pockets and horn buttons for a heritage-inspired look.',
    images: ['/product-chore-coat.jpg', '/product-chore-coat.jpg', '/product-chore-coat.jpg', '/product-chore-coat.jpg'],
    category: 'Men',
    colors: [
      { name: 'Navy', hex: '#1E3A5F' },
    ],
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    rating: 4.7,
    reviewCount: 9,
    gender: 'men',
  },
  {
    id: '8',
    name: 'Heritage Cotton Slub Henley T-Shirt',
    slug: 'heritage-cotton-slub-henley-t-shirt',
    price: 150,
    salePrice: 120,
    description: 'A timeless layer in slub cotton with a three-button henley placket. The uneven texture gives each piece a unique, lived-in character.',
    images: ['/product-henley.jpg', '/product-henley.jpg', '/product-henley.jpg', '/product-henley.jpg'],
    category: 'Men',
    colors: [
      { name: 'Indigo', hex: '#3B5F8A' },
      { name: 'Olive', hex: '#5B6B3A' },
    ],
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    rating: 4.3,
    reviewCount: 11,
    badge: '-20%',
    gender: 'men',
  },
  {
    id: '9',
    name: 'Le Teckel Medium Nubuck Shoulder Bag',
    slug: 'le-teckel-medium-nubuck-shoulder-bag',
    price: 96,
    salePrice: 60,
    description: 'An elongated silhouette in soft nubuck suede. The clean lines and structured base make this a versatile everyday companion.',
    images: ['/product-red-bag.jpg', '/product-red-bag.jpg', '/product-red-bag.jpg', '/product-red-bag.jpg'],
    category: 'Bags',
    colors: [
      { name: 'Red', hex: '#B83A3A' },
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Tan', hex: '#C4956A' },
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 7,
    badge: '-37%',
    gender: 'women',
  },
  {
    id: '10',
    name: 'Apolline Patent-Leather Slingback Pumps',
    slug: 'apolline-patent-leather-slingback-pumps',
    price: 85,
    description: 'Sculpted slingback pumps in glossy patent leather. The pointed toe and slender heel create an elongating silhouette.',
    images: ['/product-shoes.jpg', '/product-shoes.jpg', '/product-shoes.jpg', '/product-shoes.jpg'],
    category: 'Shoes',
    colors: [
      { name: 'Nude', hex: '#D4A996' },
      { name: 'Black', hex: '#1A1A1A' },
    ],
    sizes: ['36', '37', '38', '39', '40'],
    inStock: true,
    rating: 4.6,
    reviewCount: 18,
    gender: 'women',
  },
  {
    id: '11',
    name: 'Ivy Aviator-Style Gold-Tone Sunglasses',
    slug: 'ivy-aviator-style-gold-tone-sunglasses',
    price: 55,
    description: 'Modern aviator frames with gold-tone metal and gradient lenses. A timeless shape reimagined with contemporary proportions.',
    images: ['/product-sunglasses.jpg', '/product-sunglasses.jpg', '/product-sunglasses.jpg', '/product-sunglasses.jpg'],
    category: 'Glases',
    colors: [
      { name: 'Gold', hex: '#D4A843' },
      { name: 'Silver', hex: '#C0C0C0' },
    ],
    inStock: true,
    rating: 4.4,
    reviewCount: 13,
    gender: 'unisex',
  },
  {
    id: '12',
    name: 'Bow Tie 105 Cutout Leather Pumps',
    slug: 'bow-tie-105-cutout-leather-pumps',
    price: 65,
    description: 'Statement pumps with architectural cutout detailing. Crafted from smooth leather with a sculptural 105mm heel.',
    images: ['/product-shoes.jpg', '/product-shoes.jpg', '/product-shoes.jpg', '/product-shoes.jpg'],
    category: 'Shoes',
    colors: [
      { name: 'Black', hex: '#1A1A1A' },
    ],
    sizes: ['37', '38', '39', '40'],
    inStock: false,
    rating: 4.8,
    reviewCount: 5,
    badge: '-30%',
    countdownEnd: '2026-08-15T23:59:59',
    gender: 'women',
  },
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};

export const getRelatedProducts = (productId: string, count: number = 4): Product[] => {
  return products.filter(p => p.id !== productId).slice(0, count);
};

export const categories = ['Bags', 'Glases', 'Jewelry', 'Men', 'Shoes', 'Women'];

export const blogCategories = ['Athleisure', 'Fashion Lab', 'Minimalism', 'News', 'Street Style'];
