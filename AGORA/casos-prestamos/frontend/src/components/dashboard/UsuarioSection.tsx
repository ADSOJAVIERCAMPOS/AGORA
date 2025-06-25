import React, { useState, useEffect } from 'react';
import UsuarioList from '@/components/feature/usuarios/UsuarioList';
import UsuarioForm from '@/components/feature/usuarios/UsuarioForm';
import Button from '@/components/ui/Button';
import Swal from 'sweetalert2';
import { Usuario } from '@/components/feature/usuarios/UsuarioList';

interface UsuarioSectionProps {
  API_BASE_URL: string;
  userRole: string;
  setCurrentMainTab: (tab: string) => void;
}

export default function UsuarioSection({ API_BASE_URL, userRole, setCurrentMainTab }: UsuarioSectionProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  const [currentUsuarioTab, setCurrentUsuarioTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  // Verificar permisos
  const hasPermission = ['admin', 'coordinador'].includes(userRole?.toLowerCase());

  // Cargar usuarios
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

  // Crear usuario
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

  // Actualizar usuario
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

  // Cambiar estado del usuario
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

  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (currentUsuarioTab === 'list' && hasPermission) {
      fetchUsuarios();
    }
  }, [currentUsuarioTab, hasPermission]);

  // Si no tiene permisos, mostrar mensaje de acceso denegado
  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl text-red-600 font-bold mb-4">Acceso denegado: No tienes permisos para gestionar usuarios.</p>
        <Button
          onClick={() => setCurrentMainTab('caso-general')}
          className="bg-[#39A900] text-white px-6 py-2 rounded-lg shadow-md"
        >
          Ir al inicio
        </Button>
      </div>
    );
  }

  return (
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
  );
} 