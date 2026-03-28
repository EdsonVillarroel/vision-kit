import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../hooks/useSidebar';
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

  return (
    <div>
      {item.path && !hasChildren ? (
        <Link
          to={item.path}
          className={clsx(
            'w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-300 rounded-xl group relative overflow-hidden',
            level > 0 && 'pl-12 ml-2',
            isActive
              ? 'bg-gradient-to-r from-theme-primary to-theme-dark-primary text-theme-text-icons font-bold shadow-lg shadow-theme-primary/30 scale-[1.02] before:absolute before:inset-0 before:bg-white/10 before:rounded-xl'
              : 'text-theme-primary-text hover:bg-gradient-to-r hover:from-theme-light-primary/60 hover:to-theme-light-primary/40 hover:text-theme-dark-primary hover:shadow-md hover:scale-[1.01] active:scale-[0.98]'
          )}
        >
          {content}
          {isActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-theme-accent rounded-l-full" />
          )}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={clsx(
            'w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-300 rounded-xl group',
            level > 0 && 'pl-12 ml-2',
            isExpanded
              ? 'text-theme-dark-primary font-bold bg-gradient-to-r from-theme-light-primary/60 to-theme-light-primary/40 shadow-md scale-[1.01]'
              : 'text-theme-primary-text hover:bg-gradient-to-r hover:from-theme-light-primary/40 hover:to-theme-light-primary/20 hover:text-theme-dark-primary hover:shadow-sm hover:scale-[1.01] active:scale-[0.98]'
          )}
        >
          {content}
        </button>
      )}

      {hasChildren && isExpanded && !isCollapsed && (
        <div className="mt-2 space-y-1.5 pl-3 ml-6 animate-fadeIn bg-gradient-to-br from-theme-light-primary/20 to-transparent rounded-2xl py-3 border-l-2 border-theme-accent/20">
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

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-gradient-to-b from-theme-light-primary/90 via-white to-theme-light-primary/50 backdrop-blur-xl border-r border-theme-primary/10 shadow-2xl z-50 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-theme-divider/50 bg-gradient-to-r from-theme-dark-primary to-theme-primary shadow-lg backdrop-blur-sm">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-theme-accent to-theme-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg transform hover:scale-110 transition-transform duration-300">
                V
              </div>
              <h2 className="text-lg font-bold text-theme-text-icons tracking-tight">Vision Kit</h2>
            </div>
          )}
          {isCollapsed && (
            <div className="w-9 h-9 bg-gradient-to-br from-theme-accent to-theme-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto transform hover:scale-110 transition-transform duration-300">
              V
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 hidden lg:block text-theme-text-icons hover:shadow-md hover:scale-110 active:scale-95"
            aria-label="Toggle sidebar"
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
