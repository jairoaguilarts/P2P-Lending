import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Alert from '../Alert';

const ActiveLoans = () => {
    const [activeLoans, setActiveLoans] = useState([]);
    const [message, setMessage] = useState('');
    const [typeMessage, setTypeMessage] = useState('');
    const [borrowerDetails, setBorrowerDetails] = useState({});
    const [lenderDetails, setLenderDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const walletAddress = localStorage.getItem('walletAddress');

    const fetchActiveLoans = async () => {
        try {
            const response = await fetch(`https://p2p-lending-api.onrender.com/getLoansByBorrower?walletAddress=${walletAddress}`);
            if (!response.ok) throw new Error('Error fetching active loans');
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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveLoans();
    }, [activeLoans]);

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
                }
            } catch (error) {
                console.error('Error fetching lender details:', error);
            }
        }
    };

    const handleFundLoan = async (loanId, amount, borrower, status) => {
        try {
            if (typeof window.ethereum === 'undefined') {
                alert('MetaMask no está instalado!');
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = provider.getSigner();

            const tx = await signer.sendTransaction({
                to: borrower,
                value: ethers.utils.parseUnits(amount.toString(), 'ether')
            });

            await tx.wait();

            const response = await fetch('https://p2p-lending-api.onrender.com/actualizarStatus', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loanID: loanId,
                    isFunded: true,
                    status: status
                })
            });

            if (response.ok) {
                setTypeMessage('success');
                setMessage('Préstamo financiado exitosamente.');
                fetchActiveLoans();
            } else {
                throw new Error('Error al actualizar el estado en la base de datos');
            }
        } catch (error) {
            console.error('Error funding loan:', error);
            setTypeMessage('danger');
            setMessage('Error al financiar el préstamo');
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
        <>
            <div className="overflow-x-auto m-4">
                <h2 className="text-2xl font-bold mt-8 mb-4">Préstamos Activos</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
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
                                        {loan.status === 'Pendiente' && (
                                            loan.lender.toLowerCase() === walletAddress.toLowerCase() ? (
                                                <button
                                                    onClick={() => handleFundLoan(loan.loanID, loan.amount, loan.borrower, 'Financiando')}
                                                    className="mt-2 text-white bg-blue-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                                >
                                                    Financiar
                                                </button>
                                            ) : (
                                                <span className="mt-2 text-gray-500 font-medium">Pendiente de financiación</span>
                                            )
                                        )}
                                        {loan.status === 'Financiado' && loan.isFunded && (
                                            loan.lender.toLowerCase() === walletAddress.toLowerCase() ? (
                                                <span className="mt-2 text-gray-500 font-medium">Financiado</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleFundLoan(loan.loanID, loan.amount, loan.lender, 'Pagado')}
                                                    className="mt-2 text-white bg-blue-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                                >
                                                    Pagar
                                                </button>
                                            )
                                        )}
                                        {loan.status === 'Pagado' && (
                                            loan.lender.toLowerCase() === walletAddress.toLowerCase() ? (
                                                <span className="mt-2 text-gray-500 font-medium">Pagado</span>
                                            ) : (
                                                <></>
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
                )}
            </div>
            {message && <Alert type={typeMessage} message={message} additionalClasses="fixed bottom-4 right-4" />}
        </>
    );
};

export default ActiveLoans;
