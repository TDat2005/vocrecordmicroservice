<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/EmployeeController.php';

header('Content-Type: application/json');

$db = new Database();
$pdo = $db->getConnection();
$controller = new EmployeeController($pdo);

$action = $_GET['action'] ?? 'list';
$data = json_decode(file_get_contents("php://input"), true);

switch ($action) {
    case 'list':          $controller->list(); break;
    case 'create':        $controller->create($data); break;
    case 'update':        $controller->update($data); break;
    case 'toggle_status': $controller->toggleStatus($data); break;
    default:
        echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ']);
}
?>
