import React, { useState, useContext, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import UserManagement from '../../contracts/UserManagement.json';
import Alert from '../Alert';

const defaultTheme = createTheme();

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
      
      const userManagementContract = new ethers.Contract("0xdeEbE3b81872e4028Bdf35D9860C83e39D22985a", UserManagement.abi, signer);

      const tx = await userManagementContract.registerUser(firstName, lastName, email, password, 0);
      await tx.wait();

      const response = await fetch('http://localhost:3000/register', {
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
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs" className="flex items-center justify-center min-h-screen">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Registra una cuenta
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  autoFocus
                  id="firstName"
                  label="Primer Nombre"
                  value={formValues.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!fieldErrors.firstName}
                  helperText={fieldErrors.firstName ? 'Este campo es obligatorio' : ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Primer Apellido"
                  name="lastName"
                  autoComplete="family-name"
                  value={formValues.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!fieldErrors.lastName}
                  helperText={fieldErrors.lastName ? 'Este campo es obligatorio' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  value={formValues.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email ? 'Este campo es obligatorio' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formValues.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password ? 'Este campo es obligatorio' : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isConnecting}
            >
              {isConnecting ? 'Conectando MetaMask...' : 'Registrar'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="#" variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}>
                  ¿Ya tienes una cuenta? Ingresar
                </Link>
              </Grid>
            </Grid>
          </Box>
          {error && <Typography color="error" variant="body2" align="center">{error}</Typography>}
        </Box>
        {message && (
          <Alert 
            type={typeMessage} 
            message={message} 
            additionalClasses="fixed bottom-4 right-4" 
          />
        )}
      </Container>
    </ThemeProvider>
  );
}
