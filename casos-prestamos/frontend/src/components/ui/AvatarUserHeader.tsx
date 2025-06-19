import React, { useEffect, useRef, useState } from 'react';

interface AvatarUserHeaderProps {
  userName: string;
  userRole: string;
}

const defaultAvatar = '/avatar-default.png'; // Debe estar en public/

const AvatarUserHeader: React.FC<AvatarUserHeaderProps> = ({ userName, userRole }) => {
  const [avatar, setAvatar] = useState<string>(defaultAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fechaActual, setFechaActual] = useState('');

  useEffect(() => {
    // Cargar avatar de localStorage si existe
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar) setAvatar(storedAvatar);
    // Fecha actual
    const hoy = new Date();
    setFechaActual(hoy.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAvatar(reader.result as string);
          localStorage.setItem('userAvatar', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para mapear los roles
  const getRoleDisplay = (role: string) => {
    if (!role) return 'Sin Rol';
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'Coordinador';
      case 'USER':
        return 'Auxiliar';
      default:
        return role;
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 mb-6">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <img
            src={avatar}
            alt="Avatar usuario"
            className="w-14 h-14 rounded-full border-2 border-[#51c814] object-cover shadow-md cursor-pointer hover:opacity-80"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
          />
          <span className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 text-xs shadow group-hover:bg-[#51c814] group-hover:text-white transition-colors cursor-pointer">
            ✏️
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-bold text-lg text-gray-800">{userName}</span>
          <span className="text-sm text-[#51c814] font-semibold uppercase tracking-wide">{getRoleDisplay(userRole)}</span>
          <span className="text-xs text-gray-500 mt-1">{fechaActual}</span>
        </div>
      </div>
    </div>
  );
};

export default AvatarUserHeader; 