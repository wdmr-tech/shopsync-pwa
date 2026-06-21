import React, { useState } from 'react';
import { ShoppingBasket, Eye, EyeOff } from 'lucide-react';

const VALID_USERS = {
  'developer': { id: 'dev_user_01', name: 'Developer', password: 'devpassword' },
  'tester': { id: 'test_user_02', name: 'Tester', password: 'testpassword' },
  'profejp': { id: 'profejp_03', name: 'Profe JP', password: 'profepassword' }
};

export function LoginView({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const userKey = username.toLowerCase().trim();
    const user = VALID_USERS[userKey];

    if (!user) {
      setError('Usuario no encontrado');
      return;
    }

    if (user.password !== password) {
      setError('Contraseña incorrecta');
      return;
    }

    // Si todo es correcto, llamamos al onLogin que viene por prop
    onLogin(user.id, user.name);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-white overflow-y-auto select-none">
      <div className="w-full max-w-sm flex flex-col justify-center py-4">
        {/* Logo and Welcome Area */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex flex-col items-center justify-center mb-4">
            <img 
              src="/shopsync_login.png" 
              alt="ShopSync Logo" 
              className="w-64 h-auto object-contain" 
              onError={(e) => {
                // Fallback por si la imagen no carga inmediatamente en el entorno
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback visual (solo se muestra si la imagen falla) */}
            <div style={{ display: 'none' }} className="flex-col items-center">
              <div className="w-16 h-16 bg-[#0f62fe] rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBasket size={32} color="white" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#0f62fe] tracking-tight">ShopSync</h1>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full">
          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl text-center font-medium animate-fadeIn">
                {error}
              </div>
            )}
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 mb-1 block">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 mb-1 block">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 pr-12 py-3.5 focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!username || !password}
              className="w-full mt-4 bg-[#0f62fe] text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all active:scale-[0.99]"
            >
              Iniciar Sesión
            </button>

            <button 
              type="button"
              onClick={() => onLogin('guest', 'Sin cuenta')}
              className="w-full mt-4 text-[#0f62fe] font-semibold hover:underline bg-transparent"
            >
              Acceder sin cuenta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
