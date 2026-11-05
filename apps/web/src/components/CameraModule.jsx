
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const CameraModule = ({ onCapture, onClose }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }
    onCapture(file);
    toast.success('Image uploaded successfully');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-darker rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Upload Waste Segregation Proof</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground hover:text-warning-orange">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!preview ? (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-accent-green transition-all duration-200"
            >
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground mb-2">Click to select image</p>
              <p className="text-sm text-muted-foreground">Take a photo of your segregated waste</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="flex-1 border-border text-foreground hover:bg-muted"
              >
                Retake
              </Button>
              <Button
                onClick={handleUpload}
                className="flex-1 bg-accent-green text-background-dark hover:bg-accent-green-dark"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraModule;
