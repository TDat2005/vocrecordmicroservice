<?php
require_once __DIR__ . '/payos.php';

class PayOSService {
    public static function createPaymentLink($orderCode, $amount, $description, $returnUrl, $cancelUrl) {
        $data = [
            "orderCode" => $orderCode,
            "amount" => $amount,
            "description" => substr($description, 0, 25), // PayOS allows max 25 chars for description
            "returnUrl" => $returnUrl,
            "cancelUrl" => $cancelUrl
        ];

        // Tạo signature (sắp xếp theo alphabet rồi nối lại)
        $signatureString = "amount={$data['amount']}&cancelUrl={$data['cancelUrl']}&description={$data['description']}&orderCode={$data['orderCode']}&returnUrl={$data['returnUrl']}";
        $signature = hash_hmac('sha256', $signatureString, PAYOS_CHECKSUM_KEY);
        $data['signature'] = $signature;

        $ch = curl_init('https://api-merchant.payos.vn/v2/payment-requests');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-client-id: ' . PAYOS_CLIENT_ID,
            'x-api-key: ' . PAYOS_API_KEY
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);
        if (isset($result['code']) && $result['code'] == '00') {
            return $result['data'];
        }
        
        throw new Exception("Lỗi tạo Payment Link từ PayOS: " . ($result['desc'] ?? 'Unknown Error'));
    }

    public static function verifyWebhookSignature($webhookData, $signature) {
        // payload format for verify inside webhook
        $data = [
            'amount' => $webhookData['amount'],
            'cancel' => $webhookData['cancel'] ? 'true' : 'false',
            'description' => $webhookData['description'],
            'orderCode' => $webhookData['orderCode'],
            'status' => $webhookData['status'],
        ];
        
        $signatureString = "amount={$data['amount']}&cancel={$data['cancel']}&description={$data['description']}&orderCode={$data['orderCode']}&status={$data['status']}";
        $computedSignature = hash_hmac('sha256', $signatureString, PAYOS_CHECKSUM_KEY);
        
        return $computedSignature === $signature;
    }
}
?>
