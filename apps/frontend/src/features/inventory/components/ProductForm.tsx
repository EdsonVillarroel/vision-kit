import { useState } from 'react';
import { Input, Button, Card } from '../../../components/ui';
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

const selectClass = "w-full px-4 py-3 bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:outline-none transition-all duration-300 text-theme-primary-text hover:bg-theme-light-primary/40";
const labelClass = "block text-sm font-medium text-theme-dark-primary mb-2";

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

    if (!sku.trim()) { setError('El SKU es requerido'); return; }
    if (!name.trim()) { setError('El nombre es requerido'); return; }
    if (!brand.trim()) { setError('La marca es requerida'); return; }
    if (!costPrice || parseFloat(costPrice) <= 0) { setError('El precio de costo debe ser mayor a 0'); return; }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) { setError('El precio de venta debe ser mayor a 0'); return; }
    if (!minStock || parseInt(minStock) < 0) { setError('El stock mínimo es requerido'); return; }

    setSubmitting(true);

    try {
      const specifications: NonNullable<Product['specifications']> = {};

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

      if (lensType) specifications.lensType = lensType;
      if (lensMaterial) specifications.lensMaterial = lensMaterial;
      if (index) specifications.index = parseFloat(index);
      if (coatings) {
        specifications.coatings = coatings.split(',').map(c => c.trim()).filter(Boolean);
      }

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
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card elevation="low" className="!p-6">
        <h2 className="text-xl font-semibold text-theme-dark-primary mb-4">Información Básica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="FRM-RB-5228-001"
            required
          />
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ray-Ban Wayfarer Classic"
            required
          />
          <div>
            <label className={labelClass}>Categoría <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className={selectClass}
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Marca"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ray-Ban"
            required
          />
          <Input
            label="Modelo"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="RB5228"
          />
          <div className="md:col-span-2">
            <label className={labelClass}>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del producto..."
              rows={3}
              className={`${selectClass} resize-none`}
            />
          </div>
        </div>
      </Card>

      {/* Pricing */}
      <Card elevation="low" className="!p-6">
        <h2 className="text-xl font-semibold text-theme-dark-primary mb-4">Precios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Precio Costo"
            type="number"
            step="0.01"
            min="0"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="0.00"
            required
          />
          <Input
            label="Precio Venta"
            type="number"
            step="0.01"
            min="0"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="0.00"
            required
          />
          <Input
            label="Descuento (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="0"
          />
          {costPrice && sellingPrice && parseFloat(costPrice) > 0 && parseFloat(sellingPrice) > 0 && (
            <div className="md:col-span-3 bg-theme-light-primary/30 border border-theme-primary/20 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-theme-secondary-text">Margen:</span>
                  <span className="ml-2 font-semibold text-green-600">${margin.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-theme-secondary-text">% Margen:</span>
                  <span className="ml-2 font-semibold text-green-600">{marginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Stock */}
      <Card elevation="low" className="!p-6">
        <h2 className="text-xl font-semibold text-theme-dark-primary mb-4">Inventario</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Stock Inicial"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <Input
            label="Stock Mínimo"
            type="number"
            min="0"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            required
          />
          <Input
            label="Stock Máximo"
            type="number"
            min="0"
            value={maxStock}
            onChange={(e) => setMaxStock(e.target.value)}
          />
        </div>
      </Card>

      {/* Supplier */}
      <Card elevation="low" className="!p-6">
        <h2 className="text-xl font-semibold text-theme-dark-primary mb-4">Proveedor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="ID Proveedor"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            placeholder="SUP001"
          />
          <Input
            label="Nombre Proveedor"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="Luxottica México"
          />
          <Input
            label="Contacto"
            value={supplierContact}
            onChange={(e) => setSupplierContact(e.target.value)}
            placeholder="555-1000"
          />
        </div>
      </Card>

      {/* Specifications - Frames/Sunglasses */}
      {(category === 'frames' || category === 'sunglasses') && (
        <Card elevation="low" className="!p-6">
          <h2 className="text-xl font-semibold text-theme-dark-primary mb-4">Especificaciones de Marco</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de Marco</label>
              <select
                value={frameType}
                onChange={(e) => setFrameType(e.target.value as 'full-rim' | 'semi-rimless' | 'rimless' | '')}
                className={selectClass}
              >
                <option value="">Seleccione...</option>
                <option value="full-rim">Completo</option>
                <option value="semi-rimless">Semi al Aire</option>
                <option value="rimless">Al Aire</option>
              </select>
            </div>
            <Input
              label="Material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Acetato, Metal, Titanio..."
            />
            <Input
              label="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Negro, Carey, etc."
            />
            <div className="md:col-span-2">
              <label className={labelClass}>Medidas (mm)</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={sizeLen}
                  onChange={(e) => setSizeLens(e.target.value)}
                  placeholder="Lente (50)"
                />
                <Input
                  type="number"
                  value={sizeBridge}
                  onChange={(e) => setSizeBridge(e.target.value)}
                  placeholder="Puente (22)"
                />
                <Input
                  type="number"
                  value={sizeTemple}
                  onChange={(e) => setSizeTemple(e.target.value)}
                  placeholder="Varilla (150)"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Specifications - Lenses */}
      {category === 'lenses' && (
        <Card elevation="low" className="!p-6">
          <h2 className="text-xl font-semibold text-theme-dark-primary mb-4">Especificaciones de Lentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de Lente</label>
              <select
                value={lensType}
                onChange={(e) => setLensType(e.target.value as 'single' | 'bifocal' | 'progressive' | '')}
                className={selectClass}
              >
                <option value="">Seleccione...</option>
                <option value="single">Monofocal</option>
                <option value="bifocal">Bifocal</option>
                <option value="progressive">Progresivo</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Material</label>
              <select
                value={lensMaterial}
                onChange={(e) => setLensMaterial(e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccione...</option>
                <option value="plastic">Plástico</option>
                <option value="polycarbonate">Policarbonato</option>
                <option value="high-index">Alto Índice</option>
                <option value="glass">Cristal</option>
              </select>
            </div>
            <Input
              label="Índice de Refracción"
              type="number"
              step="0.01"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              placeholder="1.6"
            />
            <Input
              label="Tratamientos (separados por comas)"
              value={coatings}
              onChange={(e) => setCoatings(e.target.value)}
              placeholder="Anti-reflejante, UV Protection"
            />
          </div>
        </Card>
      )}

      {/* Specifications - Contact Lenses */}
      {category === 'contact-lenses' && (
        <Card elevation="low" className="!p-6">
          <h2 className="text-xl font-semibold text-theme-dark-primary mb-4">Especificaciones de Lentes de Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Curva Base"
              type="number"
              step="0.1"
              value={baseCurve}
              onChange={(e) => setBaseCurve(e.target.value)}
              placeholder="8.4"
            />
            <Input
              label="Diámetro (mm)"
              type="number"
              step="0.1"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="14.0"
            />
            <Input
              label="Poder"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              placeholder="-1.00 a -12.00"
            />
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={submitting}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={submitting}
          className="flex-1"
        >
          {product ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
};
