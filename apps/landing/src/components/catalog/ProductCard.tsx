import { Link } from 'react-router-dom';
import type { Product } from '../../types';

const WA_BASE = 'https://wa.me/59168803830?text=';

function buildWaMessage(product: Product): string {
  const text = `Hola! Me interesa *${product.name}* (Bs. ${product.sellingPrice.toLocaleString()}). ¿Está disponible?`;
  return WA_BASE + encodeURIComponent(text);
}

function trackEvent(label: string) {
  window.gtag?.('event', 'whatsapp_product', { event_category: 'catalog', event_label: label });
}

const WaIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.121 1.532 5.849L0 24l6.335-1.641C8.024 23.406 9.978 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.574-.484-5.07-1.333l-.363-.215-3.761.975.999-3.655-.237-.376A9.959 9.959 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export const ProductCard = ({ product }: { product: Product }) => {
  const image = product.images?.[0];
  const subtitle = product.specifications?.material ?? product.brand ?? null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #f0e8d8',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Image */}
      <Link to={`/catalogo/${product.id}`} style={{ display: 'block', aspectRatio: '1', background: '#fafafa', overflow: 'hidden' }}>
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#c17d2a" strokeWidth={0.8} opacity={0.35}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12c0-2.5 2-4 5-4s5 2 5 2 2-2 5-2 5 1.5 5 4-2 4-5 4-5-2-5-2-2 2-5 2-5-1.5-5-4z" />
              <circle cx="7" cy="12" r="1.5" fill="#c17d2a" stroke="none" />
              <circle cx="17" cy="12" r="1.5" fill="#c17d2a" stroke="none" />
            </svg>
          </div>
        )}
      </Link>

      {/* Info */}
      <div style={{ padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#2c2118', lineHeight: 1.3, marginBottom: 2 }}>
            {product.name}
          </p>
          {subtitle && (
            <p style={{ fontSize: 12, color: '#9e8a6e', fontWeight: 400 }}>{subtitle}</p>
          )}
        </div>

        <p style={{ fontSize: 18, fontWeight: 700, color: '#c17d2a', marginTop: 2 }}>
          Bs. {product.sellingPrice.toLocaleString()}
        </p>

        {/* Reservar */}
        <a
          href={buildWaMessage(product)}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent(product.name)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: '#25D366',
            color: '#fff',
            fontWeight: 600, fontSize: 13,
            padding: '9px 0',
            borderRadius: 50,
            textDecoration: 'none',
            marginTop: 4,
          }}
        >
          <WaIcon /> Reservar
        </a>

        {/* Ver detalle */}
        <Link
          to={`/catalogo/${product.id}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            color: '#9e8a6e',
            fontWeight: 500, fontSize: 12,
            padding: '7px 0',
            borderRadius: 50,
            border: '1px solid #f0e8d8',
            textDecoration: 'none',
          }}
        >
          <EyeIcon /> Ver detalle
        </Link>
      </div>
    </div>
  );
};
