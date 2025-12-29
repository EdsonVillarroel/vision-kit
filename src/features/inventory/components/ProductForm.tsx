import { useState } from 'react';
import type { Product, ProductFormData, ProductCategory } from '../types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'frames', label: 'Marcos' },
  { value: 'lenses', label: 'Lentes' },
  { value: 'sunglasses', label: 'Gafas de Sol' },
  { value: 'contact-lenses', label: 'Lentes de Contacto' },
  { value: 'accessories', label: 'Accesorios' },
  { value: 'solutions', label: 'Soluciones' }
];

export const ProductForm = ({ product, onSubmit }: ProductFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic Info
  const [sku, setSku] = useState(product?.sku || '');
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'frames');
  const [brand, setBrand] = useState(product?.brand || '');
  const [model, setModel] = useState(product?.model || '');
  const [description, setDescription] = useState(product?.description || '');

  // Pricing
  const [costPrice, setCostPrice] = useState(product?.costPrice.toString() || '');
  const [sellingPrice, setSellingPrice] = useState(product?.sellingPrice.toString() || '');
  const [discount, setDiscount] = useState(product?.discount?.toString() || '');

  // Stock
  const [stock, setStock] = useState(product?.stock.toString() || '0');
  const [minStock, setMinStock] = useState(product?.minStock.toString() || '');
  const [maxStock, setMaxStock] = useState(product?.maxStock?.toString() || '');

  // Supplier
  const [supplierId, setSupplierId] = useState(product?.supplier?.id || '');
  const [supplierName, setSupplierName] = useState(product?.supplier?.name || '');
  const [supplierContact, setSupplierContact] = useState(product?.supplier?.contact || '');

  // Specifications - Frames
  const [frameType, setFrameType] = useState<'full-rim' | 'semi-rimless' | 'rimless' | ''>(
    product?.specifications?.frameType || ''
  );
  const [material, setMaterial] = useState(product?.specifications?.material || '');
  const [color, setColor] = useState(product?.specifications?.color || '');
  const [sizeLen, setSizeLens] = useState(product?.specifications?.size?.lens.toString() || '');
  const [sizeBridge, setSizeBridge] = useState(product?.specifications?.size?.bridge.toString() || '');
  const [sizeTemple, setSizeTemple] = useState(product?.specifications?.size?.temple.toString() || '');

  // Specifications - Lenses
  const [lensType, setLensType] = useState<'single' | 'bifocal' | 'progressive' | ''>(
    product?.specifications?.lensType || ''
  );
  const [lensMaterial, setLensMaterial] = useState<string>(
    product?.specifications?.lensMaterial || ''
  );
  const [index, setIndex] = useState(product?.specifications?.index?.toString() || '');
  const [coatings, setCoatings] = useState(product?.specifications?.coatings?.join(', ') || '');

  // Specifications - Contact Lenses
  const [baseCurve, setBaseCurve] = useState(product?.specifications?.baseCurve?.toString() || '');
  const [diameter, setDiameter] = useState(product?.specifications?.diameter?.toString() || '');
  const [power, setPower] = useState(product?.specifications?.power || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!sku.trim()) {
      setError('El SKU es requerido');
      return;
    }
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!brand.trim()) {
      setError('La marca es requerida');
      return;
    }
    if (!costPrice || parseFloat(costPrice) <= 0) {
      setError('El precio de costo debe ser mayor a 0');
      return;
    }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      setError('El precio de venta debe ser mayor a 0');
      return;
    }
    if (!minStock || parseInt(minStock) < 0) {
      setError('El stock mínimo es requerido');
      return;
    }

    setSubmitting(true);

    try {
      const specifications: any = {};

      // Add frame specs
      if (frameType) specifications.frameType = frameType;
      if (material) specifications.material = material;
      if (color) specifications.color = color;
      if (sizeLen && sizeBridge && sizeTemple) {
        specifications.size = {
          lens: parseInt(sizeLen),
          bridge: parseInt(sizeBridge),
          temple: parseInt(sizeTemple)
        };
      }

      // Add lens specs
      if (lensType) specifications.lensType = lensType;
      if (lensMaterial) specifications.lensMaterial = lensMaterial;
      if (index) specifications.index = parseFloat(index);
      if (coatings) {
        specifications.coatings = coatings.split(',').map(c => c.trim()).filter(Boolean);
      }

      // Add contact lens specs
      if (baseCurve) specifications.baseCurve = parseFloat(baseCurve);
      if (diameter) specifications.diameter = parseFloat(diameter);
      if (power) specifications.power = power;

      const formData: ProductFormData = {
        sku: sku.trim(),
        name: name.trim(),
        category,
        brand: brand.trim(),
        model: model.trim() || undefined,
        description: description.trim() || undefined,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        discount: discount ? parseFloat(discount) : undefined,
        stock: parseInt(stock),
        minStock: parseInt(minStock),
        maxStock: maxStock ? parseInt(maxStock) : undefined,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        supplier: supplierId && supplierName ? {
          id: supplierId,
          name: supplierName,
          contact: supplierContact || undefined
        } : undefined
      };

      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const margin = parseFloat(sellingPrice) - parseFloat(costPrice);
  const marginPercent = parseFloat(costPrice) > 0 ? (margin / parseFloat(costPrice)) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="FRM-RB-5228-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ray-Ban Wayfarer Classic"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ray-Ban"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelo
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="RB5228"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del producto..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Precios</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Costo <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Venta <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descuento (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {costPrice && sellingPrice && parseFloat(costPrice) > 0 && parseFloat(sellingPrice) > 0 && (
            <div className="md:col-span-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Margen:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    ${margin.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">% Margen:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {marginPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventario</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Inicial
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Mínimo <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Máximo
            </label>
            <input
              type="number"
              min="0"
              value={maxStock}
              onChange={(e) => setMaxStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Supplier */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Proveedor</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Proveedor
            </label>
            <input
              type="text"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              placeholder="SUP001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Proveedor
            </label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Luxottica México"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contacto
            </label>
            <input
              type="text"
              value={supplierContact}
              onChange={(e) => setSupplierContact(e.target.value)}
              placeholder="555-1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Specifications - Frames/Sunglasses */}
      {(category === 'frames' || category === 'sunglasses') && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Especificaciones de Marco</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Marco
              </label>
              <select
                value={frameType}
                onChange={(e) => setFrameType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione...</option>
                <option value="full-rim">Completo</option>
                <option value="semi-rimless">Semi al Aire</option>
                <option value="rimless">Al Aire</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Acetato, Metal, Titanio..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Negro, Carey, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medidas (mm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={sizeLen}
                  onChange={(e) => setSizeLens(e.target.value)}
                  placeholder="Lente (50)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={sizeBridge}
                  onChange={(e) => setSizeBridge(e.target.value)}
                  placeholder="Puente (22)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={sizeTemple}
                  onChange={(e) => setSizeTemple(e.target.value)}
                  placeholder="Varilla (150)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Specifications - Lenses */}
      {category === 'lenses' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Especificaciones de Lentes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Lente
              </label>
              <select
                value={lensType}
                onChange={(e) => setLensType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione...</option>
                <option value="single">Monofocal</option>
                <option value="bifocal">Bifocal</option>
                <option value="progressive">Progresivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <select
                value={lensMaterial}
                onChange={(e) => setLensMaterial(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione...</option>
                <option value="plastic">Plástico</option>
                <option value="polycarbonate">Policarbonato</option>
                <option value="high-index">Alto Índice</option>
                <option value="glass">Cristal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Índice de Refracción
              </label>
              <input
                type="number"
                step="0.01"
                value={index}
                onChange={(e) => setIndex(e.target.value)}
                placeholder="1.6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tratamientos (separados por comas)
              </label>
              <input
                type="text"
                value={coatings}
                onChange={(e) => setCoatings(e.target.value)}
                placeholder="Anti-reflejante, UV Protection"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Specifications - Contact Lenses */}
      {category === 'contact-lenses' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Especificaciones de Lentes de Contacto</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curva Base
              </label>
              <input
                type="number"
                step="0.1"
                value={baseCurve}
                onChange={(e) => setBaseCurve(e.target.value)}
                placeholder="8.4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diámetro (mm)
              </label>
              <input
                type="number"
                step="0.1"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                placeholder="14.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poder
              </label>
              <input
                type="text"
                value={power}
                onChange={(e) => setPower(e.target.value)}
                placeholder="-1.00 a -12.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
};
