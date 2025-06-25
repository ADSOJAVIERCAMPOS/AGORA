import React from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

export interface Usuario {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  role_id: number;
}

interface UsuarioListProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
}

const UsuarioList: React.FC<UsuarioListProps> = ({ usuarios, onEdit, onToggleStatus }) => {
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios Auxiliares</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nombre Completo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{usuario.id}</td>
                  <td className="px-4 py-3">{usuario.name}</td>
                  <td className="px-4 py-3">{usuario.email}</td>
                  <td className={`px-4 py-3 ${usuario.is_active ? 'text-[#39A900]' : 'text-red-500'}`}>
                    {usuario.is_active ? 'Activo' : 'Inactivo'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onEdit(usuario)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant={usuario.is_active ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => onToggleStatus(usuario.id, usuario.is_active)}
                      >
                        {usuario.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default UsuarioList; 