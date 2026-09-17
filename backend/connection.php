<?php
/**
 * Database connection (PDO).
 *
 * Fill these in from your Freehostia "Databases" tab AFTER you create the
 * new database (the old one is gone). On Freehostia, DB_HOST is normally
 * "localhost" and DB_NAME/DB_USER are prefixed with your account name,
 * e.g. "yourusername_phones".
 */
define('DB_HOST', 'localhost');
define('DB_NAME', 'yourusername_phones');
define('DB_USER', 'yourusername_dbuser');
define('DB_PASS', 'your-db-password');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
