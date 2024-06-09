import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import LoanContract from '../../contracts/LoanContract.json'; // Asegúrate de que la ruta al ABI es correcta

const LoanOffers = () => {
  const [loanOffers, setLoanOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
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

  useEffect(() => {
    // Ejemplo de ofertas de préstamo
    const exampleLoanOffers = [
      { id: 'LOAN001', amount: '0.01', interestRate: 5, duration: 12, status: 'Active', borrower: '0x...', lender: '0x...', isFunded: false, isRepaid: false },
      { id: 'LOAN002', amount: '0.5', interestRate: 4.5, duration: 24, status: 'Pending', borrower: '0x...', lender: '0x...', isFunded: false, isRepaid: false },
      { id: 'LOAN003', amount: '2', interestRate: 6, duration: 36, status: 'Closed', borrower: '0x...', lender: '0x...', isFunded: false, isRepaid: false },
      { id: 'LOAN004', amount: '1', interestRate: 3.5, duration: 6, status: 'Active', borrower: '0x...', lender: '0x...', isFunded: false, isRepaid: false },
      { id: 'LOAN005', amount: '0.6', interestRate: 4, duration: 18, status: 'Pending', borrower: '0x...', lender: '0x...', isFunded: false, isRepaid: false },
    ];

    setLoanOffers(exampleLoanOffers);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLoan({ ...newLoan, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        "0xa1836B9BF58c41dB635B7697f966A0876b8698a6",
        LoanContract.abi,
        signer
      );

      const tx = await loanContract.createLoanOffer(
        ethers.utils.parseUnits(newLoan.amount, 'ether'),
        newLoan.interestRate,
        newLoan.duration
      );

      const receipt = await tx.wait();
      console.log('Transaction successful with hash:', receipt.transactionHash);
      console.log('Receipt:', receipt);
      const events = await receipt.events;
      console.log("Loan contract: ", LoanContract);
      console.log("Events: ", events);
      const loanCreatedFilter = {
        topics: [
          ethers.utils.id("LoanOfferCreated(uint256,address,uint256,uint256,uint256)"),
          null, // This will match any value for the first indexed parameter (loanId)
          null, // This will match any value for the second indexed parameter (lender)
        ],
      };
      
      const loanCreatedEvents = events.filter(event => event.topics.some(topic => topic === loanCreatedFilter.topics[0]));
      console.log("LoanCreatedFilter: ", loanCreatedFilter);
      console.log("LoanCreatedEvents: ", loanCreatedEvents);

      if (loanCreatedEvents.length > 0) {
        const loanCreatedEvent = loanCreatedEvents[0];
        const loanId = loanCreatedEvent.args.loanId;
        console.log(loanId);
        // Access other event arguments as needed
      } else {
        console.error('LoanCreated event not found');
      }

      const event = receipt.events.find(event => event.event === 'LoanCreated');
      const loanId = event.args.loanId.toString();

      const newLoanOffer = {
        id: loanId,
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
      const response = await fetch('http://localhost:3000/createLoan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLoanOffer),
      });

      if (response.ok) {
        setLoanOffers([...loanOffers, newLoanOffer]);
        setNewLoan({
          amount: '',
          interestRate: '',
          duration: '',
        });
        setShowForm(false);
        Swal.fire({
          title: 'Success',
          text: 'Loan offer created successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear la oferta de préstamo');
      }
    } catch (error) {
      console.error('Error creating loan offer:', error);
    }
  };

  return (
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
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
            />
            <label htmlFor="amount" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Cantidad (ETH)</label>
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="number"
              name="interestRate"
              value={newLoan.interestRate}
              onChange={handleInputChange}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
            />
            <label htmlFor="interestRate" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Tasa de Interes (%)</label>
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="number"
              name="duration"
              value={newLoan.duration}
              onChange={handleInputChange}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
            />
            <label htmlFor="duration" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 dark:peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Duracion (meses)</label>
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
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Loan ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Cantidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tasa de Interes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Duracion</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {loanOffers.map((offer, index) => (
            <tr key={offer.id} className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{offer.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{offer.amount} ETH</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{offer.interestRate}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{offer.duration} meses</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">{offer.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoanOffers;
