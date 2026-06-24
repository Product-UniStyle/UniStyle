import 'dotenv/config';
import { connectDb } from './lib/db.js';
import Product from './models/Product.js';
import mongoose from 'mongoose';

// Mirrors app/src/data/products.ts so the DB matches what's already on the site.
// Prices are converted from dollars to cents for storage.
const products = [
  {
    slug: 'simona-glossed-leather-shoulder-bag',
    name: 'Simona Glossed-Leather Shoulder Bag',
    description: 'A sleek cylindrical silhouette crafted from high-shine glossed leather. Features a thin adjustable strap and minimalist hardware for everyday sophistication.',
    price: 7200,
    category: 'Bags',
    images: ['/product-bag-black.jpg'],
    colors: [
      { name: 'Pink', hex: '#E8B4B8' },
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Brown', hex: '#8B6914' },
      { name: 'Green', hex: '#2D5A3D' },
    ],
    sizes: [],
    stock: 25,
    featured: false,
    rating: 4.5,
    reviewCount: 12,
  },
  {
    slug: 'fringed-wool-blend-turtleneck-top',
    name: 'Fringed Wool-Blend Turtleneck Top',
    description: 'A cozy statement piece in a premium wool blend. The chunky cable-knit pattern and dramatic fringe hem bring texture and movement to cold-weather dressing.',
    price: 6000,
    compareAt: 7500,
    category: 'Women',
    images: ['/product-turtleneck.jpg'],
    colors: [
      { name: 'Cream', hex: '#F5F0E8' },
      { name: 'Charcoal', hex: '#4A4A4A' },
    ],
    sizes: ['S', 'M', 'L'],
    stock: 30,
    featured: true,
    rating: 5,
    reviewCount: 8,
    badge: '-20%',
  },
  {
    slug: 'triomphe-cat-eye-acetate-sunglasses',
    name: 'Triomphe Cat-Eye Acetate Sunglasses',
    description: 'Bold angular frames in glossy acetate with signature gold-tone temple detailing. UV400 protection with a distinctive cat-eye silhouette.',
    price: 6000,
    category: 'Glases',
    images: ['/product-sunglasses.jpg'],
    colors: [
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Tortoise', hex: '#6B4423' },
    ],
    sizes: [],
    stock: 40,
    featured: false,
    rating: 4.8,
    reviewCount: 24,
  },
  {
    slug: 'althea-belted-cow-hair-trench-coat',
    name: 'Althea Belted Cow Hair Trench Coat',
    description: 'A luxurious take on the classic trench in distinctive cow hair. Double-breasted silhouette with storm flaps, belted waist, and rich burgundy patina.',
    price: 8000,
    compareAt: 15000,
    category: 'Women',
    images: ['/product-trench.jpg'],
    colors: [{ name: 'Burgundy', hex: '#6B1A2A' }],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 15,
    featured: true,
    rating: 4.5,
    reviewCount: 6,
    badge: '-46%',
  },
  {
    slug: 'wool-coat',
    name: 'Wool Coat',
    description: 'Curabitur egestas malesuada volutpat. Nunc vel vestibulum odio, ac pellentesque lacus. Pellentesque dapibus nunc nec est imperdiet, a malesuada sem rutrum.',
    price: 8000,
    compareAt: 11000,
    category: 'Women',
    images: ['/product-wool-coat.jpg'],
    colors: [
      { name: 'Navy', hex: '#1E3A5F' },
      { name: 'Purple', hex: '#6B4C7F' },
      { name: 'Yellow', hex: '#D4A843' },
    ],
    sizes: ['M', 'L', 'XL'],
    stock: 20,
    featured: true,
    rating: 5,
    reviewCount: 4,
    badge: '-27%',
    countdownEnd: new Date('2026-12-31T23:59:59'),
  },
  {
    slug: 'luxury-touch-polo',
    name: 'Luxury-Touch Polo',
    description: 'Elevated polo in premium pique cotton with contrast tipping at the collar and cuffs. A refined essential for smart-casual dressing.',
    price: 5000,
    category: 'Men',
    images: ['/product-polo.jpg'],
    colors: [
      { name: 'Navy', hex: '#1E3A5F' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: 35,
    featured: false,
    rating: 4.2,
    reviewCount: 15,
  },
  {
    slug: 'jacquard-chore-coat',
    name: 'Jacquard Chore Coat',
    description: 'A modern workwear staple in textured jacquard. Boxy silhouette with patch pockets and horn buttons for a heritage-inspired look.',
    price: 7000,
    category: 'Men',
    images: ['/product-chore-coat.jpg'],
    colors: [{ name: 'Navy', hex: '#1E3A5F' }],
    sizes: ['M', 'L', 'XL'],
    stock: 18,
    featured: false,
    rating: 4.7,
    reviewCount: 9,
  },
  {
    slug: 'heritage-cotton-slub-henley-t-shirt',
    name: 'Heritage Cotton Slub Henley T-Shirt',
    description: 'A timeless layer in slub cotton with a three-button henley placket. The uneven texture gives each piece a unique, lived-in character.',
    price: 12000,
    compareAt: 15000,
    category: 'Men',
    images: ['/product-henley.jpg'],
    colors: [
      { name: 'Indigo', hex: '#3B5F8A' },
      { name: 'Olive', hex: '#5B6B3A' },
    ],
    sizes: ['M', 'L', 'XL'],
    stock: 22,
    featured: false,
    rating: 4.3,
    reviewCount: 11,
    badge: '-20%',
  },
  {
    slug: 'le-teckel-medium-nubuck-shoulder-bag',
    name: 'Le Teckel Medium Nubuck Shoulder Bag',
    description: 'An elongated silhouette in soft nubuck suede. The clean lines and structured base make this a versatile everyday companion.',
    price: 6000,
    compareAt: 9600,
    category: 'Bags',
    images: ['/product-red-bag.jpg'],
    colors: [
      { name: 'Red', hex: '#B83A3A' },
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Tan', hex: '#C4956A' },
    ],
    sizes: [],
    stock: 12,
    featured: true,
    rating: 4.9,
    reviewCount: 7,
    badge: '-37%',
  },
  {
    slug: 'apolline-patent-leather-slingback-pumps',
    name: 'Apolline Patent-Leather Slingback Pumps',
    description: 'Sculpted slingback pumps in glossy patent leather. The pointed toe and slender heel create an elongating silhouette.',
    price: 8500,
    category: 'Shoes',
    images: ['/product-shoes.jpg'],
    colors: [
      { name: 'Nude', hex: '#D4A996' },
      { name: 'Black', hex: '#1A1A1A' },
    ],
    sizes: ['36', '37', '38', '39', '40'],
    stock: 28,
    featured: false,
    rating: 4.6,
    reviewCount: 18,
  },
  {
    slug: 'ivy-aviator-style-gold-tone-sunglasses',
    name: 'Ivy Aviator-Style Gold-Tone Sunglasses',
    description: 'Modern aviator frames with gold-tone metal and gradient lenses. A timeless shape reimagined with contemporary proportions.',
    price: 5500,
    category: 'Glases',
    images: ['/product-sunglasses.jpg'],
    colors: [
      { name: 'Gold', hex: '#D4A843' },
      { name: 'Silver', hex: '#C0C0C0' },
    ],
    sizes: [],
    stock: 33,
    featured: false,
    rating: 4.4,
    reviewCount: 13,
  },
  {
    slug: 'bow-tie-105-cutout-leather-pumps',
    name: 'Bow Tie 105 Cutout Leather Pumps',
    description: 'Statement pumps with architectural cutout detailing. Crafted from smooth leather with a sculptural 105mm heel.',
    price: 6500,
    category: 'Shoes',
    images: ['/product-shoes.jpg'],
    colors: [{ name: 'Black', hex: '#1A1A1A' }],
    sizes: ['37', '38', '39', '40'],
    stock: 0,
    featured: false,
    rating: 4.8,
    reviewCount: 5,
    badge: '-30%',
    countdownEnd: new Date('2026-08-15T23:59:59'),
  },
];

async function main() {
  await connectDb();
  console.log('Seeding products...');
  for (const product of products) {
    await Product.findOneAndUpdate(
      { slug: product.slug },
      product,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
