import React, { useEffect, useState } from 'react';
// Login Modal အတွက်လိုအပ်သော icon များကို ထပ်ထည့်ပါ
import { Search, Grid, List, Recycle, Leaf, Award, Star, MapPin, Heart, Lock, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// --- UI Components (Self-contained) ---

// 1. ProductCard Component
const ProductCard = ({ id, title, price, location, rating, image, className = '', isAuthenticated, onLoginRequired }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    
    // Check if product is in user's favorites on mount
    useEffect(() => {
        if (isAuthenticated) {
            const checkFavorite = async () => {
                try {
                    const userFavorites = await apiClient.getUserFavorites({ limit: 1000 });
                    const isInFavorites = userFavorites.products.some(fav => fav.id === id || fav._id === id);
                    setIsFavorite(isInFavorites);
                } catch (error) {
                    console.error('Failed to check favorites:', error);
                }
            };
            checkFavorite();
        }
    }, [id, isAuthenticated]);
    
    const handleClick = () => {
        window.location.href = `/products/${id}`;
    };
    
    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            onLoginRequired();
            return;
        }
        
        if (isToggling) return;
        
        try {
            setIsToggling(true);
            const response = await apiClient.toggleFavorite(id);
            setIsFavorite(response.isFavorite);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsToggling(false);
        }
    };
    
    return (
        <div onClick={handleClick} className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer ${className}`}>
            <div className="relative">
                <img src={image} alt={title} className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found'; }}/>
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">USED</div>
                <button 
                    onClick={handleFavoriteClick}
                    disabled={isToggling}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white hover:scale-110 transition-all duration-200"
                >
                    <Heart className={`h-4 w-4 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'}`} />
                </button>
            </div>
            <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 truncate" title={title}>{title}</h3>
                <p className="text-lg font-bold text-green-600 mt-1">${typeof price === 'number' ? price.toFixed(2) : parseFloat(price || '0').toFixed(2)}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-400" fill="currentColor" />
                        <span>{rating || '0.0'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. SearchFilters Component (Unchanged)
const SearchFilters = ({ category }) => (
 <div>
    <h4 className="font-medium mb-3">Price Range</h4>
    <div className="flex items-center space-x-2">
        <input type="number" placeholder="$ Min" className="w-full p-2 text-sm border rounded-md focus:ring-green-500 focus:border-green-500" />
        <span className="text-gray-500">-</span>
        <input type="number" placeholder="$ Max" className="w-full p-2 text-sm border rounded-md focus:ring-green-500 focus:border-green-500" />
    </div>
 </div>
);

// 3. Button Component
const Button = ({ children, variant = 'primary', size = 'md', className = '', onClick }) => {
 const baseClasses = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300";
 const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    secondary: "bg-white text-green-600 hover:bg-gray-100 focus:ring-green-500",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-green-500",
 };
 const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
 };
 return <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick}>{children}</button>;
};

// 4. Card Component (Unchanged)
const Card = ({ children, className = '' }) => (
 <div className={`bg-white rounded-xl shadow-sm ${className}`}>
    {children}
 </div>
);

// 5. *** UI ပိုလှအောင် ပြန်လည်ပြင်ဆင်ထားသော Login Modal Component အသစ် ***
const LoginRequiredModal = ({ isOpen, onClose, onGoToLogin }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden relative border-t-4 border-green-500"
                style={{ animation: 'scaleIn 0.3s ease-out' }}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
                    <X className="h-6 w-6" />
                </button>
                <div className="p-8 text-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5">
                        <Lock className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Login Required</h2>
                    <p className="mt-2 text-gray-500 leading-relaxed">
                        Please log in to your account to use this feature.
                    </p>
                    <div className="mt-8 grid grid-cols-1 gap-4">
                        <Link to="/login" className="w-full">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                className="w-full flex items-center justify-center" 
                            >
                                <LogIn className="h-5 w-5 mr-2" />
                                Go to Login
                            </Button>
                        </Link>
                        <Button variant="outline" size="md" className="w-full" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};


