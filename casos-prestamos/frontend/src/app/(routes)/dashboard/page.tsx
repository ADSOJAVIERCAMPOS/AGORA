'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import DashboardStats from '@/components/feature/dashboard/DashboardStats';
import PrestamoList from '@/components/feature/prestamos/PrestamoList';
import PrestamoForm from '@/components/feature/prestamos/PrestamoForm';
import AuxiliarList from '@/components/feature/auxiliares/AuxiliarList';
import AuxiliarForm from '@/components/feature/auxiliares/AuxiliarForm';
import CasoForm from '@/components/feature/casos/CasoForm';
import CasoEspecialForm from '@/components/feature/casos/CasoEspecialForm';
import CasoAcudienteForm from '@/components/feature/casos/CasoAcudienteForm';
import SignaturePad from '@/components/ui/SignaturePad';
import AvatarUserHeader from '@/components/ui/AvatarUserHeader';
import Button from '@/components/ui/Button';
import Swal from 'sweetalert2';

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

interface Prestamo {
  id: number;
  numeroCaso: string;
  nombreAprendiz: string;
  itemPrestado: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  estado: 'activo' | 'devuelto' | 'pendiente';
  documentos: {
    nombre: string;
    tipo: string;
    url: string;
  }[];
}

interface Auxiliar {
  id: number;
  nombreCompleto: string;
  email: string;
  estado: boolean;
}

interface DevolucionData {
  fechaDevolucion: string;
  observaciones: string;
  firma: string;
  documentos?: File[];
  horaFinal?: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function DashboardPage() {
  // Estados para el Dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState<string | null>(null);

  // Estados para las Pestañas de contenido dinámico
  const [currentMainTab, setCurrentMainTab] = useState<'caso-general' | 'caso-especial' | 'caso-acudientes' | 'prestamos' | 'auxiliares'>('caso-general');

  // Estados para Préstamos
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loadingPrestamos, setLoadingPrestamos] = useState(false);
  const [errorPrestamos, setErrorPrestamos] = useState<string | null>(null);
  const [currentPrestamoTab, setCurrentPrestamoTab] = useState<'list' | 'create' | 'devolucion'>('list');

