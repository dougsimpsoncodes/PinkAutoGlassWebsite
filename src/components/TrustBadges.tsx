import { Shield, Lock, Star, Award } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'horizontal' | 'grid';
  size?: 'sm' | 'md' | 'lg';
}

export default function TrustBadges({
  variant = 'horizontal',
  size = 'md'
}: TrustBadgesProps) {
  const badges = [
    {
      icon: Lock,
      title: 'SSL Secure',
      description: 'Your data is encrypted and protected',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Shield,
      title: 'Lifetime Warranty',
      description: 'All installations backed by lifetime warranty',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Award,
      title: 'Licensed & Insured',
      description: 'Fully licensed and insured professionals',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Star,
      title: '200+ 5-Star Reviews',
      description: 'Trusted by thousands of Colorado drivers',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const titleSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
  const descSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className={`${badge.bgColor} rounded-lg p-4 text-center transition-transform hover:scale-105`}
            >
              <div className="flex justify-center mb-3">
                <Icon className={`${iconSize} ${badge.color}`} />
              </div>
              <h3 className={`font-bold ${titleSize} mb-1 ${badge.color}`}>
                {badge.title}
              </h3>
              <p className={`${descSize} text-gray-600`}>
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-6 items-center">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div key={index} className="flex items-center gap-2">
            <div className={`${badge.bgColor} rounded-full p-2`}>
              <Icon className={`${iconSize} ${badge.color}`} />
            </div>
            <div>
              <div className={`font-bold ${titleSize} ${badge.color}`}>
                {badge.title}
              </div>
              {size === 'lg' && (
                <div className={`${descSize} text-gray-600`}>
                  {badge.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
