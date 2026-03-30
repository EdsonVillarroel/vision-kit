import { api } from './api';

export const uploadService = {
  /**
   * Sube un avatar para el userId dado.
   * Retorna la URL firmada del avatar subido.
   */
  uploadAvatar: async (userId: string, file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const result = await api.upload<{ url: string }>(`/upload/avatar/${userId}`, form);
    return result.url;
  },

  /**
   * Sube una imagen para el productId dado.
   * Retorna la URL pública de la imagen subida.
   */
  uploadProductImage: async (productId: string, file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const result = await api.upload<{ url: string }>(`/upload/product-image/${productId}`, form);
    return result.url;
  },
};
