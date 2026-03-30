import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/catalog/ProductCard';
import { TopBar } from '../components/layout/TopBar';
import { Spinner } from '../components/ui/Spinner';
import { publicApi } from '../lib/api';
import type { Product } from '../types';

/* ─ Page title from URL params ─ */
const CATEGORY_LABELS: Record<string, string> = {
  frames:          'Monturas',
  sunglasses:      'Gafas de Sol',
  lenses:          'Lentes',
  'contact-lenses':'Lentes de Contacto',
  accessories:     'Accesorios',
};

const GENDER_LABELS: Record<string, string> = {
  hombre: 'Hombre',
  mujer:  'Mujer',
  ninos:  'Niños',
};

function buildTitle(category: string, gender: string): string {
  const cat = CATEGORY_LABELS[category] ?? 'Catálogo';
  const gen = GENDER_LABELS[gender];
  return gen ? `${cat} — ${gen}` : cat;
}

export default function CatalogPage() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const category = params.get('category') ?? '';
  const gender   = params.get('gender')   ?? '';
  const pageTitle = buildTitle(category, gender);

  useEffect(() => {
    setPage(1);
  }, [category, gender]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    publicApi
      .getCatalog({ category: category || undefined, page, limit: 20 })
      .then((res) => {
        if (!cancelled) {
          setProducts(res.data);
          setTotal(res.meta.total);
          setTotalPages(res.meta.totalPages);
        }
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [category, page]);

  return (
    <div style={{ background: '#fff', minHeight: '100dvh' }}>
      <TopBar title={pageTitle} />

      <main style={{ maxWidth: 430, margin: '0 auto', padding: '16px 16px 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <Spinner className="w-10 h-10" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: '#9e8a6e', fontSize: 14 }}>
            {error}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: '#9e8a6e' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ fontWeight: 600, fontSize: 14 }}>No encontramos productos</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Escríbenos por WhatsApp</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: '#9e8a6e', marginBottom: 14 }}>
              {total} producto{total !== 1 ? 's' : ''}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 28 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '8px 18px', borderRadius: 50,
                    border: '1px solid #f0e8d8', background: '#fff',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    opacity: page === 1 ? 0.4 : 1,
                  }}
                >
                  ← Anterior
                </button>
                <span style={{ fontSize: 13, color: '#9e8a6e' }}>{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '8px 18px', borderRadius: 50,
                    border: '1px solid #f0e8d8', background: '#fff',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    opacity: page === totalPages ? 0.4 : 1,
                  }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
