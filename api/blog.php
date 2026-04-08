<?php
// Router: Blog (blog.php)
// Entry point - định tuyến request đến BlogController

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/BlogController.php';

header('Content-Type: application/json');

$db = new Database();
$pdo = $db->getConnection();
$controller = new BlogController($pdo);

$action = $_GET['action'] ?? 'list';
$data = json_decode(file_get_contents("php://input"), true);

switch ($action) {
    case 'list':   $controller->list(); break;
    case 'detail': $controller->detail(); break;
    case 'create': $controller->create($data); break;
    case 'update': $controller->update($data); break;
    case 'delete': $controller->delete($data); break;
    default:
        echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ']);
}
?>
