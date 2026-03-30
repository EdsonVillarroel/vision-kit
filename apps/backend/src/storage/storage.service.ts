import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Sube un avatar de usuario.
   * Path en bucket: avatars/{userId}/{filename}
   * Retorna la URL pública firmada (1 año de validez).
   */
  async uploadAvatar(userId: string, buffer: Buffer, mimeType: string): Promise<string> {
    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userId}/avatar.${ext}`;

    const { error } = await this.supabase.storage
      .from('avatars')
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw new InternalServerErrorException(`Error al subir avatar: ${error.message}`);

    // Bucket privado → signed URL de 1 año
    const { data, error: signedError } = await this.supabase.storage
      .from('avatars')
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    if (signedError || !data) {
      throw new InternalServerErrorException(`Error al generar URL firmada: ${signedError?.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Sube una imagen de producto.
   * Path en bucket: product-images/{productId}/{filename}
   * Retorna la URL pública (bucket público).
   */
  async uploadProductImage(productId: string, buffer: Buffer, mimeType: string): Promise<string> {
    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const path = `${productId}/image.${ext}`;

    const { error } = await this.supabase.storage
      .from('product-images')
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw new InternalServerErrorException(`Error al subir imagen: ${error.message}`);

    const { data } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /** Elimina el avatar de un usuario del bucket */
  async deleteAvatar(userId: string): Promise<void> {
    const extensions = ['jpg', 'png', 'webp'];
    await Promise.allSettled(
      extensions.map((ext) =>
        this.supabase.storage.from('avatars').remove([`${userId}/avatar.${ext}`]),
      ),
    );
  }

  /** Elimina la imagen de un producto del bucket */
  async deleteProductImage(productId: string): Promise<void> {
    const extensions = ['jpg', 'png', 'webp'];
    await Promise.allSettled(
      extensions.map((ext) =>
        this.supabase.storage.from('product-images').remove([`${productId}/image.${ext}`]),
      ),
    );
  }
}
