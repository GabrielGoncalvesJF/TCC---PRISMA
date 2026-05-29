<?php

define('DB_HOST', 'localhost');
define('DB_NAME', 'prisma_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

$dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['sucesso' => false, 'erro' => 'Erro ao conectar ao banco de dados.']);
    exit;
}

// lê o body da requisição como JSON ou POST

function input(): array {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (str_contains($contentType, 'application/json')) {
        $body = file_get_contents('php://input');
        return json_decode($body, true) ?? [];
    }

    return $_POST;
}

// responde JSON e encerra

function responder(array $dados, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($dados);
    exit;
}