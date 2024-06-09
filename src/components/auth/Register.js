import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ethers } from 'ethers';
import UserManagement from '../../contracts/UserManagement.json';
import Alert from '../Alert';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Register() {
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const initialFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };
  const [formValues, setFormValues] = useState(initialFormValues);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    if (value.trim() !== '') {
      setFieldErrors({
        ...fieldErrors,
        [name]: false
      });
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (value.trim() === '') {
      setFieldErrors({
        ...fieldErrors,
        [name]: true
      });
    } else {
      setFieldErrors({
        ...fieldErrors,
        [name]: false
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { firstName, lastName, email, password } = formValues;
  
    const errors = {};
    if (!firstName) errors.firstName = true;
    if (!lastName) errors.lastName = true;
    if (!email) errors.email = true;
    if (!password) errors.password = true;
  
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTypeMessage('danger');
      setMessage('Todos los campos son necesarios');
      return;
    }
  
    setFieldErrors({});
  
    try {
      setIsConnecting(true);
  
      if (typeof window.ethereum === 'undefined') {
        Swal.fire({
          title: 'Error',
          text: 'MetaMask no está instalado!',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        setIsConnecting(false);
        return;
      }
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();
  
      const userManagementContract = new ethers.Contract("0x654CB55f293a76664856D14AE1aC198d9E2B3EB1", UserManagement.abi, signer);
  
      const tx = await userManagementContract.registerUser(firstName, lastName, email, password, 0);
      await tx.wait();
  
      const response = await fetch('https://p2p-lending-api.onrender.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          walletAddress,
        }),
      });
  
      if (response.ok) {
        setTypeMessage('success');
        setMessage('Usuario registrado exitosamente.');
        setFormValues(initialFormValues);
      } else if (response.status === 401) {
        const data = await response.json();
        setTypeMessage('danger');
        setMessage(data.message || 'Error al registrar el usuario');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Error al registrar el usuario');
      }
  
      setIsConnecting(false);
    } catch (e) {
      console.error("Registration error:", e);
      setTypeMessage('danger');
      setMessage(`Registration failed: ${e.message}`);
      setIsConnecting(false);
    }
  };
  

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">Registra una cuenta</h1>
        <form noValidate onSubmit={handleSubmit}>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="firstName"
              id="firstName"
              className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'} appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
              placeholder=" "
              value={formValues.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <label htmlFor="firstName" className={`peer-focus:font-medium absolute text-sm ${fieldErrors.firstName ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>Primer Nombre</label>
            {fieldErrors.firstName && <p className="mt-2 text-sm text-red-600 dark:text-red-500">Este campo es obligatorio</p>}
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="lastName"
              id="lastName"
              className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'} appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
              placeholder=" "
              value={formValues.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <label htmlFor="lastName" className={`peer-focus:font-medium absolute text-sm ${fieldErrors.lastName ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>Primer Apellido</label>
            {fieldErrors.lastName && <p className="mt-2 text-sm text-red-600 dark:text-red-500">Este campo es obligatorio</p>}
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="email"
              name="email"
              id="email"
              className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
              placeholder=" "
              value={formValues.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <label htmlFor="email" className={`peer-focus:font-medium absolute text-sm ${fieldErrors.email ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>Email</label>
            {fieldErrors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-500">Este campo es obligatorio</p>}
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
              placeholder=" "
              value={formValues.password}
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
            disabled={isConnecting}
          >
            {isConnecting ? 'Conectando MetaMask...' : 'Registrar'}
          </button>
          <div className="flex justify-end mt-4">
            <Link to="/login" className="text-sm text-blue-600 hover:underline dark:text-blue-500">
              ¿Ya tienes una cuenta? Ingresar
            </Link>
          </div>
        </form>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>}
        {message && <Alert type={typeMessage} message={message} additionalClasses="fixed bottom-4 right-4" />}
      </div>
    </div>
  );
}
