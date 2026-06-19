export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  image: string;
  author: string;
}

export const blogCategories = ['Athleisure', 'Fashion Lab', 'Minimalism', 'News', 'Street Style'];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How to Build a Sustainable Capsule Wardrobe Without Spending a Small Fortune',
    slug: 'how-to-build-a-sustainable-capsule-wardrobe',
    excerpt: 'Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Aenean commodo ligula eget...',
    content: `Building a sustainable capsule wardrobe doesn't require a massive budget or an overnight overhaul. The key is intentionality — choosing pieces that work harder so you don't have to.

Start with your lifestyle. If you spend five days a week in an office, your foundation pieces should reflect that reality. A well-tailored blazer, two pairs of quality trousers, and three silk blouses will carry you further than ten trendy tops that sit unworn.

Quality over quantity is the golden rule. A $200 cashmere sweater that you wear 100 times costs $2 per wear. A $30 fast-fashion equivalent that pills after three washes costs $10 per wear and ends up in a landfill.

Look for natural fibers — cotton, wool, silk, linen. They breathe better, last longer, and age gracefully. When shopping secondhand, prioritize these materials as they've already proven their durability.

The 80/20 rule applies to wardrobes too. You'll wear 20% of your clothes 80% of the time. Identify that 20% and invest there. A capsule wardrobe of 30 well-chosen pieces will outperform a closet of 300 mediocre ones every single time.`,
    category: 'Athleisure',
    date: 'April 20, 2026',
    image: '/blog-1.jpg',
    author: 'Elena Martinez',
  },
  {
    id: '2',
    title: 'Ten Essential Items Every Professional Should Have in Their Workday Wardrobe',
    slug: 'ten-essential-items-workday-wardrobe',
    excerpt: 'Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Aenean commodo ligula eget...',
    content: `The modern professional wardrobe is a delicate balance between authority and approachability, comfort and polish. These ten pieces form the backbone of a work wardrobe that works as hard as you do.

1. The Structured Blazer — Navy or charcoal, single-breasted, tailored to your shoulders. Throw it over anything and instant credibility follows.

2. The Silk Blouse — White, cream, or soft blue. Breathable, elegant, and appropriate for every meeting on your calendar.

3. The Tailored Trouser — Mid-rise, straight leg, in wool or a wool blend. Black, navy, or camel. These are your daily drivers.

4. The Pencil Skirt — Knee-length, in a substantial fabric. Paired with the blazer, it's a suit. Alone, it's versatile.

5. The Day Dress — Sheath or A-line, in a solid color. One-and-done dressing for busy mornings.

6. The Cashmere Sweater — Crewneck or V-neck in a neutral tone. Layering essential that elevates everything beneath it.

7. The Leather Belt — Simple, 1-inch width, in black and brown. The finishing touch that pulls an outfit together.

8. The Classic Pump — 2-3 inch heel, pointed or almond toe, in black leather. Your power shoe.

9. The Structured Bag — Large enough for a laptop, with organization pockets. Leather ages beautifully.

10. The Trench Coat — Camel or navy, belted, knee-length. The ultimate transitional piece.`,
    category: 'Athleisure',
    date: 'April 20, 2026',
    image: '/blog-2.jpg',
    author: 'James Chen',
  },
  {
    id: '3',
    title: 'The Ultimate Guide to Mastering Your Personal Style for the Year 2026',
    slug: 'ultimate-guide-personal-style-2026',
    excerpt: 'Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Aenean commodo ligula eget...',
    content: `Personal style isn't about following trends — it's about understanding yourself and expressing that understanding through clothing. As we move through 2026, several shifts are redefining how we approach getting dressed.

Quiet luxury continues its reign, but with a twist. The logo-free minimalism of last year is evolving into something more personal — investment pieces that tell a story. A hand-me-down watch, a locally tailored jacket, vintage denim with the perfect fade. These are the new status symbols.

Color is having a moment, but selectively. Instead of head-to-toe brights, we're seeing strategic pops — a burgundy bag against an all-black outfit, a mustard scarf with navy. The rule: one vibrant element per look.

Fit is everything. The oversized experiment is settling into a balanced silhouette — relaxed but intentional. Shoulders fit, waists are defined (but not cinched), hems graze the ankle. It's comfortable without being sloppy.

Sustainability is no longer optional. The most stylish people you know are also the most conscious consumers. They're buying less, choosing better, and caring for what they own. A well-maintained garment from 2020 is more impressive than a new one from a questionable source.`,
    category: 'Athleisure',
    date: 'April 20, 2026',
    image: '/blog-3.jpg',
    author: 'Sophia Laurent',
  },
];
