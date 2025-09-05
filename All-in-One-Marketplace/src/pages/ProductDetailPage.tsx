import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient, Product } from '../services/api';
import { Button } from '../components/ui/Button';
import { 
  Star, Eye, Heart, ChevronLeft, MapPin, Lock, X, LogIn,
  ShoppingCart, Check, ArrowRight, Home, Store
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setError('');
        setLoading(true);
        const p = await apiClient.getProductById(id);
        setProduct(p);
        
        // Increment view count when product is loaded
        try {
          await apiClient.incrementProductViews(id);
          // Update local product state with incremented view
          setProduct(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
        } catch (e) {
          console.error('Failed to increment view count:', e);
        }
        
        // Load related products
        try {
          const related = await apiClient.getProductsByCategory(p.category, { limit: 4 });
          setRelatedProducts(related.products.filter((relatedProduct: Product) => relatedProduct.id !== p.id));
        } catch (e) {
          console.error('Failed to load related products:', e);
        }
        
        // Check if product is in user's favorites
        if (isAuthenticated) {
          try {
            const userFavorites = await apiClient.getUserFavorites({ limit: 1000 });
            const isInFavorites = userFavorites.products.some(fav => fav.id === p.id || fav._id === p.id);
            setIsFavorite(isInFavorites);
          } catch (e) {
            console.error('Failed to check favorites:', e);
          }
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    if (isToggling || !id) return;
    
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

  const handleBuy = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    setBuying(true);
    try {
      await addToCart({
        id: product.id,
        title: product.title,
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'),
        image: product.image
      }, qty);
      
      // Show success modal instead of alert
      setShowCartModal(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist or has been removed.'}</p>
          <Link to="/marketplace" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
  const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'number' ? product.originalPrice : parseFloat(product.originalPrice)) : null;
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const images = product.images?.length ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-indigo-600">Home</Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link to="/marketplace" className="text-gray-500 hover:text-indigo-600">Marketplace</Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-800 font-medium truncate max-w-xs">
                {product.title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-4" style={{ paddingBottom: '100%' }}>
                <img
                  src={images[currentImage]}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-contain p-4"
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = 'https://placehold.co/600x600/e5e7eb/ffffff?text=No+Image'; 
                  }}
                />
                {discount > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`relative rounded-md overflow-hidden border-2 transition-all ${
                        currentImage === idx ? 'border-indigo-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} ${idx + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{product.rating ? product.rating.toFixed(1) : '0.0'} ({product.rating ? '1 review' : 'No reviews'})</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{(product.views || 0).toLocaleString()} views</span>
                    </div>
                    <span>•</span>
                    <div className="text-green-600 font-medium">
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleFavoriteClick}
                  disabled={isToggling}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                </button>
              </div>

              {/* Price */}
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">${price.toFixed(2)}</span>
                  {originalPrice && (
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    Save ${originalPrice ? (originalPrice - price).toFixed(2) : '0.00'} ({discount}%)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>{(product.favorites || 0).toLocaleString()} favorites</span>
                </div>
              </div>

              {/* Location */}
              {product.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{product.location}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Quantity */}
              <div className="flex items-center space-x-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value || '1', 10))}
                    className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  In stock: {product.quantity !== undefined ? product.quantity : '—'}
                </div>
              </div>
            </div>

            {/* Buy Button */}
            <div>
              <Button
                onClick={handleBuy}
                disabled={buying || (product.quantity !== undefined && product.quantity <= 0)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
              >
                {buying ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link 
                  key={relatedProduct.id} 
                  to={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-50 relative">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.title}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; 
                        target.src = 'https://placehold.co/600x600/e5e7eb/ffffff?text=No+Image'; 
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{relatedProduct.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${typeof relatedProduct.price === 'number' ? relatedProduct.price.toFixed(2) : parseFloat(relatedProduct.price || 0).toFixed(2)}
                      </span>
                      {relatedProduct.rating && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span>{relatedProduct.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden relative border-t-4 border-green-500">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
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
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <LogIn className="h-5 w-5 mr-2" />
                    Go to Login
                  </Button>
                </Link>
                <Button 
                  onClick={() => setShowLoginModal(false)}
                  className="w-full bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Success Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden relative border-t-4 border-green-500">
            <button onClick={() => setShowCartModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
              <X className="h-6 w-6" />
            </button>
            <div className="p-8 text-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Added to Cart!</h2>
              <div className="flex items-center justify-center my-6">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-20 h-20 object-contain rounded-lg border"
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = 'https://placehold.co/600x600/e5e7eb/ffffff?text=No+Image'; 
                  }}
                />
                <div className="ml-4 text-left">
                  <h3 className="font-medium text-gray-900">{product.title}</h3>
                  <p className="text-gray-600">Quantity: {qty}</p>
                  <p className="text-lg font-bold text-green-600">
                    ${(price * qty).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/cart" className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    View Cart
                  </Button>
                </Link>
                <Button 
                  onClick={() => setShowCartModal(false)}
                  className="w-full bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Continue Shopping
                </Button>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/checkout" className="block">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/marketplace" className="block">
                    <Button className="w-full bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Store className="h-4 w-4 mr-2" />
                      Browse More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;