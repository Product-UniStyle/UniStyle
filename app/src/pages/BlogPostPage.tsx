import { useParams, Link, Navigate } from 'react-router-dom';
import { blogPosts } from '@/data/blog';
import { ArrowLeft } from 'lucide-react';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) return <Navigate to="/blog" />;

  const relatedPosts = blogPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 2);

  return (
    <div className="mt-[72px]">
      {/* Hero */}
      <div className="w-full h-[400px] md:h-[500px] overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#1A1A1A] mb-8">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <div className="flex items-center gap-3 text-xs text-[#999] mb-4">
          <span className="font-medium uppercase tracking-wider text-[#1A1A1A]">{post.category}</span>
          <span>|</span>
          <span>{post.date}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{post.title}</h1>

        <div className="flex items-center gap-3 mb-10 pb-8 border-b border-[#E5E5E5]">
          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-sm font-bold">
            {post.author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">{post.author}</p>
            <p className="text-xs text-[#999]">Fashion Editor</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-[#1A1A1A] leading-relaxed">
          {post.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-4 text-sm text-[#666] leading-relaxed">{paragraph}</p>
          ))}
        </div>

        {/* Share */}
        <div className="mt-10 pt-8 border-t border-[#E5E5E5]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#999] mb-3">Share this article</p>
          <div className="flex items-center gap-3">
            {['Facebook', 'X', 'Pinterest', 'Email'].map(platform => (
              <button key={platform} className="px-4 py-2 border border-[#E5E5E5] text-xs font-medium text-[#666] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors">
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-[#F5F5F5] py-16">
          <div className="max-w-[800px] mx-auto px-6">
            <h2 className="font-playfair text-2xl font-normal tracking-widest uppercase mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map(rp => (
                <article key={rp.id} className="group">
                  <Link to={`/blog/${rp.slug}`} className="block overflow-hidden mb-4">
                    <img src={rp.image} alt={rp.title} className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <Link to={`/blog/${rp.slug}`}>
                    <h3 className="text-lg font-semibold text-[#1A1A1A] group-hover:underline leading-snug">{rp.title}</h3>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
