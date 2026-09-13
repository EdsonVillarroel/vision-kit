import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../hooks/useSidebar';
import { useClinicSettings } from '../../settings/context/ClinicSettingsContext';
import type { MenuItem } from '../types';
import clsx from 'clsx';

interface SidebarProps {
  menuItems: MenuItem[];
}

const MenuItemComponent: React.FC<{ item: MenuItem; level?: number }> = ({ item, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isCollapsed, setIsOpen } = useSidebar();
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === location.pathname;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.path) {
      // Cerrar sidebar en móvil al hacer click
      setIsOpen(false);
    }
  };

  const content = (
    <>
      <span className="text-xl">{item.icon}</span>
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
          {hasChildren && (
            <svg
              className={clsx(
                'w-4 h-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </>
      )}
    </>
  );

  const rowBase =
    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group relative outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 transition-[background-color,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]';

  return (
    <div>
      {item.path && !hasChildren ? (
        <Link
          to={item.path}
          className={clsx(
            rowBase,
            level > 0 && 'pl-11',
            isActive
              ? 'bg-theme-primary text-theme-text-icons font-semibold'
              : 'text-theme-primary-text hover:bg-theme-light-primary/60 hover:text-theme-dark-primary'
          )}
        >
          {content}
          {isActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-theme-accent rounded-l-full" />
          )}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={clsx(
            rowBase,
            level > 0 && 'pl-11',
            isExpanded
              ? 'text-theme-dark-primary font-semibold bg-theme-light-primary/50'
              : 'text-theme-primary-text hover:bg-theme-light-primary/60 hover:text-theme-dark-primary'
          )}
        >
          {content}
        </button>
      )}

      {hasChildren && isExpanded && !isCollapsed && (
        <div className="mt-1 space-y-1 pl-3 ml-5 animate-fadeIn border-l border-theme-divider/50">
          {item.children?.map((child) => (
            <MenuItemComponent key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const { isOpen, isCollapsed, toggleCollapse, setIsOpen } = useSidebar();
  const { settings } = useClinicSettings();
  const clinicName = settings?.name ?? 'Vision Kit';
  const clinicLogo = settings?.logo;
  const clinicInitial = clinicName.charAt(0).toUpperCase();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-white border-r border-black/[0.06] shadow-[0_0_0_1px_rgba(16,24,40,0.02),0_8px_24px_rgba(16,24,40,0.06)] z-50 transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isCollapsed ? 'w-20' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-theme-divider/40 bg-theme-primary">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              {clinicLogo ? (
                <img src={clinicLogo} alt={clinicName} className="w-9 h-9 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 bg-theme-accent rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                  {clinicInitial}
                </div>
              )}
              <h2 className="text-lg font-bold text-theme-text-icons tracking-tight truncate">{clinicName}</h2>
            </div>
          )}
          {isCollapsed && (
            <div className="w-9 h-9 bg-theme-accent rounded-xl flex items-center justify-center text-white font-bold mx-auto overflow-hidden">
              {clinicLogo ? (
                <img src={clinicLogo} alt={clinicName} className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                clinicInitial
              )}
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 hover:bg-white/15 rounded-lg transition-colors duration-150 hidden lg:block text-theme-text-icons outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-95"
            aria-label="Contraer menú"
          >
            <svg
              className={clsx('w-5 h-5 transition-transform duration-300', isCollapsed && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-theme-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-theme-primary/50">
          {menuItems.map((item) => (
            <MenuItemComponent key={item.id} item={item} />
          ))}
        </nav>
      </aside>
    </>
  );
};
