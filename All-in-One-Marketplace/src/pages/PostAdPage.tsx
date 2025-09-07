import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { Check, X, Info, AlertTriangle, XCircle, Upload, Image, MapPin, DollarSign, Calendar, Briefcase, Award, Clock, Star, Zap, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageUpload from '../components/ImageUpload';
import { useNotificationHelpers } from '../contexts/NotificationContext';

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
      icon: <Info className="w-5 h-5 text-blue-500" />,
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

const PostAdPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const categoryOptions = [
    { value: 'marketplace', label: t('marketplace.title'), icon: <Zap className="w-4 h-4" /> },
    { value: 'secondhand', label: t('secondhand.title'), icon: <Award className="w-4 h-4" /> },
    { value: 'jobs', label: t('jobs.title'), icon: <Briefcase className="w-4 h-4" /> },
    { value: 'travel', label: 'Services', icon: <Star className="w-4 h-4" /> },
  ];
  
  const { success, error, warning } = useNotificationHelpers();

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
  const [tripType, setTripType] = useState('consulting');
  const [duration, setDuration] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [availability, setAvailability] = useState('daily');
  const [included, setIncluded] = useState('');
  const [toBring, setToBring] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostExperience, setHostExperience] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('flexible');
  const [serviceFee, setServiceFee] = useState('15');

  const showCondition = useMemo(() => category === 'secondhand', [category]);
  const showJobFields = useMemo(() => category === 'jobs', [category]);
  const showServiceFields = useMemo(() => category === 'travel', [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      error('Authentication Required', 'Please login to post an ad');
      return;
    }

    if (!title || !description || !price || !image || !category) {
      warning('Missing Fields', 'Please fill all required fields');
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
    if (showServiceFields) {
      basePayload.tripType = tripType;
      basePayload.duration = duration;
      basePayload.groupSize = groupSize;
      basePayload.availability = availability;
      basePayload.included = included;
      basePayload.toBring = toBring;
      basePayload.hostName = hostName;
      basePayload.hostExperience = hostExperience;
      basePayload.cancellationPolicy = cancellationPolicy;
      basePayload.serviceFee = serviceFee;
    }

    try {
      setLoading(true);
      const created = await apiClient.createProduct(basePayload);
      success('Post Created', 'Your listing has been published successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setImage('');
      setLocation('');
      setSalary('');
      setDuration('');
      setGroupSize('');
      setIncluded('');
      setToBring('');
      setHostName('');
      setHostExperience('');
      setQuantity(1);
      
    } catch (err: any) {
      console.error('Failed to create post:', err);
      error('Post Creation Failed', err?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">

      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Listing</h1>
          <p className="text-gray-600 text-lg">Reach thousands of potential buyers with your amazing offer</p>
        </div>

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-8">
            <div className="text-center">
              <CardTitle className="text-3xl font-bold mb-2">Post Your Ad</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Choose a category and fill in the details to get started
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Selection */}
              <div className="space-y-4">
                <Label className="text-gray-700 font-semibold text-lg flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-500" />
                  Category *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categoryOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setCategory(opt.value as CategoryKey)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        category === opt.value
                          ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          category === opt.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {opt.icon}
                        </div>
                        <span className="font-medium text-sm">{opt.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div className="space-y-4">
                  <Label htmlFor="title" className="text-gray-700 font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    Title *
                  </Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Enter a clear and descriptive title" 
                    className="py-4 px-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                    required 
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="description" className="text-gray-700 font-semibold flex items-center">
                    <Info className="w-4 h-4 mr-2 text-blue-500" />
                    Description *
                  </Label>
                  <textarea
                    id="description"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    placeholder="Provide detailed information about your post..."
                    required
                  />
                </div>
              </div>

              {/* Pricing & Media */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Pricing & Media</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="price" className="text-gray-700 font-semibold flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      Price *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input 
                        id="price" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        placeholder="0.00" 
                        className="py-4 pl-12 pr-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-gray-700 font-semibold flex items-center">
                      <Image className="w-4 h-4 mr-2 text-purple-500" />
                      Product Image *
                    </Label>
                    <ImageUpload 
                      onImageChange={setImage}
                      currentImage={image}
                    />
                  </div>
                </div>
              </div>

              {/* Location & Quantity */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Additional Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="location" className="text-gray-700 font-semibold flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-red-500" />
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input 
                        id="location" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        placeholder="City, Country" 
                        className="py-4 pl-12 pr-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="quantity" className="text-gray-700 font-semibold flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                      Quantity
                    </Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min={1} 
                      value={quantity} 
                      onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))} 
                      className="py-4 px-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Condition Section */}
              {showCondition && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Item Condition</h3>
                  
                  <div className="space-y-4">
                    <Label htmlFor="condition" className="text-gray-700 font-semibold">
                      Select Condition
                    </Label>
                    <select
                      id="condition"
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <option value="new">🆕 Brand New</option>
                      <option value="like-new">✨ Like New</option>
                      <option value="good">👍 Good</option>
                      <option value="fair">✅ Fair</option>
                      <option value="poor">⚠️ Poor</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Job Fields */}
              {showJobFields && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Job Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="jobType" className="text-gray-700 font-semibold">
                        Job Type
                      </Label>
                      <select 
                        id="jobType" 
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        value={jobType} 
                        onChange={(e) => setJobType(e.target.value)}
                      >
                        <option value="full-time">💼 Full-time</option>
                        <option value="part-time">⏰ Part-time</option>
                        <option value="contract">📝 Contract</option>
                        <option value="remote">🏠 Remote</option>
                        <option value="internship">🎓 Internship</option>
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="experience" className="text-gray-700 font-semibold">
                        Experience
                      </Label>
                      <select 
                        id="experience" 
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        value={experience} 
                        onChange={(e) => setExperience(e.target.value)}
                      >
                        <option value="entry">🚀 Entry Level</option>
                        <option value="mid">⭐ Mid Level</option>
                        <option value="senior">👑 Senior Level</option>
                        <option value="executive">🎯 Executive</option>
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="salary" className="text-gray-700 font-semibold flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                        Salary
                      </Label>
                      <Input 
                        id="salary" 
                        value={salary} 
                        onChange={(e) => setSalary(e.target.value)} 
                        placeholder="e.g. $60k - $80k" 
                        className="py-4 px-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Service Fields */}
              {showServiceFields && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Service Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="tripType" className="text-gray-700 font-semibold">
                        Service Type
                      </Label>
                      <select 
                        id="tripType" 
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        value={tripType} 
                        onChange={(e) => setTripType(e.target.value)}
                      >
                        <option value="consulting">💡 Consulting</option>
                        <option value="design">🎨 Design</option>
                        <option value="development">💻 Development</option>
                        <option value="marketing">📈 Marketing</option>
                        <option value="education">📚 Education</option>
                        <option value="travel">✈️ Travel & Tours</option>
                        <option value="other">🔧 Other Services</option>
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="duration" className="text-gray-700 font-semibold flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        Duration
                      </Label>
                      <Input 
                        id="duration" 
                        value={duration} 
                        onChange={(e) => setDuration(e.target.value)} 
                        placeholder="e.g. 3 days 2 nights, 2 hours" 
                        className="py-4 px-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="groupSize" className="text-gray-700 font-semibold flex items-center">
                        <Star className="w-4 h-4 mr-2 text-purple-500" />
                        Group Size
                      </Label>
                      <Input 
                        id="groupSize" 
                        value={groupSize} 
                        onChange={(e) => setGroupSize(e.target.value)} 
                        placeholder="e.g. 2-12 people, 1-on-1" 
                        className="py-4 px-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="availability" className="text-gray-700 font-semibold">
                        Availability
                      </Label>
                      <select 
                        id="availability" 
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        value={availability} 
                        onChange={(e) => setAvailability(e.target.value)}
                      >
                        <option value="daily">📅 Daily Available</option>
                        <option value="weekends">🎯 Weekends Only</option>
                        <option value="weekdays">💼 Weekdays Only</option>
                        <option value="appointment">📞 By Appointment</option>
                        <option value="seasonal">🌟 Seasonal</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="included" className="text-gray-700 font-semibold">
                      What's Included
                    </Label>
                    <textarea
                      id="included"
                      rows={3}
                      value={included}
                      onChange={(e) => setIncluded(e.target.value)}
                      className="flex w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                      placeholder="e.g. Professional guide, Transportation, Lunch & snacks, Equipment"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="toBring" className="text-gray-700 font-semibold">
                      What to Bring
                    </Label>
                    <textarea
                      id="toBring"
                      rows={3}
                      value={toBring}
                      onChange={(e) => setToBring(e.target.value)}
                      className="flex w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                      placeholder="e.g. Comfortable shoes, Water bottle, Camera, Sunscreen"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="hostName" className="text-gray-700 font-semibold">
                        Host/Provider Name
                      </Label>
                      <Input 
                        id="hostName" 
                        value={hostName} 
                        onChange={(e) => setHostName(e.target.value)} 
                        placeholder="Your name or business name" 
                        className="py-4 px-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="hostExperience" className="text-gray-700 font-semibold">
                        Experience/Qualification
                      </Label>
                      <Input 
                        id="hostExperience" 
                        value={hostExperience} 
                        onChange={(e) => setHostExperience(e.target.value)} 
                        placeholder="e.g. 5+ years experience, Certified guide" 
                        className="py-4 px-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="serviceFee" className="text-gray-700 font-semibold flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                        Service Fee
                      </Label>
                      <Input 
                        id="serviceFee" 
                        value={serviceFee} 
                        onChange={(e) => setServiceFee(e.target.value)} 
                        placeholder="15" 
                        className="py-4 px-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="cancellationPolicy" className="text-gray-700 font-semibold">
                        Cancellation Policy
                      </Label>
                      <select 
                        id="cancellationPolicy" 
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        value={cancellationPolicy} 
                        onChange={(e) => setCancellationPolicy(e.target.value)}
                      >
                        <option value="flexible">✅ Flexible - Free cancellation 24h before</option>
                        <option value="moderate">⚠️ Moderate - Free cancellation 48h before</option>
                        <option value="strict">❌ Strict - No free cancellation</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-5 px-12 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Post...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5" />
                      <span>Publish Listing</span>
                    </div>
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