import { createContext, type ReactNode, useContext, useState } from 'react';
import type { SidebarContextType } from '../types';

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsOpen(prev => !prev);
  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  return (
    <SidebarContext.Provider value={{
      isOpen,
      isCollapsed,
      toggleSidebar,
      toggleCollapse,
      setIsOpen
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
