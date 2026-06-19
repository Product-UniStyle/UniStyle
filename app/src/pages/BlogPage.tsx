import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { blogPosts, blogCategories } from '@/data/blog';

export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mt-[72px]">
      {/* Banner */}
      <div className="relative bg-[#1A1A1A] h-[300px] md:h-[400px] flex flex-col items-center justify-center text-white">
        <div className="absolute inset-0 opacity-30">
          <img src="/blog-1.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">BLOGS</h1>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-[#E5E5E5]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-6 overflow-x-auto py-4">
            <button
              onClick={() => setActiveCategory('All')}
              className={`text-sm font-medium whitespace-nowrap pb-1 transition-colors ${activeCategory === 'All' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : 'text-[#999] hover:text-[#1A1A1A]'}`}
            >
              All
            </button>
            {blogCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm font-medium whitespace-nowrap pb-1 transition-colors ${activeCategory === cat ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : 'text-[#999] hover:text-[#1A1A1A]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[300px] shrink-0">
            {/* Search */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Search</h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full border border-[#E5E5E5] pl-3 pr-10 py-2.5 text-sm outline-none focus:border-[#1A1A1A] transition-colors"
                />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Categories</h4>
              <div className="space-y-2">
                {blogCategories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                    <input
                      type="checkbox"
                      checked={activeCategory === cat}
                      onChange={() => setActiveCategory(activeCategory === cat ? 'All' : cat)}
                      className="accent-[#1A1A1A]"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Related Articles */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Related Articles</h4>
              <div className="space-y-3">
                {blogPosts.slice(0, 3).map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="block text-sm text-[#666] hover:text-[#1A1A1A] hover:underline leading-snug">
                    {post.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Posts Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts.map(post => (
                <article key={post.id} className="group">
                  <Link to={`/blog/${post.slug}`} className="block overflow-hidden mb-4">
                    <img src={post.image} alt={post.title} className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2 leading-snug group-hover:underline">{post.title}</h3>
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-[#999] mb-2">
                    <span className="font-medium uppercase tracking-wider text-[#1A1A1A]">{post.category}</span>
                    <span>|</span>
                    <span>{post.date}</span>
                  </div>
                  <p className="text-sm text-[#666] line-clamp-2">{post.excerpt}</p>
                </article>
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-[#666]">No articles found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
