import { Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

/* ── Static palette (non-brand) ── */
const C = {
  text:   '#2c2118',
  muted:  '#9e8a6e',
  border: '#f0e8d8',
  card:   '#ffffff',
} as const;

/* ── Social links (specific to this tenant's real accounts) ── */
const SOCIAL = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61587181355825',
    iconBg: '#e8f0fd',
    iconColor: '#1877F2',
    icon: (
      <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/opticavision.20hd',
    iconBg: '#fce8ef',
    iconColor: '#c13584',
    icon: (
      <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@vision2020hd',
    iconBg: '#f0f0f0',
    iconColor: '#010101',
    icon: (
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.87 4.87 0 01-1.01-.04z" />
      </svg>
    ),
  },
  {
    label: 'Ubicación',
    href: 'https://www.google.com/maps/place/Visi%C3%B3n+20%2F20+HD/@-17.7797196,-63.1827728,21z',
    iconBg: '#fff3d6',
    iconColor: '#b38728',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function track(cat: string, label: string) {
  window.gtag?.('event', 'click', { event_category: cat, event_label: label });
}

export default function HomePage() {
  const { clinicInfo, brandColor, path } = useTenant();

  const pale = `${brandColor}22`; // ~13% opacity tint for icon backgrounds

  const clinicName = clinicInfo?.name ?? 'Visión 20/20 HD';
  const logoSrc    = clinicInfo?.logo ?? '/logo.png';
  const phone      = clinicInfo?.phone?.replace(/\D/g, '') ?? '59168803830';
  const address    = clinicInfo?.address
    ? `${clinicInfo.address}${clinicInfo.city ? `, ${clinicInfo.city}` : ''}`
    : 'Calle Sucre #60, Santa Cruz - Bolivia';

  const waHref = `https://wa.me/${phone}?text=${encodeURIComponent('👋 Hola! Me gustaría más información sobre sus servicios 👓')}`;

  const categories = [
    {
      label: 'Monturas Hombre',
      href: `${path('catalogo')}?category=frames&gender=hombre`,
      icon: (
        <svg viewBox="0 0 48 28" fill="none" stroke={brandColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="20">
          <rect x="1" y="6" width="18" height="15" rx="7" />
          <rect x="29" y="6" width="18" height="15" rx="7" />
          <line x1="19" y1="13.5" x2="29" y2="13.5" />
          <line x1="1" y1="13.5" x2="0" y2="8" />
          <line x1="47" y1="13.5" x2="48" y2="8" />
        </svg>
      ),
    },
    {
      label: 'Monturas Mujer',
      href: `${path('catalogo')}?category=frames&gender=mujer`,
      icon: (
        <svg viewBox="0 0 48 28" fill="none" stroke={brandColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="20">
          <path d="M1 13.5C1 9.358 4.358 6 8.5 6h5C17.642 6 21 9.358 21 13.5S17.642 21 13.5 21h-5C4.358 21 1 17.642 1 13.5z" />
          <path d="M27 13.5C27 9.358 30.358 6 34.5 6h5C43.642 6 47 9.358 47 13.5S43.642 21 39.5 21h-5C30.358 21 27 17.642 27 13.5z" />
          <line x1="21" y1="13.5" x2="27" y2="13.5" />
          <line x1="1" y1="13.5" x2="0" y2="8" />
          <line x1="47" y1="13.5" x2="48" y2="8" />
          <path d="M13.5 6 Q18 3 21 6" fill="none" />
          <path d="M39.5 6 Q44 3 47 6" fill="none" />
        </svg>
      ),
    },
    {
      label: 'Niños',
      href: `${path('catalogo')}?category=frames&gender=ninos`,
      icon: (
        <svg viewBox="0 0 48 28" fill="none" stroke={brandColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="20">
          <rect x="2" y="5" width="17" height="17" rx="8.5" />
          <rect x="29" y="5" width="17" height="17" rx="8.5" />
          <line x1="19" y1="13.5" x2="29" y2="13.5" />
          <line x1="2" y1="13.5" x2="0" y2="8" />
          <line x1="46" y1="13.5" x2="48" y2="8" />
          <path d="M24 1 L24.5 2.5 L26 3 L24.5 3.5 L24 5 L23.5 3.5 L22 3 L23.5 2.5 Z" fill={brandColor} stroke="none" />
        </svg>
      ),
    },
    {
      label: 'Sol',
      href: `${path('catalogo')}?category=sunglasses`,
      icon: (
        <svg viewBox="0 0 48 28" fill="none" stroke={brandColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="20">
          <rect x="1" y="6" width="18" height="15" rx="5" />
          <rect x="29" y="6" width="18" height="15" rx="5" />
          <line x1="19" y1="13.5" x2="29" y2="13.5" />
          <line x1="1" y1="13.5" x2="0" y2="8" />
          <line x1="47" y1="13.5" x2="48" y2="8" />
          <rect x="2" y="7" width="16" height="13" rx="4" fill={pale} stroke="none" opacity="0.6" />
          <rect x="30" y="7" width="16" height="13" rx="4" fill={pale} stroke="none" opacity="0.6" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100dvh', padding: '0 16px 32px' }}>

      {/* ── PROFILE ── */}
      <section className="anim-0" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 36, paddingBottom: 20, gap: 10 }}>
        <div style={{
          width: 108, height: 108, borderRadius: '50%',
          border: `3px solid ${C.border}`,
          boxShadow: `0 4px 20px ${brandColor}22`,
          overflow: 'hidden',
          background: C.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src={logoSrc} alt={clinicName} style={{ width: 96, height: 96, objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontWeight: 800, fontSize: 26, color: C.text, textAlign: 'center', lineHeight: 1.2 }}>
          {clinicName}
        </h1>

        <p style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
          Ver Bien, Sentirte Bien
        </p>
      </section>

      {/* ── CATALOG ── */}
      <section className="anim-1" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Catálogo</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {categories.map(({ label, href, icon }) => (
            <Link
              key={label}
              to={href}
              className="cat-card"
              onClick={() => track('catalogo', label)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 10, padding: '20px 8px 16px',
                background: C.card,
                border: `1.5px solid ${C.border}`,
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                textDecoration: 'none',
                color: C.text,
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: pale,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {icon}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── WHATSAPP ── */}
      <div className="anim-2" style={{ marginBottom: 24 }}>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => track('social', 'WhatsApp')}
          className="wa-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '16px 20px',
            background: '#25D366',
            borderRadius: 50,
            color: '#fff',
            fontWeight: 700, fontSize: 16,
            textDecoration: 'none',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.121 1.532 5.849L0 24l6.335-1.641C8.024 23.406 9.978 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.574-.484-5.07-1.333l-.363-.215-3.761.975.999-3.655-.237-.376A9.959 9.959 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
          WhatsApp Directo
        </a>
      </div>

      {/* ── SOCIAL ── */}
      <section className="anim-3" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Síguenos</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {SOCIAL.map(({ label, href, iconBg, iconColor, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              onClick={() => track('social', label)}
              className="social-card"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '14px 6px',
                background: C.card,
                border: `1.5px solid ${C.border}`,
                borderRadius: 16,
                textDecoration: 'none',
                color: C.text,
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: iconBg,
                color: iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="anim-4" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#b0a090', lineHeight: 1.7 }}>{address}</p>
      </footer>

    </div>
  );
}
