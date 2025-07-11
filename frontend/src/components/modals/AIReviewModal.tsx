import React from 'react';
import { X, Brain, Star, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { AIReviewResponse } from '@/services/aiReviewService';

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: AIReviewResponse | null;
  candidateName: string;
  jobTitle: string;
  isLoading: boolean;
}

const AIReviewModal: React.FC<AIReviewModalProps> = ({
  isOpen,
  onClose,
  review,
  candidateName,
  jobTitle,
  isLoading
}) => {
  if (!isOpen) return null;

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended': return 'bg-green-100 text-green-800';
      case 'recommended': return 'bg-blue-100 text-blue-800';
      case 'consider': return 'bg-yellow-100 text-yellow-800';
      case 'not_recommended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended': return 'Highly Recommended';
      case 'recommended': return 'Recommended';
      case 'consider': return 'Consider';
      case 'not_recommended': return 'Not Recommended';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Review</h2>
              <p className="text-sm text-gray-600">{candidateName} - {jobTitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="small"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Analyzing candidate...</span>
            </div>
          ) : review ? (
            <div className="space-y-6">
              {/* Overall Assessment */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Overall Assessment</h3>
                  <Badge className={getRecommendationColor(review.recommendation)}>
                    {getRecommendationText(review.recommendation)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{review.overallScore}/100</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{review.confidence}%</div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                </div>
              </Card>

              {/* Key Strengths */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Key Strengths
                </h3>
                <ul className="space-y-2">
                  {review.keyStrengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Potential Concerns */}
              {review.potentialConcerns.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Potential Concerns
                  </h3>
                  <ul className="space-y-2">
                    {review.potentialConcerns.map((concern, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Interview Recommendations */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Recommendations</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {review.interviewFocus.map((focus, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Suggested Questions</h4>
                    <ul className="space-y-1">
                      {review.questionsToAsk.slice(0, 3).map((question, index) => (
                        <li key={index} className="text-sm text-gray-700">• {question}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No review data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIReviewModal;
