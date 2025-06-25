import React from 'react';
import CasoForm from '@/components/feature/casos/CasoForm';

interface CasoGeneralSectionProps {
  onSubmit: (formData: FormData) => Promise<any>;
  setCurrentMainTab: (tab: string) => void;
}

export default function CasoGeneralSection({ onSubmit, setCurrentMainTab }: CasoGeneralSectionProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Crear Caso General
      </h1>
      <CasoForm
        tipoCaso="general"
        onSubmit={onSubmit}
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
  );
} 