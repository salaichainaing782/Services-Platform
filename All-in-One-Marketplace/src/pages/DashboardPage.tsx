import React, { useState, useEffect, useRef } from 'react';
import { 
    User, Heart, Eye, Star, Plus, Edit, Trash2,
    Package, MapPin, Phone, Mail, Shield, LogOut, LayoutDashboard, Settings,
    Menu, X, AlertTriangle, CheckCircle, XCircle, Info, ShoppingCart, Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, Product } from '../services/api';
import '../i18n';

// --- Modal and Notification Components ---
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "default"
}) => {
  const variantStyles = {
    default: "bg-indigo-600 hover:bg-indigo-700",
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-amber-600 hover:bg-amber-700"
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="py-4">
        <p className="text-gray-700">{message}</p>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${variantStyles[variant]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

const Notification = ({ message, type = 'success', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const typeStyles = {
    success: {
      bg: 'bg-green-100 border-green-400',
      text: 'text-green-700',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />
    },
    error: {
      bg: 'bg-red-100 border-red-400',
      text: 'text-red-700',
      icon: <XCircle className="w-5 h-5 text-red-500" />
    },
    info: {
      bg: 'bg-blue-100 border-blue-400',
      text: 'text-blue-700',
      icon: <Info className="w-5 h-5 text-blue-500" />
    },
    warning: {
      bg: 'bg-amber-100 border-amber-400',
      text: 'text-amber-700',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
    }
  };
  
  const currentStyle = typeStyles[type];
  
  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className={`flex items-center p-4 rounded-lg border ${currentStyle.bg} ${currentStyle.text} shadow-lg max-w-sm`}>
        <div className="mr-3">
          {currentStyle.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
          duration={notification.duration}
        />
      ))}
    </>
  );
};

const useInView = (options: IntersectionObserverInit) => { 
    const ref = useRef<HTMLDivElement>(null); 
    const [isInView, setIsInView] = useState(false); 
    useEffect(() => { 
        const observer = new IntersectionObserver(([entry]) => { 
            if (entry.isIntersecting) { 
                setIsInView(true); 
                observer.unobserve(entry.target); 
            } 
        }, options); 
        if (ref.current) { 
            observer.observe(ref.current); 
        } 
        return () => { 
            if (ref.current) { 
                observer.unobserve(ref.current); 
            } 
        }; 
    }, [ref, options]); 
    return [ref, isInView] as const; 
};

// --- Sub-components ---
const StatCard = ({ title, value, icon, color, delay }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    delay: number; 
}) => { 
    const Icon = icon; 
    const [ref, inView] = useInView({ threshold: 0.1 }); 
    const colorStyles: { [key: string]: { bg: string; text: string } } = {
      indigo: {
          bg: 'from-indigo-100 to-indigo-200',
          text: 'text-indigo-600',
      },
      sky: {
          bg: 'from-sky-100 to-sky-200',
          text: 'text-sky-600',
      },
      rose: {
          bg: 'from-rose-100 to-rose-200',
          text: 'text-rose-600',
      },
      amber: {
          bg: 'from-amber-100 to-amber-200',
          text: 'text-amber-600',
      },
  };

  const currentStyle = colorStyles[color] || { bg: 'from-gray-100 to-gray-200', text: 'text-gray-600' };
    return ( 
        <div 
            ref={ref} 
            className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100/80 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} 
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br ${currentStyle.bg}`}>
                    <Icon className={`w-5 h-5 ${currentStyle.text}`} />
                </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div> 
    ); 
};
const SimpleBarChart = ({ products }: { products: Product[] }) => { 
    const maxViews = Math.max(...products.map(p => p.views || 0), 1); 
    const colors = ['bg-indigo-500', 'bg-sky-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500']; 
    return ( 
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100/80 h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex-shrink-0">Product Performance</h3>
            <div className="flex-grow flex justify-around items-end h-full space-x-3">
                {products.slice(0, 5).map((p, index) => ( 
                    <div key={p.id || index} className="flex flex-col items-center flex-1 group h-full justify-end">
                        <div className="relative w-full h-full flex items-end">
                            <div className={`w-full rounded-t-md transition-all duration-500 ease-out hover:opacity-80 ${colors[index % colors.length]}`} style={{ height: `${((p.views || 0) / maxViews) * 100}%` }}></div>
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-semibold text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{p.views || 0} views</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center truncate w-full pt-1">{p.title}</p>
                    </div> 
                ))}
            </div>
        </div> 
    ); 
};
const StatCardSkeleton = () => ( <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse"><div className="flex items-center justify-between"><div><div className="h-4 bg-gray-200 rounded w-24 mb-2"></div><div className="h-8 bg-gray-300 rounded w-16"></div></div><div className="w-12 h-12 rounded-full bg-gray-200"></div></div></div>);
const ProductCardSkeleton = () => (<div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"><div className="h-48 w-full bg-gray-300"></div><div className="p-4"><div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div><div className="h-6 bg-gray-200 rounded w-1/4"></div></div></div>);

// --- Edit Product Modal Component ---
const EditProductModal = ({ product, onClose, onSave }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: product?.title || '',
        price: product?.price || '',
        description: product?.description || '',
        quantity: product?.quantity || 0,
        category: product?.category || 'marketplace'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const updatedProduct = await apiClient.updateProduct(product.id || product._id, formData);
            onSave(updatedProduct);
        } catch (error) {
            console.error('Error updating product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={t('products.editProduct')} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.title')}</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.price')} ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.stock')}</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="marketplace">Marketplace</option>
                        <option value="secondhand">Secondhand</option>
                        <option value="jobs">Jobs</option>
                        <option value="travel">Travel</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isLoading ? t('common.loading') : t('common.save')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// --- Main Dashboard Page Component ---
export const DashboardPage = () => {
    const { user, logout: authLogout, updateProfile } = useAuth();
    const { t, i18n } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [userProducts, setUserProducts] = useState<Product[]>([]);
    const [userFavorites, setUserFavorites] = useState<Product[]>([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalViews: 0,
        totalFavorites: 0,
        averageRating: '0.0'
    });
    const [alertCount, setAlertCount] = useState(0);
    const [orderNotificationCount, setOrderNotificationCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Notification state
    const [notifications, setNotifications] = useState([]);
    
    // Modal states
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
    const [editModal, setEditModal] = useState({ isOpen: false, product: null });

    const addNotification = (message, type = 'success', duration = 5000) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { id, message, type, duration }]);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            await apiClient.deleteProduct(id);
            const deletedProduct = userProducts.find(p => (p.id || p._id) === id);
            setUserProducts(p => p.filter(i => (i.id || i._id) !== id));
            // Update stats
            setStats(prev => ({
                ...prev,
                totalProducts: prev.totalProducts - 1
            }));
            // Show success notification
            addNotification(`Product "${deletedProduct?.title || 'Unknown'}" deleted successfully!`);
        } catch (error) {
            console.error('Error deleting product:', error);
            addNotification('Failed to delete product', 'error');
        } finally {
            setDeleteModal({ isOpen: false, product: null });
        }
    };

    const handleToggleFavorite = async (id: string) => {
        try {
            await apiClient.toggleFavorite(id);
            setUserFavorites(p => p.filter(i => i.id !== id));
            // Update stats
            setStats(prev => ({
                ...prev,
                totalFavorites: prev.totalFavorites - 1
            }));
            addNotification('Product removed from favorites');
        } catch (error) {
            console.error('Error toggling favorite:', error);
            addNotification('Failed to update favorites', 'error');
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const requests = [
                apiClient.getUserProducts({ limit: 100 }),
                apiClient.getUserFavorites({ limit: 100 })
            ];
            
            // Add seller orders request if user is a seller
            if (user?.role === 'seller') {
                requests.push(apiClient.getSellerOrders());
            }
            
            const [prodRes, favRes, ordersRes] = await Promise.all(requests);
            
            setUserProducts(prodRes.products || []);
            setUserFavorites(favRes.products || []);
            
            const products = prodRes.products || [];
            const favorites = favRes.products || [];
            
            const totalViews = products.reduce((sum, product) => sum + (product.views || 0), 0);
            const totalFavorites = products.reduce((sum, product) => sum + (product.favorites || 0), 0);
            const avgRating = products.length > 0 
                ? products.reduce((sum, product) => sum + (product.rating || 0), 0) / products.length 
                : 0;
            
            setStats({ 
                totalProducts: products.length, 
                totalViews, 
                totalFavorites, 
                averageRating: avgRating.toFixed(1) 
            });
            
            // Calculate alert count
            const outOfStock = products.filter(p => (p.quantity || 0) === 0).length;
            const lowStock = products.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= 5).length;
            setAlertCount(outOfStock + lowStock);
            
            // Calculate order notification count for sellers
            if (user?.role === 'seller' && ordersRes) {
                const pendingOrders = ordersRes.orders?.filter(order => order.status === 'pending').length || 0;
                setOrderNotificationCount(pendingOrders);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Failed to load dashboard data');
            addNotification('Failed to load dashboard data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);
    
    useEffect(() => {
        const handleProductsUpdate = () => {
            loadData();
        };
        
        window.addEventListener('productsUpdated', handleProductsUpdate);
        return () => window.removeEventListener('productsUpdated', handleProductsUpdate);
    }, []);
    
    useEffect(() => { document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto'; }, [isSidebarOpen]);

// DashboardPage.tsx ထဲက Sidebar component ကို အောက်ပါအတိုင်း ပြင်ဆင်ပါ

const Sidebar = () => (
   <aside className={`w-64 flex-shrink-0 h-100 bg-white border-r border-gray-200/80 p-6 flex flex-col fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:z-auto`}>
       <div className="flex items-center justify-between mb-10">
           <div className="flex items-center space-x-3">
               <div className="relative">
                   <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                       {user?.avatar ? (
                           <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                       ) : (
                           <User className="w-6 h-6 text-white" />
                       )}
                   </div>
                   {user?.isVerified && <Shield className="absolute -bottom-1 -right-1 w-5 h-5 text-white bg-green-500 rounded-full p-0.5" />}
               </div>
               <div>
                   <h2 className="font-bold text-gray-800 text-sm">{user?.firstName} {user?.lastName}</h2>
                   <p className="text-xs text-gray-500">{user?.role === 'seller' ? 'Verified Seller' : user?.role}</p>
               </div>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500 hover:text-gray-800"> <X size={20} /> </button>
       </div>
        <nav className="flex-grow space-y-2">
            {[
                { id: 'overview', label: t('dashboard.overview'), icon: LayoutDashboard },
                { id: 'products', label: t('dashboard.myProducts'), icon: Package },
                ...(user?.role === 'seller' ? [{ id: 'orders', label: t('dashboard.orders'), icon: ShoppingCart }] : []),
                { id: 'favorites', label: t('dashboard.favorites'), icon: Heart },
                { id: 'profile', label: t('dashboard.profile'), icon: Settings }
            ].map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:translate-x-1 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}>
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {tab.id === 'products' && alertCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {alertCount}
                        </span>
                    )}
                    {tab.id === 'orders' && orderNotificationCount > 0 && (
                        <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {orderNotificationCount}
                        </span>
                    )}
                </button>
            ))}
        </nav>
        <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
                <button
                    onClick={() => {
                        const newLang = i18n.language === 'en' ? 'my' : 'en';
                        i18n.changeLanguage(newLang);
                        localStorage.setItem('language', newLang);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Globe className="w-4 h-4" />
                    <span>{i18n.language === 'en' ? 'မြန်မာ' : 'English'}</span>
                </button>
            </div>
            <button onClick={authLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200">
                <LogOut className="w-5 h-5" />
                <span>{t('dashboard.logout')}</span>
            </button>
        </div>
    </aside>
);

// Header component ကို အောက်ပါအတိုင်း ပြင်ဆင်ပါ
<header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm z-40 p-4 border-b flex items-center">
   <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600"> <Menu size={24} /> </button>
   <div className="flex-1 text-center"><h1 className="text-lg font-bold text-indigo-600">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1></div>
   <div className="w-8"></div>
</header>
    if (!user) { 
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
                    <button 
                        onClick={() => window.location.href = '/login'} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        ); 
    }

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); body { font-family: 'Inter', sans-serif; }`}</style>
            
            {/* Notification Container */}
            <NotificationContainer 
                notifications={notifications} 
                removeNotification={removeNotification} 
            />
            
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, product: null })}
                onConfirm={() => handleDeleteProduct(deleteModal.product?.id || deleteModal.product?._id)}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteModal.product?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
            
            {/* Edit Product Modal */}
            {editModal.isOpen && editModal.product && (
                <EditProductModal
                    product={editModal.product}
                    onClose={() => setEditModal({ isOpen: false, product: null })}
                    onSave={(updatedProduct) => {
                        setUserProducts(prev => prev.map(p => 
                            (p.id || p._id) === (updatedProduct.id || updatedProduct._id) ? updatedProduct : p
                        ));
                        setEditModal({ isOpen: false, product: null });
                        addNotification('Product updated successfully!');
                    }}
                />
            )}
            
            <div className="min-h-screen flex bg-gray-50 text-gray-800">
                <Sidebar />
                <div className="flex flex-col flex-1">
                    <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm z-40 p-4 border-b flex items-center">
                       <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600"> <Menu size={24} /> </button>
                       <div className="flex-1 text-center"><h1 className="text-lg font-bold text-indigo-600">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1></div>
                       <div className="w-8"></div>
                    </header>
                    <main className="flex-1 p-6 md:p-8">
                        {error && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                                <button 
                                    onClick={() => setError(null)} 
                                    className="ml-2 text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        {isLoading ? (
                           <DashboardSkeleton activeTab={activeTab} />
                        ) : (
                            <>
                                {activeTab === 'overview' && <OverviewContent stats={stats} products={userProducts} />}
                                {activeTab === 'products' && (
                                    <ProductsContent 
                                        products={userProducts} 
                                        onDelete={(product) => setDeleteModal({ isOpen: true, product })}
                                        setAlertCount={setAlertCount}
                                        onEdit={(product) => setEditModal({ isOpen: true, product })}
                                    />
                                )}
                                {activeTab === 'orders' && user?.role === 'seller' && <OrdersContent />}
                                {activeTab === 'favorites' && <FavoritesContent favorites={userFavorites} onToggleFavorite={handleToggleFavorite} />}
                                {activeTab === 'profile' && <ProfileContent user={user} onUpdateProfile={updateProfile} addNotification={addNotification} />}
                            </>
                        )}
                    </main>
                </div>
                {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-40 md:hidden"></div>}
            </div>
        </>
    );
};

