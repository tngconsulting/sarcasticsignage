<?php
/* ================================================
   Sarcastic Signage — Order Enquiry Handler
   Receives JSON POST from cart.js checkout form.
   Sends email to store + confirmation to customer.
   ================================================ */

require_once __DIR__ . '/config.php';

/* --- CORS & headers --- */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { json_fail('Method not allowed'); }

/* --- Parse body --- */
$body = file_get_contents('php://input');
$data = json_decode($body, true);
if (!$data) { json_fail('Invalid request body'); }

/* --- Sanitise inputs --- */
$name     = sanitise($data['name']     ?? '');
$email    = sanitise($data['email']    ?? '');
$phone    = sanitise($data['phone']    ?? '');
$delivery = sanitise($data['delivery'] ?? '');
$market   = sanitise($data['market']   ?? '');
$address  = sanitise($data['address']  ?? '');
$city     = sanitise($data['city']     ?? '');
$province = sanitise($data['province'] ?? '');
$postal   = sanitise($data['postal']   ?? '');
$notes    = sanitise($data['notes']    ?? '');
$total    = sanitise($data['total']    ?? '0.00');
$cart     = $data['cart'] ?? [];

/* --- Validate required fields --- */
if (!$name || !$email || !$phone || !$delivery) {
  json_fail('Missing required fields');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_fail('Invalid email address');
}
if (!is_array($cart) || count($cart) === 0) {
  json_fail('Cart is empty');
}

/* --- Build order text --- */
$orderLines = [];
foreach ($cart as $item) {
  $title = sanitise($item['title']  ?? 'Unknown');
  $model = sanitise($item['model']  ?? '');
  $color = sanitise($item['color']  ?? '');
  $qty   = (int)($item['qty']   ?? 1);
  $price = (float)($item['price'] ?? 0);
  $line  = "{$qty}x {$title}";
  $attrs = array_filter([$model, $color]);
  if ($attrs) $line .= ' (' . implode(', ', $attrs) . ')';
  $line .= ' — $' . number_format($price * $qty, 2);
  $orderLines[] = $line;
}
$orderText  = implode("\n", $orderLines);
$totalText  = '$' . number_format((float)$total, 2);

/* --- Build delivery text --- */
if ($delivery === 'pickup') {
  $deliveryText = "Market pickup: {$market}";
} else {
  $addrParts    = array_filter([$address, $city, $province, $postal]);
  $deliveryText = 'Ship to: ' . implode(', ', $addrParts);
}

/* --- Email to Patricia --- */
$toPatricia = word_wrap_text(
  "New order enquiry from {$name}\n" .
  "================================\n\n" .
  "Customer: {$name}\n" .
  "Email:    {$email}\n" .
  "Phone:    {$phone}\n\n" .
  "Delivery: {$deliveryText}\n\n" .
  "ORDER\n" .
  "-----\n" .
  $orderText . "\n\n" .
  "Total: {$totalText}\n" .
  ($notes ? "\nNotes: {$notes}\n" : '') .
  "\n================================\n" .
  "Reply to this email to contact the customer."
);

/* --- Confirmation to customer --- */
$toCustomer = word_wrap_text(
  "Hi {$name},\n\n" .
  "Thank you for your order enquiry from Sarcastic Signage!\n" .
  "Patricia will be in touch with you soon to confirm your order and arrange payment.\n\n" .
  "YOUR ORDER\n" .
  "----------\n" .
  $orderText . "\n\n" .
  "Total: {$totalText}\n" .
  "Delivery: {$deliveryText}\n" .
  ($notes ? "\nYour notes: {$notes}\n" : '') .
  "\n----------\n" .
  "Questions? Contact Patricia:\n" .
  "  Email: " . STORE_EMAIL . "\n" .
  "  Phone: 613-700-6677\n\n" .
  "Thank you for supporting a small handmade business!\n" .
  "— " . STORE_NAME
);

/* --- Send emails --- */
$sent = EMAIL_PROVIDER === 'smtp'
  ? send_smtp($name, $email, $toPatricia, $toCustomer)
  : send_mail($name, $email, $toPatricia, $toCustomer);

if (!$sent) { json_fail('Failed to send email — please contact us directly'); }

echo json_encode(['ok' => true]);
exit;

/* -----------------------------------------------
   SEND VIA PHP mail()
----------------------------------------------- */
function send_mail($custName, $custEmail, $toPatricia, $toCustomer) {
  $headersToStore = implode("\r\n", [
    'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . $custName . ' <' . $custEmail . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
  ]);
  $headersToCustomer = implode("\r\n", [
    'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
  ]);

  $s1 = mail(STORE_EMAIL, 'New Order Enquiry — ' . $custName, $toPatricia, $headersToStore);
  $s2 = mail($custEmail,  'Your Sarcastic Signage order enquiry', $toCustomer, $headersToCustomer);
  return $s1; // customer confirmation failing is non-fatal
}

/* -----------------------------------------------
   SEND VIA SMTP (PHPMailer)
   Requires PHPMailer files in /phpmailer/ folder.
   Switch EMAIL_PROVIDER to 'smtp' in config.php
   after installing PHPMailer and setting credentials.
----------------------------------------------- */
function send_smtp($custName, $custEmail, $toPatricia, $toCustomer) {
  $mailerPath = __DIR__ . '/phpmailer/';
  if (!file_exists($mailerPath . 'PHPMailer.php')) {
    error_log('PHPMailer not found — falling back to mail()');
    return send_mail($custName, $custEmail, $toPatricia, $toCustomer);
  }

  require_once $mailerPath . 'Exception.php';
  require_once $mailerPath . 'PHPMailer.php';
  require_once $mailerPath . 'SMTP.php';

  $configure = function($mail) {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->Port       = SMTP_PORT;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_ENCRYPTION;
    $mail->setFrom(FROM_EMAIL, FROM_NAME);
    $mail->CharSet    = 'UTF-8';
  };

  try {
    $m1 = new PHPMailer\PHPMailer\PHPMailer(true);
    $configure($m1);
    $m1->addReplyTo($custEmail, $custName);
    $m1->addAddress(STORE_EMAIL, STORE_NAME);
    $m1->Subject = 'New Order Enquiry — ' . $custName;
    $m1->Body    = $toPatricia;
    $m1->send();

    $m2 = new PHPMailer\PHPMailer\PHPMailer(true);
    $configure($m2);
    $m2->addAddress($custEmail, $custName);
    $m2->Subject = 'Your Sarcastic Signage order enquiry';
    $m2->Body    = $toCustomer;
    $m2->send();

    return true;
  } catch (\Exception $e) {
    error_log('PHPMailer error: ' . $e->getMessage());
    return false;
  }
}

/* -----------------------------------------------
   HELPERS
----------------------------------------------- */
function sanitise($val) {
  return htmlspecialchars(strip_tags(trim((string)$val)), ENT_QUOTES, 'UTF-8');
}

function word_wrap_text($text) {
  return wordwrap($text, 72, "\n", false);
}

function json_fail($msg) {
  echo json_encode(['ok' => false, 'error' => $msg]);
  exit;
}
