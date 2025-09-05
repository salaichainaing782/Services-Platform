import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

type CategoryKey = 'marketplace' | 'secondhand' | 'jobs' | 'travel';

const categoryOptions: { value: CategoryKey; label: string }[] = [
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'secondhand', label: 'Second-hand' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'travel', label: 'Travel' },
];

const PostAdPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    setError('');
    setSuccess('');
    if (!isAuthenticated) {
      setError('Please login to post.');
      return;
    }

    if (!title || !description || !price || !image || !category) {
      setError('Please fill all required fields.');
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
      setSuccess('Post created successfully.');
      // Simple reset; keep category selection
      setTitle('');
      setDescription('');
      setPrice('');
      setImage('');
      setLocation('');
      setSalary('');
      setDuration('');
    } catch (err: any) {
      setError(err?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create a new post</CardTitle>
            <CardDescription>Marketplace, Second-hand, Jobs, or Travel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryKey)}
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe your item, job, or trip..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $250 or Negotiable" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min={0} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value || '0', 10))} />
                </div>
              </div>

              {showCondition && (
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <select
                    id="condition"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                    <Label htmlFor="jobType">Job type</Label>
                    <select id="jobType" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience</Label>
                    <select id="experience" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={experience} onChange={(e) => setExperience(e.target.value)}>
                      <option value="entry">Entry</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. $60k - $80k" />
                  </div>
                </div>
              )}

              {showTravelFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tripType">Trip Type</Label>
                    <select id="tripType" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={tripType} onChange={(e) => setTripType(e.target.value)}>
                      <option value="flights">Flights</option>
                      <option value="hotels">Hotels</option>
                      <option value="packages">Packages</option>
                      <option value="activities">Activities</option>
                      <option value="transport">Transport</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 5 days / 4 nights" />
                  </div>
                </div>
              )}

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
              {success && <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md">{success}</div>}

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Posting...' : 'Post'}
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


