import React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface RoomImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
}

export default function RoomImageUpload({ images, onChange }: RoomImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `room-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('rooms')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('rooms')
        .getPublicUrl(filePath);

      onChange([...images, publicUrl]);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (urlToRemove: string) => {
    try {
      const fileName = urlToRemove.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('rooms')
        .remove([`room-images/${fileName}`]);

      if (error) throw error;

      onChange(images.filter(url => url !== urlToRemove));
      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Room image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => removeImage(url)}
              className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
            }}
            disabled={uploading}
          />
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Upload Image</span>
            </>
          )}
        </label>
      </div>
      {images.length === 0 && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}