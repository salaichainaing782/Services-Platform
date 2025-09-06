import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { Check, X, Info, AlertTriangle, XCircle } from 'lucide-react';

// Notification Component
const Notification = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  React.useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: <Check className="w-5 h-5 text-green-500" />,
      border: 'border-l-4 border-green-500'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      border: 'border-l-4 border-red-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 w-5 text-blue-500" />,
      border: 'border-l-4 border-blue-500'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      border: 'border-l-4 border-amber-500'
    }
  };
  
  const currentStyle = typeStyles[type];
  
  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`${currentStyle.bg} ${currentStyle.border} rounded-lg shadow-lg p-4 min-w-80 max-w-sm border`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {currentStyle.icon}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${currentStyle.text}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' :
              type === 'info' ? 'bg-blue-500' : 'bg-amber-500'
            }`}
            style={{ 
              width: isVisible ? '0%' : '100%',
              transition: `width ${duration}ms linear`
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Notification Container
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

type CategoryKey = 'marketplace' | 'secondhand' | 'jobs' | 'travel';

const categoryOptions: { value: CategoryKey; label: string }[] = [
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'secondhand', label: 'Second-hand' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'travel', label: 'Travel' },
];

const PostAdPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const [category, setCategory] = useState<CategoryKey>('marketplace');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [condition, setCondition] = useState('good');
  const [jobType, setJobType] = useState('full-time');
  const [experience, setExperience] = useState('entry');
  const [salary, setSalary] = useState('');
  const [tripType, setTripType] = useState('flights');
  const [duration, setDuration] = useState('');

  const showCondition = useMemo(() => category === 'secondhand', [category]);
  const showJobFields = useMemo(() => category === 'jobs', [category]);
  const showTravelFields = useMemo(() => category === 'travel', [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      addNotification('Please login to post an ad', 'error');
      return;
    }

    if (!title || !description || !price || !image || !category) {
      addNotification('Please fill all required fields', 'warning');
      return;
    }

    const basePayload: any = {
      title,
      description,
      price,
      image,
      category,
      location,
      quantity,
    };

    if (showCondition) {
      basePayload.condition = condition;
    }
    if (showJobFields) {
      basePayload.jobType = jobType;
      basePayload.experience = experience;
      basePayload.salary = salary;
    }
    if (showTravelFields) {
      basePayload.tripType = tripType;
      basePayload.duration = duration;
    }

    try {
      setLoading(true);
      const created = await apiClient.createProduct(basePayload);
      addNotification('Post created successfully!', 'success');
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setImage('');
      setLocation('');
      setSalary('');
      setDuration('');
      setQuantity(1);
      
    } catch (err: any) {
      console.error('Failed to create post:', err);
      addNotification(err?.message || 'Failed to create post. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Create a New Post</CardTitle>
            <CardDescription className="text-blue-100">
              Share your item, job opportunity, or travel experience
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700 font-medium">
                  Category *
                </Label>
                <select
                  id="category"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryKey)}
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 font-medium">
                  Title *
                </Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Enter a clear and descriptive title" 
                  className="py-3 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-medium">
                  Description *
                </Label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all"
                  placeholder="Provide detailed information about your post..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-700 font-medium">
                    Price *
                  </Label>
                  <Input 
                    id="price" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="e.g. $250 or Negotiable" 
                    className="py-3 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-gray-700 font-medium">
                    Image URL *
                  </Label>
                  <Input 
                    id="image" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)} 
                    placeholder="https://example.com/image.jpg" 
                    className="py-3 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-700 font-medium">
                  Location
                </Label>
                <Input 
                  id="location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="City, Country" 
                  className="py-3 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-gray-700 font-medium">
                    Quantity
                  </Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min={1} 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))} 
                    className="py-3 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {showCondition && (
                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-gray-700 font-medium">
                    Condition
                  </Label>
                  <select
                    id="condition"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="like-new">Like new</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              )}

              {showJobFields && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobType" className="text-gray-700 font-medium">
                      Job type
                    </Label>
                    <select 
                      id="jobType" 
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      value={jobType} 
                      onChange={(e) => setJobType(e.target.value)}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-gray-700 font-medium">
                      Experience
                    </Label>
                    <select 
                      id="experience" 
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      value={experience} 
                      onChange={(e) => setExperience(e.target.value)}
                    >
                      <option value="entry">Entry</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary" className="text-gray-700 font-medium">
                      Salary
                    </Label>
                    <Input 
                      id="salary" 
                      value={salary} 
                      onChange={(e) => setSalary(e.target.value)} 
                      placeholder="e.g. $60k - $80k" 
                      className="py-3 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {showTravelFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tripType" className="text-gray-700 font-medium">
                      Trip Type
                    </Label>
                    <select 
                      id="tripType" 
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      value={tripType} 
                      onChange={(e) => setTripType(e.target.value)}
                    >
                      <option value="flights">Flights</option>
                      <option value="hotels">Hotels</option>
                      <option value="packages">Packages</option>
                      <option value="activities">Activities</option>
                      <option value="transport">Transport</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-gray-700 font-medium">
                      Duration
                    </Label>
                    <Input 
                      id="duration" 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)} 
                      placeholder="e.g. 5 days / 4 nights" 
                      className="py-3 px-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Posting...
                    </div>
                  ) : (
                    'Create Post'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostAdPage;