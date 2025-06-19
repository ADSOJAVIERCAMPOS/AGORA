import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

interface PrestamoFormProps {
    onSave: (formData: FormData) => void;
    onCancel: () => void;
}

export default function PrestamoForm({ onSave, onCancel }: PrestamoFormProps) {
    const [formData, setFormData] = useState({
        nombreAprendiz: '',
        documentoAprendiz: '',
        descripcionElemento: '',
        numeroPlaca: '',
    });
    const [error, setError] = useState<string | null>(null);
    const fechaActual = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const horaActual = now.toTimeString().slice(0,5);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validar campos requeridos
        if (!formData.nombreAprendiz || !formData.documentoAprendiz || !formData.descripcionElemento || !formData.numeroPlaca) {
            setError('Todos los campos son obligatorios');
            return;
        }

        // Crear FormData
        const data = new FormData();
        data.append('nombreAprendiz', formData.nombreAprendiz);
        data.append('documentoAprendiz', formData.documentoAprendiz);
        data.append('descripcionElemento', formData.descripcionElemento);
        data.append('numeroPlaca', formData.numeroPlaca);
        data.append('horaInicio', horaActual);
        data.append('fechaPrestamo', fechaActual);
        const usuario = localStorage.getItem('user') || '';
        data.append('usuarioRegistro', usuario);

        onSave(data);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Aprendiz</label>
                    <Input
                        type="text"
                        value={formData.nombreAprendiz}
                        onChange={(e) => setFormData({...formData, nombreAprendiz: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Documento del Aprendiz</label>
                    <Input
                        type="text"
                        value={formData.documentoAprendiz}
                        onChange={(e) => setFormData({...formData, documentoAprendiz: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción del Elemento</label>
                    <Input
                        type="text"
                        value={formData.descripcionElemento}
                        onChange={(e) => setFormData({...formData, descripcionElemento: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Número de Placa del Elemento</label>
                    <Input
                        type="text"
                        value={formData.numeroPlaca}
                        onChange={(e) => setFormData({...formData, numeroPlaca: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Hora de Inicio</label>
                    <div className="px-3 py-2 border rounded-md bg-gray-100 text-gray-700">{horaActual}</div>
                </div>

                <div className="flex justify-end space-x-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="success"
                    >
                        Registrar Préstamo
                    </Button>
                </div>
            </form>
        </Card>
    );
} 