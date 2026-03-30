import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const HomePage    = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f5f0eb]">
    <div className="w-10 h-10 rounded-full border-4 border-[#e8d9b0] border-t-[#c17d2a] animate-spin" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"             element={<HomePage />} />
        <Route path="/catalogo"     element={<CatalogPage />} />
        <Route path="/catalogo/:id" element={<ProductPage />} />
        <Route path="/reservar"     element={<BookingPage />} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
