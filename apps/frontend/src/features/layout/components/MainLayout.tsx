import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useSidebar } from '../hooks/useSidebar';
import type { MenuItem } from '../types';
import clsx from 'clsx';

interface MainLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
  navbar?: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, menuItems, navbar }) => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} />

      {/* Main Content */}
      <div
        className={clsx(
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Top Navbar */}
        {navbar && (
          <nav className="bg-gradient-to-r from-theme-dark-primary via-theme-primary to-theme-dark-primary shadow-2xl border-b border-theme-accent/20 fixed top-0 left-0 right-0 z-40 backdrop-blur-md">
            <div className={clsx(
              'px-4 sm:px-6 lg:px-8 transition-all duration-300',
              isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            )}>
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-4">
                  {/* Mobile menu button */}
                  <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2.5 rounded-xl text-theme-text-icons hover:bg-white/15 active:bg-white/25 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
                    aria-label="Open sidebar"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center">
                  {navbar}
                </div>
              </div>
            </div>
            {/* Bottom glow effect */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-accent/50 to-transparent"></div>
          </nav>
        )}

        {/* Page Content */}
        <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};
