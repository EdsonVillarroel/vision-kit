import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
}

const C = { text: '#2c2118', border: '#f0e8d8', muted: '#9e8a6e' } as const;

export const TopBar = ({ title }: Props) => {
  const navigate = useNavigate();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff',
      borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center',
      height: 52, padding: '0 16px',
      gap: 8,
    }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: C.text, fontWeight: 500, fontSize: 14,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 0', flexShrink: 0,
        }}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Title — centered */}
      <span style={{
        flex: 1, textAlign: 'center',
        fontWeight: 700, fontSize: 15, color: C.text,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {title}
      </span>

      {/* Logo */}
      <img src="/logo.png" alt="logo" style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} />
    </header>
  );
};
