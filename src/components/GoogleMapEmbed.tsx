interface GoogleMapEmbedProps {
  city: string;
  state: string;
  className?: string;
}

export default function GoogleMapEmbed({ city, state, className = '' }: GoogleMapEmbedProps) {
  const query = encodeURIComponent(`${city}, ${state}`);

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <iframe
        src={`https://maps.google.com/maps?q=${query}&t=&z=11&ie=UTF8&iwloc=&output=embed`}
        width="100%"
        height="250"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Pink Auto Glass service area in ${city}, ${state}`}
      />
    </div>
  );
}
