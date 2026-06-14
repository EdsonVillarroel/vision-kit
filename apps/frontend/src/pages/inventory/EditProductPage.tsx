import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useInventory } from '../../features/inventory/hooks/useInventory';
import { ProductForm } from '../../features/inventory/components/ProductForm';
import { uploadService } from '../../lib/uploadService';
import type { ProductFormData } from '../../features/inventory/types';
import { SkeletonFormCard } from '../../components/ui/Skeleton';

export const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id!);
  const { updateProduct } = useInventory();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (data: ProductFormData) => {
    await updateProduct(id!, data);
    if (imageFile && id) {
      try {
        const url = await uploadService.uploadProductImage(id, imageFile);
        await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'}/inventory/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({ images: [url] }),
        });
      } catch {
        // No bloquear la navegación si falla el upload
      }
    }
    navigate(`/inventory/${id}`);
  };

  if (loading) {
    return <SkeletonFormCard fields={6} />;
  }

  if (error || !product) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error || 'Producto no encontrado'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(`/inventory/${id}`)}
          className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
        >
          ← Volver a Detalles
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
        <p className="text-gray-600 mt-2">{product.name}</p>
      </div>

      {/* Imagen actual + selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Imagen del Producto</h2>
        <div className="flex items-center gap-6">
          <div
            onClick={() => imageInputRef.current?.click()}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm text-center px-2">Sin imagen</span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">JPEG, PNG o WebP — máx. 5 MB</p>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              {imageFile ? 'Cambiar imagen' : product.images && product.images.length > 0 ? 'Reemplazar imagen' : 'Seleccionar imagen'}
            </button>
            {imageFile && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="ml-2 px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Quitar
              </button>
            )}
          </div>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      <ProductForm product={product} onSubmit={handleSubmit} />
    </div>
  );
};
