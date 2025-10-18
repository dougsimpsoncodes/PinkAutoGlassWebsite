import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, Tag } from 'lucide-react';
import { getAllBlogPosts } from '@/data/blog';
import Breadcrumbs from '@/components/Breadcrumbs';
import CTAButtons from '@/components/CTAButtons';

export const metadata: Metadata = {
  title: 'Auto Glass Blog | Expert Tips from Pink Auto Glass Denver',
  description: 'Expert advice on windshield repair, replacement, ADAS calibration, insurance claims, and auto glass care from Denver\'s trusted auto glass specialists.',
  alternates: {
    canonical: 'https://pinkautoglass.com/blog',
  },
  openGraph: {
    title: 'Auto Glass Blog | Expert Tips from Pink Auto Glass Denver',
    description: 'Expert advice on windshield repair, replacement, ADAS calibration, insurance claims, and auto glass care from Denver\'s trusted auto glass specialists.',
    type: 'website',
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  const breadcrumbItems = [
    { label: 'Blog', href: '/blog' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Auto Glass Expert Insights
            </h1>
            <p className="text-xl text-pink-100 mb-8">
              Tips, guides, and expert advice for keeping your auto glass in perfect condition
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.slug} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Category Badge */}
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3">
                  <div className="flex items-center justify-between text-white text-sm">
                    <span className="font-semibold">{post.category}</span>
                    <Clock className="w-4 h-4" />
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-pink-600 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-block text-pink-600 font-semibold hover:text-pink-700 transition-colors"
                  >
                    Read Full Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Need Auto Glass Service?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Get expert service with our lifetime warranty. Call, text, or book online today!
          </p>
          <CTAButtons source="blog-index-cta" />
        </div>
      </section>
    </main>
  );
}
