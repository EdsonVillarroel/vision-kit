import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Input, Button } from '../../../components/ui';
import type { Product, ProductFormData, ProductCategory } from '../types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

const CATEGORIES: { value: ProductCategory; label: string; icon: string }[] = [
  { value: 'frames', label: 'Monturas', icon: '👓' },
  { value: 'lenses', label: 'Lentes', icon: '🔍' },
  { value: 'sunglasses', label: 'Gafas de sol', icon: '🕶️' },
  { value: 'contact-lenses', label: 'Lentes de contacto', icon: '👁️' },
  { value: 'accessories', label: 'Accesorios', icon: '🧰' },
  { value: 'solutions', label: 'Soluciones', icon: '🧴' },
];

const labelClass = 'block text-sm font-medium text-theme-primary-text mb-2';
const selectClass =
  'w-full px-4 py-3 bg-white border border-theme-divider rounded-lg outline-none focus:ring-2 focus:ring-theme-primary/40';
const cardClass =
  'bg-white rounded-2xl ring-1 ring-black/[0.06] shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] p-6';

export const ProductForm = ({ product, onSubmit }: ProductFormProps) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  // Básico
  const [sku, setSku] = useState(product?.sku || '');
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'frames');
  const [brand, setBrand] = useState(product?.brand || '');
  const [model, setModel] = useState(product?.model || '');
  const [description, setDescription] = useState(product?.description || '');

  // Precios
  const [costPrice, setCostPrice] = useState(product?.costPrice?.toString() || '');
  const [sellingPrice, setSellingPrice] = useState(product?.sellingPrice?.toString() || '');
  const [discount, setDiscount] = useState(product?.discount?.toString() || '');

  // Stock
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [minStock, setMinStock] = useState(product?.minStock?.toString() || '');
  const [maxStock, setMaxStock] = useState(product?.maxStock?.toString() || '');

  // Proveedor
  const [supplierName, setSupplierName] = useState(product?.supplier?.name || '');
  const [supplierContact, setSupplierContact] = useState(product?.supplier?.contact || '');

  // Specs — monturas
  const [frameType, setFrameType] = useState<'full-rim' | 'semi-rimless' | 'rimless' | ''>(product?.specifications?.frameType || '');
  const [material, setMaterial] = useState(product?.specifications?.material || '');
  const [color, setColor] = useState(product?.specifications?.color || '');
  const [sizeLen, setSizeLens] = useState(product?.specifications?.size?.lens.toString() || '');
  const [sizeBridge, setSizeBridge] = useState(product?.specifications?.size?.bridge.toString() || '');
  const [sizeTemple, setSizeTemple] = useState(product?.specifications?.size?.temple.toString() || '');

  // Specs — lentes
  const [lensType, setLensType] = useState<'single' | 'bifocal' | 'progressive' | ''>(product?.specifications?.lensType || '');
  const [lensMaterial, setLensMaterial] = useState<string>(product?.specifications?.lensMaterial || '');
  const [index, setIndex] = useState(product?.specifications?.index?.toString() || '');
  const [coatings, setCoatings] = useState(product?.specifications?.coatings?.join(', ') || '');

  // Specs — lentes de contacto
  const [baseCurve, setBaseCurve] = useState(product?.specifications?.baseCurve?.toString() || '');
  const [diameter, setDiameter] = useState(product?.specifications?.diameter?.toString() || '');
  const [power, setPower] = useState(product?.specifications?.power || '');

  const isFrame = category === 'frames' || category === 'sunglasses';

  const genSku = () => {
    const base = (brand || name || 'PRD').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'PRD';
    return `${base}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('El nombre es requerido'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (!costPrice || parseFloat(costPrice) <= 0) { setError('El precio de costo debe ser mayor a 0'); return; }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) { setError('El precio de venta debe ser mayor a 0'); return; }

    setSubmitting(true);
    try {
      const specifications: NonNullable<Product['specifications']> = {};
      if (isFrame) {
        if (frameType) specifications.frameType = frameType;
        if (material) specifications.material = material;
        if (color) specifications.color = color;
        if (sizeLen && sizeBridge && sizeTemple) {
          specifications.size = { lens: parseInt(sizeLen), bridge: parseInt(sizeBridge), temple: parseInt(sizeTemple) };
        }
      }
      if (category === 'lenses') {
        if (lensType) specifications.lensType = lensType;
        if (lensMaterial) specifications.lensMaterial = lensMaterial;
        if (index) specifications.index = parseFloat(index);
        if (coatings) specifications.coatings = coatings.split(',').map((c) => c.trim()).filter(Boolean);
      }
      if (category === 'contact-lenses') {
        if (baseCurve) specifications.baseCurve = parseFloat(baseCurve);
        if (diameter) specifications.diameter = parseFloat(diameter);
        if (power) specifications.power = power;
      }

      const formData: ProductFormData = {
        sku: sku.trim() || genSku(),
        name: name.trim(),
        category,
        brand: brand.trim(),
        model: model.trim() || undefined,
        description: description.trim() || undefined,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        discount: discount ? parseFloat(discount) : undefined,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        maxStock: maxStock ? parseInt(maxStock) : undefined,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        supplier: supplierName.trim() ? { id: '', name: supplierName.trim(), contact: supplierContact.trim() || undefined } : undefined,
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
  const showMargin = costPrice && sellingPrice && parseFloat(costPrice) > 0 && parseFloat(sellingPrice) > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {error && (
        <div className="bg-red-50 ring-1 ring-inset ring-red-600/20 text-red-700 px-4 py-3 rounded-xl font-medium text-sm">
          {error}
        </div>
      )}

      {/* PRODUCTO (básico + specs de la categoría) */}
      <div className={cardClass}>
        <h2 className="text-xl font-bold text-theme-dark-primary mb-4">Producto</h2>

        {/* Categoría (chips) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 active:scale-95',
                category === c.value
                  ? 'bg-theme-primary text-theme-text-icons ring-theme-primary'
                  : 'bg-white text-theme-primary-text ring-black/[0.08] hover:bg-theme-light-primary/50'
              )}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="Nombre *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ray-Ban Wayfarer Classic" required />
          </div>
          <Input label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ray-Ban" />
          <Input label="Modelo" value={model} onChange={(e) => setModel(e.target.value)} placeholder="RB5228" />
        </div>

        {/* Specs adaptativas */}
        {isFrame && (
          <div className="mt-6 border-t border-theme-divider/60 pt-5">
            <p className="text-sm font-semibold text-theme-secondary-text mb-3">Detalles de la montura</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Tipo de marco</label>
                <select value={frameType} onChange={(e) => setFrameType(e.target.value as any)} className={selectClass}>
                  <option value="">Sin especificar</option>
                  <option value="full-rim">Completo</option>
                  <option value="semi-rimless">Semi al aire</option>
                  <option value="rimless">Al aire</option>
                </select>
              </div>
              <Input label="Material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Acetato, metal, titanio…" />
              <Input label="Color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Negro, carey…" />
            </div>
            <div className="mt-4">
              <label className={labelClass}>Medidas (mm) <span className="font-normal text-theme-secondary-text">— lente / puente / varilla</span></label>
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" value={sizeLen} onChange={(e) => setSizeLens(e.target.value)} placeholder="Lente 50" />
                <Input type="number" value={sizeBridge} onChange={(e) => setSizeBridge(e.target.value)} placeholder="Puente 22" />
                <Input type="number" value={sizeTemple} onChange={(e) => setSizeTemple(e.target.value)} placeholder="Varilla 150" />
              </div>
            </div>
          </div>
        )}

        {category === 'lenses' && (
          <div className="mt-6 border-t border-theme-divider/60 pt-5">
            <p className="text-sm font-semibold text-theme-secondary-text mb-3">Detalles del lente</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo de lente</label>
                <select value={lensType} onChange={(e) => setLensType(e.target.value as any)} className={selectClass}>
                  <option value="">Sin especificar</option>
                  <option value="single">Monofocal</option>
                  <option value="bifocal">Bifocal</option>
                  <option value="progressive">Progresivo</option>
                </select>
              </div>
              <Input label="Material" value={lensMaterial} onChange={(e) => setLensMaterial(e.target.value)} placeholder="Policarbonato, CR-39…" />
              <Input label="Índice de refracción" type="number" step="0.01" value={index} onChange={(e) => setIndex(e.target.value)} placeholder="1.67" />
              <Input label="Tratamientos" value={coatings} onChange={(e) => setCoatings(e.target.value)} placeholder="AR, UV, antirreflejo (separados por comas)" />
            </div>
          </div>
        )}

        {category === 'contact-lenses' && (
          <div className="mt-6 border-t border-theme-divider/60 pt-5">
            <p className="text-sm font-semibold text-theme-secondary-text mb-3">Detalles del lente de contacto</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Curva base" type="number" step="0.1" value={baseCurve} onChange={(e) => setBaseCurve(e.target.value)} placeholder="8.6" />
              <Input label="Diámetro (mm)" type="number" step="0.1" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="14.0" />
              <Input label="Poder" value={power} onChange={(e) => setPower(e.target.value)} placeholder="-1.00 a -12.00" />
            </div>
          </div>
        )}
      </div>

      {/* PRECIO Y STOCK */}
      <div className={cardClass}>
        <h2 className="text-xl font-bold text-theme-dark-primary mb-4">Precio y stock</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="Precio costo *" type="number" step="0.01" min="0" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" required />
          <Input label="Precio venta *" type="number" step="0.01" min="0" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" required />
          <Input label="Stock inicial" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
          <Input label="Stock mínimo" type="number" min="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="Para alertas" />
        </div>
        {showMargin && (
          <div className="mt-4 flex flex-wrap gap-6 rounded-xl bg-theme-light-primary/40 px-4 py-3 text-sm">
            <div>
              <span className="text-theme-secondary-text">Margen: </span>
              <span className="font-semibold tnum text-green-600">Bs {margin.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-theme-secondary-text">% Margen: </span>
              <span className="font-semibold tnum text-green-600">{marginPercent.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* MÁS OPCIONES (plegable) */}
      <div className={cardClass}>
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded-lg"
        >
          <div>
            <h2 className="text-xl font-bold text-theme-dark-primary">Más opciones <span className="text-sm font-normal text-theme-secondary-text">— opcional</span></h2>
            <p className="text-sm text-theme-secondary-text mt-1">SKU, descripción, descuento, stock máximo y proveedor.</p>
          </div>
          <svg className={clsx('h-5 w-5 shrink-0 text-theme-secondary-text transition-transform duration-200', showMore && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMore && (
          <div className="mt-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Se genera solo si lo dejas vacío" />
              <Input label="Descuento (%)" type="number" step="0.01" min="0" max="100" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
              <Input label="Stock máximo" type="number" min="0" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} placeholder="Opcional" />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción del producto…" rows={3} className={`${selectClass} resize-none`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Proveedor" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Luxottica" />
              <Input label="Contacto del proveedor" value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} placeholder="555-1000" />
            </div>
          </div>
        )}
      </div>

      {/* Barra de acción fija */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/[0.06] bg-white/90 backdrop-blur-sm lg:pl-64">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={submitting} className="!w-auto px-5">
            Cancelar
          </Button>
          <Button type="submit" isLoading={submitting} className="!w-auto px-6">
            {product ? 'Actualizar producto' : 'Guardar producto'}
          </Button>
        </div>
      </div>
    </form>
  );
};
