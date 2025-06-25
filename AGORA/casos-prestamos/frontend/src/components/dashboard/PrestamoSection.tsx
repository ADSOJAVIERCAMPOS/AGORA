import React, { useState, useEffect } from 'react';
import PrestamoList from '@/components/feature/prestamos/PrestamoList';
import PrestamoForm from '@/components/feature/prestamos/PrestamoForm';
import PrestamoDevolucionForm from './PrestamoDevolucionForm';
import Button from '@/components/ui/Button';
import SignaturePad from '@/components/ui/SignaturePad';
import Swal from 'sweetalert2';

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

interface DevolucionData {
  fechaDevolucion: string;
  observaciones: string;
  firma: string;
  documentos?: File[];
  horaFinal?: string;
}

interface PrestamoSectionProps {
  API_BASE_URL: string;
  initialTab?: 'list' | 'create' | 'devolucion';
  onTabChange?: (tab: 'list' | 'create' | 'devolucion') => void;
}

export default function PrestamoSection({ API_BASE_URL, initialTab = 'list', onTabChange }: PrestamoSectionProps) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loadingPrestamos, setLoadingPrestamos] = useState(false);
  const [errorPrestamos, setErrorPrestamos] = useState<string | null>(null);
  const [currentPrestamoTab, setCurrentPrestamoTab] = useState<'list' | 'create' | 'devolucion'>(initialTab);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
  const [devolucionData, setDevolucionData] = useState<DevolucionData>({
    fechaDevolucion: '',
    observaciones: '',
    firma: ''
  });

  // Update local tab when prop changes
  useEffect(() => {
    setCurrentPrestamoTab(initialTab);
  }, [initialTab]);

  // Update parent when local tab changes
  const handleTabChange = (tab: 'list' | 'create' | 'devolucion') => {
    setCurrentPrestamoTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Cargar préstamos
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

  // Crear préstamo
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
      handleTabChange('list');
      fetchPrestamos();
    } catch (err: any) {
      console.error('Error creating prestamo:', err);
      setErrorPrestamos(err.message || 'Error al registrar el préstamo');
    } finally {
      setLoadingPrestamos(false);
    }
  };

  // Actualizar estado del préstamo
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
      handleTabChange('list');
      fetchPrestamos();
    } catch (err: any) {
      console.error('Error updating prestamo status:', err);
      setErrorPrestamos(err.message || 'Error al actualizar el estado del préstamo.');
    } finally {
      setLoadingPrestamos(false);
    }
  };

  // Registrar devolución
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
      handleTabChange('list');
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

  // Iniciar devolución
  const handleIniciarDevolucion = (prestamo: Prestamo) => {
    setPrestamoSeleccionado(prestamo);
    handleTabChange('devolucion');
  };

  // Cargar préstamos al montar el componente
  useEffect(() => {
    if (currentPrestamoTab === 'list') {
      fetchPrestamos();
    }
  }, [currentPrestamoTab]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Gestión de Inventario
      </h1>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => { handleTabChange('list'); fetchPrestamos(); }}
          className={`px-6 py-3 font-medium ${
            currentPrestamoTab === 'list'
              ? 'text-[#51c814] border-b-2 border-[#51c814]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Préstamos Activos
        </button>
        <button
          onClick={() => handleTabChange('create')}
          className={`px-6 py-3 font-medium ${
            currentPrestamoTab === 'create'
              ? 'text-[#51c814] border-b-2 border-[#51c814]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Registrar Préstamo
        </button>
        <button
          onClick={() => handleTabChange('devolucion')}
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
            handleTabChange('list');
            fetchPrestamos();
          }}
        />
      )}

      {currentPrestamoTab === 'devolucion' && (
        <PrestamoDevolucionForm
          prestamoSeleccionado={prestamoSeleccionado}
          devolucionData={devolucionData}
          setDevolucionData={setDevolucionData}
          onSubmit={handleDevolucionSubmit}
          onCancel={() => handleTabChange('list')}
          errorPrestamos={errorPrestamos}
        />
      )}
    </div>
  );
} 