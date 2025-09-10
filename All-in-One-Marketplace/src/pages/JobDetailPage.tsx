import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share, MessageCircle, User, Send, ThumbsUp, MapPin, Clock, Star, Calendar, Briefcase, DollarSign, Building, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import RatingComponent from '../components/RatingComponent';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyInput, setShowReplyInput] = useState<{ [key: string]: boolean }>({});
  const [isLiked, setIsLiked] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null as File | null,
    expectedSalary: '',
    availableStartDate: ''
  });
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (id) {
      loadJob();
      loadComments();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobData = await apiClient.getProductById(id!);
      setJob(jobData);
      setIsLiked(jobData.isLiked || (user?.id && jobData.likes?.includes(user.id)) || false);
      
      // Increment view count
      try {
        await apiClient.incrementProductViews(id!);
        setJob(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
      } catch (e) {
        console.error('Failed to increment view count:', e);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const commentsData = await apiClient.getComments(id!);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('common.justNow');
    if (diffInMinutes < 60) return t('common.minutesAgo', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('common.hoursAgo', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('common.daysAgo', { count: diffInDays });
    
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert(t('auth.loginRequired'));
      return;
    }
    try {
      const result = await apiClient.likeProduct(id!);
      setJob(prev => ({ 
        ...prev, 
        likesCount: result.likes, 
        isLiked: result.isLiked,
        likes: result.isLiked 
          ? [...(prev.likes || []), user?.id] 
          : (prev.likes || []).filter(likeId => likeId !== user?.id)
      }));
      setIsLiked(result.isLiked);
    } catch (error) {
      console.error('Failed to like job:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!isAuthenticated || !commentText.trim()) return;
    try {
      const newComment = await apiClient.addComment(id!, commentText.trim());
      setComments(prev => [newComment, ...prev]);
      setJob(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!isAuthenticated) return;
    try {
      const result = await apiClient.likeComment(commentId);
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, likes: Array(result.likes).fill(null), isLiked: result.isLiked }
          : {
              ...comment,
              replies: comment.replies?.map((reply: any) => 
                reply._id === commentId 
                  ? { ...reply, likes: Array(result.likes).fill(null), isLiked: result.isLiked }
                  : reply
              ) || []
            }
      ));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!isAuthenticated || !replyText[parentId]?.trim()) return;
    try {
      const newReply = await apiClient.addComment(id!, replyText[parentId].trim(), parentId);
      setComments(prev => prev.map(comment => 
        comment._id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      setReplyText(prev => ({ ...prev, [parentId]: '' }));
      setShowReplyInput(prev => ({ ...prev, [parentId]: false }));
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const handleJobApplication = async () => {
    if (!isAuthenticated) {
      alert(t('auth.loginRequired'));
      return;
    }
    
    if (!applicationData.coverLetter.trim()) {
      alert('Please write a cover letter');
      return;
    }

    setApplicationStatus('submitting');
    
    try {
      console.log('Submitting application for job:', id);
      const result = await apiClient.applyForJob(id!, {
        coverLetter: applicationData.coverLetter,
        resume: applicationData.resume || undefined,
        expectedSalary: applicationData.expectedSalary || undefined,
        availableStartDate: applicationData.availableStartDate || undefined
      });
      
      console.log('Application submitted successfully:', result);
      setApplicationStatus('success');
      setTimeout(() => {
        setShowApplicationModal(false);
        setApplicationStatus('idle');
        setApplicationData({
          coverLetter: '',
          resume: null,
          expectedSalary: '',
          availableStartDate: ''
        });
      }, 2000);
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      alert('Application submission failed: ' + (error.message || 'Unknown error'));
      setApplicationStatus('error');
      setTimeout(() => setApplicationStatus('idle'), 3000);
    }
  };

  const getJobTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-purple-100 text-purple-800',
      'remote': 'bg-orange-100 text-orange-800',
      'internship': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceLevel = (level: string) => {
    const levels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive Level'
    };
    return levels[level as keyof typeof levels] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
          <button 
            onClick={() => navigate('/jobs')}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/jobs')}
              className="flex items-center text-gray-600 hover:text-orange-600 transition-colors bg-white px-4 py-2 rounded-lg border hover:border-orange-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Jobs
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold">{job.rating || '0.0'}</span>
                <span className="text-gray-500 ml-1">({job.reviews || 0})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(job.jobType)}`}>
                      {job.jobType?.replace('-', ' ').toUpperCase()}
                    </span>
                    {job.experience && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {getExperienceLevel(job.experience)}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{job.title}</h1>
                  
                  <div className="flex items-center space-x-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 mr-2 text-orange-500" />
                      <span className="font-medium">{job.seller?.firstName} {job.seller?.lastName}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-orange-500" />
                      <span>{formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-4xl font-bold text-orange-600">
                    ${job.salary || job.price}
                  </div>
                  <div className="text-gray-500">
                    {job.jobType === 'full-time' || job.jobType === 'part-time' ? 'per month' : 'per project'}
                  </div>
                </div>
              </div>

              {/* Social Actions */}
              <div className="flex items-center space-x-4 py-6 border-y">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                    isLiked 
                      ? 'bg-red-50 text-red-600 shadow-red-100' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  } shadow-sm hover:shadow-md`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-semibold">{job.likesCount || 0}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-semibold">{comments.length}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all">
                  <Share className="w-6 h-6" />
                  <span className="font-semibold">Share</span>
                </button>
              </div>

              {/* Job Description */}
              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Job Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Rating Section */}
              <div className="mt-8 border-t pt-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Company Reviews</h3>
                <RatingComponent 
                  productId={job._id || job.id}
                  currentRating={job.rating || 0}
                  totalReviews={job.totalReviews || 0}
                  onRatingUpdate={(rating, totalReviews) => {
                    setJob(prev => prev ? { ...prev, rating, totalReviews } : null);
                  }}
                />
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center text-gray-900">
                <MessageCircle className="w-6 h-6 mr-2 text-orange-500" />
                Reviews & Questions ({comments.length})
              </h3>

              {/* Add Comment */}
              {isAuthenticated ? (
                <div className="flex space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Ask a question about this job..."
                      className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 pr-16 text-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && commentText.trim()) {
                          handleCommentSubmit();
                        }
                      }}
                    />
                    <button 
                      onClick={handleCommentSubmit}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
                      disabled={!commentText.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl mb-8 border-2 border-dashed border-gray-200">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-lg font-medium">Sign in to ask questions</p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment._id} className="flex space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {comment.userId?.avatar ? (
                        <img src={comment.userId.avatar} alt={comment.userId.firstName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-semibold text-gray-900">
                          {comment.userId?.firstName} {comment.userId?.lastName}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl px-6 py-4 mb-4 shadow-sm">
                        <p className="text-gray-800 leading-relaxed">{comment.text}</p>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <button 
                          onClick={() => handleCommentLike(comment._id)}
                          className={`flex items-center space-x-2 transition-colors ${
                            comment.isLiked ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'
                          }`}
                        >
                          <ThumbsUp className={`w-5 h-5 ${comment.isLiked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{comment.likes?.length || 0}</span>
                        </button>
                        <button 
                          onClick={() => setShowReplyInput(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                          className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Replies */}
                      {comment.replies?.length > 0 && (
                        <div className="ml-8 mt-6 space-y-4 border-l-2 border-orange-200 pl-6">
                          {comment.replies.map((reply: any) => (
                            <div key={reply._id} className="flex space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-red-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-sm text-gray-900">{reply.userId?.firstName}</span>
                                  <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                </div>
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg px-4 py-3 mb-2">
                                  <p className="text-sm text-gray-700">{reply.text}</p>
                                </div>
                                <button 
                                  onClick={() => handleCommentLike(reply._id)}
                                  className={`flex items-center space-x-1 text-xs transition-colors ${
                                    reply.isLiked ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'
                                  }`}
                                >
                                  <ThumbsUp className={`w-4 h-4 ${reply.isLiked ? 'fill-current' : ''}`} />
                                  <span>{reply.likes?.length || 0}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {showReplyInput[comment._id] && (
                        <div className="ml-8 mt-4 flex space-x-3">
                          <input
                            type="text"
                            value={replyText[comment._id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                            placeholder="Write a reply..."
                            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                          />
                          <button 
                            onClick={() => handleReplySubmit(comment._id)}
                            className="bg-orange-500 text-white px-4 py-3 rounded-xl text-sm hover:bg-orange-600 transition-colors flex items-center"
                            disabled={!replyText[comment._id]?.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Apply for this Job</h3>
              
              <div className="space-y-5 mb-6">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                  <div>
                    <div className="font-semibold">Salary</div>
                    <div className="text-gray-600">${job.salary || job.price}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <Briefcase className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold">Job Type</div>
                    <div className="text-gray-600">{job.jobType?.replace('-', ' ')}</div>
                  </div>
                </div>
                
                {job.experience && (
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <Star className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-semibold">Experience</div>
                      <div className="text-gray-600">{getExperienceLevel(job.experience)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Employer Information */}
              <div className="border-t pt-6 mb-6">
                <h4 className="font-semibold mb-4 text-gray-900">Employer</h4>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                    {job.seller?.avatar ? (
                      <img src={job.seller.avatar} alt={job.seller.firstName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold">{job.seller?.firstName} {job.seller?.lastName}</div>
                    <div className="text-sm text-gray-600">Employer</div>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm">{job.rating || '0.0'} ({job.totalReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Call</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Message</span>
                  </button>
                </div>
              </div>

              {/* Apply Button */}
              <button 
                onClick={() => setShowApplicationModal(true)}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Apply Now
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Your application will be sent directly to the employer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
                <button 
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {applicationStatus === 'success' ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Application Submitted!</h3>
                  <p className="text-gray-600">Your application has been sent to the employer. They will contact you soon.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                      placeholder="Tell the employer why you're perfect for this job..."
                      rows={6}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume/CV
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setApplicationData(prev => ({ ...prev, resume: e.target.files?.[0] || null }))}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Salary
                      </label>
                      <input
                        type="number"
                        value={applicationData.expectedSalary}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                        placeholder="$0"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Start Date
                      </label>
                      <input
                        type="date"
                        value={applicationData.availableStartDate}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, availableStartDate: e.target.value }))}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={() => setShowApplicationModal(false)}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleJobApplication}
                      disabled={applicationStatus === 'submitting' || !applicationData.coverLetter.trim()}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {applicationStatus === 'submitting' ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>

                  {applicationStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <span>Failed to submit application. Please try again.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;