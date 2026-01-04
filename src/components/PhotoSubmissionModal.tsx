import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Upload, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PhotoSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  challengeTitle: string;
  requiresLocation: boolean;
  onSubmit: (data: {
    submission_text: string;
    photo_urls: string[];
    location?: { lat: number; lng: number; address: string };
  }) => Promise<void>;
}

const PhotoSubmissionModal: React.FC<PhotoSubmissionModalProps> = ({
  isOpen,
  onClose,
  challengeId,
  challengeTitle,
  requiresLocation,
  onSubmit
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Google Maps Geocoding API to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyD6zAtehiPdHQ1DwnOGvpZw3viVtTb0Sn0`
          );
          const data = await response.json();
          
          const address = data.results[0]?.formatted_address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setLocation({
            lat: latitude,
            lng: longitude,
            address
          });
          
          toast({
            title: "Location captured!",
            description: `Location: ${address}`,
          });
        } catch (error) {
          console.error('Geocoding error:', error);
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location Error",
          description: "Unable to get your current location. Please try again.",
          variant: "destructive",
        });
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handlePhotoSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setPhotos(prev => [...prev, ...validFiles]);
    
    // Generate preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotoUrls(prev => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(photoUrls[index]);
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${userId}/${challengeId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('challenge-photos')
        .upload(fileName, photo);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('challenge-photos')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      toast({
        title: "Missing description",
        description: "Please provide a description of your submission.",
        variant: "destructive",
      });
      return;
    }
    
    if (photos.length === 0) {
      toast({
        title: "Missing photos",
        description: "Please upload at least one photo.",
        variant: "destructive",
      });
      return;
    }
    
    if (requiresLocation && !location) {
      toast({
        title: "Location required",
        description: "Please capture your current location for this challenge.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const uploadedPhotoUrls = await uploadPhotos();
      
      await onSubmit({
        submission_text: submissionText,
        photo_urls: uploadedPhotoUrls,
        location: location || undefined
      });
      
      // Reset form
      setSubmissionText('');
      setPhotos([]);
      setPhotoUrls([]);
      setLocation(null);
      
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Challenge: {challengeTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you did for this challenge..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Photos</Label>
            <div className="mt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelection}
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
              
              {photoUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {requiresLocation && (
            <div>
              <Label>Location Verification</Label>
              <div className="mt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {gettingLocation ? 'Getting Location...' : 'Capture Current Location'}
                </Button>
                
                {location && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <strong>Location:</strong> {location.address}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoSubmissionModal;