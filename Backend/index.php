<?php
// index.php - Miners Hub API (PHP)

header('Content-Type: application/json; charset=utf-8');

// ---------- CORS ----------
$allowed_origins = [
    'https://minershub.online',
    'https://www.minershub.online',
    'https://redstone-hof-wbc.vercel.app',
    'http://localhost:5173',
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Credentials: true');
} else {
    // fallback, no credentials in this case
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---------- DB CONNECTION ----------
require_once __DIR__ . '/config.php'; // must create $pdo (PDO instance)
// config.php example:
// $dsn = "mysql:host=localhost;dbname=minershu_redstonehub;charset=utf8mb4";
// $pdo = new PDO($dsn, 'minershu_hubuser', 'Stoney@123', [...]);

// ---------- HELPERS ----------

function send_json($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function get_json_body() {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        $data = [];
    }
    return $data;
}

// Normalize path
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip optional /api prefix
if ($uri === '/api') {
    $uri = '/';
} elseif (strpos($uri, '/api/') === 0) {
    $uri = substr($uri, 4); // remove "/api"
}

// ---------- BASIC HANDLERS ----------

function handle_health() {
    send_json([
        'ok'       => true,
        'status'   => 'healthy',
        'timestamp'=> date('c'),
    ]);
}

function handle_test_db(PDO $pdo) {
    try {
        $stmt = $pdo->query('SELECT DATABASE() AS db');
        $row  = $stmt->fetch(PDO::FETCH_ASSOC);
        send_json([
            'ok' => true,
            'db' => $row['db'] ?? null,
        ]);
    } catch (Throwable $e) {
        error_log('DB test failed: ' . $e->getMessage());
        send_json([
            'ok'    => false,
            'error' => 'DB connection failed',
        ], 500);
    }
}

// ---------- AUTH HANDLERS ----------

function handle_auth_login(PDO $pdo) {
    $body = get_json_body();
    $username   = isset($body['username'])   ? trim($body['username'])   : '';
    $password   = isset($body['password'])   ? $body['password']         : '';
    $rememberMe = !empty($body['rememberMe']);

    if ($username === '' || $password === '') {
        send_json(['message' => 'Username and password are required'], 400);
    }

    try {
        $stmt = $pdo->prepare('SELECT * FROM admins WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$admin || empty($admin['password_hash']) || !password_verify($password, $admin['password_hash'])) {
            send_json(['message' => 'Invalid credentials'], 401);
        }

        $token  = bin2hex(random_bytes(32)); // dummy token, not validated elsewhere
        $maxAge = $rememberMe ? 30 * 24 * 60 * 60 : 12 * 60 * 60;
        $role   = !empty($admin['role']) ? $admin['role'] : 'admin';

        // Cookie on backend domain
        setcookie('token', $token, [
            'expires'  => time() + $maxAge,
            'path'     => '/',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'None',
        ]);

        send_json([
            'message'    => 'Logged in',
            'token'      => $token,
            'admin'      => [
                'id'       => isset($admin['id']) ? (int)$admin['id'] : 0,
                'username' => $admin['username'],
                'role'     => $role,
            ],
            'rememberMe' => $rememberMe,
        ]);
    } catch (Throwable $e) {
        error_log('Login error: ' . $e->getMessage());
        send_json(['message' => 'Server error during login, please try again'], 500);
    }
}

function handle_auth_logout() {
    setcookie('token', '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'None',
    ]);

    send_json(['message' => 'Logged out']);
}

function handle_auth_me() {
    // Require token cookie to consider user logged in
    if (empty($_COOKIE['token'])) {
        send_json(['message' => 'Not authenticated'], 401);
    }

    // If token exists, treat user as logged in admin
    send_json([
        'admin' => [
            'id'       => 1,
            'username' => 'admin',
            'role'     => 'admin',
        ],
    ]);
}

// ---------- SHARED CREATOR UPSERT ----------

function upsert_creator(PDO $pdo, $discord, $name, $avatar, $x_handle) {
    if ($discord === null || $discord === '') {
        return;
    }
    $sql = "
        INSERT INTO creators (discord, display_name, avatar, x_handle)
        VALUES (:discord, :name, :avatar, :x_handle)
        ON DUPLICATE KEY UPDATE
            display_name = VALUES(display_name),
            avatar       = VALUES(avatar),
            x_handle     = VALUES(x_handle)
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':discord'  => $discord,
        ':name'     => $name !== '' ? $name : null,
        ':avatar'   => $avatar !== '' ? $avatar : null,
        ':x_handle' => $x_handle !== '' ? $x_handle : null,
    ]);
}

