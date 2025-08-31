import React, { useState } from 'react';
import { Search, MapPin, Clock, DollarSign, Briefcase, Building } from 'lucide-react';
import { SearchFilters } from '../components/SearchFilters';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export const JobsPage: React.FC = () => {
  const [sortBy, setSortBy] = useState('newest');

  // Sample job data
  const jobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $160k',
      posted: '2 days ago',
      description: 'Join our team to build cutting-edge web applications using React, TypeScript, and modern tools.',
      tags: ['React', 'TypeScript', 'Remote OK'],
      featured: true
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$100k - $140k',
      posted: '1 day ago',
      description: 'Lead product strategy and work with cross-functional teams to deliver amazing user experiences.',
      tags: ['Product Strategy', 'Agile', 'B2B']
    },
    {
      id: '3',
      title: 'UX/UI Designer',
      company: 'Design Studio',
      location: 'Remote',
      type: 'Contract',
      salary: '$80 - $120/hr',
      posted: '3 days ago',
      description: 'Create beautiful and intuitive user interfaces for mobile and web applications.',
      tags: ['Figma', 'User Research', 'Mobile Design']
    },
    {
      id: '4',
      title: 'Data Scientist',
      company: 'AI Solutions',
      location: 'Boston, MA',
      type: 'Full-time',
      salary: '$110k - $150k',
      posted: '4 days ago',
      description: 'Analyze complex datasets and build machine learning models to drive business insights.',
      tags: ['Python', 'Machine Learning', 'SQL'],
      featured: true
    },
    {
      id: '5',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$105k - $135k',
      posted: '5 days ago',
      description: 'Manage cloud infrastructure and implement CI/CD pipelines for scalable applications.',
      tags: ['AWS', 'Docker', 'Kubernetes']
    },
    {
      id: '6',
      title: 'Marketing Specialist',
      company: 'Growth Co.',
      location: 'Austin, TX',
      type: 'Part-time',
      salary: '$50k - $70k',
      posted: '1 week ago',
      description: 'Drive digital marketing campaigns and analyze performance metrics to optimize growth.',
      tags: ['Digital Marketing', 'Analytics', 'Content']
    }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'salary-high', label: 'Salary: High to Low' },
    { value: 'salary-low', label: 'Salary: Low to High' },
    { value: 'company', label: 'Company A-Z' },
    { value: 'relevance', label: 'Most Relevant' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
              <p className="text-muted-foreground">Find your dream job from top companies worldwide</p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  className="pl-10 pr-4 py-3 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Job Filters
              </h3>
              <SearchFilters category="jobs" />
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="text-sm text-muted-foreground">
                Showing {jobs.length} job opportunities
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Jobs List */}
            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold hover:text-primary cursor-pointer">
                            {job.title}
                          </h3>
                          {job.featured && (
                            <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <Building className="h-4 w-4 mr-1" />
                          <span className="mr-4">{job.company}</span>
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.location}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{job.salary}</span>
                          </div>
                          <span>Posted {job.posted}</span>
                        </div>
                      </div>
                      
                      <Button className="flex-shrink-0">
                        Apply Now
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};