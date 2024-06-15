import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import LoanContract from '../../contracts/LoanContract.json';
import Alert from '../Alert';

const LoanOffers = () => {
  const [loanOffers, setLoanOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [lenderDetails, setLenderDetails] = useState({});
  const [newLoan, setNewLoan] = useState({
    id: '',
    amount: '',
    interestRate: '',
    duration: '',
    status: '',
    borrower: '',
    lender: '',
    isFunded: false,
    isRepaid: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState('');

  const fetchLoanOffers = async () => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const response = await fetch(`https://p2p-lending-api.onrender.com/getLoansByLender?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        const filteredData = data.filter(offer => offer.lender.toLowerCase() !== walletAddress.toLowerCase() && !offer.borrower);
        setLoanOffers(Array.isArray(filteredData) ? filteredData : []);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Error al obtener las ofertas de préstamos');
      }
    } catch (error) {
      console.error('Error fetching loan offers:', error);
      setTypeMessage('danger');
      setMessage('Error al obtener las ofertas de préstamos');
      setLoanOffers([]); // Asegura que loanOffers sea un arreglo vacío en caso de error
    }
  };

  useEffect(() => {
    fetchLoanOffers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLoan({ ...newLoan, [name]: value });

    // Limpiar el error del campo cuando el usuario empieza a escribir
    if (value.trim() !== '') {
      setFieldErrors({
        ...fieldErrors,
        [name]: false
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos vacíos
    const errors = {};
    if (!newLoan.amount) errors.amount = true;
    if (!newLoan.interestRate) errors.interestRate = true;
    if (!newLoan.duration) errors.duration = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTypeMessage('danger');
      setMessage('Todos los campos son necesarios');
      return;
    }

    try {
      if (typeof window.ethereum === 'undefined') {
        Swal.fire({
          title: 'Error',
          text: 'MetaMask no está instalado!',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const loanContract = new ethers.Contract(
        "0x1b30c48B008435b5F16Ba6e4099e4BBF64efe282",
        LoanContract.abi,
        signer
      );

      const tx = await loanContract.createLoanOffer(
        ethers.utils.parseUnits(newLoan.amount, 'ether'),
        newLoan.interestRate,
        newLoan.duration
      );

      await tx.wait();

      const newLoanOffer = {
        amount: newLoan.amount,
        interestRate: newLoan.interestRate,
        duration: newLoan.duration,
        status: 'Pending',
        lender: await signer.getAddress(),
        borrower: null,
        isFunded: false,
        isRepaid: false,
      };

      // Guardar en MongoDB
      const response = await fetch('https://p2p-lending-api.onrender.com/createLoan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLoanOffer),
      });

      if (response.ok) {
        setNewLoan({
          amount: '',
          interestRate: '',
          duration: '',
        });
        setShowForm(false);
        setTypeMessage('success');
        setMessage('Prestramo ofrecido exitosamente.');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear la oferta de préstamo');
      }
    } catch (error) {
      console.error('Error creating loan offer:', error);
      setTypeMessage('danger');
      setMessage('Error al crear la oferta de prestamo');
    }
  };

  const toggleDetails = async (id, lender) => {
    if (expandedRequest === id) {
      setExpandedRequest(null);
      setLenderDetails({});
    } else {
      setExpandedRequest(id);
      try {
        const response = await fetch(`https://p2p-lending-api.onrender.com/getLender/${lender}`);
        if (response.ok) {
          const data = await response.json();
          setLenderDetails(data);
        } else {
          console.error('Error fetching lender details:', response.statusText);
          setLenderDetails({});
        }
      } catch (error) {
        console.error('Error fetching lender details:', error);
        setLenderDetails({});
      }
    }
  };

  const acceptLoan = async (loanID) => {
    try {
      if (typeof window.ethereum === 'undefined') {
        Swal.fire({
          title: 'Error',
          text: 'MetaMask no está instalado!',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const loanContract = new ethers.Contract(
        "0x1b30c48B008435b5F16Ba6e4099e4BBF64efe282",
        LoanContract.abi,
        signer
      );
  
      const tx = await loanContract.acceptLoanOffer(loanID);
      await tx.wait();
  
      const borrowerAddress = localStorage.getItem('walletAddress');
  
      const response = await fetch('https://p2p-lending-api.onrender.com/asignarBorrower', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loanID, borrower: borrowerAddress }),
      });
  
      if (response.ok) {
        setTypeMessage('success');
        setMessage('Préstamo aceptado exitosamente.');
        fetchLoanOffers();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Error al actualizar el prestamista en la base de datos');
      }
    } catch (error) {
      console.error('Error accepting loan:', error);
      setTypeMessage('danger');
      setMessage('Error al aceptar el préstamo');
    }
  };

  // Temporizador para ocultar el mensaje de alerta después de 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <div className="overflow-x-auto m-4">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className={`text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800`}
          >
            Crear Oferta
          </button>
        </div>

        {showForm && (
          <form className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800" onSubmit={handleSubmit}>
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="text"
                name="amount"
                value={newLoan.amount}
                onChange={handleInputChange}
                className={`block py-2.5 px-0 w-full text-sm ${fieldErrors.amount ? 'border-red-500' : 'text-gray-900'} bg-transparent border-0 border-b-2 ${fieldErrors.amount ? 'border-red-500' : 'border-gray-300'} appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                placeholder=" "
              />
              <label htmlFor="amount" className={`peer-focus:font-medium absolute text-sm ${fieldErrors.amount ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>Cantidad (ETH)</label>
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="number"
                name="interestRate"
                value={newLoan.interestRate}
                onChange={handleInputChange}
                className={`block py-2.5 px-0 w-full text-sm ${fieldErrors.interestRate ? 'border-red-500' : 'text-gray-900'} bg-transparent border-0 border-b-2 ${fieldErrors.interestRate ? 'border-red-500' : 'border-gray-300'} appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                placeholder=" "
              />
              <label htmlFor="interestRate" className={`peer-focus:font-medium absolute text-sm ${fieldErrors.interestRate ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>Tasa de Interes (%)</label>
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="number"
                name="duration"
                value={newLoan.duration}
                onChange={handleInputChange}
                className={`block py-2.5 px-0 w-full text-sm ${fieldErrors.duration ? 'border-red-500' : 'text-gray-900'} bg-transparent border-0 border-b-2 ${fieldErrors.duration ? 'border-red-500' : 'border-gray-300'} appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
                placeholder=" "
              />
              <label htmlFor="duration" className={`peer-focus:font-medium absolute text-sm ${fieldErrors.duration ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>Duracion (meses)</label>
            </div>
            <button
              type="submit"
              className="w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Crear
            </button>
          </form>
        )}

        <table className="min-w-full bg-white dark:bg-gray-900 mt-4">
          <thead className="bg-blue-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tasa de Interes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Duracion</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {loanOffers.length > 0 ? loanOffers.map((offer, index) => (
              <React.Fragment key={offer.loanID}>
                <tr 
                  onClick={() => toggleDetails(offer.loanID, offer.lender)}
                  className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{offer.amount} ETH</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{offer.interestRate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{offer.duration} meses</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{offer.status}</td>
                </tr>
                {expandedRequest === offer.loanID && (
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                      <div><strong>Prestamista:</strong> {offer.lender}</div>
                      <div><strong>Nombre:</strong> {lenderDetails.firstName + " " + lenderDetails.lastName}</div>
                      <div><strong>Score crediticio:</strong> {lenderDetails.creditScore}</div>
                      <button
                        onClick={() => acceptLoan(offer.loanID)}
                        className="mt-2 text-white bg-blue-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                      >
                        Aceptar
                      </button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">No hay ofertas de préstamos disponibles.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {message && <Alert type={typeMessage} message={message} additionalClasses="fixed bottom-4 right-4" />}
    </>
  );  

};

export default LoanOffers;
