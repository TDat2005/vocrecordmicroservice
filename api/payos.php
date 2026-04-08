<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/PayosController.php';

header('Content-Type: application/json');

$db = new Database();
$pdo = $db->getConnection();
$controller = new PayosController($pdo);

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'webhook':
        $controller->confirmWebhook();
        break;
    default:
        // Đôi khi payos config có thể request GET verify
        echo json_encode(['success' => false, 'message' => 'Invalid payload']);
        break;
}
?>
