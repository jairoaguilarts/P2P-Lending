import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white rounded-lg shadow dark:bg-gray-900 m-4">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a href="/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Microfinance Platform</span>
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <footer>
              <button onClick={() => alert('Link 1 clicked')}>Sobre Nosotros</button>
              <button onClick={() => alert('Link 2 clicked')}>Privacidad</button>
              <button onClick={() => alert('Link 3 clicked')}>Link 3</button>
              <button onClick={() => alert('Link 4 clicked')}>Link 4</button>
            </footer>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a href="/" className="hover:underline">Microfinance Platform</a>. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
