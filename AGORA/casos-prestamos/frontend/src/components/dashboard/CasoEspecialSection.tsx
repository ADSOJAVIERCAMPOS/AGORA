import React from 'react';
import CasoEspecialForm from '@/components/feature/casos/CasoEspecialForm';

interface CasoEspecialSectionProps {
  onSubmit: (formData: FormData) => Promise<any>;
  setCurrentMainTab: (tab: string) => void;
}

export default function CasoEspecialSection({ onSubmit, setCurrentMainTab }: CasoEspecialSectionProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Crear Caso Especial
      </h1>
      <CasoEspecialForm
        onSubmit={onSubmit}
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
  );
} 