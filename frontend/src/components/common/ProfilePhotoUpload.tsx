import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, User, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (file: File | null, photoUrl?: string) => void;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
  className?: string;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhoto,
  onPhotoChange,
  size = 'medium',
  editable = true,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update previewUrl when currentPhoto prop changes
  useEffect(() => {
    setPreviewUrl(currentPhoto || null);
  }, [currentPhoto]);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the callback with the file and preview URL
      onPhotoChange(file, url);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Photo Display/Upload Area */}
      <div className="relative">
        <div
          className={cn(
            'relative rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 transition-all duration-200',
            sizeClasses[size],
            editable && 'cursor-pointer hover:border-blue-300',
            dragActive && 'border-blue-400 bg-blue-50'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={editable ? openFileDialog : undefined}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className={cn('text-gray-400', iconSizes[size])} />
            </div>
          )}

          {/* Upload Overlay - Only show when no photo or make it subtle when photo exists */}
          {editable && (
            <div className={cn(
              "absolute inset-0 transition-all duration-200 flex items-center justify-center",
              previewUrl
                ? "bg-black bg-opacity-0 hover:bg-opacity-20" // Subtle overlay when photo exists
                : "bg-black bg-opacity-0 hover:bg-opacity-30" // More visible when no photo
            )}>
              <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Remove Photo Button */}
        {previewUrl && editable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePhoto();
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload Instructions */}
      {editable && (
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          
          {!previewUrl && (
            <div className="space-y-2">
              <Button
                onClick={openFileDialog}
                variant="outlined"
                size="small"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
              <p className="text-xs text-gray-500">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG up to 5MB
              </p>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Photo uploaded</span>
              </div>
              <Button
                onClick={openFileDialog}
                variant="outlined"
                size="small"
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Change Photo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
