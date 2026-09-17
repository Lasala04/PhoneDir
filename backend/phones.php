<?php
/**
 * PhoneDir API — single endpoint, matched to the mobile app's requests.
 *
 * Contract (see src/services/api.ts):
 *   GET  phones.php            -> JSON array of all phones
 *   GET  phones.php?id=123     -> JSON object for one phone (404 if missing)
 *   POST phones.php            -> create   (multipart/form-data fields)
 *   POST phones.php  _method=PUT     + id  -> update
 *   POST phones.php  _method=DELETE  + id  -> delete
 *
 * The app posts multipart FormData (NOT a JSON body), so we read $_POST.
 * Shared hosting can't route native PUT/DELETE reliably, so the app tunnels
 * them through POST with a `_method` field, which we honour below.
 *
 * This file is DNS-agnostic: it does not care whether the domain in front of
 * it comes from DuckDNS, FreeDNS, or Freehostia's own subdomain.
 */

// Emit the shortest round-trippable float representation, so prices serialize
// as e.g. 9999.99 instead of 9999.9899999999998 on servers with an old
// serialize_precision default.
ini_set('serialize_precision', '-1');

header('Content-Type: application/json');
// CORS — harmless for the native app, required for the Expo web build / Postman.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'auth.php';
require_once 'connection.php';

/** Send a JSON response and stop. */
function respond(int $code, $data): void {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

/** Shape a DB row to the app's Phone type (price as a real number). */
function mapPhone(array $row): array {
    return [
        'id'          => (int) $row['id'],
        'name'        => $row['name'],
        'brand'       => $row['brand'],
        'model'       => $row['model'],
        'price'       => (float) $row['price'],
        'description' => $row['description'] ?? '',
        'image_url'   => $row['image_url'] ?? '',
    ];
}

/** Validate + normalise create/update input from $_POST. */
function readPhoneInput(): array {
    $required = ['name', 'brand', 'model', 'price'];
    foreach ($required as $field) {
        if (!isset($_POST[$field]) || trim((string) $_POST[$field]) === '') {
            respond(400, ['success' => false, 'message' => "Missing required field: $field"]);
        }
    }
    if (!is_numeric($_POST['price']) || (float) $_POST['price'] <= 0) {
        respond(400, ['success' => false, 'message' => 'Price must be a number greater than zero.']);
    }
    return [
        'name'        => trim($_POST['name']),
        'brand'       => trim($_POST['brand']),
        'model'       => trim($_POST['model']),
        'price'       => (float) $_POST['price'],
        'description' => trim($_POST['description'] ?? ''),
        'image_url'   => trim($_POST['image_url'] ?? ''),
    ];
}

/** Require and return a valid integer id from $_POST or $_GET. */
function requireId(): int {
    $id = $_POST['id'] ?? $_GET['id'] ?? null;
    if ($id === null || !ctype_digit((string) $id)) {
        respond(400, ['success' => false, 'message' => 'A valid numeric id is required.']);
    }
    return (int) $id;
}

/**
 * If the request carries an uploaded file in $_FILES['image'], validate it,
 * save it under uploads/, and return its absolute URL. Returns null when no
 * file was sent (so the caller keeps whatever image_url the form provided).
 */
function handleImageUpload(): ?string {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $f = $_FILES['image'];
    if ($f['error'] !== UPLOAD_ERR_OK) {
        respond(400, ['success' => false, 'message' => 'Image upload failed (code ' . $f['error'] . ').']);
    }
    if ($f['size'] > 5 * 1024 * 1024) {
        respond(400, ['success' => false, 'message' => 'Image too large (max 5 MB).']);
    }
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    if (!isset($allowed[$mime])) {
        respond(400, ['success' => false, 'message' => 'Only JPG, PNG, WEBP, or GIF images are allowed.']);
    }

    $dir = __DIR__ . '/uploads';
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
        respond(500, ['success' => false, 'message' => 'Uploads folder is missing and could not be created.']);
    }
    $name = 'phone_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $allowed[$mime];
    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) {
        respond(500, ['success' => false, 'message' => 'Could not save the uploaded image.']);
    }

    // Absolute URL to the saved file (http — this host has no SSL).
    $host = $_SERVER['HTTP_HOST'] ?? 'dlasala.duckdns.org';
    $base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
    return 'http://' . $host . $base . '/uploads/' . $name;
}

