<?php
/**
 * Bearer-token gate. Included at the top of phones.php so every request
 * must present: Authorization: Bearer <VALID_TOKEN>
 *
 * This token MUST match the one the app sends in src/services/api.ts.
 */
define('VALID_TOKEN', 'dwyn-students-api-8f92k3');

function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(
            array_map('ucwords', array_keys($requestHeaders)),
            array_values($requestHeaders)
        );
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return $matches[1];
    }
    return null;
}

$token = getBearerToken();
if ($token === null || $token !== VALID_TOKEN) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Unauthorized: missing or invalid bearer token.']);
    exit;
}
