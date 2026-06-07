<?php


session_start();
require_once 'db.php';

$method     = $_SERVER['REQUEST_METHOD'];
$logado     = isset($_SESSION['usuario_id']);
$usuario_id = $_SESSION['usuario_id'] ?? null;
$tipo       = $_SESSION['usuario_tipo'] ?? null;

// GET — Listar materiais de um conteúdo

if ($method === 'GET') {

    $conteudo_id = (int) ($_GET['conteudo_id'] ?? 0);

    if (!$conteudo_id) {
        responder(['sucesso' => false, 'erro' => 'conteudo_id é obrigatório.'], 422);
    }

    $stmt = $pdo->prepare('
        SELECT m.id, m.nome, m.url, m.criado_em,
               u.nome AS autor_nome
        FROM materiais m
        JOIN conteudos c ON c.id = m.conteudo_id
        JOIN usuarios u  ON u.id = c.autor_id
        WHERE m.conteudo_id = ?
        ORDER BY m.criado_em ASC
    ');
    $stmt->execute([$conteudo_id]);
    $materiais = $stmt->fetchAll();

    responder(['sucesso' => true, 'materiais' => $materiais]);
}

// As rotas abaixo exigem login e ser professor
if (!$logado) {
    responder(['sucesso' => false, 'erro' => 'Não autorizado.'], 401);
}

if ($tipo !== 'professor') {
    responder(['sucesso' => false, 'erro' => 'Apenas professores podem gerenciar materiais.'], 403);
}

// POST — Adicionar material (professor dono do conteúdo)

if ($method === 'POST') {

    $dados       = input();
    $conteudo_id = (int) ($dados['conteudo_id'] ?? 0);
    $nome        = trim($dados['nome'] ?? '');
    $url         = trim($dados['url']  ?? '');

    $erros = [];

    if (!$conteudo_id) {
        $erros[] = 'conteudo_id é obrigatório.';
    }
    if (empty($nome)) {
        $erros[] = 'O nome do material é obrigatório.';
    }
    if (empty($url)) {
        $erros[] = 'A URL do material é obrigatória.';
    } elseif (!filter_var($url, FILTER_VALIDATE_URL)) {
        $erros[] = 'URL inválida.';
    }

    if (!empty($erros)) {
        responder(['sucesso' => false, 'erros' => $erros], 422);
    }

    // Verifica se o conteúdo existe e pertence ao professor
    $stmt = $pdo->prepare('SELECT autor_id FROM conteudos WHERE id = ?');
    $stmt->execute([$conteudo_id]);
    $conteudo = $stmt->fetch();

    if (!$conteudo) {
        responder(['sucesso' => false, 'erro' => 'Conteúdo não encontrado.'], 404);
    }

    if ($conteudo['autor_id'] !== $usuario_id) {
        responder(['sucesso' => false, 'erro' => 'Você não tem permissão para adicionar materiais neste conteúdo.'], 403);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO materiais (conteudo_id, nome, url) VALUES (?, ?, ?)'
    );
    $stmt->execute([$conteudo_id, $nome, $url]);
    $novo_id = $pdo->lastInsertId();

    responder(['sucesso' => true, 'mensagem' => 'Material adicionado com sucesso!', 'id' => $novo_id], 201);
}

// DELETE — Remover material (professor dono do conteúdo)

if ($method === 'DELETE') {

    $dados = input();
    $id    = (int) ($dados['id'] ?? 0);

    if (!$id) {
        responder(['sucesso' => false, 'erro' => 'ID do material é obrigatório.'], 422);
    }

    // Verifica se o material existe e se o professor é dono do conteúdo
    $stmt = $pdo->prepare('
        SELECT m.id, c.autor_id
        FROM materiais m
        JOIN conteudos c ON c.id = m.conteudo_id
        WHERE m.id = ?
    ');
    $stmt->execute([$id]);
    $material = $stmt->fetch();

    if (!$material) {
        responder(['sucesso' => false, 'erro' => 'Material não encontrado.'], 404);
    }

    if ($material['autor_id'] !== $usuario_id) {
        responder(['sucesso' => false, 'erro' => 'Você não tem permissão para remover este material.'], 403);
    }

    $stmt = $pdo->prepare('DELETE FROM materiais WHERE id = ?');
    $stmt->execute([$id]);

    responder(['sucesso' => true, 'mensagem' => 'Material removido com sucesso!']);
}

responder(['sucesso' => false, 'erro' => 'Método não permitido.'], 405);