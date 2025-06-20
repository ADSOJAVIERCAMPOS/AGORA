import AprendizForm from '../../components/feature/aprendices/AprendizForm';
import { useRouter } from 'next/navigation';

export default function RegistrarAprendizPage() {
  const router = useRouter();
  const handleSuccess = () => {
    router.push('/aprendices/lista');
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Registrar Aprendiz</h1>
      <AprendizForm onSuccess={handleSuccess} />
      <a href="/aprendices/lista" className="block mt-4 text-blue-600 underline">Ver lista de aprendices</a>
    </div>
  );
} 