// ---------- HOF HANDLERS ----------

function handle_hof_list(PDO $pdo) {
    $month    = isset($_GET['month'])    ? $_GET['month']    : null;
    $year     = isset($_GET['year'])     ? $_GET['year']     : null;
    $category = isset($_GET['category']) ? $_GET['category'] : null;

    $query      = 'SELECT * FROM hof_entries';
    $conditions = [];
    $params     = [];

    if ($month !== null && $month !== '') {
        $conditions[] = 'month = ?';
        $params[]     = $month;
    }
    if ($year !== null && $year !== '') {
        $conditions[] = 'year = ?';
        $params[]     = $year;
    }
    if ($category !== null && $category !== '') {
        $conditions[] = 'category = ?';
        $params[]     = $category;
    }

    if (!empty($conditions)) {
        $query .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $query .= ' ORDER BY created_at DESC';

    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        send_json($rows);
    } catch (Throwable $e) {
        error_log('HoF GET error: ' . $e->getMessage());
        send_json(['message' => 'Failed to fetch HoF entries'], 500);
    }
}

function handle_hof_profile(PDO $pdo) {
    $discord = isset($_GET['discord']) ? $_GET['discord'] : null;
    if ($discord === null || $discord === '') {
        send_json(['message' => 'discord is required'], 400);
    }

    try {
        $stmt = $pdo->prepare('SELECT discord, display_name AS name, avatar, x_handle FROM creators WHERE discord = ?');
        $stmt->execute([$discord]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            send_json(['message' => 'Profile not found'], 404);
        }

        send_json($row);
    } catch (Throwable $e) {
        error_log('HoF profile error: ' . $e->getMessage());
        send_json(['message' => 'Failed to fetch profile'], 500);
    }
}

function handle_hof_create(PDO $pdo) {
    $body = get_json_body();

    $name     = isset($body['name'])     ? $body['name']     : null;
    $category = isset($body['category']) ? $body['category'] : null;
    $month    = isset($body['month'])    ? $body['month']    : null;
    $year     = isset($body['year'])     ? $body['year']     : null;
    $link     = isset($body['link'])     ? $body['link']     : null;
    $avatar   = isset($body['avatar'])   ? $body['avatar']   : null;
    $discord  = isset($body['discord'])  ? $body['discord']  : null;
    $x_handle = isset($body['x_handle']) ? $body['x_handle'] : null;
    $placement= isset($body['placement'])? $body['placement']: null;

    try {
        $sql = "
            INSERT INTO hof_entries
                (name, category, month, year, link, avatar, discord, x_handle, placement)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $name,
            $category,
            $month,
            $year !== '' ? $year : null,
            $link,
            $avatar,
            $discord,
            $x_handle,
            $placement !== '' ? $placement : null,
        ]);

        $id = (int)$pdo->lastInsertId();

        if ($discord !== null && $discord !== '') {
            upsert_creator($pdo, $discord, $name, $avatar, $x_handle);
        }

        $stmt2 = $pdo->prepare('SELECT * FROM hof_entries WHERE id = ?');
        $stmt2->execute([$id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);

        send_json($row, 201);
    } catch (Throwable $e) {
        error_log('HoF create error: ' . $e->getMessage());
        send_json(['message' => 'Failed to create HoF entry'], 500);
    }
}

