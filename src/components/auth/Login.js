import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Swal from 'sweetalert2';
import Alert from '../Alert';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);

    if (value.trim() !== '') {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (value.trim() === '') {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: true
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!email) errors.email = true;
    if (!password) errors.password = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Swal.fire({
        title: 'Error',
        text: 'Todos los campos son obligatorios',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    setFieldErrors({});

    try {
      const response = await fetch('https://p2p-lending-api.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Almacena el estado de sesión en localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('walletAddress', data.walletAddress);

        // Mostrar mensaje de éxito
        setSuccessMessage('Inicio de sesión exitoso! Redirigiendo...');
        
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 2000);
      } else {
        const data = await response.json();
        console.log(data.error);
        setError(data.error || 'Correo o contraseña incorrecto');
      }
    } catch (e) {
      console.error("Login error:", e);
      setError('Error al realizar login');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">Inicia Sesión</h1>
        <form noValidate onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-600 dark:text-red-500">{error}</p>}
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="email"
              name="email"
              id="email"
              className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
              placeholder=" "
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <label htmlFor="email" className={`peer-focus:font-medium absolute text-sm ${fieldErrors.email ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>Correo Electrónico</label>
            {fieldErrors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-500">Este campo es obligatorio</p>}
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
              placeholder=" "
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <label htmlFor="password" className={`peer-focus:font-medium absolute text-sm ${fieldErrors.password ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>Contraseña</label>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                className="text-gray-500 dark:text-gray-400 focus:outline-none"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-500">Este campo es obligatorio</p>}
          </div>
          <button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Ingresar
          </button>
          <div className="flex justify-between mt-4">
            <Link to="#" className="text-sm text-blue-600 hover:underline dark:text-blue-500">
              Olvidaste la contraseña?
            </Link>
            <Link
              to="#"
              className="text-sm text-blue-600 hover:underline dark:text-blue-500"
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
            >
              ¿No tienes una cuenta? Regístrate
            </Link>
          </div>
        </form>
        {successMessage && (
          <Alert 
            type="success" 
            message={successMessage} 
            additionalClasses="fixed bottom-4 right-4" 
          />
        )}
      </div>
    </div>
  );
};

export default Login;
