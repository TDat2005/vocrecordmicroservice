<?php
// Router: Wishlist (wishlist.php)
// Entry point - định tuyến request đến WishlistController

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/WishlistController.php';

header('Content-Type: application/json');

$db = new Database();
$pdo = $db->getConnection();
$controller = new WishlistController($pdo);

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'list':   $controller->list(); break;
    case 'add':    $controller->add($data); break;
    case 'remove': $controller->remove($data); break;
    default:
        echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ']);
}
?>
