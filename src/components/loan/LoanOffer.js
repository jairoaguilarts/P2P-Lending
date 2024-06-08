import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LoanContract from '../../contracts/LoanContract.json';
import Swal from 'sweetalert2';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const defaultTheme = createTheme();

const LoanOffer = () => {
  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState('');

  const handleOfferLoan = async (event) => {
    event.preventDefault();

    try {
      if (!window.ethereum) {
        Swal.fire({
          title: 'Error',
          text: 'MetaMask no está instalado!',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }

      setIsSubmitting(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contractAddress = "0xBE4A95CD3F24566970f489279b904aB0E66920A8"; // Reemplaza con tu dirección del contrato desplegado
      const loanContract = new ethers.Contract(contractAddress, LoanContract.abi, signer);

      const tx = await loanContract.fundLoan(loanId, { value: ethers.utils.parseEther(amount) });
      await tx.wait();

      setTypeMessage('success');
      setMessage('Loan funded successfully');
    } catch (error) {
      console.error('Error offering loan:', error);
      setTypeMessage('danger');
      setMessage('Error offering loan');
    } finally {
      setIsSubmitting(false);
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
            Offer Loan
          </Typography>
          <Box component="form" noValidate onSubmit={handleOfferLoan} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="loanId"
                  required
                  fullWidth
                  id="loanId"
                  label="Loan ID"
                  value={loanId}
                  onChange={(e) => setLoanId(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="amount"
                  required
                  fullWidth
                  id="amount"
                  label="Amount (ETH)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Offer Loan'}
            </Button>
          </Box>
          {message && (
            <div
              className={`fixed bottom-4 right-4 p-4 mb-4 text-sm ${typeMessage === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'} rounded-lg`}
              role="alert"
            >
              {message}
            </div>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default LoanOffer;
