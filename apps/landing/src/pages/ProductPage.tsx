import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { Spinner } from '../components/ui/Spinner';
import { useTenant } from '../context/TenantContext';
import { publicApi } from '../lib/api';
import type { Product } from '../types';

function buildWaMessage(product: Product, phone: string): string {
  const text = `Hola! Me interesa *${product.name}* (Bs. ${product.sellingPrice.toLocaleString()}). ¿Está disponible?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/* Spec field label mapping */
const SPEC_LABELS: Record<string, string> = {
  material:   'Material',
  frameType:  'Tipo de montura',
  color:      'Color',
  lensType:   'Tipo de lente',
  lensSize:   'Tamaño de lente',
};

const MEASURE_LABELS: Record<string, string> = {
  lensWidth: 'Ancho lente',
  bridge:    'Puente',
  temple:    'Varilla',
};

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0',
      borderBottom: '1px solid #f0e8d8',
      fontSize: 14,
    }}>
      <span style={{ color: '#9e8a6e' }}>{label}</span>
      <span style={{ fontWeight: 700, color: '#2c2118' }}>{value}</span>
    </div>
  );
}

const WaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.121 1.532 5.849L0 24l6.335-1.641C8.024 23.406 9.978 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.574-.484-5.07-1.333l-.363-.215-3.761.975.999-3.655-.237-.376A9.959 9.959 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

export default function ProductPage() {
  const { tenantSlug, clinicInfo, path } = useTenant();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgIdx, setImgIdx] = useState(0);

  const phone = clinicInfo?.phone?.replace(/\D/g, '') ?? '59168803830';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    publicApi
      .getProduct(tenantSlug, id)
      .then(setProduct)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ background: '#fff', minHeight: '100dvh' }}>
        <TopBar title="Cargando…" />
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Spinner className="w-10 h-10" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ background: '#fff', minHeight: '100dvh' }}>
        <TopBar title="Producto" />
        <div style={{ textAlign: 'center', paddingTop: 80, color: '#9e8a6e' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>😕</p>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#2c2118' }}>Producto no disponible</p>
          <button
            onClick={() => navigate(path('catalogo'))}
            style={{ marginTop: 16, color: '#c17d2a', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer' }}
          >
            ← Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const waHref = buildWaMessage(product, phone);

  /* Specs & measures */
  const specs = product.specifications
    ? Object.entries(product.specifications).filter(([k, v]) => v != null && k in SPEC_LABELS)
    : [];

  const measures = product.specifications
    ? Object.entries(product.specifications as Record<string, unknown>)
        .filter(([k, v]) => v != null && k in MEASURE_LABELS)
    : [];

  return (
    <div style={{ background: '#fff', minHeight: '100dvh', paddingBottom: 96 }}>
      <TopBar title={product.name} />

      <main style={{ maxWidth: 430, margin: '0 auto' }}>

        {/* ── IMAGE CAROUSEL ── */}
        <div style={{ position: 'relative', background: '#f7f7f7', aspectRatio: '4/3', overflow: 'hidden' }}>
          {images.length > 0 ? (
            <img
              key={imgIdx}
              src={images[imgIdx]}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="#c17d2a" strokeWidth={0.7} opacity={0.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12c0-2.5 2-4 5-4s5 2 5 2 2-2 5-2 5 1.5 5 4-2 4-5 4-5-2-5-2-2 2-5 2-5-1.5-5-4z" />
              </svg>
            </div>
          )}

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.88)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2c2118" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.88)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2c2118" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 12, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', gap: 6,
            }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  style={{
                    width: i === imgIdx ? 20 : 7,
                    height: 7,
                    borderRadius: 99,
                    background: i === imgIdx ? '#c17d2a' : 'rgba(255,255,255,0.7)',
                    border: 'none', cursor: 'pointer',
                    transition: 'width 0.2s ease, background 0.2s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── PRODUCT INFO ── */}
        <div style={{ padding: '20px 20px 0' }}>
          <h1 style={{ fontWeight: 700, fontSize: 22, color: '#2c2118', lineHeight: 1.25, marginBottom: 6 }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#c17d2a', marginBottom: 12 }}>
            Bs. {product.sellingPrice.toLocaleString()}
          </p>

          {/* Description */}
          {product.brand && (
            <p style={{ fontSize: 14, color: '#6b5c4d', lineHeight: 1.6, marginBottom: 16 }}>
              {product.brand}
            </p>
          )}

          <div style={{ borderTop: '1px solid #f0e8d8', marginBottom: 0 }} />

          {/* Especificaciones */}
          {specs.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#2c2118', marginBottom: 4 }}>
                Especificaciones
              </p>
              {specs.map(([key, val]) => (
                <SpecRow key={key} label={SPEC_LABELS[key]} value={String(val)} />
              ))}
            </div>
          )}

          {/* Medidas */}
          {measures.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#2c2118', marginBottom: 4 }}>
                Medidas
              </p>
              {measures.map(([key, val]) => (
                <SpecRow key={key} label={MEASURE_LABELS[key]} value={`${val} mm`} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── FIXED BOTTOM CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderTop: '1px solid #f0e8d8',
        padding: '12px 20px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => window.gtag?.('event', 'whatsapp_product', { event_category: 'product', event_label: product.name })}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', maxWidth: 390,
            padding: '14px 20px',
            borderRadius: 50,
            background: '#25D366',
            color: '#fff',
            fontWeight: 700, fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
          }}
        >
          <WaIcon /> Reservar por WhatsApp
        </a>
        <Link
          to={path('catalogo')}
          style={{ fontSize: 13, color: '#9e8a6e', fontWeight: 500, textDecoration: 'none' }}
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
