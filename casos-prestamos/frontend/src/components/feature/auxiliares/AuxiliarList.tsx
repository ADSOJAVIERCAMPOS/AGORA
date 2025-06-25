import React from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface Auxiliar {
  id: number;
  nombreCompleto: string;
  email: string;
  estado: boolean;
}

interface AuxiliarListProps {
  auxiliares: Auxiliar[];
  onEdit: (auxiliar: Auxiliar) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
}

const AuxiliarList: React.FC<AuxiliarListProps> = ({
  auxiliares,
  onEdit,
  onToggleStatus
}) => {
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Lista de Auxiliares</h2>
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
            {auxiliares.length > 0 ? (
              auxiliares.map((auxiliar) => (
                <tr key={auxiliar.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{auxiliar.id}</td>
                  <td className="px-4 py-3">{auxiliar.nombreCompleto}</td>
                  <td className="px-4 py-3">{auxiliar.email}</td>
                  <td className={`px-4 py-3 ${auxiliar.estado ? 'text-[#51c814]' : 'text-red-500'}`}>
                    {auxiliar.estado ? 'Activo' : 'Inactivo'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onEdit(auxiliar)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant={auxiliar.estado ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => onToggleStatus(auxiliar.id, auxiliar.estado)}
                      >
                        {auxiliar.estado ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                  No hay auxiliares registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AuxiliarList; 