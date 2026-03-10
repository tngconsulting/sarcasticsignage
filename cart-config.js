/* ================================================
   Sarcastic Signage — Cart Configuration
   Edit this file to change cart behaviour.
   ================================================ */

const SS_CART_CONFIG = {

  /* -----------------------------------------------
     EMAIL PROVIDER
     'php'        — uses order.php on your server (recommended)
     'formspree'  — uses Formspree (no server code needed)
     'emailjs'    — uses EmailJS (client-side only)
  ----------------------------------------------- */
  provider: 'php',

  /* PHP endpoint — path to order.php from site root.
     Detected automatically; override here if needed. */
  phpEndpoint: null, // auto-detected based on page location

  /* Formspree — replace with your form endpoint URL */
  formspreeEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',

  /* EmailJS — replace with your account credentials */
  emailjs: {
    serviceId:  'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    publicKey:  'YOUR_PUBLIC_KEY',
  },

  /* -----------------------------------------------
     STORE INFO
     Used in confirmation emails sent to customers.
  ----------------------------------------------- */
  storeName:  'Sarcastic Signage',
  storeEmail: 'patriciapkcjs@hotmail.com',
  storePhone: '613-700-6677',

  /* -----------------------------------------------
     UPCOMING MARKETS
     Listed as pickup options in checkout.
     Remove past markets; add new ones as scheduled.
     Format: { id, label }
  ----------------------------------------------- */
  upcomingMarkets: [
    {
      id:    'carleton-2026-03-27',
      label: 'Carleton University Market — Fri, March 27, 2026 (9 AM–3 PM)',
    },
    /* Add more markets here, for example:
    {
      id:    'somemarket-2026-04-12',
      label: 'Some Market — Sun, April 12, 2026 (10 AM–4 PM)',
    },
    */
  ],

};
