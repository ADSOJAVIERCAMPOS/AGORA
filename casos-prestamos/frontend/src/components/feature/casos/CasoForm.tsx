import React, { useState, useRef } from 'react';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Swal from 'sweetalert2';

interface FileUpload {
  file: File;
  preview: string;
}

interface CasoFormProps {
  tipoCaso: 'general' | 'especial' | 'acudientes';
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CasoForm: React.FC<CasoFormProps> = ({ tipoCaso, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreAprendiz: '',
    documento: '',
    ficha: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    usuarioRegistro: '',
  });

  const [files, setFiles] = useState<FileUpload[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombreAprendiz) newErrors.nombreAprendiz = 'El nombre es requerido';
    if (!formData.documento) newErrors.documento = 'El documento es requerido';
    if (!formData.ficha) newErrors.ficha = 'La ficha es requerida';
    if (!formData.descripcion) newErrors.descripcion = 'La descripción es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        Swal.fire({
          title: 'Archivo inválido',
          text: `El archivo ${file.name} no es un formato válido. Solo se permiten PDF, JPG y PNG.`,
          icon: 'error'
        });
        return false;
      }
      
      if (!isValidSize) {
        Swal.fire({
          title: 'Archivo muy grande',
          text: `El archivo ${file.name} excede el tamaño máximo de 5MB.`,
          icon: 'error'
        });
        return false;
      }
      
      return true;
    });

    const newFiles = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('tipoCaso', tipoCaso);
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSubmit.append(key, value);
      });

      formDataToSubmit.append('fechaCaso', formData.fecha);
      formDataToSubmit.append('usuarioRegistro', formData.usuarioRegistro);

      files.forEach((fileUpload, index) => {
        formDataToSubmit.append(`archivo${index}`, fileUpload.file);
      });

      await onSubmit(formDataToSubmit);
      Swal.fire({
        title: '¡Caso registrado!',
        text: 'Caso registrado exitosamente',
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      onCancel();
    } catch (error) {
      console.error('Error al registrar el caso:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al registrar el caso. Por favor, intente nuevamente.',
        icon: 'error',
        color: '#b71c1c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        Registrar {tipoCaso === 'general' ? 'Caso General' : tipoCaso === 'especial' ? 'Caso Especial' : 'Caso de Acudientes'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Aprendiz"
          name="nombreAprendiz"
          value={formData.nombreAprendiz}
          onChange={handleChange}
          error={errors.nombreAprendiz}
          required
        />
        
        <Input
          label="Número de Documento"
          name="documento"
          value={formData.documento}
          onChange={handleChange}
          error={errors.documento}
          required
        />
        
        <Input
          label="Número de Ficha"
          name="ficha"
          value={formData.ficha}
          onChange={handleChange}
          error={errors.ficha}
          required
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción del Caso
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#51c814] ${
              errors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            required
          />
          {errors.descripcion && (
            <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivos Adjuntos (PDF, JPG, PNG - Máx. 5MB)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="mb-2"
          >
            Seleccionar Archivos
          </Button>
          
          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              {files.map((fileUpload, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm truncate">{fileUpload.file.name}</span>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <Button type="submit">Registrar Caso</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CasoForm; 