import React, { useEffect } from 'react';
import 'flowbite';

const articles = [
  {
    title: 'Entendiendo las Finanzas Personales',
    content: `Las finanzas personales implican gestionar tu dinero, incluyendo la elaboración de presupuestos, el ahorro, la inversión y la planificación para la jubilación. 
    Entender las finanzas personales puede ayudarte a tomar mejores decisiones financieras y alcanzar tus objetivos económicos. 
    Las áreas clave incluyen la creación de un presupuesto, la gestión de deudas, el ahorro para emergencias, y la inversión para el futuro.`,
    reference: 'https://theinvestoru.com/blog/guia-finanzas-personales/'
  },
  {
    title: 'La Importancia del Presupuesto',
    content: `El presupuesto es el proceso de crear un plan para gastar tu dinero. Este plan de gasto te permite determinar con antelación si tendrás suficiente dinero para hacer las cosas que necesitas hacer o te gustaría hacer. 
    Un presupuesto efectivo te ayuda a equilibrar tus ingresos con tus gastos y a evitar deudas innecesarias. 
    Al implementar el método 50/30/20, puedes optimizar la gestión de tus finanzas personales, asegurando que puedas cubrir tus necesidades básicas, disfrutar de ciertos lujos y garantizar un futuro financiero próspero.`,
    reference: 'https://triunfaemprendiendo.com/como-medir-mis-finanzas-personales/'
  },
  {
    title: 'Cómo Construir un Fondo de Emergencia',
    content: `Un fondo de emergencia es una red de seguridad financiera para futuros contratiempos y/o gastos inesperados. 
    Puede usarse para cubrir gastos repentinos e inesperados, como reparaciones del automóvil o facturas médicas. 
    La clave para construir un fondo de emergencia es empezar poco a poco y ser constante en tus ahorros.`,
    reference: 'https://contabilidadfinanzas.com/finanzas-personales/fondo-de-emergencia/'
  },
  {
    title: 'Gestionando la Deuda Efectivamente',
    content: `La gestión de la deuda implica estrategias para pagar deudas, como la consolidación de deudas, la creación de un plan de pagos y la negociación de tasas de interés más bajas con los acreedores. 
    Gestionar la deuda efectivamente es crucial para mantener la salud financiera. 
    Es importante priorizar las deudas con tasas de interés más altas y evitar acumular nuevas deudas.`,
    reference: 'https://contabilidadfinanzas.com/contabilidad-financiera/deudas-a-largo-plazo/'
  },
  {
    title: 'Conceptos Básicos del Puntaje Crediticio',
    content: `Tu puntaje crediticio es un número que representa tu solvencia crediticia. 
    Los prestamistas lo usan para evaluar el riesgo de prestarte dinero. 
    Entender cómo se calcula tu puntaje crediticio y cómo mejorarlo puede ayudarte a acceder a mejores oportunidades financieras. 
    Factores como el historial de pagos, la cantidad de deuda y la duración del historial crediticio afectan tu puntaje.`,
    reference: 'https://www.usa.gov/es/puntaje-credito#:~:text=El%20puntaje%20de%20cr%C3%A9dito%20es,los%20pagos%20de%20un%20pr%C3%A9stamo.'
  }
];

const Training = () => {
  useEffect(() => {
    const accordions = document.querySelectorAll('[data-accordion-target]');
    accordions.forEach(accordion => {
      accordion.addEventListener('click', function (event) {
        const target = document.querySelector(this.getAttribute('data-accordion-target'));
        if (target) {
          const isOpen = target.classList.contains('hidden');
          target.classList.toggle('hidden', !isOpen);
          target.classList.toggle('block', isOpen);
          this.setAttribute('aria-expanded', isOpen);
        }
      });
    });
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Capacitación</h2>
      <p className="mb-6">Aquí puedes encontrar recursos de capacitación para mejorar tus habilidades en la gestión financiera.</p>
      <div id="accordion-open" data-accordion="open">
        {articles.map((article, index) => (
          <div key={index}>
            <h2 id={`accordion-open-heading-${index + 1}`}>
              <button
                type="button"
                className="flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                data-accordion-target={`#accordion-open-body-${index + 1}`}
                aria-expanded="false"
                aria-controls={`accordion-open-body-${index + 1}`}
              >
                <span>{article.title}</span>
                <svg
                  data-accordion-icon
                  className="w-3 h-3 rotate-180 shrink-0"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5 5 1 1 5"
                  />
                </svg>
              </button>
            </h2>
            <div
              id={`accordion-open-body-${index + 1}`}
              className="hidden"
              aria-labelledby={`accordion-open-heading-${index + 1}`}
            >
              <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <p className="mb-2 text-gray-500 dark:text-gray-400">{article.content}</p>
                <a
                  href={article.reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Leer más
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Training;
