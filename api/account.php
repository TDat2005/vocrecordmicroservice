<?php
// Router: Tài Khoản (account.php)
// Entry point - định tuyến request đến AccountController

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/AccountController.php';

header('Content-Type: application/json');

$db = new Database();
$pdo = $db->getConnection();
$controller = new AccountController($pdo);

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'get_profile':    $controller->getProfile(); break;
    case 'update_profile': $controller->updateProfile($data); break;
    case 'get_addresses':  $controller->getAddresses(); break;
    default:
        echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ']);
}
?>
