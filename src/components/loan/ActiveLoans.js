import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Alert from '../Alert';
import LoanContract from '../../contracts/LoanContract.json';

const ActiveLoans = () => {
    const [activeLoans, setActiveLoans] = useState([]);
    const [message, setMessage] = useState('');
    const [typeMessage, setTypeMessage] = useState('');
    const [borrowerDetails, setBorrowerDetails] = useState({});
    const [lenderDetails, setLenderDetails] = useState({});

    const walletAddress = localStorage.getItem('walletAddress');

    useEffect(() => {
        const fetchActiveLoans = async () => {
            try {
                const walletAddress = localStorage.getItem('walletAddress');
                const response = await fetch(`https://p2p-lending-api.onrender.com/getLoansByBorrower?walletAddress=${walletAddress}`);
                if (response.ok) {
                    const data = await response.json();
                    const filteredData = data.filter(
                        loan => (loan.borrower !== null && loan.lender !== null) &&
                            (loan.borrower.toLowerCase() === walletAddress.toLowerCase() ||
                                loan.lender.toLowerCase() === walletAddress.toLowerCase())
                    );
                    setActiveLoans(Array.isArray(filteredData) ? filteredData : []);
                    filteredData.forEach(loan => {
                        fetchBorrowerDetails(loan.borrower);
                        fetchLenderDetails(loan.lender);
                    });
                } else {
                    const data = await response.json();
                    throw new Error(data.message || 'Error al obtener los préstamos activos');
                }
            } catch (error) {
                console.error('Error fetching active loans:', error);
                setTypeMessage('danger');
                setMessage('Error al obtener los préstamos activos');
                setActiveLoans([]); // Asegura que activeLoans sea un arreglo vacío en caso de error
            }
        };

        fetchActiveLoans();
    }, []);

    const fetchBorrowerDetails = async (borrower) => {
        if (!borrowerDetails[borrower]) {
            try {
                const response = await fetch(`https://p2p-lending-api.onrender.com/getBorrower/${borrower}`);
                if (response.ok) {
                    const data = await response.json();
                    setBorrowerDetails(prevState => ({
                        ...prevState,
                        [borrower]: data.name
                    }));
                } else {
                    console.error('Error fetching borrower details:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching borrower details:', error);
            }
        }
    };

    const fetchLenderDetails = async (lender) => {
        if (!lenderDetails[lender]) {
            try {
                const response = await fetch(`https://p2p-lending-api.onrender.com/getLender/${lender}`);
                if (response.ok) {
                    const data = await response.json();
                    setLenderDetails(prevState => ({
                        ...prevState,
                        [lender]: data.name
                    }));
                } else {
                    console.error('Error fetching lender details:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching lender details:', error);
            }
        }
    };

    const handleFundLoan = async (loanId, amount) => {
        try {
            if (typeof window.ethereum === 'undefined') {
                alert('MetaMask no está instalado!');
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = provider.getSigner();
            const loanContract = new ethers.Contract(
                "0x451a34a0C165dBdD86f6f4da78700Ffd803D101b",
                LoanContract.abi,
                signer
            );

            const tx = await loanContract.fundLoan(loanId, { value: ethers.utils.parseUnits(amount.toString(), 'ether') });

            await tx.wait();

            // Actualizar el estado de la aplicación después de la financiación exitosa
            setActiveLoans(activeLoans.map(loan => loan.loanID === loanId ? { ...loan, isFunded: true } : loan));
            setTypeMessage('success');
            setMessage('Préstamo financiado exitosamente.');
        } catch (error) {
            console.error('Error funding loan:', error);
            setTypeMessage('danger');
            setMessage('Error al financiar el préstamo');
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
                <h2 className="text-2xl font-bold mt-8 mb-4">Préstamos Activos</h2>
                <table className="min-w-full bg-white dark:bg-gray-900 mt-4">
                    <thead className="bg-blue-600">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Cantidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tasa de Interes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Duracion</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Accion</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {activeLoans.length > 0 ? activeLoans.map((loan, index) => (
                            <tr key={loan.loanID} className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{loan.amount} ETH</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{loan.interestRate}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{loan.duration} meses</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{loan.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                                    {loan.status === 'Pending' && (
                                        loan.lender.toLowerCase() === walletAddress.toLowerCase() ? (
                                            <button
                                                onClick={() => handleFundLoan(loan.loanID, loan.amount)}
                                                className="mt-2 text-white bg-blue-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                            >
                                                Financiar
                                            </button>
                                        ) : (
                                            <span className="mt-2 text-gray-500 font-medium">Pendiente de financiación</span>
                                        )
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">No hay préstamos activos.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {message && <Alert type={typeMessage} message={message} additionalClasses="fixed bottom-4 right-4" />}
        </>
    );
};

export default ActiveLoans;
