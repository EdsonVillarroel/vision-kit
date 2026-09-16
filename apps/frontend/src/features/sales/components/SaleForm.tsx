import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import type { SaleFormData, SaleItem, PaymentMethod } from '../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { inventoryService } from '../../inventory/services/inventoryService';
import type { Product } from '../../inventory/types';
import { useAuth } from '../../auth/hooks/useAuth';
import { PatientSearch } from '../../patients/components/PatientSearch';
import { patientService } from '../../patients/services/patientService';
import { clinicalExamService } from '../../clinical-exams/services/clinicalExamService';
import type { ClinicalExamFormData } from '../../clinical-exams/types';
import { useClinicSettings } from '../../settings/context/ClinicSettingsContext';
import { useSnackbar } from '../../../components/Snackbar';
import type { Patient } from '../../patients/types';

interface SaleFormProps {
  onSubmit: (data: SaleFormData) => Promise<void>;
}

export const SaleForm: React.FC<SaleFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { user } = useAuth();
  const { settings } = useClinicSettings();
  const { showSuccess, showError } = useSnackbar();

  // IVA desde configuración de la clínica (Bolivia = 13%)
  const TAX_RATE = settings?.taxRate ?? 0.13;
  const TAX_PCT = Math.round(TAX_RATE * 100);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Productos del inventario
  const [products, setProducts] = useState<Product[]>([]);
  const [, setLoadingProducts] = useState(true);

  // Cliente
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [clientMode, setClientMode] = useState<'search' | 'new'>('search');
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({ firstName: '', lastName: '', phone: '' });

  // Medida opcional (visión de lejos + DP), se guarda como examen del cliente
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [measurement, setMeasurement] = useState({
    odSphere: '', odCylinder: '', odAxis: '',
    oiSphere: '', oiCylinder: '', oiAxis: '',
    pdRight: '', pdLeft: ''
  });

  const [formData, setFormData] = useState({
    patientId: patientId || '',
    patientName: '',
    notes: '',
    globalDiscount: 0,
    paymentMethod: 'cash' as PaymentMethod
  });

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`
    });
  };

  const handleCreateClient = async () => {
    if (!newClient.firstName.trim() || !newClient.lastName.trim()) {
      showError('Nombre y apellido son obligatorios');
      return;
    }
    setCreatingClient(true);
    try {
      const created = await patientService.create({
        firstName: newClient.firstName.trim(),
        lastName: newClient.lastName.trim(),
        phone: newClient.phone.trim() || undefined,
      } as Parameters<typeof patientService.create>[0]);
      handlePatientSelect(created);
      setClientMode('search');
      setNewClient({ firstName: '', lastName: '', phone: '' });
      showSuccess('Cliente creado y seleccionado');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setCreatingClient(false);
    }
  };

  const hasMeasurement =
    !!measurement.odSphere || !!measurement.odCylinder || !!measurement.odAxis ||
    !!measurement.oiSphere || !!measurement.oiCylinder || !!measurement.oiAxis ||
    !!measurement.pdRight || !!measurement.pdLeft;

  const [items, setItems] = useState<Array<Omit<SaleItem, 'subtotal' | 'total'>>>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);

  // Para pagos mixtos
  const [showMixedPayment, setShowMixedPayment] = useState(false);
  const [payments, setPayments] = useState<Array<{ method: PaymentMethod; amount: number; reference?: string }>>([]);
  const [currentPayment, setCurrentPayment] = useState<{ method: PaymentMethod; amount: string; reference: string }>({
    method: 'cash',
    amount: '',
    reference: ''
  });

  // Cargar productos del inventario
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await inventoryService.getAllProducts();
        // Filtrar solo productos con stock disponible
        setProducts(data.filter(p => p.stock > 0));
      } catch (err) {
        console.error('Error al cargar productos:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const itemDiscounts = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * item.discount / 100);
    }, 0);
    const globalDiscountAmount = (subtotal * formData.globalDiscount) / 100;
    const subtotalAfterDiscount = subtotal - itemDiscounts - globalDiscountAmount;
    const tax = subtotalAfterDiscount * TAX_RATE;
    const total = subtotalAfterDiscount + tax;

    return {
      subtotal,
      itemDiscounts,
      globalDiscountAmount,
      totalDiscount: itemDiscounts + globalDiscountAmount,
      tax,
      total
    };
  };

  const totals = calculateTotals();

  const filteredProducts = products.filter((p: Product) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const addItem = () => {
    if (!selectedProduct) return;

    // Verificar stock disponible
    if (quantity > selectedProduct.stock) {
      setError(`Stock insuficiente. Disponible: ${selectedProduct.stock} unidades`);
      return;
    }

    const newItem: Omit<SaleItem, 'subtotal' | 'total'> = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSku: selectedProduct.sku,
      quantity,
      unitPrice: selectedProduct.sellingPrice,
      discount: itemDiscount
    };

    setItems([...items, newItem]);
    setSelectedProduct(null);
    setSearchProduct('');
    setQuantity(1);
    setItemDiscount(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addPayment = () => {
    const amount = parseFloat(currentPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Ingrese un monto válido');
      return;
    }

    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPayments + amount > totals.total) {
      setError('El total de pagos excede el monto de la venta');
      return;
    }

    setPayments([...payments, {
      method: currentPayment.method,
      amount,
      reference: currentPayment.reference || undefined
    }]);

    setCurrentPayment({ method: 'cash', amount: '', reference: '' });
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (items.length === 0) {
      setError('Debe agregar al menos un producto');
      setLoading(false);
      return;
    }

    if (!formData.patientId) {
      setError('Debe seleccionar un paciente');
      setLoading(false);
      return;
    }

    // Validar pagos mixtos
    if (formData.paymentMethod === 'mixed') {
      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalPayments - totals.total) > 0.01) {
        setError(`El total de pagos (${totalPayments.toFixed(2)}) debe coincidir con el total de la venta (${totals.total.toFixed(2)})`);
        setLoading(false);
        return;
      }
    }

    // 1) Medida opcional → se guarda como examen del cliente antes de la venta
    if (hasMeasurement) {
      const num = (v: string) => (v === '' ? 0 : parseFloat(v));
      const examData: ClinicalExamFormData = {
        patientId: formData.patientId,
        date: new Date().toISOString().split('T')[0],
        examinerId: user?.id || '',
        farVision: {
          right: { sphere: num(measurement.odSphere), cylinder: num(measurement.odCylinder), axis: num(measurement.odAxis), prism: 0, base: '' },
          left: { sphere: num(measurement.oiSphere), cylinder: num(measurement.oiCylinder), axis: num(measurement.oiAxis), prism: 0, base: '' },
        },
        pupillaryDistance: {
          right: measurement.pdRight ? parseFloat(measurement.pdRight) : undefined,
          left: measurement.pdLeft ? parseFloat(measurement.pdLeft) : undefined,
        },
      };
      try {
        await clinicalExamService.create(examData);
        showSuccess('Medida registrada');
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Error al registrar la medida');
        setLoading(false);
        return; // abortar antes de la venta para que el usuario reintente
      }
    }

    try {
      // 2) Venta (el hook de ventas muestra el error de API como snackbar)
      const submitData: SaleFormData = {
        patientId: formData.patientId,
        items,
        discount: formData.globalDiscount,
        paymentMethod: formData.paymentMethod,
        payments: formData.paymentMethod === 'mixed' ? payments : undefined,
        notes: formData.notes,
        soldBy: {
          id: user?.id || 'UNKNOWN',
          name: user?.name || 'Usuario Desconocido'
        }
      };

      await onSubmit(submitData);
      navigate('/sales');
    } catch {
      // El error de API de la venta ya se muestra como snackbar desde el hook;
      // se mantiene al usuario en el formulario sin navegar.
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Principal - Productos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Cliente */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900">Cliente</h2>
              <div className="inline-flex rounded-lg bg-gray-100 p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setClientMode('search')}
                  className={clsx(
                    'px-3 py-1.5 rounded-md font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40',
                    clientMode === 'search' ? 'bg-white text-theme-dark-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('new')}
                  className={clsx(
                    'px-3 py-1.5 rounded-md font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40',
                    clientMode === 'new' ? 'bg-white text-theme-dark-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  + Cliente nuevo
                </button>
              </div>
            </div>

            {clientMode === 'search' ? (
              <PatientSearch
                onSelect={handlePatientSelect}
                showCreateButton={false}
                autoFocus={true}
              />
            ) : (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Nombre *"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                    autoFocus
                  />
                  <Input
                    label="Apellido *"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Button type="button" onClick={handleCreateClient} disabled={creatingClient} className="!w-auto px-5">
                    {creatingClient ? 'Creando...' : 'Crear y usar cliente'}
                  </Button>
                  <p className="text-xs text-gray-500">Solo nombre y apellido son obligatorios.</p>
                </div>
              </div>
            )}

            {selectedPatient && clientMode === 'search' && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 ring-1 ring-inset ring-green-600/20">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cliente seleccionado: <span className="font-semibold">{formData.patientName}</span>
              </div>
            )}
          </div>

          {/* Medida del cliente (opcional) */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              type="button"
              onClick={() => setShowMeasurement((v) => !v)}
              className="flex w-full items-center justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded-lg"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">Medida del cliente <span className="text-sm font-normal text-gray-500">(opcional)</span></h2>
                <p className="text-sm text-gray-500 mt-1">Se guarda como examen del cliente junto con la venta.</p>
              </div>
              <svg className={clsx('h-5 w-5 text-gray-500 transition-transform duration-200', showMeasurement && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMeasurement && (
              <div className="mt-5 space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-semibold text-theme-primary mb-2">Ojo Derecho (D)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Input label="Esférico" type="number" step="0.25" value={measurement.odSphere} onChange={(e) => setMeasurement({ ...measurement, odSphere: e.target.value })} />
                    <Input label="Cilíndrico" type="number" step="0.25" value={measurement.odCylinder} onChange={(e) => setMeasurement({ ...measurement, odCylinder: e.target.value })} />
                    <Input label="Eje" type="number" min="0" max="180" value={measurement.odAxis} onChange={(e) => setMeasurement({ ...measurement, odAxis: e.target.value })} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-theme-primary mb-2">Ojo Izquierdo (I)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Input label="Esférico" type="number" step="0.25" value={measurement.oiSphere} onChange={(e) => setMeasurement({ ...measurement, oiSphere: e.target.value })} />
                    <Input label="Cilíndrico" type="number" step="0.25" value={measurement.oiCylinder} onChange={(e) => setMeasurement({ ...measurement, oiCylinder: e.target.value })} />
                    <Input label="Eje" type="number" min="0" max="180" value={measurement.oiAxis} onChange={(e) => setMeasurement({ ...measurement, oiAxis: e.target.value })} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-theme-primary mb-2">Distancia Pupilar (DP) <span className="font-normal text-gray-500">— opcional</span></h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="DP Derecha" type="number" step="0.5" placeholder="Opcional" value={measurement.pdRight} onChange={(e) => setMeasurement({ ...measurement, pdRight: e.target.value })} />
                    <Input label="DP Izquierda" type="number" step="0.5" placeholder="Opcional" value={measurement.pdLeft} onChange={(e) => setMeasurement({ ...measurement, pdLeft: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Agregar Productos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agregar Productos</h2>
            <div className="space-y-4">
              {/* Búsqueda de Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Producto
                </label>
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="Buscar por nombre o SKU..."
                  className="w-full px-4 py-2 border border-theme-divider rounded-lg focus:ring-2 focus:ring-theme-primary/30"
                />
                {searchProduct && filteredProducts.length > 0 && (
                  <div className="mt-2 border border-theme-divider rounded-lg max-h-48 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSearchProduct(product.name);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {product.sku} - Bs {product.sellingPrice.toLocaleString()}
                          <span className="text-xs ml-2">({product.stock} disponibles)</span>
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Detalles del producto seleccionado */}
              {selectedProduct && (
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Cantidad"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                  <Input
                    label="Descuento (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={itemDiscount}
                    onChange={(e) => setItemDiscount(parseFloat(e.target.value) || 0)}
                  />
                  <div className="flex items-end">
                    <Button type="button" onClick={addItem} className="w-full">
                      Agregar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Productos en la Venta</h2>
            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay productos agregados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Producto</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-700">Cant.</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-700">Precio</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-700">Desc.</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-700">Total</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-700">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => {
                      const itemTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
                      return (
                        <tr key={index}>
                          <td className="py-2 text-sm text-gray-900">{item.productName}</td>
                          <td className="py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                          <td className="py-2 text-sm text-gray-900 text-right">
                            Bs {item.unitPrice.toLocaleString()}
                          </td>
                          <td className="py-2 text-sm text-gray-600 text-right">
                            {item.discount > 0 ? `${item.discount}%` : '-'}
                          </td>
                          <td className="py-2 text-sm font-medium text-gray-900 text-right">
                            Bs {itemTotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Panel Lateral - Resumen y Pago */}
        <div className="space-y-6">
          {/* Resumen de Totales */}
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  Bs {totals.subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuentos:</span>
                  <span className="font-medium text-red-600">
                    -Bs {totals.totalDiscount.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA ({TAX_PCT}%):</span>
                <span className="font-medium text-gray-900">
                  Bs {totals.tax.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">
                  Bs {totals.total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Descuento Global */}
            <div className="mb-6">
              <Input
                label="Descuento Global (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.globalDiscount}
                onChange={(e) => setFormData({ ...formData, globalDiscount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            {/* Método de Pago */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => {
                  const method = e.target.value as PaymentMethod;
                  setFormData({ ...formData, paymentMethod: method });
                  setShowMixedPayment(method === 'mixed');
                  setPayments([]);
                }}
                className="w-full px-4 py-2 border border-theme-divider rounded-lg focus:ring-2 focus:ring-theme-primary/30"
                required
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="check">Cheque</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>

            {/* Pagos Mixtos */}
            {showMixedPayment && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Pagos Múltiples</h3>
                <div className="space-y-3 mb-3">
                  <select
                    value={currentPayment.method}
                    onChange={(e) => setCurrentPayment({ ...currentPayment, method: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 border border-theme-divider rounded-lg text-sm"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="check">Cheque</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Monto"
                    value={currentPayment.amount}
                    onChange={(e) => setCurrentPayment({ ...currentPayment, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-theme-divider rounded-lg text-sm"
                  />
                  {currentPayment.method !== 'cash' && (
                    <input
                      type="text"
                      placeholder="Referencia (opcional)"
                      value={currentPayment.reference}
                      onChange={(e) => setCurrentPayment({ ...currentPayment, reference: e.target.value })}
                      className="w-full px-3 py-2 border border-theme-divider rounded-lg text-sm"
                    />
                  )}
                  <button
                    type="button"
                    onClick={addPayment}
                    className="w-full px-3 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-dark-primary text-sm"
                  >
                    Agregar Pago
                  </button>
                </div>

                {payments.length > 0 && (
                  <div className="space-y-2">
                    {payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                        <span className="text-gray-700">
                          {payment.method} - Bs {payment.amount.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePayment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="text-sm font-medium pt-2 border-t">
                      <div className="flex justify-between">
                        <span>Total Pagado:</span>
                        <span>Bs {payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Falta:</span>
                        <span>Bs {(totals.total - payments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
                className="w-full px-4 py-2 border border-theme-divider rounded-lg focus:ring-2 focus:ring-theme-primary/30"
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Procesando...' : 'Completar Venta'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/sales')}
                disabled={loading}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
