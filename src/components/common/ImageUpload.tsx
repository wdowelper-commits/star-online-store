import React, { useRef, useState } from 'react';
import { UploadCloud, Link as LinkIcon, X, Star, Loader2, Plus, Image as ImageIcon, Camera, Check } from 'lucide-react';
import { uploadService } from '../../services/uploadService';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 6,
  label = 'Product Images / Tasveer',
  helperText = 'Apne mobile ya computer se tasveerein upload karein ya image URL paste karein.',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError('');

    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError('Meharbani karke image URL likhein.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image')) {
      setUrlError('URL http:// ya https:// se shuru hona chahiye.');
      return;
    }

    if (images.length >= maxImages) {
      setUrlError(`Aap sirf ${maxImages} images tak add kar sakte hain.`);
      return;
    }

    onChange([...images, trimmed]);
    setUrlInput('');
  };

  const processFiles = async (files: FileList | File[]) => {
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setUrlError(`Maximum limit (${maxImages} images) poori ho chuki hai.`);
      return;
    }

    setIsUploading(true);
    setUrlError('');
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    try {
      const uploadPromises = filesToUpload.map((file) => uploadService.uploadFile(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      console.error('File upload failed:', err);
      setUrlError('File upload mein masla hua. Dobara koshish karein ya image URL use karein.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  return (
    <div className="space-y-4">
      {/* Header Label and Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#6C47FF]" />
          <span>{label}</span>
          <span className="text-red-500">*</span>
        </label>
        <span className="text-slate-400 font-medium">
          {images.length} / {maxImages} uploaded {images.length > 0 ? '(Pehli image Main Thumbnail hai)' : ''}
        </span>
      </div>

      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}

      {/* Tabs: Upload File from Device (Default) OR Image URL */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-[#6C47FF] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Device se Image Upload Karein</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-[#6C47FF] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Add via Image URL</span>
        </button>
      </div>

      {/* Tab 1: Upload from Device (Drag & Drop Zone + Click to Browse) */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#6C47FF] bg-purple-50/70 dark:bg-purple-950/40 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-[#6C47FF] bg-slate-50/60 dark:bg-slate-900/60'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#6C47FF]" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Image upload ho rahi hai...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#6C47FF] flex items-center justify-center mb-1">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Yahan click karein ya image drag & drop karein
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Mobile camera photo ya gallery se select karein (JPG, PNG, WEBP, GIF)
                </p>
              </div>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#6C47FF] text-[#6C47FF] rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                📁 Choose Image Files
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Tab 2: Add Image via URL */}
      {activeTab === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                placeholder="Image URL paste karein (e.g. https://images.unsplash.com/...)"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAddUrl()}
              disabled={images.length >= maxImages}
              className="px-4 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add URL</span>
            </button>
          </div>

          {/* Quick preset samples */}
          <div className="flex items-center gap-1.5 pt-1 flex-wrap text-[11px]">
            <span className="text-slate-400">Sample Photos:</span>
            {[
              { label: 'Leather Bag', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' },
              { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
              { label: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
              { label: 'Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  if (images.length < maxImages) {
                    onChange([...images, preset.url]);
                  }
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-slate-600 dark:text-slate-300 font-medium transition-colors"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {urlError && (
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50">
          {urlError}
        </p>
      )}

      {/* Uploaded Images Gallery Preview */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Uploaded Photos ({images.length}):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((url, idx) => (
              <div
                key={url + idx}
                className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-sm"
              >
                <img
                  src={url}
                  alt={`Product photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-[#6C47FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                    <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                    Thumbnail
                  </span>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="p-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer shadow-md"
                      title="Make Primary Thumbnail"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-md"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
