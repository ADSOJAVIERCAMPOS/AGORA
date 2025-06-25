import React, { useState, useRef } from 'react';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Swal from 'sweetalert2';

interface FileUpload {
  file: File;
  preview: string;
}

interface CasoEspecialFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CasoEspecialForm: React.FC<CasoEspecialFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreAprendiz: '',
    documento: '',
    ficha: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    // Campos específicos para casos especiales
    tipoCasoEspecial: '',
    gravedad: '',
    estadoActual: 'ACTIVO',
    medidasPrevias: '',
    observaciones: '',
    usuarioRegistro: '',
  });

  const [files, setFiles] = useState<FileUpload[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tiposCasoEspecial = [
    'Discapacidad',
    'Cognitivo',
    'Otro'
  ];

  const nivelesGravedad = [
    'Bajo',
    'Medio',
    'Alto'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones base
    if (!formData.nombreAprendiz) newErrors.nombreAprendiz = 'El nombre es requerido';
    if (!formData.documento) newErrors.documento = 'El documento es requerido';
    if (!formData.ficha) newErrors.ficha = 'La ficha es requerida';
    if (!formData.descripcion) newErrors.descripcion = 'La descripción es requerida';
    
    // Validaciones específicas para casos especiales
    if (!formData.tipoCasoEspecial) newErrors.tipoCasoEspecial = 'El tipo de caso especial es requerido';
    if (!formData.gravedad) newErrors.gravedad = 'El nivel de gravedad es requerido';
    if (!formData.estadoActual) newErrors.estadoActual = 'El estado actual es requerido';
    if (!formData.medidasPrevias) newErrors.medidasPrevias = 'Las medidas previas son requeridas';
    
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
      
      // Agregar todos los campos del formulario
      formDataToSubmit.append('nombreAprendiz', formData.nombreAprendiz);
      formDataToSubmit.append('documento', formData.documento);
      formDataToSubmit.append('ficha', formData.ficha);
      formDataToSubmit.append('descripcion', formData.descripcion);
      formDataToSubmit.append('fechaCaso', formData.fecha);
      formDataToSubmit.append('tipoCasoEspecial', formData.tipoCasoEspecial);
      formDataToSubmit.append('gravedad', formData.gravedad);
      formDataToSubmit.append('estadoActual', formData.estadoActual);
      formDataToSubmit.append('medidasPrevias', formData.medidasPrevias);
      formDataToSubmit.append('observaciones', formData.observaciones || '');
      formDataToSubmit.append('usuarioRegistro', formData.usuarioRegistro);

      // Agregar archivos si existen
      files.forEach((fileUpload, index) => {
        formDataToSubmit.append(`archivo${index}`, fileUpload.file);
      });

      console.log('Enviando datos al servidor...');
      const response = await fetch('/api/casos-especiales', {
        method: 'POST',
        body: formDataToSubmit,
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al registrar el caso especial');
      }

      Swal.fire({
        title: '¡Caso especial registrado!',
        text: 'Caso especial registrado exitosamente',
        width: 600,
        padding: '3em',
        color: '#388e3c',
        background: "#fff url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') no-repeat center/contain",
        backdrop: `rgba(0,0,0,0.2) url('https://userscontent2.emaze.com/images/12951ed1-079a-43f7-967d-939a79e0ca14/50dd6ca60763b25fe05bb86f246eb059.gif') center top no-repeat`,
        icon: 'success'
      });
      onCancel();
    } catch (error) {
      console.error('Error detallado:', error);
      Swal.fire({
        title: 'Error',
        text: `Error al registrar el caso especial: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        icon: 'error',
        color: '#e53935',
        confirmButtonColor: '#388e3c'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        Registrar Caso Especial
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Caso Especial
            </label>
            <select
              name="tipoCasoEspecial"
              value={formData.tipoCasoEspecial}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#51c814] ${
                errors.tipoCasoEspecial ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Seleccione un tipo</option>
              {tiposCasoEspecial.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            {errors.tipoCasoEspecial && (
              <p className="mt-1 text-sm text-red-500">{errors.tipoCasoEspecial}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de Gravedad
            </label>
            <select
              name="gravedad"
              value={formData.gravedad}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#51c814] ${
                errors.gravedad ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Seleccione nivel</option>
              {nivelesGravedad.map(nivel => (
                <option key={nivel} value={nivel}>{nivel}</option>
              ))}
            </select>
            {errors.gravedad && (
              <p className="mt-1 text-sm text-red-500">{errors.gravedad}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado Actual
            </label>
            <select
              name="estadoActual"
              value={formData.estadoActual}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#51c814] ${
                errors.estadoActual ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="EN PROCESO">EN PROCESO</option>
              <option value="CERRADO">CERRADO</option>
            </select>
            {errors.estadoActual && (
              <p className="mt-1 text-sm text-red-500">{errors.estadoActual}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medidas Previas Tomadas
            </label>
            <textarea
              name="medidasPrevias"
              value={formData.medidasPrevias}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#51c814] ${
                errors.medidasPrevias ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              required
            />
            {errors.medidasPrevias && (
              <p className="mt-1 text-sm text-red-500">{errors.medidasPrevias}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción Detallada
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones Adicionales
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51c814]"
              rows={3}
            />
          </div>
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
          <Button type="submit">Registrar Caso Especial</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CasoEspecialForm; 