function handle_hof_update(PDO $pdo, $id) {
    $body = get_json_body();

    $name      = isset($body['name'])      ? $body['name']      : null;
    $category  = isset($body['category'])  ? $body['category']  : null;
    $month     = isset($body['month'])     ? $body['month']     : null;
    $year      = isset($body['year'])      ? $body['year']      : null;
    $link      = isset($body['link'])      ? $body['link']      : null;
    $avatar    = isset($body['avatar'])    ? $body['avatar']    : null;
    $discord   = isset($body['discord'])   ? $body['discord']   : null;
    $x_handle  = isset($body['x_handle'])  ? $body['x_handle']  : null;
    $placement = isset($body['placement']) ? $body['placement'] : null;

    try {
        $sql = "
            UPDATE hof_entries
            SET name = ?, category = ?, month = ?, year = ?, link = ?,
                avatar = ?, discord = ?, x_handle = ?, placement = ?
            WHERE id = ?
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $name,
            $category,
            $month,
            $year !== '' ? $year : null,
            $link,
            $avatar,
            $discord,
            $x_handle,
            $placement !== '' ? $placement : null,
            $id,
        ]);

        if ($discord !== null && $discord !== '') {
            upsert_creator($pdo, $discord, $name, $avatar, $x_handle);
        }

        // Fetch to confirm existence and return latest row
        $stmt2 = $pdo->prepare('SELECT * FROM hof_entries WHERE id = ?');
        $stmt2->execute([$id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            send_json(['message' => 'HoF entry not found'], 404);
        }

        send_json($row);
    } catch (Throwable $e) {
        error_log('HoF update error: ' . $e->getMessage());
        send_json(['message' => 'Failed to update HoF entry'], 500);
    }
}

function handle_hof_delete(PDO $pdo, $id) {
    try {
        $stmt = $pdo->prepare('DELETE FROM hof_entries WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            send_json(['message' => 'HoF entry not found'], 404);
        }

        send_json(['message' => 'HoF entry deleted', 'id' => $id]);
    } catch (Throwable $e) {
        error_log('HoF delete error: ' . $e->getMessage());
        send_json(['message' => 'Failed to delete HoF entry'], 500);
    }
}

// ---------- WBC HANDLERS ----------

function handle_wbc_list(PDO $pdo) {
    $month = isset($_GET['month']) ? $_GET['month'] : null;
    $year  = isset($_GET['year'])  ? $_GET['year']  : null;

    $query  = 'SELECT * FROM wbc_entries';
    $where  = [];
    $params = [];

    if ($month !== null && $month !== '') {
        $where[]  = 'month = ?';
        $params[] = $month;
    }
    if ($year !== null && $year !== '') {
        $where[]  = 'year = ?';
        $params[] = $year;
    }

    if (!empty($where)) {
        $query .= ' WHERE ' . implode(' AND ', $where);
    }

    $query .= ' ORDER BY year DESC, month DESC, created_at DESC';

    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        send_json($rows);
    } catch (Throwable $e) {
        error_log('WBC GET error: ' . $e->getMessage());
        send_json(['message' => 'Failed to fetch WBC entries'], 500);
    }
}

function handle_wbc_profile(PDO $pdo) {
    $discord = isset($_GET['discord']) ? $_GET['discord'] : null;
    if ($discord === null || $discord === '') {
        send_json(['message' => 'discord is required'], 400);
    }

    try {
        $stmt = $pdo->prepare('SELECT discord, display_name AS name, avatar, x_handle FROM creators WHERE discord = ?');
        $stmt->execute([$discord]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            send_json(['message' => 'Profile not found'], 404);
        }

        send_json($row);
    } catch (Throwable $e) {
        error_log('WBC profile error: ' . $e->getMessage());
        send_json(['message' => 'Failed to fetch profile'], 500);
    }
}

function handle_wbc_create(PDO $pdo) {
    $body = get_json_body();

    $name       = isset($body['name'])       ? $body['name']       : null;
    $month      = isset($body['month'])      ? $body['month']      : null;
    $year       = isset($body['year'])       ? $body['year']       : null;
    $date_range = isset($body['date_range']) ? $body['date_range'] : null;
    $link       = isset($body['link'])       ? $body['link']       : null;
    $discord    = isset($body['discord'])    ? $body['discord']    : null;
    $x_handle   = isset($body['x_handle'])   ? $body['x_handle']   : null;
    $avatar     = isset($body['avatar'])     ? $body['avatar']     : null;

    try {
        $sql = "
            INSERT INTO wbc_entries
                (name, month, year, date_range, link, discord, x_handle, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $name,
            $month,
            $year !== '' ? $year : null,
            $date_range !== '' ? $date_range : null,
            $link,
            $discord,
            $x_handle,
            $avatar,
        ]);

        $id = (int)$pdo->lastInsertId();

        if ($discord !== null && $discord !== '') {
            upsert_creator($pdo, $discord, $name, $avatar, $x_handle);
        }

        $stmt2 = $pdo->prepare('SELECT * FROM wbc_entries WHERE id = ?');
        $stmt2->execute([$id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);

        send_json($row, 201);
    } catch (Throwable $e) {
        error_log('WBC create error: ' . $e->getMessage());
        send_json(['message' => 'Failed to create WBC entry'], 500);
    }
}

