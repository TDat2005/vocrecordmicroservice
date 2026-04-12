<?php


define('PAYOS_CLIENT_ID', '23b5b4b7-ce1c-40ff-ba1e-ee72bc2e95e0');
define('PAYOS_API_KEY', '04ab77c5-e546-4d98-92ef-3280bc2771cb');
define('PAYOS_CHECKSUM_KEY', '5eef28884b3861b5c963b3b9ab5f798b2a71116edba17bd6fe181671dbf8f985');

// URL Frontend để PayOS gọi về sau khi giao dịch
// ⚠️ KHI DEPLOY LÊN VPS: Đổi localhost:5173 thành domain thật (ví dụ: https://yourdomain.com)
define('PAYOS_RETURN_URL', 'http://localhost:5173/payment-result');
define('PAYOS_CANCEL_URL', 'http://localhost:5173/payment-result');
?>