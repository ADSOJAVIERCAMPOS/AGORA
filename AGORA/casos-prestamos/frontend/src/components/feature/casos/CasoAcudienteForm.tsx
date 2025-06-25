import React, { useState, useRef } from 'react';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Swal from 'sweetalert2';

interface FileUpload {
  file: File;
  preview: string;
}

interface CasoAcudienteFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CasoAcudienteForm: React.FC<CasoAcudienteFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Datos del Aprendiz
    nombreAprendiz: '',
    documentoAprendiz: '',
    tipoDocumentoAprendiz: '',
    fechaNacimientoAprendiz: '',
    programa: '',
    ficha: '',
    // Datos del Acudiente
    nombreAcudiente: '',
    documentoAcudiente: '',
    tipoDocumentoAcudiente: '',
    parentesco: '',
    telefonoAcudiente: '',
    // emailAcudiente: '',
    // direccionAcudiente: '',
    // Datos del Caso
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    tipoCaso: '',
    estadoActual: 'ACTIVO',
    observaciones: '',
    usuarioRegistro: '',
  });

  const [files, setFiles] = useState<FileUpload[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tiposParentesco = [
    'Padre',
    'Madre',
    'Tutor Legal',
    'Abuelo/a',
    'Hermano/a Mayor',
    'Otro'
  ];

  const tiposCaso = [
    'Autorización',
    'Permiso',
    'Inasistencia',
    'Situación Familiar',
    'Otro'
  ];

  const tiposDocumento = [
    'Cédula de Ciudadanía',
    'Tarjeta de Identidad',
    'Cédula de Extranjería',
    'Pasaporte',
    'Registro Civil',
    'Otro'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones del Aprendiz
    if (!formData.nombreAprendiz) newErrors.nombreAprendiz = 'El nombre del aprendiz es requerido';
    if (!formData.documentoAprendiz) newErrors.documentoAprendiz = 'El documento del aprendiz es requerido';
    if (!formData.tipoDocumentoAprendiz) newErrors.tipoDocumentoAprendiz = 'El tipo de documento del aprendiz es requerido';
    if (!formData.fechaNacimientoAprendiz) newErrors.fechaNacimientoAprendiz = 'La fecha de nacimiento es requerida';
    if (!formData.ficha) newErrors.ficha = 'La ficha es requerida';
    
    // Validaciones del Acudiente
    if (!formData.nombreAcudiente) newErrors.nombreAcudiente = 'El nombre del acudiente es requerido';
    if (!formData.documentoAcudiente) newErrors.documentoAcudiente = 'El documento del acudiente es requerido';
    if (!formData.tipoDocumentoAcudiente) newErrors.tipoDocumentoAcudiente = 'El tipo de documento del acudiente es requerido';
    if (!formData.parentesco) newErrors.parentesco = 'El parentesco es requerido';
    if (!formData.telefonoAcudiente) newErrors.telefonoAcudiente = 'El teléfono del acudiente es requerido';
    // if (!formData.emailAcudiente) newErrors.emailAcudiente = 'El email del acudiente es requerido';
    // if (!formData.direccionAcudiente) newErrors.direccionAcudiente = 'La dirección del acudiente es requerida';
    
    // Validaciones del Caso
    if (!formData.tipoCaso) newErrors.tipoCaso = 'El tipo de caso es requerido';
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
      formDataToSubmit.append('tipoCaso', 'acudiente');
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSubmit.append(key, value);
      });

      formDataToSubmit.append('fechaCaso', formData.fecha);
      formDataToSubmit.append('usuarioRegistro', formData.usuarioRegistro);

      files.forEach((fileUpload, index) => {
        formDataToSubmit.append(`archivo${index}`, fileUpload.file);
      });

      await onSubmit(formDataToSubmit);
      alert('Caso de acudiente registrado exitosamente');
      onCancel();
    } catch (error) {
      console.error('Error al registrar el caso de acudiente:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al registrar el caso de acudiente. Por favor, intente nuevamente.',
        icon: 'error',
        color: '#b71c1c',
        background: '#fff'
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
        Registrar Caso de Acudiente
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de Datos del Aprendiz */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Datos del Aprendiz</h3>
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
              label="Documento del Aprendiz"
              name="documentoAprendiz"
              value={formData.documentoAprendiz}
              onChange={handleChange}
              error={errors.documentoAprendiz}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento del Aprendiz
              </label>
              <select
                name="tipoDocumentoAprendiz"
                value={formData.tipoDocumentoAprendiz}
                onChange={handleChange}
                className={`w-full max-w-xs mx-auto px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900] ${
                  errors.tipoDocumentoAprendiz ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Seleccione un tipo</option>
                {tiposDocumento.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipoDocumentoAprendiz && (
                <p className="mt-1 text-sm text-red-500">{errors.tipoDocumentoAprendiz}</p>
              )}
            </div>
            
            <Input
              label="Fecha de Nacimiento"
              name="fechaNacimientoAprendiz"
              type="date"
              value={formData.fechaNacimientoAprendiz}
              onChange={handleChange}
              error={errors.fechaNacimientoAprendiz}
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
        </div>

        {/* Sección de Datos del Acudiente */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Datos del Acudiente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Acudiente"
              name="nombreAcudiente"
              value={formData.nombreAcudiente}
              onChange={handleChange}
              error={errors.nombreAcudiente}
              required
            />
            
            <Input
              label="Documento del Acudiente"
              name="documentoAcudiente"
              value={formData.documentoAcudiente}
              onChange={handleChange}
              error={errors.documentoAcudiente}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento del Acudiente
              </label>
              <select
                name="tipoDocumentoAcudiente"
                value={formData.tipoDocumentoAcudiente}
                onChange={handleChange}
                className={`w-full max-w-xs mx-auto px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900] ${
                  errors.tipoDocumentoAcudiente ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Seleccione un tipo</option>
                {tiposDocumento.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipoDocumentoAcudiente && (
                <p className="mt-1 text-sm text-red-500">{errors.tipoDocumentoAcudiente}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parentesco
              </label>
              <select
                name="parentesco"
                value={formData.parentesco}
                onChange={handleChange}
                className={`w-full max-w-xs mx-auto px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900] ${
                  errors.parentesco ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Seleccione parentesco</option>
                {tiposParentesco.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.parentesco && (
                <p className="mt-1 text-sm text-red-500">{errors.parentesco}</p>
              )}
            </div>
            
            <Input
              label="Teléfono del Acudiente"
              name="telefonoAcudiente"
              value={formData.telefonoAcudiente}
              onChange={handleChange}
              error={errors.telefonoAcudiente}
              required
            />
          </div>
        </div>

        {/* Sección de Datos del Caso */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Datos del Caso</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Caso
              </label>
              <select
                name="tipoCaso"
                value={formData.tipoCaso}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#39A900] ${
                  errors.tipoCaso ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Seleccione tipo de caso</option>
                {tiposCaso.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipoCaso && (
                <p className="mt-1 text-sm text-red-500">{errors.tipoCaso}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado Actual
              </label>
              <select
                name="estadoActual"
                value={formData.estadoActual}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#39A900] ${
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Caso
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className={`w-full max-w-xs mx-auto px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900] ${
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39A900]"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Sección de Archivos */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Archivos Adjuntos</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documentos (PDF, JPG, PNG - Máx. 5MB)
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
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
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
        </div>

        <div className="flex gap-4 mt-6">
          <Button type="submit">Registrar Caso de Acudiente</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CasoAcudienteForm;