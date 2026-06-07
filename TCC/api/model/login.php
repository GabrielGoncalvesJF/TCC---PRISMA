<?php
 
session_start();
require_once 'db.php';
 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['sucesso' => false, 'erro' => 'Método não permitido.'], 405);
}
 
$dados = input();
 
$email = trim($dados['email'] ?? '');
$senha = $dados['senha']      ?? '';
 
// --- Validações ---
$erros = [];
 
if (empty($email)) {
    $erros[] = 'O e-mail é obrigatório.';
}
if (empty($senha)) {
    $erros[] = 'A senha é obrigatória.';
}
 
if (!empty($erros)) {
    responder(['sucesso' => false, 'erros' => $erros], 422);
}
 
// --- Busca o usuário ---
$stmt = $pdo->prepare('SELECT id, nome, senha_hash, tipo FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
$usuario = $stmt->fetch();
 
if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
    responder(['sucesso' => false, 'erros' => ['E-mail ou senha incorretos.']], 401);
}
 
// --- Inicia a sessão ---
session_regenerate_id(true);
 
$_SESSION['usuario_id']   = $usuario['id'];
$_SESSION['usuario_nome'] = $usuario['nome'];
$_SESSION['usuario_tipo'] = $usuario['tipo'];
 
// O JavaScript decide para onde redirecionar com base no tipo
responder([
    'sucesso'  => true,
    'mensagem' => 'Login realizado com sucesso!',
    'usuario'  => [
        'id'   => $usuario['id'],
        'nome' => $usuario['nome'],
        'tipo' => $usuario['tipo'],
    ]
], 200);