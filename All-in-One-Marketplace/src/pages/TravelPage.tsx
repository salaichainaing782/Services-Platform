import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { apiClient } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const TravelPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await apiClient.getProductsByCategory('travel', { page: 1, limit: 12 });
        setItems(res.products as any[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load trips');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Compass className="h-7 w-7 text-indigo-500 mr-2" />
              Travel & Adventures
            </h1>
            <p className="text-gray-500 text-sm">
              Curated journeys, flights, hotels, and adventures worldwide
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Intro */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Explore the World
          </h2>
          <p className="text-base text-gray-600">
            Discover unique destinations and unforgettable travel packages tailored for you.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-8 text-center shadow-sm text-sm">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-32 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((p: any) => (
              <ProductCard
                key={p._id}
                id={p._id}
                title={p.title}
                price={p.price}
                location={p.location || 'Worldwide'}
                rating={p.rating}
                image={p.image}
                category={p.category}
                featured={p.featured}
                className="!rounded-lg !shadow-md !p-3"
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="bg-gradient-to-r from-indigo-600 to-blue-600 mt-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready for Your Next Journey?
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-xl mx-auto">
            Book unforgettable experiences and start exploring the world today.
          </p>
          <button className="px-6 py-3 text-base font-semibold rounded-xl bg-white text-indigo-600 shadow hover:shadow-lg transition">
            Start Booking
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TravelPage;
