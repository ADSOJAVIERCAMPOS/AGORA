import { useState } from 'react';

export default function AprendizForm({ initialData = null, onSuccess }) {
  const [form, setForm] = useState(initialData || {
    numero_documento: '',
    nombre: '',
    apellido: '',
    correo: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData
        ? `http://localhost:8000/api/aprendices/${form.numero_documento}`
        : 'http://localhost:8000/api/aprendices';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMensaje('¡Guardado correctamente!');
        if (!initialData) setForm({ numero_documento: '', nombre: '', apellido: '', correo: '' });
        if (onSuccess) onSuccess();
      } else {
        const error = await res.json();
        setMensaje('Error: ' + JSON.stringify(error.errors || error.message));
      }
    } catch (err) {
      setMensaje('Error de conexión con el backend');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input name="numero_documento" value={form.numero_documento} onChange={handleChange} placeholder="Documento" required disabled={!!initialData} className="w-full border p-2 rounded" />
      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required className="w-full border p-2 rounded" />
      <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" required className="w-full border p-2 rounded" />
      <input name="correo" value={form.correo} onChange={handleChange} placeholder="Correo" required type="email" className="w-full border p-2 rounded" />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? 'Guardando...' : 'Guardar'}</button>
      {mensaje && <p className="mt-2 text-center text-sm text-red-600">{mensaje}</p>}
    </form>
  );
} 