// --- Content Components ---
const OverviewContent = ({ stats, products }: { stats: any, products: Product[] }) => {
    const statItems = [ 
        { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'indigo' }, 
        { title: 'Total Views', value: stats.totalViews, icon: Eye, color: 'sky' }, 
        { title: 'Favorites', value: stats.totalFavorites, icon: Heart, color: 'rose' }, 
        { title: 'Avg. Rating', value: stats.averageRating, icon: Star, color: 'amber' }, 
    ];
    return (
        <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {statItems.map((stat, i) => ( <StatCard key={stat.title} {...stat} delay={i * 100} /> ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg border border-gray-100/80 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex-shrink-0">Recent Activity</h3>
                    <div className="space-y-3 overflow-y-auto flex-grow">
                        {products.length > 0 ? products.slice(0, 4).map((p, index) => (
                            <div key={p.id || index} className="flex items-center space-x-4 p-3 pr-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                 <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                                 <div className="flex-1">
                                     <h4 className="font-semibold text-gray-800 text-sm leading-tight">{p.title}</h4>
                                     <p className="text-xs text-gray-500">{p.category}</p>
                                 </div>
                                 <div className="text-right flex-shrink-0">
                                     <p className="font-bold text-base text-gray-900">${p.price}</p>
                                 </div>
                            </div>
                        )) : (
                            <div className="text-center text-gray-500 py-8">
                                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No products yet</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2 h-full">
                    <SimpleBarChart products={products} />
                </div>
            </div>
        </div>
    );
};

const ProductsContent = ({ products, onDelete, setAlertCount, onEdit }: { products: Product[], onDelete: (product: Product) => void, setAlertCount: (count: number) => void, onEdit: (product: Product) => void }) => {
    const { t } = useTranslation();
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{id: string, title: string, currentStock: number} | null>(null);
    const [newStock, setNewStock] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [stockFilter, setStockFilter] = useState<'all' | 'out-of-stock' | 'low-stock'>('all');
    const [displayCount, setDisplayCount] = useState(12);
    
    const lowStockProducts = products.filter(p => (p.quantity || 0) <= 5 && (p.quantity || 0) > 0);
    const outOfStockProducts = products.filter(p => (p.quantity || 0) === 0);
    
    const getFilteredProducts = () => {
        switch (stockFilter) {
            case 'out-of-stock':
                return outOfStockProducts;
            case 'low-stock':
                return lowStockProducts;
            default:
                return products;
        }
    };
    
    const filteredProducts = getFilteredProducts();
    const displayedProducts = filteredProducts.slice(0, displayCount);
    const hasMore = filteredProducts.length > displayCount;
    
    const handleStockUpdate = (product: Product) => {
        const productId = product.id || product._id;
        if (!productId) {
            console.error('Product ID is missing:', product);
            return;
        }
        setSelectedProduct({ 
            id: productId, 
            title: product.title, 
            currentStock: product.quantity || 0 
        });
        setNewStock('');
        setShowStockModal(true);
    };
    
    const updateStock = async () => {
        if (!selectedProduct || !newStock) return;
        
        setIsUpdating(true);
        try {
            await apiClient.updateProduct(selectedProduct.id, { quantity: parseInt(newStock) });
            
            // Update local state instead of reloading
            const updatedProducts = products.map(p => 
                p.id === selectedProduct.id 
                    ? { ...p, quantity: parseInt(newStock) }
                    : p
            );
            
            // Update alert count
            const outOfStock = updatedProducts.filter(p => (p.quantity || 0) === 0).length;
            const lowStock = updatedProducts.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= 5).length;
            setAlertCount(outOfStock + lowStock);
            
            // Trigger parent component update
            window.dispatchEvent(new CustomEvent('productsUpdated', { detail: updatedProducts }));
            
            setShowStockModal(false);
            setSelectedProduct(null);
            setNewStock('');
        } catch (error) {
            console.error('Failed to update stock:', error);
            // Use notification instead of alert
            window.dispatchEvent(new CustomEvent('showNotification', { 
                detail: { message: 'Failed to update stock. Please try again.', type: 'error' } 
            }));
        } finally {
            setIsUpdating(false);
        }
    };
    
    return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{t('dashboard.myProducts')}</h1>
            <div className="flex items-center space-x-3">
                <select 
                    value={stockFilter} 
                    onChange={(e) => setStockFilter(e.target.value as 'all' | 'out-of-stock' | 'low-stock')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                    <option value="all">All Products ({products.length})</option>
                    <option value="out-of-stock">Out of Stock ({outOfStockProducts.length})</option>
                    <option value="low-stock">Low Stock ({lowStockProducts.length})</option>
                </select>
                <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5"><Plus className="w-5 h-5" /><span>{t('products.addProduct')}</span></button>
            </div>
        </div>
        
        {/* Stock Alerts */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
            <div className="space-y-4">
                {outOfStockProducts.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-red-800 font-semibold mb-2">⚠️ {t('products.outOfStock')} ({outOfStockProducts.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {outOfStockProducts.map(p => (
                                <div key={p.id} className="text-red-700 text-sm">
                                    • {p.title}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {lowStockProducts.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-yellow-800 font-semibold mb-2">⚠️ {t('products.lowStock')} ({lowStockProducts.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lowStockProducts.map(p => (
                                <div key={p.id} className="text-yellow-700 text-sm">
                                    • {p.title} - {p.quantity || 0} left
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.length > 0 ? displayedProducts.map(p => (
                <div key={p.id} className={`bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${(p.quantity || 0) === 0 ? 'opacity-60' : ''}`}>
                    <div className="relative">
                        <img src={p.image} alt={p.title} className="h-44 sm:h-48 w-full object-cover"/>
                        {(p.quantity || 0) === 0 && (
                            <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">OUT OF STOCK</span>
                            </div>
                        )}
                        {(p.quantity || 0) > 0 && (p.quantity || 0) <= 5 && (
                            <div className="absolute top-2 left-2">
                                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">LOW STOCK</span>
                            </div>
                        )}
                        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                                onClick={() => window.open(`/product/${p.id || p._id}`, '_blank')}
                                className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-blue-600 hover:bg-white transition-all"
                                title="View Product"
                            >
                                <Eye size={14}/>
                            </button>
                            <button 
                                onClick={() => onEdit(p)}
                                className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-indigo-600 hover:bg-white transition-all"
                                title="Edit Product"
                            >
                                <Edit size={14}/>
                            </button>
                            <button 
                                onClick={() => onDelete(p)}
                                className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-rose-600 hover:bg-white transition-all"
                                title="Delete Product"
                            >
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                        <div className="flex-grow">
                            <h3 className="font-semibold text-sm text-gray-800 leading-snug h-10">{p.title}</h3>
                            <p className="text-indigo-600 font-bold text-lg mt-1">${p.price}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-gray-500 text-xs">{t('products.stock')}: {p.quantity || 0}</p>
                                <button 
                                    onClick={() => handleStockUpdate(p)}
                                    className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                >
                                    + {t('products.addStock')}
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                             <div className="flex items-center space-x-1"><Eye size={12}/><span>{p.views || 0} Views</span></div>
                             <div className="flex items-center space-x-1"><Star size={12} className="text-amber-500" fill="currentColor"/><span>{p.rating || 0}</span></div>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="col-span-full text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {stockFilter === 'all' ? 'No products yet' : 
                         stockFilter === 'out-of-stock' ? 'No out of stock products' :
                         'No low stock products'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {stockFilter === 'all' ? 'Start by adding your first product to the marketplace.' :
                         stockFilter === 'out-of-stock' ? 'All your products are in stock!' :
                         'All your products have sufficient stock!'}
                    </p>
                    {stockFilter === 'all' && (
                        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 mx-auto">
                            <Plus className="w-5 h-5" />
                            <span>Add Your First Product</span>
                        </button>
                    )}
                </div>
            )}
        </div>
        
        {/* Load More Button */}
        {hasMore && (
            <div className="flex justify-center mt-8">
                <button 
                    onClick={() => setDisplayCount(prev => prev + 12)}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    Load More Products ({filteredProducts.length - displayCount} remaining)
                </button>
            </div>
        )}
        
        {/* Stock Update Modal */}
        {showStockModal && selectedProduct && (
            <Modal 
                isOpen={showStockModal} 
                onClose={() => setShowStockModal(false)} 
                title="Update Stock"
                size="sm"
            >
                <div className="py-4">
                    <p className="text-gray-600 mb-2">{selectedProduct.title}</p>
                    <p className="text-sm text-gray-500 mb-4">Current Stock: {selectedProduct.currentStock}</p>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Stock Quantity
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter new stock quantity"
                    />
                </div>
                <div className="flex space-x-3 pt-4">
                    <button
                        onClick={() => setShowStockModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isUpdating}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={updateStock}
                        disabled={!newStock || isUpdating}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {isUpdating ? t('common.loading') : t('products.addStock')}
                    </button>
                </div>
            </Modal>
        )}
    </div>
)};

const FavoritesContent = ({ favorites, onToggleFavorite }: { favorites: Product[], onToggleFavorite: (id: string) => void }) => (
    <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">My Favorites</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
             {favorites.length > 0 ? favorites.map(p => (
                <div key={p.id} className="bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
                    <div className="relative">
                       <img src={p.image} alt={p.title} className="h-44 sm:h-48 w-full object-cover"/>
                       <button onClick={() => onToggleFavorite(p.id)} className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-rose-500 hover:bg-white transition-all transform hover:scale-110"><Heart size={16} fill="currentColor"/></button>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                        <div className="flex-grow">
                            <h3 className="font-semibold text-sm text-gray-800 leading-snug h-10">{p.title}</h3>
                            <p className="text-indigo-600 font-bold text-lg mt-1">${p.price}</p>
                        </div>
                         <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
                            <MapPin size={12} className="mr-1" />
                            <span>{p.location || 'Location not specified'}</span>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="col-span-full text-center py-12">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No favorites yet</h3>
                    <p className="text-gray-500">Start exploring products and add them to your favorites!</p>
                </div>
            )}
        </div>
    </div>
);

const ProfileContent = ({ user: initialUser, onUpdateProfile, addNotification }: { user: any, onUpdateProfile: (userData: any) => Promise<void>, addNotification: (message: string, type?: string) => void }) => { 
    const [user, setUser] = useState(initialUser); 
    const [isEditing, setIsEditing] = useState(false); 
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSave = async () => { 
        setIsSaving(true);
        setError(null);
        try {
            await onUpdateProfile(user);
            setIsEditing(false);
            addNotification('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
            addNotification('Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    }; 
    
    const handleCancel = () => { 
        setUser(initialUser); 
        setIsEditing(false);
        setError(null);
    }; 
    
    const InfoItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => { 
        const Icon = icon; 
        return (
            <div className="flex items-start space-x-4 py-3">
                <Icon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                    <dt className="text-sm font-medium text-gray-500">{label}</dt>
                    <dd className="mt-1 text-gray-900">{value || 'Not specified'}</dd>
                </div>
            </div>
        ); 
    }; 
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Profile Settings</h1>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100/80">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                {!isEditing ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                            <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                <Edit size={14} />
                                <span>Edit Profile</span>
                            </button>
                        </div>
                        <div className="border-t border-gray-200 pt-6">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                <InfoItem icon={User} label="Full Name" value={`${user?.firstName || ''} ${user?.lastName || ''}`} />
                                <InfoItem icon={Mail} label="Email Address" value={user?.email || ''} />
                                <InfoItem icon={Phone} label="Phone Number" value={user?.phone || ''} />
                                <InfoItem icon={MapPin} label="Location" value={user?.location || ''} />
                                <div className="md:col-span-2">
                                    <InfoItem icon={User} label="Bio" value={user?.bio || ''} />
                                </div>
                            </dl>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Edit Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <input 
                                    type="text" 
                                    value={user?.firstName || ''} 
                                    onChange={e => setUser({...user, firstName: e.target.value})} 
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <input 
                                    type="text" 
                                    value={user?.lastName || ''} 
                                    onChange={e => setUser({...user, lastName: e.target.value})} 
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Phone Number</label>
                            <input 
                                type="text" 
                                value={user?.phone || ''} 
                                onChange={e => setUser({...user, phone: e.target.value})} 
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Location</label>
                            <input 
                                type="text" 
                                value={user?.location || ''} 
                                onChange={e => setUser({...user, location: e.target.value})} 
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Bio</label>
                            <textarea 
                                value={user?.bio || ''} 
                                onChange={e => setUser({...user, bio: e.target.value})} 
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                rows={4}
                            />
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                onClick={handleCancel} 
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    ); 
};

const OrdersContent = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = await apiClient.getSellerOrders();
                setOrders(response.orders || []);
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, []);

    const handleStatusUpdate = async (orderId, subOrderId, newStatus) => {
        try {
            await apiClient.updateSubOrderStatus(orderId, subOrderId, newStatus);
            setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{t('dashboard.orders')}</h1>
            <div className="space-y-4">
                {orders.length > 0 ? orders.map(order => (
                    <div key={order.id} className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${
                        order.status === 'pending' ? 'border-orange-500' : 
                        order.status === 'confirmed' ? 'border-green-500' : 'border-gray-300'
                    }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                                <p className="text-gray-600">{order.customer?.name}</p>
                                <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl">${order.total}</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                    order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {t(`orders.${order.status}`)}
                                </span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Items:</h4>
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>{item.title} x{item.quantity}</span>
                                    <span>${item.total}</span>
                                </div>
                            ))}
                        </div>
                        {order.status === 'pending' && (
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleStatusUpdate(order.id, order.subOrderId, 'confirmed')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    {t('orders.confirmOrder')}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(order.id, order.subOrderId, 'cancelled')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    {t('orders.cancelOrder')}
                                </button>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-12">
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No orders yet</h3>
                        <p className="text-gray-500">Orders will appear here when customers purchase your products.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DashboardSkeleton = ({ activeTab }: { activeTab: string }) => (
    <div className="space-y-8">
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
        {activeTab === 'overview' && (
            <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100/80 animate-pulse h-96"></div>
            </>
        )}
        {(activeTab === 'products' || activeTab === 'favorites') && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
        )}
        {activeTab === 'profile' && (
             <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100/80 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
             </div>
        )}
    </div>
);

export default DashboardPage;