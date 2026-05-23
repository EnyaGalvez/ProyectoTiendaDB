import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Lock, User, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(username, password);
    if (success) {
      navigate('/inicio');
    } else {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <KeyRound size={24} strokeWidth={2} />
          </div>
          <h2 className="login-title">La Tiendita</h2>
          <p className="login-subtitle">
            Panel de administración y control
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-alert">
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-container">
              <div className="input-icon">
                <User size={18} />
              </div>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field input-field-with-icon"
                placeholder="Ej. admin"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-container">
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field input-field-with-icon"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn">
            Iniciar sesión
          </button>
        </form>
        
        <div className="login-footer">
          <span>Para pruebas usar contraseña "secret"</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
