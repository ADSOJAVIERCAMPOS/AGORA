import React, { useState } from 'react';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Swal from 'sweetalert2';
import { Usuario } from './UsuarioList';

interface UsuarioFormProps {
  usuario?: Usuario;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({ usuario, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: usuario?.name || '',
    email: usuario?.email || '',
    password: '',
    confirmPassword: '',
    role_id: 2, // Siempre Auxiliar
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePassword = (password: string) => {
    if (!usuario && password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'El nombre completo es requerido';
    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'El email no es válido';
    if (!usuario || formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const dataToSubmit = {
        ...formData,
        id: usuario?.id,
      };
      await onSave(dataToSubmit);
      Swal.fire({
        title: usuario ? '¡Usuario actualizado!' : '¡Usuario creado!',
        text: usuario ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
        icon: 'success',
        color: '#39A900',
        background: '#fff',
      });
      onCancel();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Error al guardar el usuario. Por favor, intente nuevamente.',
        icon: 'error',
        color: '#b71c1c',
        background: '#fff',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">
        {usuario ? 'Editar Usuario Auxiliar' : 'Registrar Nuevo Usuario Auxiliar'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-4">
            <Input
              label="Nombre Completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required={!usuario}
              placeholder={usuario ? 'Dejar en blanco para mantener la contraseña actual' : ''}
            />
            <Input
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required={!usuario}
              placeholder={usuario ? 'Dejar en blanco para mantener la contraseña actual' : ''}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <Button type="submit">
            {usuario ? 'Actualizar Usuario' : 'Registrar Usuario'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UsuarioForm; 