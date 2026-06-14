import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../features/inventory/hooks/useInventory';
import { ProductForm } from '../../features/inventory/components/ProductForm';
import { uploadService } from '../../lib/uploadService';
import type { ProductFormData } from '../../features/inventory/types';

export const NewProductPage = () => {
  const navigate = useNavigate();
  const { createProduct } = useInventory();
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
    const product = await createProduct(data);
    if (imageFile && product?.id) {
      try {
        const url = await uploadService.uploadProductImage(product.id, imageFile);
        // Actualiza la URL en el producto recién creado
        await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'}/inventory/${product.id}`, {
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
    navigate('/inventory');
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/inventory')}
          className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
        >
          ← Volver a Inventario
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        <p className="text-gray-600 mt-2">Agregar un nuevo producto al inventario</p>
      </div>

      {/* Selector de imagen */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Imagen del Producto</h2>
        <div className="flex items-center gap-6">
          <div
            onClick={() => imageInputRef.current?.click()}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm text-center px-2">Clic para seleccionar imagen</span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">JPEG, PNG o WebP — máx. 5 MB</p>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              {imageFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
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

      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
};
