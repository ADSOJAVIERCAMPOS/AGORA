import React from 'react';
import Button from '@/components/ui/Button';
import SignaturePad from '@/components/ui/SignaturePad';

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

interface PrestamoDevolucionFormProps {
  prestamoSeleccionado: Prestamo | null;
  devolucionData: DevolucionData;
  setDevolucionData: React.Dispatch<React.SetStateAction<DevolucionData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  errorPrestamos: string | null;
}

export default function PrestamoDevolucionForm({
  prestamoSeleccionado,
  devolucionData,
  setDevolucionData,
  onSubmit,
  onCancel,
  errorPrestamos
}: PrestamoDevolucionFormProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Registrar Devolución</h2>
      <p className="text-gray-600 mb-4">
        Selecciona un préstamo de la lista para iniciar la devolución o ingresa el número de caso.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
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
              // Aquí necesitarías una función para actualizar el préstamo seleccionado
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
          <label htmlFor="horaFinal" className="block text-sm font-medium text-gray-700">
            Hora Final
          </label>
          <input
            type="time"
            id="horaFinal"
            value={devolucionData.horaFinal || ''}
            onChange={(e) => setDevolucionData({ ...devolucionData, horaFinal: e.target.value })}
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
          <SignaturePad 
            onSignatureChange={(firma) => setDevolucionData({ ...devolucionData, firma })}
            onSave={(firma) => setDevolucionData({ ...devolucionData, firma })}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <Button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800">
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 text-white">
            Registrar Devolución
          </Button>
        </div>
      </form>
    </div>
  );
} 