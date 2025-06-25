import React, { useState } from 'react';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Swal from 'sweetalert2';

interface AuxiliarFormProps {
  auxiliar?: {
    id: number;
    nombreCompleto: string;
    email: string;
    estado: boolean;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const AuxiliarForm: React.FC<AuxiliarFormProps> = ({ auxiliar, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreCompleto: auxiliar?.nombreCompleto || '',
    email: auxiliar?.email || '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasMinLength) return 'La contraseña debe tener al menos 8 caracteres';
    if (!hasUpperCase) return 'La contraseña debe contener al menos una letra mayúscula';
    if (!hasLowerCase) return 'La contraseña debe contener al menos una letra minúscula';
    if (!hasNumber) return 'La contraseña debe contener al menos un número';
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombreCompleto) {
      newErrors.nombreCompleto = 'El nombre completo es requerido';
    }
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Solo validar contraseña si es un nuevo usuario o si se está cambiando
    if (!auxiliar || formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        id: auxiliar?.id,
        estado: auxiliar?.estado ?? true
      };

      await onSave(dataToSubmit);
      Swal.fire({
        title: '¡Usuario registrado!',
        text: 'Usuario auxiliar registrado correctamente',
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      onCancel();
    } catch (error) {
      console.error('Error al registrar el usuario auxiliar:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al registrar el usuario auxiliar. Por favor, intente nuevamente.',
        icon: 'error',
        color: '#b71c1c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el campo se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">
        {auxiliar ? 'Editar Usuario Auxiliar' : 'Registrar Nuevo Usuario Auxiliar'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-4">
            <Input
              label="Nombre Completo"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              error={errors.nombreCompleto}
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
              required={!auxiliar}
              placeholder={auxiliar ? 'Dejar en blanco para mantener la contraseña actual' : ''}
            />
            
            <Input
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required={!auxiliar}
              placeholder={auxiliar ? 'Dejar en blanco para mantener la contraseña actual' : ''}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button type="submit">
            {auxiliar ? 'Actualizar Usuario' : 'Registrar Usuario'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AuxiliarForm; 