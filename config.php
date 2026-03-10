<?php
/* ================================================
   Sarcastic Signage — Server Configuration
   Keep this file private (not publicly readable).
   ================================================ */

/* -----------------------------------------------
   EMAIL PROVIDER
   'smtp'  — send via SMTP (recommended, requires credentials below)
   'mail'  — use PHP's built-in mail() (simpler, less reliable)
----------------------------------------------- */
define('EMAIL_PROVIDER', 'mail');

/* -----------------------------------------------
   SMTP CREDENTIALS
   Used when EMAIL_PROVIDER = 'smtp'
   Example: Gmail SMTP, your host's SMTP, etc.
----------------------------------------------- */
define('SMTP_HOST',       'smtp.gmail.com');   // e.g. smtp.gmail.com
define('SMTP_PORT',       587);                // 587 = TLS, 465 = SSL
define('SMTP_ENCRYPTION', 'tls');              // 'tls' or 'ssl'
define('SMTP_USER',       'your@gmail.com');   // your SMTP username
define('SMTP_PASS',       'your-app-password');// your SMTP password / app password

/* -----------------------------------------------
   STORE EMAIL
   Patricia's email — receives all order enquiries.
----------------------------------------------- */
define('STORE_EMAIL', 'patriciapkcjs@hotmail.com');
define('STORE_NAME',  'Sarcastic Signage');
define('FROM_EMAIL',  'noreply@sarcasticsignage.com'); // sender address shown to customers
define('FROM_NAME',   'Sarcastic Signage');

/* -----------------------------------------------
   ALLOWED ORIGINS (CORS)
   Add your domain(s) here.
----------------------------------------------- */
define('ALLOWED_ORIGIN', 'https://sarcasticsignage.com');
