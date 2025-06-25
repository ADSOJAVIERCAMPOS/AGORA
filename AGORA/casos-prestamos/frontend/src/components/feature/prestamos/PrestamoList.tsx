import React from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

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

interface PrestamoListProps {
  prestamos: Prestamo[];
  onStatusChange: (id: number, newState: 'activo' | 'devuelto' | 'pendiente') => void;
  onIniciarDevolucion: (prestamo: Prestamo) => void;
}

const PrestamoList: React.FC<PrestamoListProps> = ({ prestamos, onStatusChange, onIniciarDevolucion }) => {
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'text-[#39A900]';
      case 'devuelto':
        return 'text-[#28a745]';
      case 'pendiente':
        return 'text-[#ffc107]';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Préstamos Activos</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">N° Caso</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aprendiz</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Item</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">F. Préstamo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">F. Devolución</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {prestamos.length > 0 ? (
              prestamos.map((prestamo) => (
                <tr key={prestamo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{prestamo.numeroCaso}</td>
                  <td className="px-4 py-3">{prestamo.nombreAprendiz}</td>
                  <td className="px-4 py-3">{prestamo.itemPrestado}</td>
                  <td className="px-4 py-3">{prestamo.fechaPrestamo}</td>
                  <td className="px-4 py-3">{prestamo.fechaDevolucion || 'N/A'}</td>
                  <td className={`px-4 py-3 ${getStatusColor(prestamo.estado)}`}>
                    {prestamo.estado.charAt(0).toUpperCase() + prestamo.estado.slice(1)}
                  </td>
                  <td className="px-4 py-3">
                    {prestamo.estado === 'activo' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onIniciarDevolucion(prestamo)}
                      >
                        Devolver
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-3 text-center text-gray-500">
                  No hay préstamos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PrestamoList; 