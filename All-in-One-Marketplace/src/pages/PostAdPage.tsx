import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { Check, Briefcase, Award, Star, Zap, ChevronDown, DollarSign, MapPin, Image as ImageIcon, Tag, FileText, Calendar, Clock, Users, User, Shield, CheckIcon } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { useNotificationHelpers } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

type CategoryKey = 'marketplace' | 'secondhand' | 'jobs' | 'services';

const PostAdPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { success, error, warning } = useNotificationHelpers();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Form State
  const [category, setCategory] = useState<CategoryKey>('marketplace');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState<number>(1);

  // Category-specific State
  const [condition, setCondition] = useState('good');
  const [jobType, setJobType] = useState('full-time');
  const [experience, setExperience] = useState('entry');
  const [salary, setSalary] = useState('');
  const [serviceType, setServiceType] = useState('consulting');
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
  const showServiceFields = useMemo(() => category === 'services', [category]);

  const categoryOptions = [
    { value: 'marketplace', label: t('postAd.marketplace'), icon: <Zap className="w-5 h-5" />, color: 'blue' },
    { value: 'secondhand', label: t('postAd.secondhand'), icon: <Award className="w-5 h-5" />, color: 'green' },
    { value: 'jobs', label: t('postAd.jobs'), icon: <Briefcase className="w-5 h-5" />, color: 'purple' },
    { value: 'services', label: t('postAd.services'), icon: <Star className="w-5 h-5" />, color: 'amber' },
  ];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setImage('');
    setLocation('');
    setQuantity(1);
    setCondition('good');
    setJobType('full-time');
    setExperience('entry');
    setSalary('');
    setServiceType('consulting');
    setDuration('');
    setGroupSize('');
    setAvailability('daily');
    setIncluded('');
    setToBring('');
    setHostName('');
    setHostExperience('');
    setCancellationPolicy('flexible');
    setServiceFee('15');
    setActiveStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      error(t('postAd.authRequired'), t('postAd.loginToPost'));
      return;
    }

    if (!title || !description || (category !== 'jobs' && category !== 'services' && !price) || !image || !category) {
      warning(t('postAd.missingFields'), t('postAd.fillAllRequired'));
      return;
    }

    const payload: any = {
      title,
      description,
      image,
      category,
      location,
      quantity,
    };

    if (category !== 'jobs' && category !== 'services') {
      payload.price = price;
    }

    if (showCondition) payload.condition = condition;
    if (showJobFields) {
      payload.jobType = jobType;
      payload.experience = experience;
      payload.salary = salary;
    }
    if (showServiceFields) {
      payload.serviceType = serviceType;
      payload.duration = duration;
      payload.groupSize = groupSize;
      payload.availability = availability;
      payload.included = included;
      payload.toBring = toBring;
      payload.hostName = hostName;
      payload.hostExperience = hostExperience;
      payload.cancellationPolicy = cancellationPolicy;
    }

    try {
      setLoading(true);
      await apiClient.createProduct(payload);
      success(t('postAd.postCreated'), t('postAd.publishedSuccessfully'));
      resetForm();
    } catch (err: any) {
      console.error('Failed to create post:', err);
      error(t('postAd.postCreationFailed'), err?.message || t('postAd.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (activeStep < 3) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Choose Category</h2>
              <p className="text-gray-500">Select the most relevant category for your listing</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setCategory(opt.value as CategoryKey)}
                  className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center space-x-4 ${
                    category === opt.value
                      ? `border-${opt.color}-500 bg-${opt.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-lg bg-${opt.color}-100`}>
                    {React.cloneElement(opt.icon, { className: `w-6 h-6 text-${opt.color}-600` })}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{opt.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {opt.value === 'marketplace' && 'New products and items'}
                      {opt.value === 'secondhand' && 'Used items in good condition'}
                      {opt.value === 'jobs' && 'Employment opportunities'}
                      {opt.value === 'services' && 'Offer your skills and expertise'}
                    </p>
                  </div>
                  {category === opt.value && (
                    <div className="ml-auto bg-blue-500 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
              >
                Continue
                <CheckIcon className="ml-2 h-4 w-4 transform rotate-60" />
              </Button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
              <p className="text-gray-500">Provide essential details about your listing</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-gray-700 mb-2 block font-medium">
                  <Tag className="inline-block w-4 h-4 mr-2" />
                  {t('postAd.titleLabel')} *
                </Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder={t('postAd.titlePlaceholder')} 
                  // className="py-3 px-4 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required 
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-gray-700 mb-2 block font-medium">
                  <FileText className="inline-block w-4 h-4 mr-2" />
                  {t('postAd.descriptionLabel')} *
                </Label>
                <textarea 
                  id="description" 
                  rows={4} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" 
                  placeholder={t('postAd.descriptionPlaceholder')} 
                  required 
                />
              </div>
              
              {category !== 'jobs' && category !== 'services' && (
                <div>
                  <Label htmlFor="price" className="text-gray-700 mb-2 block font-medium">
                    <DollarSign className="inline-block w-4 h-4 mr-2" />
                    {t('postAd.priceLabel')} *
                  </Label>
                  <div className="relative">
                    <Input 
                      id="price" 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="quantity" className="text-gray-700 mb-2 block font-medium">
                  {t('postAd.quantityLabel')}
                </Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min={1} 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))} 
                  // className="py-3 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div>
                <Label htmlFor="location" className="text-gray-700 mb-2 block font-medium">
                  <MapPin className="inline-block w-4 h-4 mr-2" />
                  {t('postAd.locationLabel')}
                </Label>
                <div className="relative">
                  {/* <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
                  <Input 
                    id="location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder={t('postAd.locationPlaceholder')} 
                    // className="pl-11 py-3 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-gray-700 mb-2 block font-medium">
                  <ImageIcon className="inline-block w-4 h-4 mr-2" />
                  {t('postAd.productImageLabel')} *
                </Label>
                <ImageUpload onImageChange={setImage} currentImage={image} />
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button 
                onClick={prevStep}
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg"
              >
                Back
              </Button>
              <Button 
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
              >
                Continue
                <CheckIcon className="ml-2 h-4 w-4 transform rotate-60" />
              </Button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Additional Details</h2>
              <p className="text-gray-500">Add specific information based on your category</p>
            </div>
            
            {/* Item Condition */}
            {showCondition && (
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-500" />
                  {t('postAd.itemCondition')}
                </h3>
                <div>
                  <Label htmlFor="condition" className="text-gray-700 mb-2 block">
                    {t('postAd.conditionLabel')}
                  </Label>
                  <div className="relative">
                    <select 
                      id="condition" 
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                      value={condition} 
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <option value="new"> {t('postAd.new')}</option>
                      <option value="like-new"> {t('postAd.likeNew')}</option>
                      <option value="good"> {t('postAd.good')}</option>
                      <option value="fair"> {t('postAd.fair')}</option>
                      <option value="poor"> {t('postAd.poor')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Job Details */}
            {showJobFields && (
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                  {t('postAd.jobDetails')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobType" className="text-gray-700 mb-2 block">
                      {t('postAd.jobTypeLabel')}
                    </Label>
                    <div className="relative">
                      <select 
                        id="jobType" 
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                        value={jobType} 
                        onChange={(e) => setJobType(e.target.value)}
                      >
                        <option value="full-time"> {t('postAd.fullTime')}</option>
                        <option value="part-time"> {t('postAd.partTime')}</option>
                        <option value="contract"> {t('postAd.contract')}</option>
                        <option value="remote"> {t('postAd.remote')}</option>
                        <option value="internship"> {t('postAd.internship')}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="experience" className="text-gray-700 mb-2 block">
                      {t('postAd.experienceLabel')}
                    </Label>
                    <div className="relative">
                      <select 
                        id="experience" 
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                        value={experience} 
                        onChange={(e) => setExperience(e.target.value)}
                      >
                        <option value="entry"> {t('postAd.entry')}</option>
                        <option value="mid"> {t('postAd.mid')}</option>
                        <option value="senior"> {t('postAd.senior')}</option>
                        <option value="executive"> {t('postAd.executive')}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="salary" className="text-gray-700 mb-2 block">
                      {t('postAd.salaryLabel')}
                    </Label>
                    <Input 
                      id="salary" 
                      value={salary} 
                      onChange={(e) => setSalary(e.target.value)} 
                      placeholder={t('postAd.salaryPlaceholder')} 
                      // className="py-3 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Service Details */}
            {showServiceFields && (
              <div className="space-y-5">
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-amber-500" />
                    {t('postAd.serviceDetails')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="md:col-span-2">
                      <Label htmlFor="serviceType" className="text-gray-700 mb-2 block">
                        {t('postAd.serviceTypeLabel')}
                      </Label>
                      <div className="relative">
                        <select 
                          id="serviceType" 
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                          value={serviceType} 
                          onChange={(e) => setServiceType(e.target.value)}
                        >
                          <option value="consulting"> {t('postAd.consulting')}</option>
                          <option value="design"> {t('postAd.design')}</option>
                          <option value="development"> {t('postAd.development')}</option>
                          <option value="marketing"> {t('postAd.marketing')}</option>
                          <option value="education"> {t('postAd.education')}</option>
                          <option value="travel"> {t('postAd.travel')}</option>
                          <option value="hotel"> {t('postAd.hotel')}</option>
                          <option value="accommodation"> {t('postAd.accommodation')}</option>
                          <option value="bar"> {t('postAd.bar')}</option>
                          <option value="ktv"> {t('postAd.ktv')}</option>
                          <option value="massage"> {t('postAd.massage')}</option>
                          <option value="gym"> {t('postAd.gym')}</option>
                          <option value="tea"> {t('postAd.tea')}</option>
                          <option value="coffee"> {t('postAd.coffee')}</option>
                          <option value="restaurant"> {t('postAd.restaurant')}</option>
                          <option value="other"> {t('postAd.other')}</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Service-specific fields */}
                  {(serviceType === 'consulting' || serviceType === 'design' || serviceType === 'development' || serviceType === 'marketing' || serviceType === 'education') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <Label htmlFor="duration" className="text-gray-700 mb-2 block">
                          <Clock className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.durationLabel')}
                        </Label>
                        <Input 
                          id="duration" 
                          value={duration} 
                          onChange={(e) => setDuration(e.target.value)} 
                          placeholder={t('postAd.durationPlaceholder')} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="availability" className="text-gray-700 mb-2 block">
                          <Calendar className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.availabilityLabel')}
                        </Label>
                        <div className="relative">
                          <select 
                            id="availability" 
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                            value={availability} 
                            onChange={(e) => setAvailability(e.target.value)}
                          >
                            <option value="daily"> {t('postAd.daily')}</option>
                            <option value="weekends"> {t('postAd.weekendsOnly')}</option>
                            <option value="weekdays"> {t('postAd.weekdaysOnly')}</option>
                            <option value="appointment"> {t('postAd.byAppointment')}</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {serviceType === 'travel' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <Label htmlFor="duration" className="text-gray-700 mb-2 block">
                          <Clock className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.durationLabel')}
                        </Label>
                        <Input 
                          id="duration" 
                          value={duration} 
                          onChange={(e) => setDuration(e.target.value)} 
                          placeholder={t('postAd.durationPlaceholder')} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="groupSize" className="text-gray-700 mb-2 block">
                          <Users className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.groupSizeLabel')}
                        </Label>
                        <Input 
                          id="groupSize" 
                          value={groupSize} 
                          onChange={(e) => setGroupSize(e.target.value)} 
                          placeholder={t('postAd.groupSizePlaceholder')} 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="included" className="text-gray-700 mb-2 block">
                          {t('postAd.whatsIncluded')}
                        </Label>
                        <textarea 
                          id="included" 
                          rows={2} 
                          value={included} 
                          onChange={(e) => setIncluded(e.target.value)} 
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" 
                          placeholder={t('postAd.includedPlaceholder')} 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="toBring" className="text-gray-700 mb-2 block">
                          {t('postAd.whatToBring')}
                        </Label>
                        <textarea 
                          id="toBring" 
                          rows={2} 
                          value={toBring} 
                          onChange={(e) => setToBring(e.target.value)} 
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" 
                          placeholder={t('postAd.toBringPlaceholder')} 
                        />
                      </div>
                    </div>
                  )}
                  
                  {(serviceType === 'hotel' || serviceType === 'accommodation') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <Label htmlFor="availability" className="text-gray-700 mb-2 block">
                          <Calendar className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.availabilityLabel')}
                        </Label>
                        <div className="relative">
                          <select 
                            id="availability" 
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                            value={availability} 
                            onChange={(e) => setAvailability(e.target.value)}
                          >
                            <option value="daily"> {t('postAd.daily')}</option>
                            <option value="seasonal"> {t('postAd.seasonal')}</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="groupSize" className="text-gray-700 mb-2 block">
                          <Users className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.roomCapacity')}
                        </Label>
                        <Input 
                          id="groupSize" 
                          value={groupSize} 
                          onChange={(e) => setGroupSize(e.target.value)} 
                          placeholder={t('postAd.roomCapacityPlaceholder')} 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="included" className="text-gray-700 mb-2 block">
                          {t('postAd.amenitiesIncluded')}
                        </Label>
                        <textarea 
                          id="included" 
                          rows={2} 
                          value={included} 
                          onChange={(e) => setIncluded(e.target.value)} 
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" 
                          placeholder={t('postAd.amenitiesPlaceholder')} 
                        />
                      </div>
                    </div>
                  )}
                  
                  {(serviceType === 'bar' || serviceType === 'ktv') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <Label htmlFor="availability" className="text-gray-700 mb-2 block">
                          <Calendar className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.operatingHours')}
                        </Label>
                        <div className="relative">
                          <select 
                            id="availability" 
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                            value={availability} 
                            onChange={(e) => setAvailability(e.target.value)}
                          >
                            <option value="daily"> {t('postAd.daily')}</option>
                            <option value="weekends"> {t('postAd.weekendsOnly')}</option>
                            <option value="weekdays"> {t('postAd.weekdaysOnly')}</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="groupSize" className="text-gray-700 mb-2 block">
                          <Users className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.capacity')}
                        </Label>
                        <Input 
                          id="groupSize" 
                          value={groupSize} 
                          onChange={(e) => setGroupSize(e.target.value)} 
                          placeholder={t('postAd.capacityPlaceholder')} 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="included" className="text-gray-700 mb-2 block">
                          {t('postAd.servicesFeatures')}
                        </Label>
                        <textarea 
                          id="included" 
                          rows={2} 
                          value={included} 
                          onChange={(e) => setIncluded(e.target.value)} 
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" 
                          placeholder={t('postAd.servicesFeaturesPlaceholder')} 
                        />
                      </div>
                    </div>
                  )}
                  
                  {serviceType === 'massage' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <Label htmlFor="duration" className="text-gray-700 mb-2 block">
                          <Clock className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.sessionDuration')}
                        </Label>
                        <Input 
                          id="duration" 
                          value={duration} 
                          onChange={(e) => setDuration(e.target.value)} 
                          placeholder={t('postAd.sessionDurationPlaceholder')} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="availability" className="text-gray-700 mb-2 block">
                          <Calendar className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.availabilityLabel')}
                        </Label>
                        <div className="relative">
                          <select 
                            id="availability" 
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                            value={availability} 
                            onChange={(e) => setAvailability(e.target.value)}
                          >
                            <option value="daily"> {t('postAd.daily')}</option>
                            <option value="appointment"> {t('postAd.byAppointment')}</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="included" className="text-gray-700 mb-2 block">
                          {t('postAd.massageTypes')}
                        </Label>
                        <textarea 
                          id="included" 
                          rows={2} 
                          value={included} 
                          onChange={(e) => setIncluded(e.target.value)} 
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" 
                          placeholder={t('postAd.massageTypesPlaceholder')} 
                        />
                      </div>
                    </div>
                  )}
                  
                  {serviceType === 'gym' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <Label htmlFor="availability" className="text-gray-700 mb-2 block">
                          <Calendar className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.operatingHours')}
                        </Label>
                        <div className="relative">
                          <select 
                            id="availability" 
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                            value={availability} 
                            onChange={(e) => setAvailability(e.target.value)}
                          >
                            <option value="daily"> {t('postAd.daily')}</option>
                            <option value="weekdays"> {t('postAd.weekdaysOnly')}</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="duration" className="text-gray-700 mb-2 block">
                          <Clock className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.membershipDuration')}
                        </Label>
                        <Input 
                          id="duration" 
                          value={duration} 
                          onChange={(e) => setDuration(e.target.value)} 
                          placeholder={t('postAd.membershipDurationPlaceholder')} 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="included" className="text-gray-700 mb-2 block">
                          {t('postAd.facilitiesEquipment')}
                        </Label>
                        <textarea 
                          id="included" 
                          rows={2} 
                          value={included} 
                          onChange={(e) => setIncluded(e.target.value)} 
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" 
                          placeholder={t('postAd.facilitiesEquipmentPlaceholder')} 
                        />
                      </div>
                    </div>
                  )}
                  
                  {(serviceType === 'tea' || serviceType === 'coffee' || serviceType === 'restaurant') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <Label htmlFor="availability" className="text-gray-700 mb-2 block">
                          <Calendar className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.operatingHours')}
                        </Label>
                        <div className="relative">
                          <select 
                            id="availability" 
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                            value={availability} 
                            onChange={(e) => setAvailability(e.target.value)}
                          >
                            <option value="daily"> {t('postAd.daily')}</option>
                            <option value="weekdays"> {t('postAd.weekdaysOnly')}</option>
                            <option value="weekends"> {t('postAd.weekendsOnly')}</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="groupSize" className="text-gray-700 mb-2 block">
                          <Users className="inline-block w-4 h-4 mr-1" />
                          {t('postAd.seatingCapacity')}
                        </Label>
                        <Input 
                          id="groupSize" 
                          value={groupSize} 
                          onChange={(e) => setGroupSize(e.target.value)} 
                          placeholder={t('postAd.seatingCapacityPlaceholder')} 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="included" className="text-gray-700 mb-2 block">
                          {t('postAd.menuSpecialties')}
                        </Label>
                        <textarea 
                          id="included" 
                          rows={2} 
                          value={included} 
                          onChange={(e) => setIncluded(e.target.value)} 
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" 
                          placeholder={t('postAd.menuSpecialtiesPlaceholder')} 
                        />
                      </div>
                      {serviceType === 'restaurant' && (
                        <div className="md:col-span-2">
                          <Label htmlFor="toBring" className="text-gray-700 mb-2 block">
                            {t('postAd.cuisineType')}
                          </Label>
                          <Input 
                            id="toBring" 
                            value={toBring} 
                            onChange={(e) => setToBring(e.target.value)} 
                            placeholder={t('postAd.cuisineTypePlaceholder')} 
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Common fields for service provider info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div>
                      <Label htmlFor="hostName" className="text-gray-700 mb-2 block">
                        <User className="inline-block w-4 h-4 mr-1" />
                        {serviceType === 'hotel' || serviceType === 'accommodation' ? t('postAd.propertyName') : 
                         serviceType === 'bar' || serviceType === 'ktv' ? t('postAd.businessName') :
                         serviceType === 'massage' ? t('postAd.spaTherapistName') :
                         serviceType === 'gym' ? t('postAd.gymName') :
                         serviceType === 'tea' || serviceType === 'coffee' || serviceType === 'restaurant' ? t('postAd.restaurantName') :
                         t('postAd.hostNameLabel')}
                      </Label>
                      <Input 
                        id="hostName" 
                        value={hostName} 
                        onChange={(e) => setHostName(e.target.value)} 
                        placeholder={serviceType === 'hotel' || serviceType === 'accommodation' ? t('postAd.propertyNamePlaceholder') :
                                   serviceType === 'bar' || serviceType === 'ktv' ? t('postAd.businessNamePlaceholder') :
                                   serviceType === 'massage' ? t('postAd.spaTherapistNamePlaceholder') :
                                   serviceType === 'gym' ? t('postAd.gymNamePlaceholder') :
                                   serviceType === 'tea' || serviceType === 'coffee' || serviceType === 'restaurant' ? t('postAd.restaurantNamePlaceholder') :
                                   t('postAd.hostNamePlaceholder')} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="hostExperience" className="text-gray-700 mb-2 block">
                        {serviceType === 'hotel' || serviceType === 'accommodation' ? t('postAd.starRating') :
                         serviceType === 'bar' || serviceType === 'ktv' ? t('postAd.yearsInBusiness') :
                         serviceType === 'massage' ? t('postAd.therapistExperience') :
                         serviceType === 'gym' ? t('postAd.certifications') :
                         serviceType === 'tea' || serviceType === 'coffee' || serviceType === 'restaurant' ? t('postAd.yearsInBusiness') :
                         t('postAd.hostExperienceLabel')}
                      </Label>
                      <Input 
                        id="hostExperience" 
                        value={hostExperience} 
                        onChange={(e) => setHostExperience(e.target.value)} 
                        placeholder={serviceType === 'hotel' || serviceType === 'accommodation' ? t('postAd.starRatingPlaceholder') :
                                   serviceType === 'bar' || serviceType === 'ktv' ? t('postAd.yearsInBusinessPlaceholder') :
                                   serviceType === 'massage' ? t('postAd.therapistExperiencePlaceholder') :
                                   serviceType === 'gym' ? t('postAd.certificationsPlaceholder') :
                                   serviceType === 'tea' || serviceType === 'coffee' || serviceType === 'restaurant' ? t('postAd.yearsInBusinessPlaceholder') :
                                   t('postAd.hostExperiencePlaceholder')} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cancellationPolicy" className="text-gray-700 mb-2 block">
                      <Shield className="inline-block w-4 h-4 mr-1" />
                      {t('postAd.cancellationPolicyLabel')}
                    </Label>
                    <div className="relative">
                      <select 
                        id="cancellationPolicy" 
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                        value={cancellationPolicy} 
                        onChange={(e) => setCancellationPolicy(e.target.value)}
                      >
                        <option value="flexible">{t('postAd.flexible')}</option>
                        <option value="moderate"> {t('postAd.moderate')}</option>
                        <option value="strict">{t('postAd.strict')}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-6">
              <Button 
                onClick={prevStep}
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t('postAd.publishing')}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="mr-2 h-5 w-5" />
                    {t('postAd.publishAd')}
                  </div>
                )}
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('postAd.title')}</h1>
          <p className="text-gray-600">{t('postAd.subtitle')}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-medium ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Category</div>
            <div className={`text-sm font-medium ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Details</div>
            <div className={`text-sm font-medium ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Additional Info</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(activeStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              {renderStep()}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostAdPage;