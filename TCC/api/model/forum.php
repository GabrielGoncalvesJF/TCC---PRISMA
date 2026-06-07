<?php

session_start();
require_once 'db.php';

$method     = $_SERVER['REQUEST_METHOD'];
$logado     = isset($_SESSION['usuario_id']);
$usuario_id = $_SESSION['usuario_id'] ?? null;


// GET — Listar posts ou buscar post com respostas

if ($method === 'GET') {

    // Lista respostas de um post
    if (!empty($_GET['acao']) && $_GET['acao'] === 'respostas') {
        $post_id = (int) ($_GET['post_id'] ?? 0);

        if (!$post_id) {
            responder(['sucesso' => false, 'erro' => 'post_id é obrigatório.'], 422);
        }

        $stmt = $pdo->prepare('
            SELECT r.id, r.corpo, r.criado_em,
                   u.id AS autor_id, u.nome AS autor_nome, u.foto_perfil AS autor_foto
            FROM forum_respostas r
            JOIN usuarios u ON u.id = r.autor_id
            WHERE r.post_id = ?
            ORDER BY r.criado_em ASC
        ');
        $stmt->execute([$post_id]);
        $respostas = $stmt->fetchAll();

        responder(['sucesso' => true, 'respostas' => $respostas]);
    }

    // Busca um post específico com suas respostas
    if (!empty($_GET['id'])) {
        $id = (int) $_GET['id'];

        $stmt = $pdo->prepare('
            SELECT p.*, u.nome AS autor_nome, u.foto_perfil AS autor_foto
            FROM forum_posts p
            JOIN usuarios u ON u.id = p.autor_id
            WHERE p.id = ?
        ');
        $stmt->execute([$id]);
        $post = $stmt->fetch();

        if (!$post) {
            responder(['sucesso' => false, 'erro' => 'Post não encontrado.'], 404);
        }

        // Busca as respostas junto
        $stmt = $pdo->prepare('
            SELECT r.id, r.corpo, r.criado_em,
                   u.id AS autor_id, u.nome AS autor_nome, u.foto_perfil AS autor_foto
            FROM forum_respostas r
            JOIN usuarios u ON u.id = r.autor_id
            WHERE r.post_id = ?
            ORDER BY r.criado_em ASC
        ');
        $stmt->execute([$id]);
        $post['respostas'] = $stmt->fetchAll();

        responder(['sucesso' => true, 'post' => $post]);
    }

    // Lista todos os posts com contagem de respostas
    $stmt = $pdo->prepare('
        SELECT p.id, p.titulo, p.criado_em,
               u.nome AS autor_nome, u.foto_perfil AS autor_foto,
               COUNT(r.id) AS total_respostas
        FROM forum_posts p
        JOIN usuarios u ON u.id = p.autor_id
        LEFT JOIN forum_respostas r ON r.post_id = p.id
        GROUP BY p.id
        ORDER BY p.criado_em DESC
    ');
    $stmt->execute();
    $posts = $stmt->fetchAll();

    responder(['sucesso' => true, 'posts' => $posts]);
}

// As rotas abaixo exigem login
if (!$logado) {
    responder(['sucesso' => false, 'erro' => 'Não autorizado.'], 401);
}

// POST — Criar post ou resposta

if ($method === 'POST') {

    $dados = input();
    $acao  = $dados['acao'] ?? 'post';

    // --- Criar resposta ---
    if ($acao === 'resposta') {
        $post_id = (int) ($dados['post_id'] ?? 0);
        $corpo   = trim($dados['corpo'] ?? '');

        $erros = [];

        if (!$post_id) {
            $erros[] = 'post_id é obrigatório.';
        }
        if (empty($corpo)) {
            $erros[] = 'A resposta não pode estar vazia.';
        } elseif (strlen($corpo) < 3) {
            $erros[] = 'A resposta deve ter pelo menos 3 caracteres.';
        }

        if (!empty($erros)) {
            responder(['sucesso' => false, 'erros' => $erros], 422);
        }

        // Verifica se o post existe
        $stmt = $pdo->prepare('SELECT id FROM forum_posts WHERE id = ?');
        $stmt->execute([$post_id]);
        if (!$stmt->fetch()) {
            responder(['sucesso' => false, 'erro' => 'Post não encontrado.'], 404);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO forum_respostas (post_id, autor_id, corpo) VALUES (?, ?, ?)'
        );
        $stmt->execute([$post_id, $usuario_id, $corpo]);
        $novo_id = $pdo->lastInsertId();

        responder(['sucesso' => true, 'mensagem' => 'Resposta adicionada!', 'id' => $novo_id], 201);
    }

    // --- Criar post ---
    $titulo = trim($dados['titulo'] ?? '');
    $corpo  = trim($dados['corpo']  ?? '');

    $erros = [];

    if (empty($titulo)) {
        $erros[] = 'O título é obrigatório.';
    } elseif (strlen($titulo) < 3) {
        $erros[] = 'O título deve ter pelo menos 3 caracteres.';
    }
    if (empty($corpo)) {
        $erros[] = 'O conteúdo do post não pode estar vazio.';
    }

    if (!empty($erros)) {
        responder(['sucesso' => false, 'erros' => $erros], 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO forum_posts (autor_id, titulo, corpo) VALUES (?, ?, ?)'
    );
    $stmt->execute([$usuario_id, $titulo, $corpo]);
    $novo_id = $pdo->lastInsertId();

    responder(['sucesso' => true, 'mensagem' => 'Post criado com sucesso!', 'id' => $novo_id], 201);
}

// DELETE — Deletar post ou resposta (somente o dono)

if ($method === 'DELETE') {

    $dados = input();
    $acao  = $dados['acao'] ?? 'post';
    $id    = (int) ($dados['id'] ?? 0);

    if (!$id) {
        responder(['sucesso' => false, 'erro' => 'ID é obrigatório.'], 422);
    }

    // --- Deletar resposta ---
    if ($acao === 'resposta') {
        $stmt = $pdo->prepare('SELECT autor_id FROM forum_respostas WHERE id = ?');
        $stmt->execute([$id]);
        $resposta = $stmt->fetch();

        if (!$resposta) {
            responder(['sucesso' => false, 'erro' => 'Resposta não encontrada.'], 404);
        }
        if ($resposta['autor_id'] !== $usuario_id) {
            responder(['sucesso' => false, 'erro' => 'Você não tem permissão para deletar esta resposta.'], 403);
        }

        $stmt = $pdo->prepare('DELETE FROM forum_respostas WHERE id = ?');
        $stmt->execute([$id]);

        responder(['sucesso' => true, 'mensagem' => 'Resposta deletada.']);
    }

    // --- Deletar post ---
    $stmt = $pdo->prepare('SELECT autor_id FROM forum_posts WHERE id = ?');
    $stmt->execute([$id]);
    $post = $stmt->fetch();

    if (!$post) {
        responder(['sucesso' => false, 'erro' => 'Post não encontrado.'], 404);
    }
    if ($post['autor_id'] !== $usuario_id) {
        responder(['sucesso' => false, 'erro' => 'Você não tem permissão para deletar este post.'], 403);
    }

    $stmt = $pdo->prepare('DELETE FROM forum_posts WHERE id = ?');
    $stmt->execute([$id]);

    responder(['sucesso' => true, 'mensagem' => 'Post deletado.']);
}

responder(['sucesso' => false, 'erro' => 'Método não permitido.'], 405);