// --- Main Page Component ---
export const App = () => {
    const { t } = useTranslation();
    // --- Authentication ---
    const { isAuthenticated } = useAuth();
 
    // --- 1. State များကို သတ်မှတ်ခြင်း ---
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // --- UI အတွက် state တွေ ---
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');

    // --- 2. Backend မှ real data ကို fetch လုပ်ရန် useEffect ကို အသုံးပြုခြင်း ---
    useEffect(() => {
        const loadItems = async () => {
            try {
                setError('');
                setLoading(true);
                
                const response = await apiClient.getProductsByCategory('secondhand', { 
                    page, 
                    limit: 12 
                });
                
                setItems(prevItems => page === 1 ? response.products : [...prevItems, ...response.products]);
                
                if (response.products.length === 0 || page >= response.pagination.totalPages) {
                    setHasMore(false);
                }

            } catch (e) {
                setError(e?.message || 'Failed to load secondhand products');
            } finally {
                setLoading(false);
            }
        };
        loadItems();
    }, [page]);

    const loadMoreItems = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    }



    // Static data for UI
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' }
    ];

    const sustainabilityStats = [
        { label: 'CO₂ Saved', value: '2.3M kg', icon: Leaf },
        { label: 'Items Reused', value: '150K+', icon: Recycle },
        { label: 'Verified Sellers', value: '25K+', icon: Award }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <Recycle className="h-8 w-8 text-green-500 mr-3" />
                                {t('secondhand.title')}
                            </h1>
                            <p className="text-gray-500">{t('secondhand.subtitle')}</p>
                        </div>
                        <div className="flex-1 max-w-2xl">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('common.search')}
                                    className="pl-10 pr-4 py-3 w-full rounded-full border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sustainability Banner */}
            <section className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {sustainabilityStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="flex-shrink-0 p-3 rounded-full bg-green-100">
                                        <Icon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-800">{stat.value}</div>
                                        <div className="text-sm text-green-600">{stat.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-72 flex-shrink-0">
                        <Card className="p-6 sticky top-24">
                            <h3 className="font-semibold mb-4 flex items-center text-lg">
                                <Grid className="h-5 w-5 mr-2 text-green-500" />
                                {t('common.filter')}
                            </h3>
                            <div className="space-y-6">
                                <SearchFilters category="secondhand" />
                                <div className="pt-6 border-t">
                                    <h4 className="font-medium mb-3">Condition</h4>
                                    <div className="space-y-2">
                                        {['Like New', 'Excellent', 'Good', 'Fair'].map((condition) => (
                                            <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                                <span className="text-sm text-gray-600">{condition}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-6 border-t">
                                    <h4 className="font-medium mb-3">Seller Type</h4>
                                    <div className="space-y-2">
                                        {['Verified Seller', 'Individual', 'Store'].map((type) => (
                                            <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                                <span className="text-sm text-gray-600">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-bold text-green-600">{items.length}</span> second-hand items
                            </div>
                            <div className="flex items-center gap-4">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                    {sortOptions.map((option) => ( <option key={option.value} value={option.value}>{option.label}</option>))}
                                </select>
                                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                    <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-100'}`} ><Grid className="h-5 w-5" /></button>
                                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-100'}`} ><List className="h-5 w-5" /></button>
                                </div>
                            </div>
                        </div>
                        
                        {error && (<div className="bg-red-50 text-red-700 p-4 rounded-md mb-8 text-center">{error}</div>)}

                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                            {items.map((item) => (
                                <ProductCard 
                                    key={item._id || item.id} 
                                    id={item._id || item.id} 
                                    title={item.title} 
                                    price={item.price} 
                                    location={item.location} 
                                    rating={item.rating} 
                                    image={item.image}
                                    isAuthenticated={isAuthenticated}
                                    onLoginRequired={() => setShowLoginModal(true)}
                                />
                            ))}
                        </div>

                        {loading && (
                            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-lg shadow">
                                        <div className="h-40 bg-gray-200 animate-pulse"></div>
                                        <div className="p-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                                            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Load More Button */}
                        <div className="text-center mt-12">
                            {hasMore ? (
                                <button 
                                    onClick={loadMoreItems} 
                                    disabled={loading}
                                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg hover:shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-600 to-emerald-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    <span className="relative flex items-center">
                                        {loading ? 'Loading...' : 'Load More Items'}
                                    </span>
                                </button>
                            ) : (
                                items.length > 0 && (
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 font-medium">You've seen all items!</p>
                                        <p className="text-sm text-gray-500">Check back later for new listings</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* *** Modal component အသစ်ကို ဤနေရာတွင် ခေါ်သုံးပါ *** */}
            <LoginRequiredModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)}
            />

            <footer className="bg-gradient-to-r from-green-600 to-blue-600 mt-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Have Items to Sell?</h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Turn your unused items into cash while helping others find great deals. It's a win-win!</p>
                    <Button size="lg" variant="secondary" className="text-lg px-8 py-4">Start Selling Today</Button>
                </div>
            </footer>
        </div>
    );
};

export default App;