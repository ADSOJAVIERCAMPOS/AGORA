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
      <div className="flex items-center gap-4">
        <div className="relative group">
          <img
            src={avatar}
          alt="Avatar"
          className="w-14 h-14 rounded-full border-2 border-[#39A900] object-cover shadow-md cursor-pointer hover:opacity-80"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
          />
        <span className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 text-xs shadow group-hover:bg-[#39A900] group-hover:text-white transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.108 2.108 0 1 1 2.978 2.978L7.5 19.805l-4 1 1-4 14.362-14.318z" />
          </svg>
          </span>
        </div>
      <div>
        <div className="font-bold text-lg text-gray-800">{userName}</div>
        <span className="text-sm text-[#39A900] font-semibold uppercase tracking-wide">{getRoleDisplay(userRole)}</span>
        <div className="text-xs text-gray-500">{fechaActual}</div>
      </div>
    </div>
  );
};

export default AvatarUserHeader; 