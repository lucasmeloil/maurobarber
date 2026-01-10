import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('isAdmin', 'true'); 
        router.push('/admin');
    } catch (error) {
        alert('Erro ao fazer login. Verifique suas credenciais.');
        console.error(error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
            <Image 
                src="/img/logo.png" 
                width={160} 
                height={50} 
                alt="Mauro Barber Logo" 
                className="object-contain"
            />
        </div>
        <h1 className="text-2xl font-bold font-heading mb-6 text-center text-black">Login Administrativo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-black transition-colors"
                    required
                />
            </div>
            <div>
                <label className="block text-sm text-gray-600 mb-1">Senha</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-black transition-colors"
                    required
                />
            </div>
            <button 
                type="submit"
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors mt-4"
            >
                Entrar
            </button>
        </form>
      </div>
    </div>
  );
}
