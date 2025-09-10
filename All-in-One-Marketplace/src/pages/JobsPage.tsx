import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, X, ArrowRight, SearchIcon, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// --- Data Constants ---
// Data တွေကို component အပြင်ဘက်၊ file တစ်ခုတည်းမှာပဲ ထားလိုက်ပါတယ်
const JOB_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'remote', label: 'Remote' },
  { value: 'internship', label: 'Internship' }
];

const EXPERIENCE_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'executive', label: 'Executive' }
];


// --- Helper & Sub-Components ---

const JobCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
    <div className="flex gap-4">
      <div className="w-14 h-14 bg-slate-200 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-4 bg-slate-200 rounded w-full mt-4"></div>
    <div className="h-4 bg-slate-200 rounded w-5/6 mt-2 mb-4"></div>
    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
      <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
    </div>
  </div>
);

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-4 border-b border-slate-200">
    <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
    {children}
  </div>
);

const FilterSidebar: React.FC<any> = ({
  selectedJobType,
  setSelectedJobType,
  selectedExperience,
  setSelectedExperience,
  salaryRange,
  setSalaryRange,
  resetFilters
}) => {
  return (
    <aside className="w-full lg:w-1/4 xl:w-1/5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-500" />
          Filters
        </h2>
        <button onClick={resetFilters} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
          Reset All
        </button>
      </div>

      <FilterSection title="Job Type">
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedJobType(type.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedJobType === type.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Experience Level">
        <select
          value={selectedExperience}
          onChange={(e) => setSelectedExperience(e.target.value)}
          className="w-full rounded-lg border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Salary Range">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Up to ${salaryRange[1].toLocaleString()}
        </label>
        <input
          type="range"
          min="0"
          max="200000"
          step="10000"
          value={salaryRange[1]}
          onChange={(e) => setSalaryRange([0, parseInt(e.target.value)])}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>$0</span>
          <span>$200k+</span>
        </div>
      </FilterSection>
    </aside>
  );
};

const JobCard = ({ job }: { job: any }) => {
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(job.isLiked || false);
  const [likesCount, setLikesCount] = useState(job.likes?.length || job.likesCount || job.favorites || 0);

  const handleLikeJob = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login to like jobs');
      return;
    }
    try {
      const result = await apiClient.likeProduct(job._id || job.id);
      setIsLiked(result.isLiked);
      setLikesCount(result.likes);
    } catch (error) {
      console.error('Failed to like job:', error);
    }
  };

  const getTagColor = (type: string, category: 'jobType' | 'experience') => {
    const colors = {
      jobType: { 'full-time': 'bg-green-100 text-green-800', 'part-time': 'bg-blue-100 text-blue-800', 'contract': 'bg-purple-100 text-purple-800', 'remote': 'bg-teal-100 text-teal-800', 'internship': 'bg-amber-100 text-amber-800', default: 'bg-slate-100 text-slate-800' },
      experience: { 'entry': 'bg-sky-100 text-sky-800', 'mid': 'bg-fuchsia-100 text-fuchsia-800', 'senior': 'bg-orange-100 text-orange-800', 'executive': 'bg-red-100 text-red-800', default: 'bg-slate-100 text-slate-700' }
    };
    return colors[category][type as keyof typeof colors[typeof category]] || colors[category].default;
  };

  return (
<motion.div
  layout
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.25 }}
  whileHover={{ y: -3, scale: 1.01 }}
  className="bg-white rounded-xl border border-slate-200 shadow-sm 
             hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
>
  <a href={`/jobs/${job._id}`} className="block p-6">
    {/* Header: Avatar + Title */}
    <div className="flex gap-4">
      <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center font-semibold text-slate-600">
        {job.seller?.avatar ? (
          <img
            src={job.seller.avatar}
            alt={job.seller.firstName || job.seller.username}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span>{job.seller?.firstName?.charAt(0) || job.seller?.username?.charAt(0) || '?'}</span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
              {job.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {job.seller?.firstName || job.seller?.username || 'Unknown'} · {job.location || 'Remote'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 1.2 }}
            onClick={handleLikeJob}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </motion.button>
        </div>
      </div>
    </div>

    {/* Description */}
    <p className="text-slate-600 text-sm mt-4 line-clamp-2">
      {job.description || 'No description provided.'}
    </p>

    {/* Tags */}
    <div className="flex gap-2 mt-3">
      {job.jobType && (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {job.jobType}
        </span>
      )}
      {job.experience && (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {job.experience}
        </span>
      )}
    </div>

    {/* Footer */}
    <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100">
      <p className="text-lg font-semibold text-indigo-600">
        ${job.salary?.toLocaleString() || 'N/A'}
        <span className="text-sm text-slate-500 ml-1">
          {job.salaryType === 'annual' ? '/year' : job.salaryType === 'monthly' ? '/month' : ''}
        </span>
      </p>
      <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
        View Details →
      </button>
    </div>
  </a>
</motion.div>

  );
};


// --- Main Page Component ---

const JobsPage: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [salaryRange, setSalaryRange] = useState([0, 200000]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await apiClient.getProductsByCategory('jobs', { page: 1, limit: 50 });
        setItems(res.products as any[]);
      } catch (e: any) {
        setError(e?.message || t('common.loadingError'));
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, [t]);

  const filteredItems = useMemo(() => items.filter((job) => {
    const searchString = search.toLowerCase();
    const matchesSearch = searchString === '' ||
      job.title.toLowerCase().includes(searchString) ||
      job.description?.toLowerCase().includes(searchString) ||
      job.company?.toLowerCase().includes(searchString);
    const matchesJobType = selectedJobType === 'all' || job.jobType === selectedJobType;
    const matchesExperience = selectedExperience === 'all' || job.experience === selectedExperience;
    const jobSalary = job.salary || job.price || 0;
    const matchesSalary = jobSalary >= salaryRange[0] && jobSalary <= salaryRange[1];
    return matchesSearch && matchesJobType && matchesExperience && matchesSalary;
  }), [items, search, selectedJobType, selectedExperience, salaryRange]);

  const resetFilters = () => {
    setSearch('');
    setSelectedJobType('all');
    setSelectedExperience('all');
    setSalaryRange([0, 200000]);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            Find Your <span className="text-indigo-600">Next Opportunity</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Browse thousands of jobs from top companies and find your perfect fit.
          </motion.p>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <FilterSidebar
            selectedJobType={selectedJobType}
            setSelectedJobType={setSelectedJobType}
            selectedExperience={selectedExperience}
            setSelectedExperience={setSelectedExperience}
            salaryRange={salaryRange}
            setSalaryRange={setSalaryRange}
            resetFilters={resetFilters}
          />
          <div className="w-full">
            <div className="mb-6 sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, company, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-10 py-3 w-full rounded-xl border-2 border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-4">
                Showing <span className="font-bold text-slate-800">{filteredItems.length}</span> of <span className="font-bold text-slate-800">{items.length}</span> results
              </p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-red-600">{error}</h3>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((job) => <JobCard key={job._id} job={job} />)
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="md:col-span-2 text-center py-16 bg-white rounded-xl shadow-sm"
                    >
                      <div className="flex justify-center items-center w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full shadow-inner">
                        <SearchIcon className="w-10 h-10 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        No Matching Jobs Found
                      </h3>
                      <p className="text-slate-600 max-w-md mx-auto">
                        Your search and filter combination didn't return any results. Try adjusting your criteria.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobsPage;