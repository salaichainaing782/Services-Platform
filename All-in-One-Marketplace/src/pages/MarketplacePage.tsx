import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // useNavigate အစား Link ကိုသုံးပါမည်
import { Search, Grid, List, Filter, X, Bot, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient, Product, Category } from '../services/api';
import { ProductCard } from '../components/ProductCard';

// --- UI Components (Self-contained) ---




// 2. Button Component
const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled = false, onClick }: { 
    children: React.ReactNode; 
    variant?: 'primary' | 'secondary' | 'outline'; 
    size?: 'sm' | 'md' | 'lg'; 
    className?: string; 
    disabled?: boolean;
    onClick?: () => void;
}) => {
  const baseClasses = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 inline-flex items-center justify-center";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg hover:shadow-indigo-300/50",
    secondary: "bg-white text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
    outline: "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 focus:ring-indigo-500",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-4 text-lg",
  };
  const disabledClasses = "opacity-50 cursor-not-allowed";
  return <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? disabledClasses : ''}`} disabled={disabled} onClick={onClick}>{children}</button>;
};

// 3. Card Component
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

// 4. AI Modal Component
const AIModal = ({ isOpen, onClose, title, content, isLoading }: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    content: string; 
    isLoading: boolean; 
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative transform transition-all duration-300 scale-95 animate-modal-pop">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-6 w-6" />
                </button>
                <div className="flex items-start space-x-4">
                      <div className="bg-indigo-100 p-3 rounded-full flex-shrink-0">
                          <Bot className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                          <div className="mt-4 text-gray-600 prose prose-sm max-w-none">
                              {isLoading ? (
                                  <div className="space-y-3">
                                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                  </div>
                              ) : (
                                  <p className="whitespace-pre-wrap">{content}</p>
                              )}
                          </div>
                      </div>
                </div>
            </div>
        </div>
    );
};

// 5. AnimatedText Component
const AnimatedText = ({ text, className = '' }: { text: string; className?: string }) => {
    return (
        <h1 className={className}>
            {text.split('').map((char: string, index: number) => (
                <span
                    key={index}
                    className="animate-text-reveal inline-block"
                    style={{ animationDelay: `${index * 35}ms` }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </h1>
    );
};


// --- Main Marketplace Page Component ---
const MarketplacePage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [priceRangeLimits, setPriceRangeLimits] = useState({ minPrice: 0, maxPrice: 0 });
  
  // State for Gemini AI Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);



  // Fetch categories and price range for filter
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const categoriesData = await apiClient.getCategories();
            setCategories(categoriesData);
        } catch (e) {
            console.error("Failed to fetch categories:", e);
        }
    };
    const fetchPriceRange = async () => {
        try {
            const priceData = await apiClient.getPriceRange('marketplace');
            setPriceRangeLimits(priceData);
        } catch (e) {
            console.error("Failed to fetch price range:", e);
        }
    };
    fetchCategories();
    fetchPriceRange();
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      if(page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params: any = { page, limit: 12 };
        if (searchQuery.trim()) { params.search = searchQuery.trim(); }
        if (selectedCategories.length > 0) { params.category = selectedCategories.join(','); }
        if (priceRange.min) { params.minPrice = parseFloat(priceRange.min); }
        if (priceRange.max) { params.maxPrice = parseFloat(priceRange.max); }
        if (sortBy !== 'default') {
          const [field, order] = sortBy.split('-');
          params.sortBy = field;
          params.sortOrder = order;
        }

        const response = await apiClient.getProducts(params);
        setItems(prev => page === 1 ? response.products : [...prev, ...response.products]);
        
        if (response.products.length === 0 || page >= response.pagination.totalPages) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }
      } catch (e: any) {
        setError(e.message || t('common.loading'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    loadItems();
  }, [page, searchQuery, selectedCategories, priceRange, sortBy]);
  
  // --- Gemini API Call Logic ---
  const handleAskAI = async (product: Product) => {
      setIsModalOpen(true);
      setIsModalLoading(true);
      setModalTitle(`✨ AI Description for ${product.title}`);
      setModalContent('');

      const prompt = `Write a short, catchy, and persuasive product description for a product named "${product.title}" in the "${product.category}" category. The price is $${product.price}. Highlight its key benefits for a potential buyer. Keep it under 100 words and format it as a single paragraph.`;

      try {
          const apiKey = "";
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
          const payload = { contents: [{ parts: [{ text: prompt }] }] };
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);
          const result = await response.json();
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
              setModalContent(text);
          } else {
              throw new Error("No content received from AI.");
          }
      } catch (error) {
          console.error("Error fetching AI description:", error);
          setModalContent("Sorry, I couldn't generate a description at the moment. Please try again later.");
      } finally {
          setIsModalLoading(false);
      }
  };

  const loadMoreItems = () => {
    if (!loadingMore && hasMore) {
        setPage(prev => prev + 1);
    }
  };

  const resetPagination = () => {
    setPage(1);
    setHasMore(true);
  };



  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
    resetPagination();
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
    resetPagination();
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    resetPagination();
  };

  const sortOptions = [
    { value: 'default', label: t('marketplace.sortBy') },
    { value: 'price-asc', label: t('marketplace.priceAsc') },
    { value: 'price-desc', label: t('marketplace.priceDesc') },
    { value: 'rating-desc', label: t('marketplace.rating') }
  ];

  return (
    <>
    <style>{`
        /* All CSS styles from the previous version are kept here, they are not changed */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .product-title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .custom-checkbox:checked { background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e"); }
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes modal-pop { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-modal-pop { animation: modal-pop 0.3s ease-out forwards; }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; opacity: 0; }
        @keyframes text-reveal { 0% { opacity: 0; transform: translateY(10px) skewY(5deg); } 100% { opacity: 1; transform: translateY(0) skewY(0); } }
        .animate-text-reveal { animation: text-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
    `}</style>
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Header */}
      <header className="py-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23d9e2ff%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <AnimatedText text={t('marketplace.title')} className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight"/>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '600ms', opacity: 0 }}>
            {t('marketplace.subtitle')}
          </p>
          <div className="mt-8 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '800ms', opacity: 0 }}>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder={t('common.search')} value={searchQuery} onChange={(e) => {
                setSearchQuery(e.target.value);
                resetPagination();
              }} className="w-full pl-14 pr-4 py-4 rounded-full border-2 border-transparent bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
                <Card className="p-6 sticky top-8">
                    <h3 className="font-bold text-xl mb-6 flex items-center"><Filter className="mr-2 h-5 w-5 text-indigo-500"/>{t('common.filter')}</h3>
                       <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-3 text-gray-800">{t('marketplace.priceRange')}</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input type="number" placeholder="$ Min" value={priceRange.min} onChange={(e) => handlePriceRangeChange('min', e.target.value)} className="w-full p-2 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                                        <span className="text-gray-500">-</span>
                                        <input type="number" placeholder="$ Max" value={priceRange.max} onChange={(e) => handlePriceRangeChange('max', e.target.value)} className="w-full p-2 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                                    </div>
                                    {priceRangeLimits.maxPrice > 0 && (
                                        <p className="text-xs text-gray-500">
                                            Range: ${priceRangeLimits.minPrice} - ${priceRangeLimits.maxPrice}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="border-t pt-6">
                                <h4 className="font-semibold mb-3 text-gray-800">{t('marketplace.allCategories')}</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center space-x-3 cursor-pointer p-1 rounded-md hover:bg-indigo-50">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedCategories.includes(cat.id)} 
                                                onChange={(e) => handleCategoryChange(cat.id, e.target.checked)} 
                                                className="custom-checkbox h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition duration-150 ease-in-out"
                                            />
                                            <span className="text-gray-700 capitalize">{cat.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                       </div>
                </Card>
            </aside>
            
            {/* Products Grid */}
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm">
                    <p className="text-gray-600">{t('common.viewAll')} <span className="font-bold text-gray-800">{items.length}</span> {t('products.title')}</p>
                    <div className="flex items-center gap-4">
                         <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                           {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                         </select>
                         <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <button onClick={()=>setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-600'}`}><Grid className="h-5 w-5"/></button>
                            <button onClick={()=>setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-600'}`}><List className="h-5 w-5"/></button>
                         </div>
                    </div>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">{error}</div>}

                {loading ? (
                       <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                             {Array.from({length:8}).map((_,i) => (
                                 <div key={i} className="bg-white rounded-2xl shadow-lg animate-pulse">
                                     <div className="h-48 bg-gray-200"></div>
                                     <div className="p-4 space-y-3">
                                         <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                                         <div className="h-4 w-full bg-gray-200 rounded"></div>
                                         <div className="h-7 w-1/2 bg-gray-200 rounded"></div>
                                     </div>
                                 </div>
                             ))}
                       </div>
                ) : (
                       <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                            {items.map((item) => (
                                <ProductCard 
                                    key={item._id || item.id} 
                                    id={item._id || item.id}
                                    title={item.title}
                                    price={`$${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)}`}
                                    location={item.location}
                                    rating={item.rating}
                                    image={item.image}
                                    images={item.images || (item.image ? [item.image] : [])}
                                    category={item.category}
                                    featured={item.featured}
                                    views={item.views}
                                    favorites={item.favorites}
                                />
                            ))}
                       </div>
                )}
                
                <div className="text-center mt-12">
                    {hasMore ? (
                        <button 
                            onClick={loadMoreItems} 
                            disabled={loadingMore}
                            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="relative flex items-center">
                                {loadingMore ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('common.loading')}
                                    </>
                                ) : (
                                    <>
                                        {t('common.viewAll')}
                                        <svg className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </button>
                    ) : (
                        !error && items.length > 0 && (
                            <div className="flex flex-col items-center space-y-3">
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 font-medium">{t('common.noData')}</p>
                                <p className="text-sm text-gray-500">{t('common.continueShopping')}</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
      </main>
      
      <AIModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalTitle} 
        content={modalContent}
        isLoading={isModalLoading}
      />
    </div>
    </>
  );
};

export default MarketplacePage;
