import React, { useState } from 'react';

interface ProductImageGalleryProps {
  images: Array<{ id: string; url: string; sort_order: number }>;
  title: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, title }) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80';
  const validImages = images && images.length > 0 ? images : [{ id: 'default', url: fallbackImage, sort_order: 0 }];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeImage = validImages[selectedIndex] || validImages[0];

  return (
    <div className="space-y-4">
      {/* Main Image Frame */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <img
          src={activeImage.url}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-all duration-300"
        />
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {validImages.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-[#6C47FF] shadow-xs scale-105'
                  : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={`${title} thumbnail ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
