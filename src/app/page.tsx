import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Expert Auto Glass Services
            <span className="block text-pink-400">You Can Trust</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Professional windshield repair and replacement in Denver. 
            Mobile service available with lifetime warranty on all installations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-primary text-lg px-8 py-4">
              Get Free Quote
            </Link>
            <a href="tel:+13035557465" className="btn-secondary text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-gray-900">
              Call (303) 555-PINK
            </a>
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Get Your Free Quote</h2>
            <form className="bg-white p-8 rounded-lg shadow-lg" role="form" aria-label="Quote request form">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Year *
                  </label>
                  <select id="year" name="year" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="">Select Year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
                    Make *
                  </label>
                  <select id="make" name="make" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="">Select Make</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Ford">Ford</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Nissan">Nissan</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input 
                    type="text" 
                    id="model" 
                    name="model" 
                    required 
                    placeholder="Enter vehicle model"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Needed *
                  </label>
                  <select id="service" name="service" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="">Select Service</option>
                    <option value="windshield-repair">Windshield Repair</option>
                    <option value="windshield-replacement">Windshield Replacement</option>
                    <option value="side-window">Side Window</option>
                    <option value="rear-window">Rear Window</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    required 
                    placeholder="(303) 555-1234"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
              <button type="submit" className="w-full mt-6 btn-primary text-lg py-4">
                Get My Quote
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Windshield Replacement</h3>
              <p className="text-gray-600">Professional installation with OEM quality glass and lifetime warranty.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Windshield Repair</h3>
              <p className="text-gray-600">Fast chip and crack repair to prevent further damage and save you money.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mobile Service</h3>
              <p className="text-gray-600">We come to you! Convenient mobile service at your home or office.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Contact Pink Auto Glass</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <a href="tel:+13035557465" className="text-pink-400 hover:text-pink-300 transition-colors">
                (303) 555-PINK
              </a>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Service Area</h3>
              <p>Denver Metro Area</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Hours</h3>
              <p>Mon-Fri: 8AM-6PM<br />Sat: 9AM-4PM</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
