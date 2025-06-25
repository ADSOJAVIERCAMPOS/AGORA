import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AprendizForm from '../../../components/feature/aprendices/AprendizForm';

export default function EditarAprendizPage() {
  const router = useRouter();
  const { numero_documento } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (numero_documento) {
      fetch(`http://localhost:8000/api/aprendices/${numero_documento}`, {
        headers: { 'Accept': 'application/json' }
      })
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        });
    }
  }, [numero_documento]);

  const handleSuccess = () => {
    router.push('/aprendices/lista');
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!data) return <div className="p-8">No se encontró el aprendiz.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Editar Aprendiz</h1>
      <AprendizForm initialData={data} onSuccess={handleSuccess} />
      <a href="/aprendices/lista" className="block mt-4 text-blue-600 underline">Ver lista de aprendices</a>
    </div>
  );
} 