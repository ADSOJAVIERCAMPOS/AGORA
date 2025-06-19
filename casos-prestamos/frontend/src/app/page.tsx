'use client';

import { useState, useEffect } from 'react';

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<'login' | 'forgotPassword'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const API_BASE = 'http://localhost:8000';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setForgotPasswordEmail('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Credenciales inválidas.');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', JSON.stringify(data.role));
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch (err: any) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Error de conexión. Inténtalo más tarde.'
          : err.message
      );
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al enviar el correo.');
      }

      alert('Enlace enviado al correo.');
      setCurrentView('login');
      resetForm();
    } catch (err: any) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Error de conexión. Inténtalo luego.'
          : err.message
      );
    }
  };

  return (
    <>
      <style jsx>{`
        .scene {
          width: 90%;
          max-width: 380px;
          perspective: 1000px;
        }

        .card {
          width: 100%;
          min-height: 520px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s ease-in-out;
        }

        .card.is-login {
          transform: rotateY(0deg);
        }

        .card.is-forgot-password {
          transform: rotateY(-180deg);
        }

        .card__face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background-color: #ffffff;
          border-radius: 1.25rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        .card__face--front {
          z-index: 2;
        }

        .card__face--forgot-password {
          transform: rotateY(180deg);
        }

        .input-label {
          display: block;
          width: 100%;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #478B3F;
          border-radius: 0.5rem;
          background-color: #fff;
          font-size: 1rem;
          color: #222;
        }

        .form-input:focus {
          border-color: #478B3F;
          outline: none;
        }

        .submit-button {
          width: 100%;
          background: linear-gradient(to right, #63d135, #007e00);
          color: white;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: background-color 0.3s ease;
        }

        .submit-button:hover {
          background: linear-gradient(to right, #56b330, #006a00);
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .link-button {
          background: none;
          border: none;
          color: #478b3f;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          margin-top: auto;
          margin-bottom: 0.5rem;
          transition: color 0.2s ease;
        }

        .link-button:hover {
          text-decoration: underline;
          color: #33682f;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#478B3F' }}>
        <div className="scene">
          <div className={`card ${currentView === 'login' ? 'is-login' : 'is-forgot-password'}`}>
            {/* Login */}
            <div className="card__face card__face--front">
              <img src="/logo-sena.png" alt="Logo SENA" className="w-24 h-24 mb-4 object-contain" />
              <h1 className="text-2xl font-bold mb-6" style={{ color: '#478B3F' }}>
                Iniciar Sesión
              </h1>
              <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="input-label">Correo institucional</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="input-label">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="submit-button">Ingresar</button>
              </form>
              <button
                className="link-button"
                type="button"
                onClick={() => {
                  setCurrentView('forgotPassword');
                  resetForm();
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Recuperar contraseña */}
            <div className="card__face card__face--forgot-password">
              <img src="/logo-sena.png" alt="Logo SENA" className="w-24 h-24 mb-4 object-contain" />
              <h1 className="text-2xl font-bold mb-6" style={{ color: '#478B3F' }}>
                Recuperar Contraseña
              </h1>
              <form onSubmit={handleForgotPasswordSubmit} className="w-full flex flex-col gap-4">
                <div>
                  <label htmlFor="forgot-email" className="input-label">Correo institucional</label>
                  <input
                    type="email"
                    id="forgot-email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="submit-button">Enviar enlace</button>
              </form>
              <button
                className="link-button"
                type="button"
                onClick={() => {
                  setCurrentView('login');
                  resetForm();
                }}
              >
                Volver a Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
