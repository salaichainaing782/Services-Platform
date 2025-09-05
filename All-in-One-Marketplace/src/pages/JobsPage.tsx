import React, { useEffect, useState } from 'react';
import { Briefcase, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const JobsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await apiClient.getProductsByCategory('jobs', { page: 1, limit: 12 });
        setItems(res.products as any[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredItems = items.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 text-gray-800 font-sans">
      {/* Header with Search */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl font-extrabold flex items-center justify-center lg:justify-start gap-2 text-orange-600">
              <Briefcase className="h-9 w-9 animate-bounce" />
              Jobs & Careers
            </h1>
            <p className="text-gray-600 mt-2">
              Find your dream role — full-time, part-time & remote opportunities.
            </p>
          </motion.div>

          {/* Search Input inside header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full lg:w-1/3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-full border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-8 text-center shadow"
          >
            {error}
          </motion.div>
        )}

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow animate-pulse"
              >
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredItems.map((p: any) => (
              <motion.div
                key={p._id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <ProductCard
                  id={p._id}
                  title={p.title}
                  price={p.salary || p.price}
                  location={p.location}
                  rating={p.rating}
                  image={p.image}
                  category={p.category}
                  featured={p.featured}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="bg-gradient-to-r from-orange-500 to-red-500 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Ready to Land Your Next Job?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-white/90 mb-8 max-w-2xl mx-auto"
          >
            Browse opportunities and start your career journey today.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 text-lg font-semibold rounded-2xl bg-white text-orange-600 shadow hover:shadow-lg transition"
          >
            Browse Jobs
          </motion.button>
        </div>
      </footer>
    </div>
  );
};

export default JobsPage;
