'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import DashboardStats from '@/components/feature/dashboard/DashboardStats';
import AvatarUserHeader from '@/components/ui/AvatarUserHeader';
import Button from '@/components/ui/Button';
import Swal from 'sweetalert2';

// Importar los nuevos componentes separados
import CasoGeneralSection from '@/components/dashboard/CasoGeneralSection';
import CasoEspecialSection from '@/components/dashboard/CasoEspecialSection';
import CasoAcudienteSection from '@/components/dashboard/CasoAcudienteSection';
import PrestamoSection from '@/components/dashboard/PrestamoSection';
import UsuarioSection from '@/components/dashboard/UsuarioSection';

// Interfaces
interface DashboardData {
  casosActivos: number;
  casosActivosTrend: string;
  casosPendientes: number;
  casosPendientesTrend: string;
  casosResueltos: number;
  casosResueltosTrend: string;
  userName: string;
  userRole: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function DashboardPage() {
  // Estados para el Dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState<string | null>(null);

  // Estados para las Pestañas de contenido dinámico
  const [currentMainTab, setCurrentMainTab] = useState<'caso-general' | 'caso-especial' | 'caso-acudientes' | 'prestamos' | 'usuarios'>('caso-general');
  const [currentPrestamoSubTab, setCurrentPrestamoSubTab] = useState<'list' | 'create' | 'devolucion'>('list');

  const router = useRouter();

  // --- Efecto para cargar datos del dashboard ---
  useEffect(() => {
    const fetchInitialDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard-data`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            router.push('/');
            return;
          }
          const errorData = await res.json();
          throw new Error(errorData.message || `Error ${res.status}: Fallo al cargar los datos iniciales.`);
        }

        const data: DashboardData = await res.json();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Error fetching initial dashboard data:', err);
        setErrorDashboard(err.message || 'No se pudieron cargar los datos del usuario.');
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchInitialDashboardData();
  }, [router]);

  // --- Función wrapper para manejar el cambio de tabs ---
  const handleTabChange = (tab: string) => {
    if (tab === 'caso-general') setCurrentMainTab('caso-general');
    else if (tab === 'caso-especial') setCurrentMainTab('caso-especial');
    else if (tab === 'caso-acudientes') setCurrentMainTab('caso-acudientes');
    else if (tab === 'prestamos' || tab === 'prestamos-list') {
      setCurrentMainTab('prestamos');
      setCurrentPrestamoSubTab('list');
    }
    else if (tab === 'prestamos-create') {
      setCurrentMainTab('prestamos');
      setCurrentPrestamoSubTab('create');
    }
    else if (tab === 'prestamos-devolucion') {
      setCurrentMainTab('prestamos');
      setCurrentPrestamoSubTab('devolucion');
    }
    else if (tab === 'usuarios') setCurrentMainTab('usuarios');
  };

  // --- Función para crear casos ---
  const handleCrearCaso = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('token');
      const tipoCaso = formData.get('tipoCaso') as string;
      
      let endpoint = '';
      switch (tipoCaso) {
        case 'general':
          endpoint = '/api/casos-generales';
          break;
        case 'especial':
          endpoint = '/api/casos-especiales';
          break;
        case 'acudiente':
          endpoint = '/api/casos-acudientes';
          break;
        default:
          throw new Error('Tipo de caso no válido');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el caso');
      }

      const data = await response.json();
      Swal.fire({
        title: '¡Caso creado!',
        text: `Número de caso: ${data.data.numeroCaso}`,
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el caso. Por favor, intente nuevamente.',
        width: 600,
        padding: '3em',
        color: '#b71c1c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'error'
      });
    }
  };

  // --- Logout ---
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (logoutError) {
      console.error('Error al hacer logout en el backend:', logoutError);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      router.push('/');
    }
  };

  // --- Renderizado Condicional Inicial ---
  if (loadingDashboard) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl text-gray-700">
        Cargando datos del usuario...
      </div>
    );
  }

  if (errorDashboard) {
    return (
      <div className="text-center p-5 text-lg text-red-500">
        Error: {errorDashboard}
        <button
          onClick={() => router.push('/')}
          className="ml-4 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
        >
          Volver al Login
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-5 text-lg text-red-500">
        No se pudo cargar la información del dashboard.
      </div>
    );
  }

  // --- Contenido Principal ---
  return (
    <div 
      className="flex min-h-screen bg-gray-100"
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 240, 240, 0.9) 100%), url('https://img.freepik.com/vector-premium/templo-ilustrado-estilo-dibujos-animados_592324-10903.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Sidebar
        userName={dashboardData.userName}
        userRole={dashboardData.userRole.name}
        currentTab={currentMainTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-10">
        {/* Header superior derecho global */}
        <div className="flex justify-end items-start gap-8 mb-8 pr-8">
          <AvatarUserHeader userName={dashboardData.userName} userRole={dashboardData.userRole.name} />
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="bg-[#e53935] hover:bg-[#b71c1c] text-white font-bold shadow-md border-none px-6 py-3 text-lg rounded-lg"
          >
            <span className="mr-2">🚪</span>Cerrar Sesión
          </Button>
        </div>

        {/* Renderizado condicional de secciones */}
        {currentMainTab === 'caso-general' && (
          <CasoGeneralSection 
            onSubmit={handleCrearCaso}
            setCurrentMainTab={handleTabChange}
          />
        )}

        {currentMainTab === 'caso-especial' && (
          <CasoEspecialSection 
            onSubmit={handleCrearCaso}
            setCurrentMainTab={handleTabChange}
          />
        )}

        {currentMainTab === 'caso-acudientes' && (
          <CasoAcudienteSection 
            onSubmit={handleCrearCaso}
            setCurrentMainTab={handleTabChange}
          />
        )}

        {currentMainTab === 'prestamos' && (
          <PrestamoSection 
            API_BASE_URL={API_BASE_URL} 
            initialTab={currentPrestamoSubTab}
            onTabChange={setCurrentPrestamoSubTab}
          />
        )}

        {currentMainTab === 'usuarios' && (
          <UsuarioSection 
            API_BASE_URL={API_BASE_URL}
            userRole={dashboardData.userRole.name}
            setCurrentMainTab={handleTabChange}
          />
        )}
      </main>
    </div>
  );
}