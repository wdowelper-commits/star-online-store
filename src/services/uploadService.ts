import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const uploadService = {
  uploadFile: async (file: File, folder: string = 'product-images'): Promise<string> => {
    // If Supabase Storage is configured
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (!error) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, falling back to data URL', err);
      }
    }

    // High performance instant client-side data URL reader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },
};
