import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  X, 
  MapPin, 
  Calendar, 
  Camera,
  Clock,
  AlertCircle
} from 'lucide-react';
import PhotoSubmissionModal from './PhotoSubmissionModal';
import { Database } from '@/integrations/supabase/types';

type Challenge = Database['public']['Tables']['eco_challenges']['Row'];
type ChallengeSubmission = Database['public']['Tables']['challenge_submissions']['Row'];

interface ChallengeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  onSubmissionComplete?: () => void;
}

const ChallengeSubmissionModal: React.FC<ChallengeSubmissionModalProps> = ({
  isOpen,
  onClose,
  challenge,
  onSubmissionComplete
}) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && user) {
      fetchUserSubmissions();
    }
  }, [isOpen, user]);

  const fetchUserSubmissions = async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select('*')
        .eq('challenge_id', challenge.id)
        .eq('user_id', user.id);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handlePhotoSubmission = async (submissionData: {
    submission_text: string;
    photo_urls: string[];
    location?: { lat: number; lng: number; address: string };
  }) => {
    if (!user || !session) return;

    try {
      setLoading(true);

      // First, get the participation ID
      const { data: participation, error: participationError } = await supabase
        .from('challenge_participations')
        .select('id')
        .eq('challenge_id', challenge.id)
        .eq('user_id', user.id)
        .single();

      if (participationError) throw participationError;

      // Create the submission
      const { error } = await supabase
        .from('challenge_submissions')
        .insert([{
          challenge_id: challenge.id,
          participation_id: participation.id,
          user_id: user.id,
          submission_text: submissionData.submission_text,
          photo_urls: submissionData.photo_urls,
          submission_location_lat: submissionData.location?.lat,
          submission_location_lng: submissionData.location?.lng,
          submission_location_address: submissionData.location?.address,
          verification_status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Submission Complete!",
        description: "Your challenge submission has been sent for verification.",
      });

      await fetchUserSubmissions();
      onSubmissionComplete?.();
      setShowPhotoModal(false);
      
    } catch (error) {
      console.error('Error submitting challenge:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const hasApprovedSubmission = submissions.some(s => s.verification_status === 'approved');
  const canSubmit = !hasApprovedSubmission && new Date(challenge.end_date) > new Date();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              Submit Challenge: {challenge.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Challenge Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Challenge Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{challenge.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{challenge.challenge_type}</Badge>
                  <Badge>{challenge.points_reward} points</Badge>
                  {challenge.location_address && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {challenge.location_address}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Ends {new Date(challenge.end_date).toLocaleDateString()}
                  </Badge>
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <h4 className="font-medium">Requirements:</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {challenge.verification_photos_required && (
                      <div className="flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        Photo verification required
                      </div>
                    )}
                    {challenge.requires_location_verification && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Location verification required
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Existing Submissions */}
            {submissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Submissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(submission.verification_status)}>
                          {getStatusIcon(submission.verification_status)}
                          <span className="ml-1 capitalize">{submission.verification_status}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{submission.submission_text}</p>
                      {submission.verification_notes && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <strong>Verification Notes:</strong> {submission.verification_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Submit New */}
            <div className="space-y-4">
              {canSubmit ? (
                <>
                  {challenge.verification_photos_required ? (
                    <Button 
                      onClick={() => setShowPhotoModal(true)}
                      className="w-full"
                      disabled={loading}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Submit with Photos
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handlePhotoSubmission({ submission_text: 'Challenge completed', photo_urls: [] })}
                      className="w-full"
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {hasApprovedSubmission 
                      ? "You have already completed this challenge!" 
                      : "This challenge has ended."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Submission Modal */}
      {showPhotoModal && (
        <PhotoSubmissionModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          challengeId={challenge.id}
          challengeTitle={challenge.title}
          requiresLocation={challenge.requires_location_verification || false}
          onSubmit={handlePhotoSubmission}
        />
      )}
    </>
  );
};

export default ChallengeSubmissionModal;
