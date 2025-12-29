import { useNavigate } from 'react-router-dom';
import { useStockMovements } from '../hooks/useInventory';
import type { Product } from '../types';

interface ProductDetailsProps {
  product: Product;
}

const CATEGORIES: Record<string, string> = {
  'frames': 'Marcos',
  'lenses': 'Lentes',
  'sunglasses': 'Gafas de Sol',
  'contact-lenses': 'Lentes de Contacto',
  'accessories': 'Accesorios',
  'solutions': 'Soluciones'
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'in-stock': { label: 'En Stock', className: 'bg-green-100 text-green-800' },
  'low-stock': { label: 'Stock Bajo', className: 'bg-yellow-100 text-yellow-800' },
  'out-of-stock': { label: 'Agotado', className: 'bg-red-100 text-red-800' },
  'discontinued': { label: 'Discontinuado', className: 'bg-gray-100 text-gray-800' }
};

const MOVEMENT_TYPE_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  'in': { label: 'Entrada', icon: '↑', className: 'text-green-600' },
  'out': { label: 'Salida', icon: '↓', className: 'text-red-600' },
  'adjustment': { label: 'Ajuste', icon: '~', className: 'text-blue-600' }
};

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const navigate = useNavigate();
  const { movements, loading: movementsLoading } = useStockMovements(product.id);

  const statusConfig = STATUS_CONFIG[product.status];
  const margin = product.sellingPrice - product.costPrice;
  const marginPercent = (margin / product.costPrice) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-4 text-gray-600">
            <span>SKU: {product.sku}</span>
            <span>•</span>
            <span>{product.brand}</span>
            {product.model && (
              <>
                <span>•</span>
                <span>Modelo: {product.model}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/inventory/${product.id}/adjust`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Ajustar Stock
          </button>
          <button
            onClick={() => navigate(`/inventory/${product.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Editar
          </button>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Categoría</div>
                <div className="font-medium text-gray-900">{CATEGORIES[product.category]}</div>
              </div>

              {product.description && (
                <div className="col-span-2">
                  <div className="text-sm text-gray-600">Descripción</div>
                  <div className="text-gray-900">{product.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Precios y Márgenes</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Precio Costo</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${product.costPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Precio Venta</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${product.sellingPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Margen</div>
                <div className="text-lg font-semibold text-green-600">
                  ${margin.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">% Margen</div>
                <div className="text-lg font-semibold text-green-600">
                  {marginPercent.toFixed(1)}%
                </div>
              </div>

              {product.discount && (
                <div className="col-span-2">
                  <div className="text-sm text-gray-600">Descuento Activo</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {product.discount}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stock Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventario</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Stock Actual</div>
                <div className={`text-2xl font-bold ${
                  product.stock === 0 ? 'text-red-600' :
                  product.stock <= product.minStock ? 'text-yellow-600' :
                  'text-gray-900'
                }`}>
                  {product.stock} uds
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Stock Mínimo</div>
                <div className="text-lg font-semibold text-gray-900">{product.minStock} uds</div>
              </div>

              {product.maxStock && (
                <div>
                  <div className="text-sm text-gray-600">Stock Máximo</div>
                  <div className="text-lg font-semibold text-gray-900">{product.maxStock} uds</div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600">Valor Stock</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${(product.stock * product.costPrice).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {product.lastRestocked && (
                <div className="col-span-2">
                  <div className="text-sm text-gray-600">Último Reabastecimiento</div>
                  <div className="text-gray-900">
                    {new Date(product.lastRestocked).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}
            </div>

            {product.stock <= product.minStock && product.stock > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                ⚠️ Stock bajo. Considere reabastecer este producto.
              </div>
            )}

            {product.stock === 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                ⛔ Producto agotado. Es necesario reabastecer.
              </div>
            )}
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Especificaciones</h2>

              <div className="grid grid-cols-2 gap-4">
                {product.specifications.frameType && (
                  <div>
                    <div className="text-sm text-gray-600">Tipo de Marco</div>
                    <div className="text-gray-900">
                      {product.specifications.frameType === 'full-rim' && 'Completo'}
                      {product.specifications.frameType === 'semi-rimless' && 'Semi al Aire'}
                      {product.specifications.frameType === 'rimless' && 'Al Aire'}
                    </div>
                  </div>
                )}

                {product.specifications.material && (
                  <div>
                    <div className="text-sm text-gray-600">Material</div>
                    <div className="text-gray-900">{product.specifications.material}</div>
                  </div>
                )}

                {product.specifications.color && (
                  <div>
                    <div className="text-sm text-gray-600">Color</div>
                    <div className="text-gray-900">{product.specifications.color}</div>
                  </div>
                )}

                {product.specifications.size && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600">Medidas</div>
                    <div className="text-gray-900">
                      Lente: {product.specifications.size.lens}mm •
                      Puente: {product.specifications.size.bridge}mm •
                      Varilla: {product.specifications.size.temple}mm
                    </div>
                  </div>
                )}

                {product.specifications.lensType && (
                  <div>
                    <div className="text-sm text-gray-600">Tipo de Lente</div>
                    <div className="text-gray-900">
                      {product.specifications.lensType === 'single' && 'Monofocal'}
                      {product.specifications.lensType === 'bifocal' && 'Bifocal'}
                      {product.specifications.lensType === 'progressive' && 'Progresivo'}
                    </div>
                  </div>
                )}

                {product.specifications.lensMaterial && (
                  <div>
                    <div className="text-sm text-gray-600">Material Lente</div>
                    <div className="text-gray-900">{product.specifications.lensMaterial}</div>
                  </div>
                )}

                {product.specifications.index && (
                  <div>
                    <div className="text-sm text-gray-600">Índice de Refracción</div>
                    <div className="text-gray-900">{product.specifications.index}</div>
                  </div>
                )}

                {product.specifications.coatings && product.specifications.coatings.length > 0 && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600">Tratamientos</div>
                    <div className="text-gray-900">{product.specifications.coatings.join(', ')}</div>
                  </div>
                )}

                {product.specifications.baseCurve && (
                  <div>
                    <div className="text-sm text-gray-600">Curva Base</div>
                    <div className="text-gray-900">{product.specifications.baseCurve}</div>
                  </div>
                )}

                {product.specifications.diameter && (
                  <div>
                    <div className="text-sm text-gray-600">Diámetro</div>
                    <div className="text-gray-900">{product.specifications.diameter}mm</div>
                  </div>
                )}

                {product.specifications.power && (
                  <div>
                    <div className="text-sm text-gray-600">Poder</div>
                    <div className="text-gray-900">{product.specifications.power}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stock Movements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Movimientos</h2>

            {movementsLoading ? (
              <div className="text-center py-4 text-gray-500">Cargando movimientos...</div>
            ) : movements.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No hay movimientos registrados</div>
            ) : (
              <div className="space-y-3">
                {movements.slice(0, 10).map((movement) => {
                  const typeConfig = MOVEMENT_TYPE_CONFIG[movement.type];
                  return (
                    <div key={movement.id} className="flex items-center justify-between border-l-4 border-gray-200 pl-4 py-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${typeConfig.className}`}>
                            {typeConfig.icon} {typeConfig.label}
                          </span>
                          <span className="text-gray-900 font-medium">{movement.quantity} uds</span>
                        </div>
                        <div className="text-sm text-gray-600">{movement.reason}</div>
                        {movement.reference && (
                          <div className="text-xs text-gray-500">Ref: {movement.reference}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {movement.previousStock} → {movement.newStock}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(movement.date).toLocaleDateString('es-MX')}
                        </div>
                        <div className="text-xs text-gray-500">{movement.performedBy.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Supplier */}
          {product.supplier && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Proveedor</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-600">Nombre</div>
                  <div className="text-gray-900">{product.supplier.name}</div>
                </div>
                {product.supplier.contact && (
                  <div>
                    <div className="text-sm text-gray-600">Contacto</div>
                    <div className="text-gray-900">{product.supplier.contact}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images */}
          {product.images && product.images.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Imágenes</h3>
              <div className="space-y-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Información del Sistema</h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-gray-600">Creado</div>
                <div className="text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Última Actualización</div>
                <div className="text-gray-900">
                  {new Date(product.updatedAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
