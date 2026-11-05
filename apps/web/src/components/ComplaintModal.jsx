
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const ComplaintModal = ({ onClose, citizenId, zoneId }) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      toast.error('Please select a complaint category');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('complaints').create({
        citizen_id: citizenId,
        zone_id: zoneId,
        complaint_category: category,
        description: description,
        status: 'open'
      }, { $autoCancel: false });

      toast.success('Complaint submitted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to submit complaint');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-darker rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Submit Complaint</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground hover:text-destructive">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="category" className="text-foreground mb-2 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background-dark border-border text-foreground">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="missed_collection">Missed Collection</SelectItem>
                <SelectItem value="overflowing_bin">Overflowing Bin</SelectItem>
                <SelectItem value="improper_service">Improper Service</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground mb-2 block">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              className="bg-background-dark border-border text-foreground placeholder:text-muted-foreground min-h-[120px]"
            />
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive leading-relaxed">
              <strong>Warning:</strong> Filing a false complaint will deduct 50 Civic Points from your score. GPS logs are used to verify truck routes.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-accent-green text-background-dark hover:bg-accent-green-dark disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintModal;