/**
 * Delete a previously-uploaded image so replaced/removed photos don't pile up.
 * Only ever removes a plain filename inside our own uploads/ folder — external
 * URLs and any path traversal are ignored, so it can't touch anything else.
 */
function deleteImageFile(?string $url): void {
    if (!$url || strpos($url, '/uploads/') === false) {
        return;
    }
    $file = basename(parse_url($url, PHP_URL_PATH) ?? '');
    if ($file === '' || $file === '.' || $file === '..') {
        return;
    }
    $path = __DIR__ . '/uploads/' . $file;
    if (is_file($path)) {
        @unlink($path);
    }
}

// Resolve the effective method, honouring the _method override tunnel.
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_POST['_method'])) {
    $override = strtoupper(trim($_POST['_method']));
    if ($override === 'PUT' || $override === 'DELETE') {
        $method = $override;
    }
}

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare('SELECT * FROM phones WHERE id = :id');
                $stmt->execute([':id' => requireId()]);
                $row = $stmt->fetch();
                if (!$row) {
                    respond(404, ['success' => false, 'message' => 'Phone not found.']);
                }
                respond(200, mapPhone($row));
            }
            $rows = $pdo->query('SELECT * FROM phones ORDER BY id DESC')->fetchAll();
            respond(200, array_map('mapPhone', $rows));
            break;

        case 'POST': // create
            $p = readPhoneInput();
            $uploaded = handleImageUpload();
            if ($uploaded !== null) {
                $p['image_url'] = $uploaded;
            }
            $stmt = $pdo->prepare(
                'INSERT INTO phones (name, brand, model, price, description, image_url)
                 VALUES (:name, :brand, :model, :price, :description, :image_url)'
            );
            $stmt->execute([
                ':name'        => $p['name'],
                ':brand'       => $p['brand'],
                ':model'       => $p['model'],
                ':price'       => $p['price'],
                ':description' => $p['description'],
                ':image_url'   => $p['image_url'],
            ]);
            $newId = (int) $pdo->lastInsertId();
            respond(201, [
                'success' => true,
                'message' => 'Phone added successfully.',
                'data'    => mapPhone(array_merge(['id' => $newId], $p)),
            ]);
            break;

        case 'PUT': // update
            $id = requireId();
            $p = readPhoneInput();

            // Load the existing image so we can clean it up if it changes.
            $existing = $pdo->prepare('SELECT image_url FROM phones WHERE id = :id');
            $existing->execute([':id' => $id]);
            $existingRow = $existing->fetch();
            if (!$existingRow) {
                respond(404, ['success' => false, 'message' => 'Phone not found.']);
            }
            $oldImage = $existingRow['image_url'] ?? '';

            $uploaded = handleImageUpload();
            if ($uploaded !== null) {
                $p['image_url'] = $uploaded;
            }
            $stmt = $pdo->prepare(
                'UPDATE phones
                    SET name = :name, brand = :brand, model = :model,
                        price = :price, description = :description, image_url = :image_url
                  WHERE id = :id'
            );
            $stmt->execute([
                ':name'        => $p['name'],
                ':brand'       => $p['brand'],
                ':model'       => $p['model'],
                ':price'       => $p['price'],
                ':description' => $p['description'],
                ':image_url'   => $p['image_url'],
                ':id'          => $id,
            ]);

            // If the image was replaced or removed, drop the old file.
            if ($oldImage !== '' && $oldImage !== $p['image_url']) {
                deleteImageFile($oldImage);
            }

            respond(200, [
                'success' => true,
                'message' => 'Phone updated successfully.',
                'data'    => mapPhone(array_merge(['id' => $id], $p)),
            ]);
            break;

        case 'DELETE': // delete
            $id = requireId();

            // Grab the image first so we can remove its file after deleting.
            $existing = $pdo->prepare('SELECT image_url FROM phones WHERE id = :id');
            $existing->execute([':id' => $id]);
            $existingRow = $existing->fetch();
            if (!$existingRow) {
                respond(404, ['success' => false, 'message' => 'Phone not found.']);
            }

            $stmt = $pdo->prepare('DELETE FROM phones WHERE id = :id');
            $stmt->execute([':id' => $id]);
            deleteImageFile($existingRow['image_url'] ?? '');

            respond(200, ['success' => true, 'message' => 'Phone deleted successfully.']);
            break;

        default:
            respond(405, ['success' => false, 'message' => 'Method not allowed.']);
    }
} catch (PDOException $e) {
    respond(500, ['success' => false, 'message' => 'Server error while processing the request.']);
}
