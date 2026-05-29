<?php


session_start();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['sucesso' => false, 'erro' => 'Método não permitido.'], 405);
}

$dados = input();

$nome           = trim($dados['nome']           ?? '');
$email          = trim($dados['email']          ?? '');
$senha          = $dados['senha']               ?? '';
$senha_confirma = $dados['senha_confirma']      ?? '';
$tipo           = $dados['tipo']                ?? 'aluno';

// --- Validações ---
$erros = [];

if (empty($nome)) {
    $erros[] = 'O nome é obrigatório.';
} elseif (strlen($nome) < 3) {
    $erros[] = 'O nome deve ter pelo menos 3 caracteres.';
}

if (empty($email)) {
    $erros[] = 'O e-mail é obrigatório.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erros[] = 'E-mail inválido.';
}

if (empty($senha)) {
    $erros[] = 'A senha é obrigatória.';
} elseif (strlen($senha) < 6) {
    $erros[] = 'A senha deve ter pelo menos 6 caracteres.';
}

if ($senha !== $senha_confirma) {
    $erros[] = 'As senhas não coincidem.';
}

if (!in_array($tipo, ['aluno', 'professor'])) {
    $tipo = 'aluno';
}

if (!empty($erros)) {
    responder(['sucesso' => false, 'erros' => $erros], 422);
}

// --- Verifica se e-mail já existe ---
$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    responder(['sucesso' => false, 'erros' => ['Este e-mail já está cadastrado.']], 409);
}

// --- Cadastra o usuário ---
$senha_hash = password_hash($senha, PASSWORD_BCRYPT);

$stmt = $pdo->prepare(
    'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)'
);
$stmt->execute([$nome, $email, $senha_hash, $tipo]);

responder(['sucesso' => true, 'mensagem' => 'Cadastro realizado! Faça o login.'], 201);