import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../ui/Button';
import Swal from 'sweetalert2';

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
  // Mostrar 'Gestión de Auxiliares' solo si el rol es 'coordinador' o 'admin' (sin importar mayúsculas/minúsculas)
  if (!['coordinador', 'admin'].includes(userRole.toLowerCase())) {
    visibleTabs = allTabs.filter(tab => tab.id !== 'auxiliares');
  }

  const handleGestionCasosClick = async () => {
    await Swal.fire({
      title: '<span style="color:#39A900">Selecciona el tipo de caso</span>',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      showCloseButton: true,
      html: `
        <button id="btn-caso-general" class="swal2-styled" style="background-color:#39A900;color:#fff;margin:8px 0;width:100%;font-size:1.1rem;">Caso General</button><br/>
        <button id="btn-caso-especial" class="swal2-styled" style="background-color:#39A900;color:#fff;margin:8px 0;width:100%;font-size:1.1rem;">Caso Especial</button><br/>
        <button id="btn-caso-acudientes" class="swal2-styled" style="background-color:#39A900;color:#fff;margin:8px 0;width:100%;font-size:1.1rem;">Caso de Acudientes</button>
      `,
      showConfirmButton: false,
      width: 400,
      background: '#fff',
      color: '#39A900',
      didOpen: () => {
        const btnGeneral = Swal.getPopup()?.querySelector('#btn-caso-general');
        if (btnGeneral) {
          btnGeneral.addEventListener('click', () => {
            Swal.close();
            onTabChange('caso-general');
          });
        }
        const btnEspecial = Swal.getPopup()?.querySelector('#btn-caso-especial');
        if (btnEspecial) {
          btnEspecial.addEventListener('click', () => {
            Swal.close();
            onTabChange('caso-especial');
          });
        }
        const btnAcudientes = Swal.getPopup()?.querySelector('#btn-caso-acudientes');
        if (btnAcudientes) {
          btnAcudientes.addEventListener('click', () => {
            Swal.close();
            onTabChange('caso-acudientes');
          });
        }
      }
    });
  };

  const handleCasoOptionClick = (option: string) => {
    onTabChange(option);
    setIsDropdownOpen(false);
  };

  // Notificación dinámica para gestión de inventario
  const handleGestionInventarioClick = async () => {
    await Swal.fire({
      title: '<span style="color:#39A900">Selecciona una opción de inventario</span>',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      showCloseButton: true,
      html: `
        <button id="btn-inv-activos" class="swal2-styled" style="background-color:#39A900;color:#fff;margin:8px 0;width:100%;font-size:1.1rem;">Préstamos Activos</button><br/>
        <button id="btn-inv-registrar" class="swal2-styled" style="background-color:#39A900;color:#fff;margin:8px 0;width:100%;font-size:1.1rem;">Registrar Préstamo</button><br/>
        <button id="btn-inv-devolucion" class="swal2-styled" style="background-color:#39A900;color:#fff;margin:8px 0;width:100%;font-size:1.1rem;">Registrar Devolución</button>
      `,
      showConfirmButton: false,
      width: 400,
      background: '#fff',
      color: '#39A900',
      didOpen: () => {
        const btnActivos = Swal.getPopup()?.querySelector('#btn-inv-activos');
        if (btnActivos) {
          btnActivos.addEventListener('click', () => {
            Swal.close();
            onTabChange('prestamos-list');
          });
        }
        const btnRegistrar = Swal.getPopup()?.querySelector('#btn-inv-registrar');
        if (btnRegistrar) {
          btnRegistrar.addEventListener('click', () => {
            Swal.close();
            onTabChange('prestamos-create');
          });
        }
        const btnDevolucion = Swal.getPopup()?.querySelector('#btn-inv-devolucion');
        if (btnDevolucion) {
          btnDevolucion.addEventListener('click', () => {
            Swal.close();
            onTabChange('prestamos-devolucion');
          });
        }
      }
    });
  };

  // Notificación dinámica para gestión de usuarios
  const handleGestionUsuariosClick = async () => {
    await Swal.fire({
      title: '<span style="color:#39A900">Selecciona una opción de usuarios</span>',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      showCloseButton: true,
      html: `
        <button id="btn-usuarios-activos" class="swal2-styled" style="background-color:#39A900;color:#fff;margin:8px 0;width:100%;font-size:1.1rem;">Usuarios Activos</button><br/>
        <button id="btn-usuarios-nuevo" class="swal2-styled" style="background-color:#39A900;color:#fff;margin:8px 0;width:100%;font-size:1.1rem;">Nuevo Usuario</button><br/>
        <button id="btn-usuarios-editar" class="swal2-styled" style="background-color:#39A900;color:#fff;margin:8px 0;width:100%;font-size:1.1rem;">Editar Usuario</button>
      `,
      showConfirmButton: false,
      width: 400,
      background: '#fff',
      color: '#39A900',
      didOpen: () => {
        const btnActivos = Swal.getPopup()?.querySelector('#btn-usuarios-activos');
        if (btnActivos) {
          btnActivos.addEventListener('click', () => {
            Swal.close();
            onTabChange('auxiliares-list');
          });
        }
        const btnNuevo = Swal.getPopup()?.querySelector('#btn-usuarios-nuevo');
        if (btnNuevo) {
          btnNuevo.addEventListener('click', () => {
            Swal.close();
            onTabChange('auxiliares-create');
          });
        }
        const btnEditar = Swal.getPopup()?.querySelector('#btn-usuarios-editar');
        if (btnEditar) {
          btnEditar.addEventListener('click', () => {
            Swal.close();
            onTabChange('auxiliares-edit');
          });
        }
      }
    });
  };

  return (
    <aside className="w-56 bg-gradient-to-b from-[#39A900] via-[#39A900] to-[#39A900] text-white p-4 flex flex-col h-screen shadow-2xl">
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
                        ? 'bg-[#39A900] border-l-4 border-white' 
                        : 'bg-white/80 text-[#39A900] hover:bg-[#e8f5e9]'
                    } focus:ring-2 focus:ring-white`}
                    style={{ minHeight: 44 }}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                  </Button>
                </div>
              ) : (
                tab.id === 'prestamos' ? (
                  <Button
                    variant={currentTab === tab.id ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={handleGestionInventarioClick}
                    className={`justify-start flex items-center gap-2 text-base font-semibold rounded-lg shadow-md transition-all duration-150 px-4 py-2 ${
                      currentTab === tab.id 
                        ? 'bg-[#39A900] border-l-4 border-white' 
                        : 'bg-white/80 text-[#39A900] hover:bg-[#e8f5e9]'
                    } focus:ring-2 focus:ring-white`}
                    style={{ minHeight: 44 }}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                  </Button>
                ) : tab.id === 'auxiliares' ? (
                  <Button
                    variant={currentTab === 'usuarios' ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={() => onTabChange('usuarios')}
                    className={`justify-start flex items-center gap-2 text-base font-semibold rounded-lg shadow-md transition-all duration-150 px-4 py-2 ${
                      currentTab === 'usuarios' 
                        ? 'bg-[#39A900] border-l-4 border-white' 
                        : 'bg-white/80 text-[#39A900] hover:bg-[#e8f5e9]'
                    } focus:ring-2 focus:ring-white`}
                    style={{ minHeight: 44 }}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                  </Button>
                ) : (
                  <Button
                    variant={currentTab === tab.id ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={() => onTabChange(tab.id)}
                    className={`justify-start flex items-center gap-2 text-base font-semibold rounded-lg shadow-md transition-all duration-150 px-4 py-2 ${
                      currentTab === tab.id 
                        ? 'bg-[#39A900] border-l-4 border-white' 
                        : 'bg-white/80 text-[#39A900] hover:bg-[#e8f5e9]'
                    } focus:ring-2 focus:ring-white`}
                    style={{ minHeight: 44 }}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                  </Button>
                )
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 