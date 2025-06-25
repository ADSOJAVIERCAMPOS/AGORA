'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<'login' | 'forgotPassword'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('');

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
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
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

      Swal.fire({
        title: '¡Enlace enviado!',
        text: 'Revisa tu correo para restablecer la contraseña.',
        icon: 'success'
      });
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

  const handlePrestamoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      // ...agrega campos y archivos...
      const res = await fetch('http://localhost:8000/api/prestamos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err: any) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Error de conexión. Inténtalo más tarde.'
          : err.message
      );
    }
  };

  const handleUsuariosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usuarios = await res.json();
      if (!res.ok) throw new Error(usuarios.message);
    } catch (err: any) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Error al obtener la lista de usuarios.'
          : err.message
      );
    }
  };

  const handleUsuariosCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, email, password, rol })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err: any) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Error al crear el usuario.'
          : err.message
      );
    }
  };

  const handleUsuariosUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const id = 'someUserId'; // Replace with actual user ID
      const res = await fetch(`${API_BASE}/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, email, rol })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err: any) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Error al actualizar el usuario.'
          : err.message
      );
    }
  };

  const handleUsuariosDesactivar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const id = 'someUserId'; // Replace with actual user ID
      const res = await fetch(`${API_BASE}/api/usuarios/${id}/desactivar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err: any) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Error al desactivar el usuario.'
          : err.message
      );
    }
  };

  return (
    <>
      <style jsx>{`
        .login-bg {
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          background: #fff;
        }
        .login-image {
          flex: 0.7;
          background: url('https://i.imgur.com/7qBOeqg.png') no-repeat center center;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          min-height: 100vh;
          width: 100%;
        }
        .login-form-container {
          flex: 1.3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff;
          min-height: 100vh;
        }
        @media (max-width: 900px) {
          .login-bg {
            flex-direction: column;
          }
          .login-image {
            min-height: 180px;
            height: 180px;
            background-size: contain;
            background-position: top center;
          }
          .login-form-container {
            min-height: auto;
            padding: 24px 0;
          }
        }
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
          padding: 1rem 2rem;
          font-weight: 700;
          font-size: 1.2rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          margin-top: 1.2rem;
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

      <div className="login-bg">
        <div className="login-image" />
        <div className="login-form-container">
          <img src="/agoraIcono.svg" alt="Logo AGORA" style={{ width: 320, marginBottom: 16 }} />
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ color: '#388e3c', fontWeight: 'bold', fontSize: 40, letterSpacing: 4 }}>AGORA</span>
          </div>
          <div className="scene">
            <div className={`card ${currentView === 'login' ? 'is-login' : 'is-forgot-password'}`}>
              {/* Login */}
              <div className="card__face card__face--front">
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
                  <div>
                    <label htmlFor="nombre" className="input-label">Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      placeholder="Nombre"
                    />
                  </div>
                  <div>
                    <label htmlFor="rol" className="input-label">Rol</label>
                    <input
                      type="text"
                      value={rol}
                      onChange={e => setRol(e.target.value)}
                      placeholder="Rol"
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
      </div>
    </>
  );
}