function handle_wbc_update(PDO $pdo, $id) {
    $body = get_json_body();

    $name       = isset($body['name'])       ? $body['name']       : null;
    $month      = isset($body['month'])      ? $body['month']      : null;
    $year       = isset($body['year'])       ? $body['year']       : null;
    $date_range = isset($body['date_range']) ? $body['date_range'] : null;
    $link       = isset($body['link'])       ? $body['link']       : null;
    $discord    = isset($body['discord'])    ? $body['discord']    : null;
    $x_handle   = isset($body['x_handle'])   ? $body['x_handle']   : null;
    $avatar     = isset($body['avatar'])     ? $body['avatar']     : null;

    try {
        $sql = "
            UPDATE wbc_entries
            SET name = ?, month = ?, year = ?, date_range = ?, link = ?,
                discord = ?, x_handle = ?, avatar = ?
            WHERE id = ?
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $name,
            $month,
            $year !== '' ? $year : null,
            $date_range !== '' ? $date_range : null,
            $link,
            $discord,
            $x_handle,
            $avatar,
            $id,
        ]);

        if ($discord !== null && $discord !== '') {
            upsert_creator($pdo, $discord, $name, $avatar, $x_handle);
        }

        $stmt2 = $pdo->prepare('SELECT * FROM wbc_entries WHERE id = ?');
        $stmt2->execute([$id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            send_json(['message' => 'WBC entry not found'], 404);
        }

        send_json($row);
    } catch (Throwable $e) {
        error_log('WBC update error: ' . $e->getMessage());
        send_json(['message' => 'Failed to update WBC entry'], 500);
    }
}

function handle_wbc_delete(PDO $pdo, $id) {
    try {
        $stmt = $pdo->prepare('DELETE FROM wbc_entries WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            send_json(['message' => 'WBC entry not found'], 404);
        }

        send_json(['message' => 'WBC entry deleted', 'id' => $id]);
    } catch (Throwable $e) {
        error_log('WBC delete error: ' . $e->getMessage());
        send_json(['message' => 'Failed to delete WBC entry'], 500);
    }
}

// ---------- ROUTER ----------

try {
    if ($method === 'GET' && $uri === '/health') {
        handle_health();

    } elseif ($method === 'GET' && $uri === '/test-db') {
        handle_test_db($pdo);

    // AUTH
    } elseif ($method === 'POST' && $uri === '/auth/login') {
        handle_auth_login($pdo);
    } elseif ($method === 'POST' && $uri === '/auth/logout') {
        handle_auth_logout();
    } elseif ($method === 'GET' && $uri === '/auth/me') {
        handle_auth_me();

    // HoF
    } elseif ($method === 'GET' && $uri === '/hof') {
        handle_hof_list($pdo);
    } elseif ($method === 'GET' && $uri === '/hof/profile') {
        handle_hof_profile($pdo);
    } elseif ($method === 'POST' && $uri === '/hof') {
        handle_hof_create($pdo);
    } elseif ($method === 'PUT' && preg_match('#^/hof/(\d+)$#', $uri, $m)) {
        handle_hof_update($pdo, (int)$m[1]);
    } elseif ($method === 'DELETE' && preg_match('#^/hof/(\d+)$#', $uri, $m)) {
        handle_hof_delete($pdo, (int)$m[1]);

    // WBC
    } elseif ($method === 'GET' && $uri === '/wbc') {
        handle_wbc_list($pdo);
    } elseif ($method === 'GET' && $uri === '/wbc/profile') {
        handle_wbc_profile($pdo);
    } elseif ($method === 'POST' && $uri === '/wbc') {
        handle_wbc_create($pdo);
    } elseif ($method === 'PUT' && preg_match('#^/wbc/(\d+)$#', $uri, $m)) {
        handle_wbc_update($pdo, (int)$m[1]);
    } elseif ($method === 'DELETE' && preg_match('#^/wbc/(\d+)$#', $uri, $m)) {
        handle_wbc_delete($pdo, (int)$m[1]);

    } else {
        send_json(['error' => 'Not found', 'path' => $uri, 'method' => $method], 404);
    }

} catch (Throwable $e) {
    error_log('Fatal API error: ' . $e->getMessage());
    send_json(['message' => 'Server error'], 500);
}