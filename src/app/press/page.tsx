import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Calendar, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Press Releases | Pink Auto Glass",
  description: "News and press releases from Pink Auto Glass — mobile windshield repair and replacement serving Denver metro and Phoenix metro.",
  alternates: {
    canonical: "https://pinkautoglass.com/press",
  },
};

const pressReleases = [
  {
    title: "Colorado's Worst Snowpack on Record Means a Dangerous Spring for Denver Drivers",
    publication: "PRLog",
    date: "February 24, 2026",
    url: "https://www.prlog.org/13129267-colorados-worst-snowpack-on-record-means-dangerous-spring-for-denver-drivers.html",
    summary: "Pink Auto Glass warns Denver drivers: record road gravel treatment this winter plus an early hail season forecast means windshield damage peaks this spring.",
    market: "Denver",
    blogPost: "/blog/denver-windshield-hail-season-guide",
  },
  {
    title: "2025 Phoenix Auto Glass Market Report: Arizona's Zero-Deductible Windshield Law and Top-Rated Mobile Providers Across Maricopa County",
    publication: "OpenPR",
    date: "February 24, 2026",
    url: null, // pending approval
    summary: "Arizona law (ARS 20-264) requires insurers to replace windshields at zero deductible for all comprehensive policyholders. Pink Auto Glass covers the three statutes protecting Arizona drivers and offers same-day mobile service across all 20 Phoenix metro cities.",
    market: "Phoenix",
    blogPost: "/blog/arizona-windshield-replacement-law",
  },
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-pink-600 to-rose-700 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Press Releases</h1>
            <p className="text-xl text-pink-100">
              News and announcements from Pink Auto Glass
            </p>
          </div>
        </div>
      </section>

      {/* Press Releases List */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {release.market}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                    {release.publication}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {release.date}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                  {release.title}
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {release.summary}
                </p>

                <div className="flex flex-wrap gap-4">
                  {release.url ? (
                    <a
                      href={release.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Read Full Release
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 font-semibold py-2 px-5 rounded-lg text-sm">
                      Pending Publication
                    </span>
                  )}
                  <Link
                    href={release.blogPost}
                    className="inline-flex items-center gap-2 border-2 border-pink-600 text-pink-600 hover:bg-pink-50 font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Read Full Guide
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Contact</h2>
            <p className="text-gray-600 mb-2">Dan Shikiar — Pink Auto Glass</p>
            <p className="text-gray-600 mb-1">Denver: (720) 918-7465</p>
            <p className="text-gray-600">Phoenix: (480) 712-7465</p>
          </div>
        </div>
      </section>
    </main>
  );
}
