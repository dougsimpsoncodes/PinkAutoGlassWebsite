'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Quote } from 'lucide-react';

export default function SocialProof() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);

  const testimonials = [
    {
      name: 'Sarah M.',
      location: 'Denver, CO',
      rating: 5,
      text: 'Same-day service, came to my office, and insurance covered everything. The technician was professional and fast. Highly recommend!',
      service: 'Windshield Replacement'
    },
    {
      name: 'Mike T.',
      location: 'Aurora, CO',
      rating: 5,
      text: 'Best auto glass experience ever. They handled all the insurance paperwork and the mobile service was so convenient. ADAS calibration included!',
      service: 'ADAS Calibration'
    },
    {
      name: 'Jennifer L.',
      location: 'Boulder, CO',
      rating: 5,
      text: 'Had a rock chip that turned into a crack. They came out the same day and fixed it perfectly. Zero cost with my insurance. Lifetime warranty too!',
      service: 'Windshield Repair'
    },
    {
      name: 'David R.',
      location: 'Highlands Ranch, CO',
      rating: 5,
      text: 'Professional service for my Tesla Model 3. They knew exactly what they were doing with the ADAS system. Perfect installation and calibration.',
      service: 'Tesla Windshield'
    }
  ];

  const recentActivity = [
    { name: 'Jessica', location: 'Denver', service: 'booked windshield replacement', time: '5 minutes ago' },
    { name: 'Robert', location: 'Aurora', service: 'requested a quote', time: '12 minutes ago' },
    { name: 'Amanda', location: 'Lakewood', service: 'booked ADAS calibration', time: '23 minutes ago' },
    { name: 'Michael', location: 'Boulder', service: 'booked windshield repair', time: '31 minutes ago' },
    { name: 'Lisa', location: 'Centennial', service: 'requested emergency service', time: '47 minutes ago' }
  ];

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    const activityInterval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % recentActivity.length);
    }, 3000);

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(activityInterval);
    };
  }, [testimonials.length, recentActivity.length]);

  return (
    <div className="space-y-6">
      {/* Real-Time Activity Notification */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-sm">
              <span className="text-blue-600">{recentActivity[currentActivity].name}</span> in{' '}
              <span className="text-blue-600">{recentActivity[currentActivity].location}</span>{' '}
              {recentActivity[currentActivity].service}
            </div>
            <div className="text-xs text-gray-600">{recentActivity[currentActivity].time}</div>
          </div>
        </div>
      </div>

      {/* Rotating Testimonials */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 min-h-[250px]">
        <div className="flex items-start gap-4">
          <Quote className="w-10 h-10 text-pink-300 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex gap-1 mb-3">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 text-lg mb-4 italic">
              "{testimonials[currentTestimonial].text}"
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{testimonials[currentTestimonial].name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {testimonials[currentTestimonial].location}
                </div>
              </div>
              <div className="text-sm text-pink-600 font-semibold">
                {testimonials[currentTestimonial].service}
              </div>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentTestimonial ? 'bg-pink-600 w-6' : 'bg-gray-300'
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-pink-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">4.9</div>
          <div className="flex justify-center gap-0.5 my-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <div className="text-xs text-gray-600">Google Rating</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">200+</div>
          <div className="text-xs text-gray-600 mt-2">5-Star Reviews</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">5,000+</div>
          <div className="text-xs text-gray-600 mt-2">Happy Customers</div>
        </div>
      </div>
    </div>
  );
}
