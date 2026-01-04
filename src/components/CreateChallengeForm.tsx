import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, MapPin, Camera, Target } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import GoogleMapPicker from './GoogleMapPicker';
import { useChallenges } from '@/hooks/useChallenges';
import { useToast } from '@/hooks/use-toast';

const challengeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  challenge_type: z.string().min(1, 'Challenge type is required'),
  target_value: z.number().min(1, 'Target value must be at least 1'),
  points_reward: z.number().min(1, 'Points reward must be at least 1'),
  end_date: z.date(),
  location_radius_km: z.number().min(1).max(100).optional(),
  requires_location_verification: z.boolean().default(false),
  verification_photos_required: z.boolean().default(false)
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface CreateChallengeFormProps {
  onSuccess?: () => void;
}

const CreateChallengeForm: React.FC<CreateChallengeFormProps> = ({ onSuccess }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const { createChallenge } = useChallenges();
  const { toast } = useToast();

  const form = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      target_value: 1,
      points_reward: 20,
      location_radius_km: 5,
      requires_location_verification: false,
      verification_photos_required: false
    }
  });

  const onSubmit = async (data: ChallengeFormData) => {
    try {
      const challengeData = {
        title: data.title,
        description: data.description,
        challenge_type: data.challenge_type,
        target_value: data.target_value,
        points_reward: data.points_reward,
        end_date: data.end_date.toISOString(),
        location_lat: location?.lat,
        location_lng: location?.lng,
        location_address: location?.address,
        location_radius_km: data.location_radius_km,
        requires_location_verification: data.requires_location_verification,
        verification_photos_required: data.verification_photos_required,
      };

      const result = await createChallenge(challengeData);
      
      if (result) {
        toast({
          title: "Challenge Created! 🌍",
          description: "Your environmental challenge has been posted successfully.",
        });
        form.reset();
        setLocation(null);
        setShowMap(false);
        onSuccess?.();
      } else {
        throw new Error('Failed to create challenge');
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const challengeTypes = [
    { value: 'cleanup', label: 'Environmental Cleanup' },
    { value: 'tree_planting', label: 'Tree Planting' },
    { value: 'waste_reduction', label: 'Waste Reduction' },
    { value: 'energy_conservation', label: 'Energy Conservation' },
    { value: 'water_conservation', label: 'Water Conservation' },
    { value: 'recycling', label: 'Recycling Initiative' },
    { value: 'awareness', label: 'Environmental Awareness' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-6 w-6 text-green-600 mr-2" />
          Create Environmental Challenge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Community Park Cleanup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the challenge, what participants need to do, and the environmental impact..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="challenge_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenge Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select challenge type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {challengeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target (Number of participants needed)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="points_reward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points Reward</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="location-toggle"
                  checked={showMap}
                  onCheckedChange={setShowMap}
                />
                <Label htmlFor="location-toggle" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Add Location (Optional)
                </Label>
              </div>

              {showMap && (
                <div className="space-y-4">
                  <GoogleMapPicker onLocationSelect={setLocation} />
                  
                  {location && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Selected Location:</strong> {location.address}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="location_radius_km"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Radius (km)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="100"
                            placeholder="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Verification Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Verification Requirements</h3>
              
              <FormField
                control={form.control}
                name="requires_location_verification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Location Verification</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Require participants to be at the challenge location
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verification_photos_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center">
                        <Camera className="h-4 w-4 mr-1" />
                        Photo Verification
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Require participants to submit photos as proof
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Create Challenge
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateChallengeForm;