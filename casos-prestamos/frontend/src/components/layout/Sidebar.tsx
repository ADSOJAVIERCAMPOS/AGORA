import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../ui/Button';

interface SidebarProps {
  userName: string;
  userRole: string;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  userName,
  userRole,
  currentTab,
  onTabChange,
  onLogout
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Tabs logic by role name
  const allTabs = [
    { id: 'gestion-casos', label: 'Gestión de Casos', icon: '📝', isDropdown: true },
    { id: 'prestamos', label: 'Gestión de Inventario', icon: '📋' },
    { id: 'auxiliares', label: 'Gestión de Usuarios', icon: '🧑‍💼' }
  ];

  let visibleTabs = allTabs;
  // Solo mostrar 'Gestión de Auxiliares' si el rol es 'coordinador'
  if (userRole !== 'coordinador') {
    visibleTabs = allTabs.filter(tab => tab.id !== 'auxiliares');
  }

  const handleGestionCasosClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCasoOptionClick = (option: string) => {
    onTabChange(option);
    setIsDropdownOpen(false);
  };

  return (
    <aside className="w-56 bg-gradient-to-b from-[#6ee7b7] via-[#51c814] to-[#388e3c] text-white p-4 flex flex-col h-screen shadow-2xl">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <Image 
            src="/logo-sena.png" 
            alt="SENA Logo" 
            fill
            className="drop-shadow-2xl object-contain"
            priority
          />
        </div>
        <h1 className="text-center">
          <span className="block text-2xl font-extrabold tracking-widest uppercase text-white drop-shadow-lg leading-tight">AGORA</span>
          <span className="block text-xl font-bold tracking-wider uppercase text-white drop-shadow-lg mt-1">ADSO</span>
        </h1>
      </div>

      <div className="border-b border-white/30 mb-6"></div>

      <nav className="flex-1">
        <ul className="space-y-3">
          {visibleTabs.map((tab) => (
            <li key={tab.id}>
              {tab.isDropdown ? (
                <div>
                  <Button
                    variant={currentTab.startsWith('caso-') ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={handleGestionCasosClick}
                    className={`justify-start flex items-center gap-2 text-base font-semibold rounded-lg shadow-md transition-all duration-150 px-4 py-2 ${
                      currentTab.startsWith('caso-') 
                        ? 'bg-[#388e3c] border-l-4 border-white' 
                        : 'bg-white/80 text-[#388e3c] hover:bg-[#e8f5e9]'
                    } focus:ring-2 focus:ring-white`}
                    style={{ minHeight: 44 }}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                  </Button>
                  {isDropdownOpen && (
                    <div className="mt-2 ml-4 space-y-1">
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => handleCasoOptionClick('caso-general')}
                        className="justify-start bg-white/80 text-[#388e3c] hover:bg-[#e8f5e9] rounded px-4 py-1"
                      >
                        Caso General
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => handleCasoOptionClick('caso-especial')}
                        className="justify-start bg-white/80 text-[#388e3c] hover:bg-[#e8f5e9] rounded px-4 py-1"
                      >
                        Caso Especial
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => handleCasoOptionClick('caso-acudientes')}
                        className="justify-start bg-white/80 text-[#388e3c] hover:bg-[#e8f5e9] rounded px-4 py-1"
                      >
                        Caso de Acudientes
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant={currentTab === tab.id ? 'primary' : 'secondary'}
                  fullWidth
                  onClick={() => onTabChange(tab.id)}
                  className={`justify-start flex items-center gap-2 text-base font-semibold rounded-lg shadow-md transition-all duration-150 px-4 py-2 ${
                    currentTab === tab.id 
                      ? 'bg-[#388e3c] border-l-4 border-white' 
                      : 'bg-white/80 text-[#388e3c] hover:bg-[#e8f5e9]'
                  } focus:ring-2 focus:ring-white`}
                  style={{ minHeight: 44 }}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 