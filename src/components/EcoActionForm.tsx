import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EcoActionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const actionTypes = [
  { value: 'recycling', label: 'Recycling', points: 15 },
  { value: 'energy_saving', label: 'Energy Saving', points: 20 },
  { value: 'water_conservation', label: 'Water Conservation', points: 18 },
  { value: 'sustainable_transport', label: 'Sustainable Transport', points: 25 },
  { value: 'waste_reduction', label: 'Waste Reduction', points: 22 },
  { value: 'tree_planting', label: 'Tree Planting', points: 30 },
  { value: 'composting', label: 'Composting', points: 20 },
  { value: 'green_shopping', label: 'Green Shopping', points: 15 },
  { value: 'education', label: 'Environmental Education', points: 25 },
  { value: 'community', label: 'Community Action', points: 35 }
];

export const EcoActionForm = ({ isOpen, onClose, onSuccess }: EcoActionFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    action_type: '',
    title: '',
    description: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const selectedActionType = actionTypes.find(type => type.value === formData.action_type);
      const points = selectedActionType?.points || 10;

      // Insert the eco action
      const { error: actionError } = await supabase
        .from('eco_actions')
        .insert({
          user_id: user.id,
          action_type: formData.action_type,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          points_earned: points,
          status: 'completed'
        });

      if (actionError) throw actionError;

      // Update eco pet stats
      const { error: petError } = await supabase.rpc('update_eco_pet_stats', {
        _user_id: user.id,
        _points: points
      });

      if (petError) throw petError;

      toast({
        title: "Action Recorded!",
        description: `Great job! You earned ${points} eco points for this action.`
      });

      // Reset form
      setFormData({
        action_type: '',
        title: '',
        description: '',
        location: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Error recording action:', error);
      toast({
        title: "Error",
        description: "Failed to record your eco action",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Eco Action</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action_type">Action Type</Label>
            <Select 
              value={formData.action_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, action_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} ({type.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief title for your action"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you did and its environmental impact"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="Where did this action take place?"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.action_type || !formData.title} className="flex-1">
              {loading ? 'Recording...' : 'Record Action'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};