import React from 'react';
import Card from '../../ui/Card';

interface DashboardStatsProps {
  casosActivos: number;
  casosActivosTrend: string;
  casosPendientes: number;
  casosPendientesTrend: string;
  casosResueltos: number;
  casosResueltosTrend: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  casosActivos,
  casosActivosTrend,
  casosPendientes,
  casosPendientesTrend,
  casosResueltos,
  casosResueltosTrend
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <div className="text-center">
          <div className="text-4xl font-bold text-[#39A900] mb-2">
            {casosActivos}
          </div>
          <div className="text-lg text-gray-600 mb-1">
            Casos Activos
          </div>
          <div className="text-sm text-[#32a852]">
            {casosActivosTrend} vs mes anterior
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <div className="text-4xl font-bold text-[#39A900] mb-2">
            {casosPendientes}
          </div>
          <div className="text-lg text-gray-600 mb-1">
            Casos Pendientes
          </div>
          <div className="text-sm text-[#c0392b]">
            {casosPendientesTrend} vs mes anterior
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <div className="text-4xl font-bold text-[#39A900] mb-2">
            {casosResueltos}
          </div>
          <div className="text-lg text-gray-600 mb-1">
            Casos Resueltos
          </div>
          <div className="text-sm text-[#32a852]">
            {casosResueltosTrend} vs mes anterior
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardStats; 