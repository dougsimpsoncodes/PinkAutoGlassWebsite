import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllBlogPosts, getBlogPostBySlug, getRelatedPosts, BlogContent } from '@/data/blog';
import Breadcrumbs from '@/components/Breadcrumbs';
import CTAButtons from '@/components/CTAButtons';
import { getArticleSchema, combineSchemas } from '@/lib/schema';
import { getBreadcrumbSchema } from '@/lib/schema';

interface BlogArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${post.title} | Pink Auto Glass Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishDate,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

function renderContent(content: BlogContent, index: number) {
  switch (content.type) {
    case 'heading':
      const HeadingTag = `h${content.level || 2}` as keyof JSX.IntrinsicElements;
      const headingClasses = content.level === 3
        ? 'text-2xl font-bold text-gray-900 mb-4 mt-8'
        : 'text-3xl font-bold text-gray-900 mb-6 mt-12';

      return (
        <HeadingTag key={index} className={headingClasses}>
          {content.content as string}
        </HeadingTag>
      );

    case 'paragraph':
      return (
        <p key={index} className="text-lg text-gray-700 mb-6 leading-relaxed">
          {content.content as string}
        </p>
      );

    case 'list':
      return (
        <ul key={index} className="list-disc list-inside space-y-3 mb-6 text-gray-700">
          {(content.content as string[]).map((item, i) => (
            <li key={i} className="text-lg leading-relaxed ml-4">
              {item}
            </li>
          ))}
        </ul>
      );

    case 'faq':
      return (
        <div key={index} className="space-y-4 mb-8">
          {(content.content as any[]).map((faq, i) => (
            <details key={i} className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 text-lg">
                <span>{faq.question}</span>
                <ChevronDown className="w-5 h-5 text-pink-600 group-open:hidden" />
                <ChevronUp className="w-5 h-5 text-pink-600 hidden group-open:block" />
              </summary>
              <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      );

    case 'cta':
      return (
        <div key={index} className="my-8 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 rounded-xl p-8 text-center">
          <p className="text-xl font-semibold text-gray-900 mb-6">
            {content.content as string}
          </p>
          <CTAButtons source={`blog-article-inline-${index}`} />
        </div>
      );

    default:
      return null;
  }
}

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, 2);

  const breadcrumbItems = [
    { label: 'Blog', href: '/blog' },
    { label: post.title, href: `/blog/${post.slug}` }
  ];

  const articleSchema = getArticleSchema({
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishDate,
    author: post.author,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Blog', url: 'https://pinkautoglass.com/blog' },
    { name: post.title, url: `https://pinkautoglass.com/blog/${post.slug}` }
  ]);

  const combinedSchema = combineSchemas(articleSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Article Header */}
        <article>
          <header className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                {/* Category Badge */}
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <span className="text-sm font-semibold">{post.category}</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {post.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-6 text-pink-100">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <div className="container mx-auto px-4 py-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Article Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Excerpt */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed font-medium">
                {post.excerpt}
              </p>

              {/* Main Content */}
              <div className="prose prose-lg max-w-none">
                {post.content.map((content, index) => renderContent(content, index))}
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Links Section */}
          {(post.relatedServices || post.relatedVehicles || post.relatedLocations) && (
            <section className="container mx-auto px-4 py-12">
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Related Services */}
                  {post.relatedServices && post.relatedServices.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-pink-600 mb-4">Our Services</h3>
                      <ul className="space-y-2">
                        {post.relatedServices.map((service) => (
                          <li key={service}>
                            <Link
                              href={`/services/${service}`}
                              className="text-gray-700 hover:text-pink-600 transition-colors"
                            >
                              {service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Vehicles */}
                  {post.relatedVehicles && post.relatedVehicles.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-pink-600 mb-4">Popular Vehicles</h3>
                      <ul className="space-y-2">
                        {post.relatedVehicles.map((vehicle) => (
                          <li key={vehicle}>
                            <Link
                              href={`/vehicles/${vehicle}`}
                              className="text-gray-700 hover:text-pink-600 transition-colors"
                            >
                              {vehicle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Locations */}
                  {post.relatedLocations && post.relatedLocations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-pink-600 mb-4">Service Areas</h3>
                      <ul className="space-y-2">
                        {post.relatedLocations.map((location) => (
                          <li key={location}>
                            <Link
                              href={`/locations/${location}`}
                              className="text-gray-700 hover:text-pink-600 transition-colors"
                            >
                              {location.split('-').slice(0, -1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="container mx-auto px-4 py-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.slug}
                      href={`/blog/${relatedPost.slug}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 group"
                    >
                      <div className="text-sm text-pink-600 font-semibold mb-2">
                        {relatedPost.category}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {relatedPost.readTime} min
                        </span>
                        <span>{new Date(relatedPost.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Get Your Auto Glass Fixed?
              </h2>
              <p className="text-xl text-pink-100 mb-8">
                Expert service, lifetime warranty, and most insurance claims covered at professional service out of pocket.
              </p>
              <CTAButtons source={`blog-${post.slug}-bottom`} />
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
