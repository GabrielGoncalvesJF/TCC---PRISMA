<?php


session_start();
require_once 'db.php';

$method     = $_SERVER['REQUEST_METHOD'];
$logado     = isset($_SESSION['usuario_id']);
$usuario_id = $_SESSION['usuario_id'] ?? null;


// GET — Listar comentários de um conteúdo
if ($method === 'GET') {

    $conteudo_id = (int) ($_GET['conteudo_id'] ?? 0);

    if (!$conteudo_id) {
        responder(['sucesso' => false, 'erro' => 'conteudo_id é obrigatório.'], 422);
    }

    $stmt = $pdo->prepare('
        SELECT cm.id, cm.corpo, cm.criado_em,
               u.id AS autor_id, u.nome AS autor_nome, u.foto_perfil AS autor_foto
        FROM comentarios cm
        JOIN usuarios u ON u.id = cm.autor_id
        WHERE cm.conteudo_id = ?
        ORDER BY cm.criado_em ASC
    ');
    $stmt->execute([$conteudo_id]);
    $comentarios = $stmt->fetchAll();

    responder(['sucesso' => true, 'comentarios' => $comentarios]);
}

// As rotas abaixo exigem login
if (!$logado) {
    responder(['sucesso' => false, 'erro' => 'Não autorizado.'], 401);
}

// POST — Criar comentário (qualquer usuário logado)

if ($method === 'POST') {

    $dados       = input();
    $conteudo_id = (int) ($dados['conteudo_id'] ?? 0);
    $corpo       = trim($dados['corpo'] ?? '');

    $erros = [];

    if (!$conteudo_id) {
        $erros[] = 'conteudo_id é obrigatório.';
    }
    if (empty($corpo)) {
        $erros[] = 'O comentário não pode estar vazio.';
    } elseif (strlen($corpo) < 3) {
        $erros[] = 'O comentário deve ter pelo menos 3 caracteres.';
    }

    if (!empty($erros)) {
        responder(['sucesso' => false, 'erros' => $erros], 422);
    }

    // Verifica se o conteúdo existe
    $stmt = $pdo->prepare('SELECT id FROM conteudos WHERE id = ?');
    $stmt->execute([$conteudo_id]);
    if (!$stmt->fetch()) {
        responder(['sucesso' => false, 'erro' => 'Conteúdo não encontrado.'], 404);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO comentarios (conteudo_id, autor_id, corpo) VALUES (?, ?, ?)'
    );
    $stmt->execute([$conteudo_id, $usuario_id, $corpo]);
    $novo_id = $pdo->lastInsertId();

    responder(['sucesso' => true, 'mensagem' => 'Comentário adicionado!', 'id' => $novo_id], 201);
}

// DELETE — Deletar comentário (somente o dono)

if ($method === 'DELETE') {

    $dados = input();
    $id    = (int) ($dados['id'] ?? 0);

    if (!$id) {
        responder(['sucesso' => false, 'erro' => 'ID do comentário é obrigatório.'], 422);
    }

    $stmt = $pdo->prepare('SELECT autor_id FROM comentarios WHERE id = ?');
    $stmt->execute([$id]);
    $comentario = $stmt->fetch();

    if (!$comentario) {
        responder(['sucesso' => false, 'erro' => 'Comentário não encontrado.'], 404);
    }

    if ($comentario['autor_id'] !== $usuario_id) {
        responder(['sucesso' => false, 'erro' => 'Você não tem permissão para deletar este comentário.'], 403);
    }

    $stmt = $pdo->prepare('DELETE FROM comentarios WHERE id = ?');
    $stmt->execute([$id]);

    responder(['sucesso' => true, 'mensagem' => 'Comentário deletado.']);
}

responder(['sucesso' => false, 'erro' => 'Método não permitido.'], 405);