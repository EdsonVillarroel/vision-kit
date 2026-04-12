import { useTenant } from '../../context/TenantContext';

export const Footer = () => {
  const { clinicInfo } = useTenant();

  const name    = clinicInfo?.name ?? 'Visión 20/20 HD';
  const address = clinicInfo?.address ?? 'Calle Sucre #60 entre Av. 24 de Septiembre y calle Libertad';
  const city    = clinicInfo?.city ?? 'Santa Cruz — Bolivia';
  const phone   = clinicInfo?.phone ?? '+591 68803830';
  const digits  = phone.replace(/\D/g, '');

  return (
    <footer className="mt-12 py-8 text-center text-[#9e8a6e] text-sm border-t border-[#f0e8d8]">
      <p className="font-medium text-[#2c2118]">{name}</p>
      <p>{address}</p>
      <p>{city}</p>
      <a
        href={`https://wa.me/${digits}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 mt-3 text-[#25D366] font-medium hover:underline"
      >
        {phone}
      </a>
    </footer>
  );
};
