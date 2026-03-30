export const Spinner = ({ className = '' }: { className?: string }) => (
  <div
    className={`inline-block rounded-full border-4 border-[#e8d9b0] border-t-[#c17d2a] animate-spin ${className}`}
  />
);
