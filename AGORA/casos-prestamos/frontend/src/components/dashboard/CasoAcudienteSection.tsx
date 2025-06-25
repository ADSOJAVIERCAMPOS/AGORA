import React from 'react';
import CasoAcudienteForm from '@/components/feature/casos/CasoAcudienteForm';

interface CasoAcudienteSectionProps {
  onSubmit: (formData: FormData) => Promise<any>;
  setCurrentMainTab: (tab: string) => void;
}

export default function CasoAcudienteSection({ onSubmit, setCurrentMainTab }: CasoAcudienteSectionProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Crear Caso de Acudientes
      </h1>
      <CasoAcudienteForm
        onSubmit={onSubmit}
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
  );
} 