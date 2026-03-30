import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Spinner } from '../components/ui/Spinner';
import { publicApi } from '../lib/api';
import type { BookingConfirmation, CreateBookingPayload } from '../types';

const SERVICES = [
  'Examen visual',
  'Adaptación de lentes de contacto',
  'Selección de monturas',
  'Ajuste de lentes',
  'Consulta de seguimiento',
  'Emergencia visual',
  'Otro',
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
];

// Mínima fecha disponible: mañana
function minDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const preService = searchParams.get('service') ?? '';

  const [form, setForm] = useState<CreateBookingPayload>({
    name: '',
    phone: '',
    email: '',
    serviceType: SERVICES.includes(preService) ? preService : 'Examen visual',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  function validate(): string | null {
    if (!form.name.trim()) return 'El nombre es requerido';
    if (!form.phone.trim()) return 'El teléfono es requerido';
    if (!/^[\d\s+\-()]+$/.test(form.phone)) return 'Teléfono inválido — solo dígitos y + - ( )';
    if (!form.preferredDate) return 'Selecciona una fecha';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }

    setStatus('loading');
    setErrorMsg('');

    try {
      const result = await publicApi.createBooking({
        ...form,
        email: form.email || undefined,
        preferredTime: form.preferredTime || undefined,
        notes: form.notes || undefined,
      });
      setConfirmation(result);
      setStatus('success');
      window.gtag?.('event', 'booking_submitted', {
        event_category: 'reservas',
        event_label: form.serviceType,
      });
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al enviar la reserva');
      setStatus('error');
    }
  }

  if (status === 'success' && confirmation) {
    return (
      <div className="min-h-screen bg-[#f5f0eb]">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl shadow-sm border border-[#f0e8d8] p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[#2c2118] mb-2">¡Reserva recibida!</h2>
            <p className="text-[#9e8a6e] mb-6">{confirmation.message}</p>
            <div className="bg-[#fdf0d5] rounded-2xl p-4 text-left text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-[#9e8a6e]">Nombre</span>
                <span className="font-semibold text-[#2c2118]">{confirmation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9e8a6e]">Servicio</span>
                <span className="font-semibold text-[#2c2118]">{confirmation.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9e8a6e]">Fecha preferida</span>
                <span className="font-semibold text-[#2c2118]">
                  {new Date(confirmation.preferredDate).toLocaleDateString('es-BO', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/" className="py-3 rounded-2xl bg-[#c17d2a] text-white font-bold hover:bg-[#9a621e] transition-colors">
                Volver al inicio
              </Link>
              <a
                href="https://wa.me/59168803830?text=Hola!%20Acabo%20de%20enviar%20una%20reserva%20online%20y%20quisiera%20confirmar."
                target="_blank"
                rel="noreferrer"
                className="py-3 rounded-2xl bg-[#25D366] text-white font-bold hover:bg-[#1ebe5d] transition-colors flex items-center justify-center gap-2"
              >
                Confirmar por WhatsApp
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-[#2c2118] mb-2">Reservar cita</h1>
        <p className="text-[#9e8a6e] text-sm mb-8">
          Completa el formulario y te contactamos para confirmar tu cita.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-[#f0e8d8] p-6 space-y-4">

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-[#2c2118] mb-1.5">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Juan Pérez"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl border border-[#f0e8d8] bg-[#fdf9f5] text-sm focus:outline-none focus:border-[#c17d2a] transition-colors"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-[#2c2118] mb-1.5">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+591 68803830"
              maxLength={20}
              className="w-full px-4 py-2.5 rounded-xl border border-[#f0e8d8] bg-[#fdf9f5] text-sm focus:outline-none focus:border-[#c17d2a] transition-colors"
            />
          </div>

          {/* Email (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-[#2c2118] mb-1.5">
              Email <span className="text-[#9e8a6e] font-normal">(opcional)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl border border-[#f0e8d8] bg-[#fdf9f5] text-sm focus:outline-none focus:border-[#c17d2a] transition-colors"
            />
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-semibold text-[#2c2118] mb-1.5">
              Servicio que necesitas <span className="text-red-500">*</span>
            </label>
            <select
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#f0e8d8] bg-[#fdf9f5] text-sm focus:outline-none focus:border-[#c17d2a] transition-colors"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Fecha preferida */}
          <div>
            <label className="block text-sm font-semibold text-[#2c2118] mb-1.5">
              Fecha preferida <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.preferredDate}
              min={minDate()}
              onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#f0e8d8] bg-[#fdf9f5] text-sm focus:outline-none focus:border-[#c17d2a] transition-colors"
            />
          </div>

          {/* Hora preferida */}
          <div>
            <label className="block text-sm font-semibold text-[#2c2118] mb-1.5">
              Hora preferida <span className="text-[#9e8a6e] font-normal">(opcional)</span>
            </label>
            <select
              value={form.preferredTime}
              onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#f0e8d8] bg-[#fdf9f5] text-sm focus:outline-none focus:border-[#c17d2a] transition-colors"
            >
              <option value="">Sin preferencia</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-[#2c2118] mb-1.5">
              Notas adicionales <span className="text-[#9e8a6e] font-normal">(opcional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ej: Tengo dificultad para ver de lejos, uso lentes desde hace 5 años…"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[#f0e8d8] bg-[#fdf9f5] text-sm focus:outline-none focus:border-[#c17d2a] transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 rounded-2xl bg-[#c17d2a] hover:bg-[#9a621e] disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <><Spinner className="w-5 h-5" /> Enviando…</>
            ) : (
              '📅 Solicitar reserva'
            )}
          </button>

          <p className="text-xs text-center text-[#9e8a6e]">
            También puedes escribirnos directamente por{' '}
            <a href="https://wa.me/59168803830" target="_blank" rel="noreferrer" className="text-[#25D366] hover:underline">
              WhatsApp
            </a>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