  // Estados para Auxiliares
  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);
  const [loadingAuxiliares, setLoadingAuxiliares] = useState(false);
  const [errorAuxiliares, setErrorAuxiliares] = useState<string | null>(null);
  const [currentAuxiliarTab, setCurrentAuxiliarTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingAuxiliar, setEditingAuxiliar] = useState<Auxiliar | null>(null);

  // Estados para el modal de devolución
  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [devolucionData, setDevolucionData] = useState<DevolucionData>({
    fechaDevolucion: '',
    observaciones: '',
    firma: ''
  });
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);

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

  // --- Funciones de Préstamos ---
  const fetchPrestamos = async () => {
    setLoadingPrestamos(true);
    setErrorPrestamos(null);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/prestamos', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Fallo al cargar préstamos.');
      }
      const data: Prestamo[] = await res.json();
      setPrestamos(data);
    } catch (err: any) {
      console.error('Error fetching prestamos:', err);
      setErrorPrestamos(err.message || 'No se pudieron cargar los préstamos.');
    } finally {
      setLoadingPrestamos(false);
    }
  };

  const handleCreatePrestamo = async (formData: FormData) => {
    setLoadingPrestamos(true);
    setErrorPrestamos(null);
    const token = localStorage.getItem('token');
    
    try {
      // Validar archivos
      const documentos = formData.getAll('documentos') as File[];
      for (const doc of documentos) {
        if (doc.size > 5 * 1024 * 1024) { // 5MB
          throw new Error('Los archivos no deben superar 5MB');
        }
        const tipo = doc.type.toLowerCase();
        if (!['application/pdf', 'image/jpeg', 'image/png'].includes(tipo)) {
          throw new Error('Solo se permiten archivos PDF, JPG y PNG');
        }
      }

      const res = await fetch('/api/prestamos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al registrar el préstamo');
      }

      const data = await res.json();
      Swal.fire({
        title: '¡Préstamo registrado!',
        text: `Número de caso: ${data.data.numeroCaso}`,
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      setCurrentPrestamoTab('list');
      fetchPrestamos();
    } catch (err: any) {
      console.error('Error creating prestamo:', err);
      setErrorPrestamos(err.message || 'Error al registrar el préstamo');
    } finally {
      setLoadingPrestamos(false);
    }
  };

  const handleUpdatePrestamoStatus = async (id: number, newState: 'activo' | 'devuelto' | 'pendiente') => {
    setLoadingPrestamos(true);
    setErrorPrestamos(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/prestamos/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: newState }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Fallo al actualizar estado del préstamo ${id}.`);
      }
      Swal.fire({
        title: '¡Estado actualizado!',
        text: `Estado del préstamo ${id} actualizado a ${newState}.`,
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      fetchPrestamos();
    } catch (err: any) {
      console.error('Error updating prestamo status:', err);
      setErrorPrestamos(err.message || 'Error al actualizar el estado del préstamo.');
    } finally {
      setLoadingPrestamos(false);
    }
  };

  const handleDevolucionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prestamoSeleccionado) return;

    // Validar campos obligatorios
    if (!devolucionData.horaFinal) {
      setErrorPrestamos('La hora final es obligatoria');
      return;
    }

    setLoadingPrestamos(true);
    setErrorPrestamos(null);
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('fechaDevolucion', devolucionData.fechaDevolucion);
      formData.append('horaFinal', devolucionData.horaFinal);
      formData.append('prestamoId', prestamoSeleccionado.id.toString());

      const res = await fetch(`${API_BASE_URL}/api/prestamos/${prestamoSeleccionado.id}/devolucion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al registrar la devolución');
      }

      Swal.fire({
        title: '¡Devolución registrada!',
        text: 'La devolución fue registrada exitosamente.',
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      setShowDevolucionModal(false);
      setDevolucionData({
        fechaDevolucion: '',
        observaciones: '',
        firma: '',
        horaFinal: '',
      });
      setPrestamoSeleccionado(null);
      fetchPrestamos();
    } catch (err: any) {
      console.error('Error al registrar devolución:', err);
      setErrorPrestamos(err.message || 'Error al registrar la devolución');
    } finally {
      setLoadingPrestamos(false);
    }
  };

  const handleIniciarDevolucion = (prestamo: Prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setCurrentPrestamoTab('devolucion');
  };

  // --- Funciones de Auxiliares ---
  const fetchAuxiliares = async () => {
    setLoadingAuxiliares(true);
    setErrorAuxiliares(null);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auxiliares`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Fallo al cargar auxiliares.`);
      }
      const data: Auxiliar[] = await res.json();
      setAuxiliares(data);
    } catch (err: any) {
      console.error('Error fetching auxiliares:', err);
      setErrorAuxiliares(err.message || 'No se pudieron cargar los auxiliares.');
    } finally {
      setLoadingAuxiliares(false);
    }
  };

  const handleCreateAuxiliar = async (newAuxiliarData: Omit<Auxiliar, 'id' | 'estado'>) => {
    setLoadingAuxiliares(true);
    setErrorAuxiliares(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auxiliares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newAuxiliarData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Fallo al crear auxiliar.');
      }
      Swal.fire({
        title: '¡Auxiliar creado!',
        text: 'Auxiliar creado exitosamente.',
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      fetchAuxiliares();
      setCurrentAuxiliarTab('list');
    } catch (err: any) {
      console.error('Error creating auxiliar:', err);
      setErrorAuxiliares(err.message || 'Error al crear el auxiliar.');
    } finally {
      setLoadingAuxiliares(false);
    }
  };

  const handleUpdateAuxiliar = async (updatedAuxiliarData: Auxiliar) => {
    setLoadingAuxiliares(true);
    setErrorAuxiliares(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auxiliares/${updatedAuxiliarData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedAuxiliarData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Fallo al actualizar auxiliar.');
      }
      Swal.fire({
        title: '¡Auxiliar actualizado!',
        text: 'Auxiliar actualizado exitosamente.',
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      fetchAuxiliares();
      setCurrentAuxiliarTab('list');
      setEditingAuxiliar(null);
    } catch (err: any) {
      console.error('Error updating auxiliar:', err);
      setErrorAuxiliares(err.message || 'Error al actualizar el auxiliar.');
    } finally {
      setLoadingAuxiliares(false);
    }
  };

  const handleToggleAuxiliarStatus = async (auxiliarId: number, currentStatus: boolean) => {
    setLoadingAuxiliares(true);
    setErrorAuxiliares(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auxiliares/${auxiliarId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: !currentStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Fallo al cambiar estado del auxiliar.');
      }
      Swal.fire({
        title: '¡Estado cambiado!',
        text: `Estado del auxiliar ${auxiliarId} cambiado a ${!currentStatus ? 'Activo' : 'Inactivo'}.`,
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      fetchAuxiliares();
    } catch (err: any) {
      console.error('Error toggling auxiliar status:', err);
      setErrorAuxiliares(err.message || 'Error al cambiar el estado del auxiliar.');
    } finally {
      setLoadingAuxiliares(false);
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
        onTabChange={(tab: string) => {
          if (tab === 'gestion-casos') {
            setCurrentMainTab('caso-general');
          } else if (tab === 'prestamos-list' || tab === 'prestamos-create' || tab === 'prestamos-devolucion') {
            setCurrentMainTab('prestamos');
            if (tab === 'prestamos-list') setCurrentPrestamoTab('list');
            if (tab === 'prestamos-create') setCurrentPrestamoTab('create');
            if (tab === 'prestamos-devolucion') setCurrentPrestamoTab('devolucion');
          } else if (tab === 'auxiliares-list' || tab === 'auxiliares-create' || tab === 'auxiliares-edit') {
            setCurrentMainTab('auxiliares');
            if (tab === 'auxiliares-list') setCurrentAuxiliarTab('list');
            if (tab === 'auxiliares-create') setCurrentAuxiliarTab('create');
            if (tab === 'auxiliares-edit') setCurrentAuxiliarTab('edit');
          } else {
            setCurrentMainTab(tab as 'caso-general' | 'caso-especial' | 'caso-acudientes' | 'prestamos' | 'auxiliares');
          }
        }}
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

        {currentMainTab === 'caso-general' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Crear Caso General
            </h1>
            <CasoForm
              tipoCaso="general"
              onSubmit={handleCrearCaso}
              onCancel={() => setCurrentMainTab('caso-general')}
            />
            {/* Tabla de ejemplo de casos generales */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-2">Casos Generales Registrados</h2>
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">N° Caso</th>
                    <th className="px-4 py-2 border-b">Aprendiz</th>
                    <th className="px-4 py-2 border-b">Descripción</th>
                    <th className="px-4 py-2 border-b">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">CG-2024-001</td>
                    <td className="px-4 py-2 border-b">Javier Campos</td>
                    <td className="px-4 py-2 border-b">Solicitud de cambio de horario</td>
                    <td className="px-4 py-2 border-b">2024-06-01</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CG-2024-002</td>
                    <td className="px-4 py-2 border-b">Andres Castro</td>
                    <td className="px-4 py-2 border-b">Solicitud de certificado</td>
                    <td className="px-4 py-2 border-b">2024-06-02</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CG-2024-003</td>
                    <td className="px-4 py-2 border-b">Carlos Moquito</td>
                    <td className="px-4 py-2 border-b">Solicitud de constancia</td>
                    <td className="px-4 py-2 border-b">2024-06-03</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CG-2024-004</td>
                    <td className="px-4 py-2 border-b">Juanito Alimaña</td>
                    <td className="px-4 py-2 border-b">Solicitud de traslado</td>
                    <td className="px-4 py-2 border-b">2024-06-04</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CG-2024-001</td>
                    <td className="px-4 py-2 border-b">Alejandro</td>
                    <td className="px-4 py-2 border-b">Solicitud de cambio de horario</td>
                    <td className="px-4 py-2 border-b">2024-06-01</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentMainTab === 'caso-especial' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Crear Caso Especial
            </h1>
            <CasoEspecialForm
              onSubmit={handleCrearCaso}
              onCancel={() => setCurrentMainTab('caso-general')}
            />
            {/* Tabla de ejemplo de casos especiales */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-2">Casos Especiales Registrados</h2>
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">N° Caso</th>
                    <th className="px-4 py-2 border-b">Aprendiz</th>
                    <th className="px-4 py-2 border-b">Tipo</th>
                    <th className="px-4 py-2 border-b">Gravedad</th>
                    <th className="px-4 py-2 border-b">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">CE-2024-002</td>
                    <td className="px-4 py-2 border-b">Ana Gómez</td>
                    <td className="px-4 py-2 border-b">Discapacidad</td>
                    <td className="px-4 py-2 border-b">Alto</td>
                    <td className="px-4 py-2 border-b">2024-06-02</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CE-2024-003</td>
                    <td className="px-4 py-2 border-b">Pedro Martínez</td>
                    <td className="px-4 py-2 border-b">Cognitivo</td>
                    <td className="px-4 py-2 border-b">Medio</td>
                    <td className="px-4 py-2 border-b">2024-06-03</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CE-2024-004</td>
                    <td className="px-4 py-2 border-b">Sofía Vargas</td>
                    <td className="px-4 py-2 border-b">Otro</td>
                    <td className="px-4 py-2 border-b">Bajo</td>
                    <td className="px-4 py-2 border-b">2024-06-04</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CE-2024-005</td>
                    <td className="px-4 py-2 border-b">Diego Rojas</td>
                    <td className="px-4 py-2 border-b">Discapacidad</td>
                    <td className="px-4 py-2 border-b">Alto</td>
                    <td className="px-4 py-2 border-b">2024-06-05</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentMainTab === 'caso-acudientes' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Crear Caso de Acudientes
            </h1>
            <CasoAcudienteForm
              onSubmit={handleCrearCaso}
              onCancel={() => setCurrentMainTab('caso-general')}
            />
            {/* Tabla de ejemplo de casos de acudientes */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-2">Casos de Acudientes Registrados</h2>
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">N° Caso</th>
                    <th className="px-4 py-2 border-b">Aprendiz</th>
                    <th className="px-4 py-2 border-b">Acudiente</th>
                    <th className="px-4 py-2 border-b">Tipo</th>
                    <th className="px-4 py-2 border-b">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">CA-2024-003</td>
                    <td className="px-4 py-2 border-b">Carlos Ruiz</td>
                    <td className="px-4 py-2 border-b">María Ruiz</td>
                    <td className="px-4 py-2 border-b">Permiso</td>
                    <td className="px-4 py-2 border-b">2024-06-03</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CA-2024-004</td>
                    <td className="px-4 py-2 border-b">Daniela Mora</td>
                    <td className="px-4 py-2 border-b">José Mora</td>
                    <td className="px-4 py-2 border-b">Justificación</td>
                    <td className="px-4 py-2 border-b">2024-06-04</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CA-2024-005</td>
                    <td className="px-4 py-2 border-b">Andrés Silva</td>
                    <td className="px-4 py-2 border-b">Rosa Silva</td>
                    <td className="px-4 py-2 border-b">Permiso</td>
                    <td className="px-4 py-2 border-b">2024-06-05</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">CA-2024-006</td>
                    <td className="px-4 py-2 border-b">Valeria Pino</td>
                    <td className="px-4 py-2 border-b">Miguel Pino</td>
                    <td className="px-4 py-2 border-b">Justificación</td>
                    <td className="px-4 py-2 border-b">2024-06-06</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentMainTab === 'prestamos' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Gestión de Inventario
            </h1>

            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => { setCurrentPrestamoTab('list'); fetchPrestamos(); }}
                className={`px-6 py-3 font-medium ${
                  currentPrestamoTab === 'list'
                    ? 'text-[#51c814] border-b-2 border-[#51c814]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Préstamos Activos
              </button>
              <button
                onClick={() => setCurrentPrestamoTab('create')}
                className={`px-6 py-3 font-medium ${
                  currentPrestamoTab === 'create'
                    ? 'text-[#51c814] border-b-2 border-[#51c814]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Registrar Préstamo
              </button>
              <button
                onClick={() => setCurrentPrestamoTab('devolucion')}
                className={`px-6 py-3 font-medium ${
                  currentPrestamoTab === 'devolucion'
                    ? 'text-[#51c814] border-b-2 border-[#51c814]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Registrar Devolución
              </button>
            </div>

            {loadingPrestamos && (
              <p className="text-center text-blue-500">Cargando...</p>
            )}
            {errorPrestamos && (
              <p className="text-center text-red-500">Error: {errorPrestamos}</p>
            )}

            {currentPrestamoTab === 'list' && !loadingPrestamos && !errorPrestamos && (
              <PrestamoList
                prestamos={prestamos}
                onStatusChange={handleUpdatePrestamoStatus}
                onIniciarDevolucion={handleIniciarDevolucion}
              />
            )}

            {currentPrestamoTab === 'create' && (
              <PrestamoForm
                onSave={handleCreatePrestamo}
                onCancel={() => setCurrentPrestamoTab('list')}
              />
            )}

            {currentPrestamoTab === 'devolucion' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Registrar Devolución</h2>
                <form onSubmit={handleDevolucionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seleccionar Préstamo</label>
                    <select
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#51c814] focus:ring-[#51c814]"
                      value={prestamoSeleccionado?.id || ''}
                      onChange={(e) => {
                        const prestamo = prestamos.find(p => p.id === Number(e.target.value));
                        setPrestamoSeleccionado(prestamo || null);
                      }}
                    >
                      <option value="">Seleccione un préstamo</option>
                      {prestamos
                        .filter(p => p.estado === 'activo')
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.numeroCaso} - {p.nombreAprendiz} - {p.itemPrestado}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {prestamoSeleccionado && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora Final</label>
                        <input
                          type="time"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#51c814] focus:ring-[#51c814]"
                          value={devolucionData.horaFinal || ''}
                          onChange={(e) => setDevolucionData({...devolucionData, horaFinal: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setPrestamoSeleccionado(null);
                            setDevolucionData({ fechaDevolucion: '', observaciones: '', firma: '', horaFinal: '' });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#51c814] text-white rounded-md hover:bg-[#45a812]"
                        >
                          Aprobar Devolución
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {currentMainTab === 'auxiliares' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Gestión de Usuarios Auxiliares
            </h1>

            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => { setCurrentAuxiliarTab('list'); setEditingAuxiliar(null); fetchAuxiliares(); }}
                className={`px-6 py-3 font-medium ${
                  currentAuxiliarTab === 'list'
                    ? 'text-[#51c814] border-b-2 border-[#51c814]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Usuarios Activos
              </button>
              <button
                onClick={() => { setCurrentAuxiliarTab('create'); setEditingAuxiliar(null); }}
                className={`px-6 py-3 font-medium ${
                  currentAuxiliarTab === 'create'
                    ? 'text-[#51c814] border-b-2 border-[#51c814]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Nuevo Usuario
              </button>
              {currentAuxiliarTab === 'edit' && (
                <button className="px-6 py-3 font-medium text-[#51c814] border-b-2 border-[#51c814]">
                  Editar Usuario
                </button>
              )}
            </div>

            {loadingAuxiliares && (
              <p className="text-center text-blue-500">Cargando usuarios...</p>
            )}
            {errorAuxiliares && (
              <p className="text-center text-red-500">Error: {errorAuxiliares}</p>
            )}

            {currentAuxiliarTab === 'list' && !loadingAuxiliares && !errorAuxiliares && (
              <AuxiliarList
                auxiliares={[
                  {
                    id: 1,
                    nombreCompleto: 'Auxiliar 1',
                    email: 'auxiliar1@example.com',
                    estado: true
                  },
                  {
                    id: 2,
                    nombreCompleto: 'Auxiliar 2',
                    email: 'auxiliar2@example.com',
                    estado: true
                  },
                  {
                    id: 3,
                    nombreCompleto: 'Auxiliar 3',
                    email: 'auxiliar3@example.com',
                    estado: false
                  },
                  {
                    id: 4,
                    nombreCompleto: 'Auxiliar 4',
                    email: 'auxiliar4@example.com',
                    estado: false
                  }
                ]}
                onEdit={(auxiliar) => { setEditingAuxiliar(auxiliar); setCurrentAuxiliarTab('edit'); }}
                onToggleStatus={handleToggleAuxiliarStatus}
              />
            )}

            {(currentAuxiliarTab === 'create' || currentAuxiliarTab === 'edit') && (
              <AuxiliarForm
                auxiliar={editingAuxiliar || undefined}
                onSave={currentAuxiliarTab === 'create' ? handleCreateAuxiliar : (data) => handleUpdateAuxiliar(data as Auxiliar)}
                onCancel={() => { setCurrentAuxiliarTab('list'); setEditingAuxiliar(null); }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}