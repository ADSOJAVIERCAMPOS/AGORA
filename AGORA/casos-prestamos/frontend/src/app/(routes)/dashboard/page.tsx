'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import DashboardStats from '@/components/feature/dashboard/DashboardStats';
import PrestamoList from '@/components/feature/prestamos/PrestamoList';
import PrestamoForm from '@/components/feature/prestamos/PrestamoForm';
import UsuarioList from '@/components/feature/usuarios/UsuarioList';
import UsuarioForm from '@/components/feature/usuarios/UsuarioForm';
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

interface Usuario {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  role_id: number;
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
  const [currentMainTab, setCurrentMainTab] = useState<'caso-general' | 'caso-especial' | 'caso-acudientes' | 'prestamos' | 'usuarios'>('caso-general');

  // Estados para Préstamos
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loadingPrestamos, setLoadingPrestamos] = useState(false);
  const [errorPrestamos, setErrorPrestamos] = useState<string | null>(null);
  const [currentPrestamoTab, setCurrentPrestamoTab] = useState<'list' | 'create' | 'devolucion'>('list');

  // Estados para Usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  const [currentUsuarioTab, setCurrentUsuarioTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

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

  // --- Funciones de Usuarios ---
  const fetchUsuarios = async () => {
    console.log('Iniciando fetchUsuarios...');
    setLoadingUsuarios(true);
    setErrorUsuarios(null);
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No hay token, saliendo...');
      return;
    }

    try {
      console.log('Haciendo petición a:', `${API_BASE_URL}/api/usuarios`);
      const res = await fetch(`${API_BASE_URL}/api/usuarios`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Respuesta recibida:', res.status, res.statusText);
      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Fallo al cargar usuarios.`);
        } else {
          const errorText = await res.text();
          throw new Error(errorText || `Fallo al cargar usuarios.`);
        }
      }
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
      console.log('Datos recibidos:', data);
      setUsuarios(data);
    } catch (err: any) {
      console.error('Error fetching usuarios:', err);
      setErrorUsuarios(err.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleCreateUsuario = async (newUsuarioData: Omit<Usuario, 'id' | 'is_active'>) => {
    setLoadingUsuarios(true);
    setErrorUsuarios(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newUsuarioData),
      });
      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Fallo al crear usuario.');
        } else {
          const errorText = await res.text();
          throw new Error(errorText || 'Fallo al crear usuario.');
        }
      }
      if (contentType && contentType.includes('application/json')) {
        await res.json();
      }
      Swal.fire({
        title: '¡Usuario creado!',
        text: 'Usuario creado exitosamente.',
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      fetchUsuarios();
      setCurrentUsuarioTab('list');
    } catch (err: any) {
      console.error('Error creating usuario:', err);
      setErrorUsuarios(err.message || 'Error al crear el usuario.');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleUpdateUsuario = async (updatedUsuarioData: Usuario) => {
    setLoadingUsuarios(true);
    setErrorUsuarios(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${updatedUsuarioData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUsuarioData),
      });
      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Fallo al actualizar usuario.');
        } else {
          const errorText = await res.text();
          throw new Error(errorText || 'Fallo al actualizar usuario.');
        }
      }
      if (contentType && contentType.includes('application/json')) {
        await res.json();
      }
      Swal.fire({
        title: '¡Usuario actualizado!',
        text: 'Usuario actualizado exitosamente.',
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      fetchUsuarios();
      setCurrentUsuarioTab('list');
      setEditingUsuario(null);
    } catch (err: any) {
      console.error('Error updating usuario:', err);
      setErrorUsuarios(err.message || 'Error al actualizar el usuario.');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleToggleUsuarioStatus = async (usuarioId: number, currentStatus: boolean) => {
    setLoadingUsuarios(true);
    setErrorUsuarios(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${usuarioId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Fallo al cambiar estado del usuario.');
        } else {
          const errorText = await res.text();
          throw new Error(errorText || 'Fallo al cambiar estado del usuario.');
        }
      }
      if (contentType && contentType.includes('application/json')) {
        await res.json();
      }
      Swal.fire({
        title: '¡Estado cambiado!',
        text: `Estado del usuario ${usuarioId} cambiado a ${!currentStatus ? 'Activo' : 'Inactivo'}.`,
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      fetchUsuarios();
    } catch (err: any) {
      console.error('Error toggling usuario status:', err);
      setErrorUsuarios(err.message || 'Error al cambiar el estado del usuario.');
    } finally {
      setLoadingUsuarios(false);
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
          if (tab === 'caso-general') setCurrentMainTab('caso-general');
          else if (tab === 'caso-especial') setCurrentMainTab('caso-especial');
          else if (tab === 'caso-acudientes') setCurrentMainTab('caso-acudientes');
          else if (tab === 'prestamos') {
            setCurrentMainTab('prestamos');
            setCurrentPrestamoTab('list');
            fetchPrestamos();
          } else if (tab === 'prestamos-create') {
            setCurrentMainTab('prestamos');
            setCurrentPrestamoTab('create');
          } else if (tab === 'prestamos-devolucion') {
            setCurrentMainTab('prestamos');
            setCurrentPrestamoTab('devolucion');
          } else if (tab === 'usuarios') {
            setCurrentMainTab('usuarios');
            setCurrentUsuarioTab('list');
            fetchUsuarios();
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
                onCancel={() => {
                  setCurrentPrestamoTab('list');
                  fetchPrestamos();
                }}
              />
            )}

            {currentPrestamoTab === 'devolucion' && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Registrar Devolución</h2>
                <p className="text-gray-600 mb-4">
                  Selecciona un préstamo de la lista para iniciar la devolución o ingresa el número de caso.
                </p>
                <form onSubmit={handleDevolucionSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="numeroCasoDevolucion" className="block text-sm font-medium text-gray-700">
                      Número de Caso del Préstamo
                    </label>
                    <input
                      type="text"
                      id="numeroCasoDevolucion"
                      value={prestamoSeleccionado?.numeroCaso || ''}
                      onChange={(e) => {
                        // Opcional: permitir buscar si no hay seleccionado
                        const dummyPrestamo = { ...prestamoSeleccionado, numeroCaso: e.target.value } as Prestamo;
                        setPrestamoSeleccionado(dummyPrestamo);
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Ej: CAS-001"
                    />
                  </div>
                  <div>
                    <label htmlFor="fechaDevolucion" className="block text-sm font-medium text-gray-700">
                      Fecha de Devolución
                    </label>
                    <input
                      type="date"
                      id="fechaDevolucion"
                      value={devolucionData.fechaDevolucion}
                      onChange={(e) => setDevolucionData({ ...devolucionData, fechaDevolucion: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                      Observaciones
                    </label>
                    <textarea
                      id="observaciones"
                      value={devolucionData.observaciones}
                      onChange={(e) => setDevolucionData({ ...devolucionData, observaciones: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Firma de Devolución</label>
                    <SignaturePad onSave={(firma) => setDevolucionData({ ...devolucionData, firma })} />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button type="button" onClick={() => setCurrentPrestamoTab('list')} className="bg-gray-200 text-gray-800">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 text-white">
                      Registrar Devolución
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {currentMainTab === 'usuarios' && (
          // Protección extra: solo admin o coordinador pueden ver la gestión de usuarios
          ['admin', 'coordinador'].includes(dashboardData?.userRole?.name?.toLowerCase()) ? (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">
                Gestión de Usuarios
              </h1>

              <div className="flex space-x-4 border-b border-gray-200">
                <button
                  onClick={() => { setCurrentUsuarioTab('list'); setEditingUsuario(null); fetchUsuarios(); }}
                  className={`px-6 py-3 font-medium ${
                    currentUsuarioTab === 'list'
                      ? 'text-[#51c814] border-b-2 border-[#51c814]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Usuarios Activos
                </button>
                <button
                  onClick={() => { setCurrentUsuarioTab('create'); setEditingUsuario(null); }}
                  className={`px-6 py-3 font-medium ${
                    currentUsuarioTab === 'create'
                      ? 'text-[#51c814] border-b-2 border-[#51c814]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Nuevo Usuario
                </button>
                {currentUsuarioTab === 'edit' && (
                  <button className="px-6 py-3 font-medium text-[#51c814] border-b-2 border-[#51c814]">
                    Editar Usuario
                  </button>
                )}
              </div>

              {loadingUsuarios && (
                <p className="text-center text-blue-500">Cargando usuarios...</p>
              )}
              {errorUsuarios && (
                <p className="text-center text-red-500">Error: {errorUsuarios}</p>
              )}

              {currentUsuarioTab === 'list' && !loadingUsuarios && !errorUsuarios && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Total de usuarios: {usuarios.length} | Estado: {loadingUsuarios ? 'Cargando...' : 'Listo'} | Error: {errorUsuarios || 'Ninguno'}
                  </p>
                  <UsuarioList
                    usuarios={usuarios}
                    onEdit={(usuario) => { setEditingUsuario(usuario); setCurrentUsuarioTab('edit'); }}
                    onToggleStatus={handleToggleUsuarioStatus}
                  />
                </div>
              )}

              {(currentUsuarioTab === 'create' || currentUsuarioTab === 'edit') && (
                <UsuarioForm
                  usuario={editingUsuario || undefined}
                  onSave={currentUsuarioTab === 'create' ? handleCreateUsuario : (data) => handleUpdateUsuario(data as Usuario)}
                  onCancel={() => { setCurrentUsuarioTab('list'); setEditingUsuario(null); }}
                />
              )}
            </div>
          ) : (
            // Si no tiene permisos, mostrar mensaje y redirigir
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-xl text-red-600 font-bold mb-4">Acceso denegado: No tienes permisos para gestionar usuarios.</p>
              <Button
                onClick={() => setCurrentMainTab('caso-general')}
                className="bg-[#39A900] text-white px-6 py-2 rounded-lg shadow-md"
              >
                Ir al inicio
              </Button>
            </div>
          )
        )}
      </main>
    </div>
  );
}