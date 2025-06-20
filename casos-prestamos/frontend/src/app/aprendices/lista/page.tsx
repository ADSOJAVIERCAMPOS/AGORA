import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ListaAprendicesPage() {
  const [aprendices, setAprendices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/aprendices', {
      headers: { 'Accept': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        setAprendices(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Lista de Aprendices</h1>
      <Link href="/aprendices" className="inline-block mb-4 bg-green-600 text-white px-4 py-2 rounded">Registrar nuevo aprendiz</Link>
      {loading ? <p>Cargando...</p> : (
        <ul className="space-y-2">
          {aprendices.map(a => (
            <li key={a.numero_documento} className="border p-2 rounded flex items-center justify-between">
              <div>
                <span className="font-semibold">{a.nombre} {a.apellido}</span> - {a.correo} <br />
                <span className="text-xs text-gray-500">Documento: {a.numero_documento}</span>
              </div>
              <Link href={`/aprendices/${a.numero_documento}`} className="ml-4 bg-blue-500 text-white px-3 py-1 rounded">Editar</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 