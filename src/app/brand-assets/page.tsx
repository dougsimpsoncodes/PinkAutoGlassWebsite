import { Metadata } from 'next';
import Image from 'next/image';

// Hidden page for Google Ads to scan for logos and marketing images
// Not linked anywhere on the site, not in sitemap
// Accessible at: /brand-assets

export const metadata: Metadata = {
  title: 'Brand Assets - Pink Auto Glass',
  description: 'Brand assets and logos for Pink Auto Glass marketing',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BrandAssetsPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Pink Auto Glass - Brand Assets
        </h1>
        <p className="text-gray-600 mb-12">
          Official brand assets and logos for Pink Auto Glass marketing campaigns.
        </p>

        {/* Square Logos */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Square Logos (1:1 ratio)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Primary Logo - 400x375 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <Image
                src="/pink-logo.png"
                alt="Pink Auto Glass Logo"
                width={400}
                height={375}
                className="w-full h-auto"
              />
              <p className="text-sm text-gray-600 mt-2">Primary Logo (400x375)</p>
            </div>

            {/* Original Logo - 1024x1024 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <Image
                src="/pink-logo-original.png"
                alt="Pink Auto Glass Logo Original"
                width={1024}
                height={1024}
                className="w-full h-auto"
              />
              <p className="text-sm text-gray-600 mt-2">Original Logo (1024x1024)</p>
            </div>

            {/* Horizontal Original - 1024x1024 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <Image
                src="/pink-logo-horizontal-original.png"
                alt="Pink Auto Glass Horizontal Logo Original"
                width={1024}
                height={1024}
                className="w-full h-auto"
              />
              <p className="text-sm text-gray-600 mt-2">Horizontal Layout (1024x1024)</p>
            </div>

          </div>
        </section>

        {/* Horizontal/Landscape Logos */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Horizontal/Landscape Logos (4:1 ratio)</h2>
          <div className="grid grid-cols-1 gap-8">

            {/* Horizontal Logo - 1200x300 (4:1 ratio - Perfect for Google Ads) */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <Image
                src="/pink-logo-horizontal-1200x300.png"
                alt="Pink Auto Glass Horizontal Logo 1200x300"
                width={1200}
                height={300}
                className="w-full h-auto"
              />
              <p className="text-sm text-gray-600 mt-2">
                Horizontal Logo (1200x300) - 4:1 ratio - Optimized for Google Ads Performance Max
              </p>
            </div>

          </div>
        </section>

        {/* Breast Cancer Awareness Logos */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Seasonal Logos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="bg-gray-50 p-6 rounded-lg">
              <Image
                src="/breast-cancer-awareness-logo.png"
                alt="Pink Auto Glass Breast Cancer Awareness Logo"
                width={400}
                height={400}
                className="w-full h-auto"
              />
              <p className="text-sm text-gray-600 mt-2">Breast Cancer Awareness Logo</p>
            </div>

          </div>
        </section>

        {/* Usage Instructions */}
        <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Ads Asset Requirements</h2>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Square Logo (1:1):</strong> Minimum 128x128px, Recommended 1200x1200px</li>
            <li><strong>Landscape Logo (4:1):</strong> Minimum 512x128px, Recommended 1200x300px</li>
            <li><strong>File Format:</strong> JPG or PNG</li>
            <li><strong>Max File Size:</strong> 5MB</li>
            <li><strong>Performance Max:</strong> Can add up to 5 logos per asset group</li>
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            This page URL for Google Ads scanning: https://pinkautoglass.com/brand-assets
          </p>
        </section>

      </div>
    </div>
  );
}
