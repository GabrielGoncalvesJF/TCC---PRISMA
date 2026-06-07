<?php

session_start();
require_once 'db.php';

$method     = $_SERVER['REQUEST_METHOD'];
$logado     = isset($_SESSION['usuario_id']);
$usuario_id = $_SESSION['usuario_id'] ?? null;
$tipo       = $_SESSION['usuario_tipo'] ?? null;

// GET — Listar ou buscar conteúdo

if ($method === 'GET') {

    // Busca um conteúdo específico com dados do autor
    if (!empty($_GET['id'])) {
        $stmt = $pdo->prepare('
            SELECT c.*, u.nome AS autor_nome, u.foto_perfil AS autor_foto
            FROM conteudos c
            JOIN usuarios u ON u.id = c.autor_id
            WHERE c.id = ?
        ');
        $stmt->execute([(int) $_GET['id']]);
        $conteudo = $stmt->fetch();

        if (!$conteudo) {
            responder(['sucesso' => false, 'erro' => 'Conteúdo não encontrado.'], 404);
        }

        responder(['sucesso' => true, 'conteudo' => $conteudo]);
    }

    // Lista todos — com filtro opcional por tipo (aula/postagem)
    $filtro = '';
    $params = [];

    if (!empty($_GET['tipo']) && in_array($_GET['tipo'], ['aula', 'postagem'])) {
        $filtro = 'WHERE c.tipo = ?';
        $params[] = $_GET['tipo'];
    }

    $stmt = $pdo->prepare("
        SELECT c.id, c.titulo, c.tipo, c.criado_em,
               u.nome AS autor_nome, u.foto_perfil AS autor_foto
        FROM conteudos c
        JOIN usuarios u ON u.id = c.autor_id
        $filtro
        ORDER BY c.criado_em DESC
    ");
    $stmt->execute($params);
    $conteudos = $stmt->fetchAll();

    responder(['sucesso' => true, 'conteudos' => $conteudos]);
}

// As rotas abaixo exigem login
if (!$logado) {
    responder(['sucesso' => false, 'erro' => 'Não autorizado.'], 401);
}

// POST — Criar conteúdo (somente professor)

if ($method === 'POST') {

    if ($tipo !== 'professor') {
        responder(['sucesso' => false, 'erro' => 'Apenas professores podem criar conteúdos.'], 403);
    }

    $dados  = input();
    $titulo = trim($dados['titulo'] ?? '');
    $corpo  = trim($dados['corpo']  ?? '');
    $tipo_c = $dados['tipo']        ?? 'aula';

    $erros = [];

    if (empty($titulo)) {
        $erros[] = 'O título é obrigatório.';
    } elseif (strlen($titulo) < 3) {
        $erros[] = 'O título deve ter pelo menos 3 caracteres.';
    }

    if (empty($corpo)) {
        $erros[] = 'O conteúdo não pode estar vazio.';
    }

    if (!in_array($tipo_c, ['aula', 'postagem'])) {
        $tipo_c = 'aula';
    }

    if (!empty($erros)) {
        responder(['sucesso' => false, 'erros' => $erros], 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO conteudos (autor_id, titulo, corpo, tipo) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$usuario_id, $titulo, $corpo, $tipo_c]);
    $novo_id = $pdo->lastInsertId();

    responder(['sucesso' => true, 'mensagem' => 'Conteúdo criado com sucesso!', 'id' => $novo_id], 201);
}

// PUT — Editar conteúdo (somente professor dono)

if ($method === 'PUT') {

    if ($tipo !== 'professor') {
        responder(['sucesso' => false, 'erro' => 'Apenas professores podem editar conteúdos.'], 403);
    }

    $dados  = input();
    $id     = (int) ($dados['id']     ?? 0);
    $titulo = trim($dados['titulo']   ?? '');
    $corpo  = trim($dados['corpo']    ?? '');

    if (!$id) {
        responder(['sucesso' => false, 'erro' => 'ID do conteúdo é obrigatório.'], 422);
    }

    // Verifica se o conteúdo existe e pertence ao professor
    $stmt = $pdo->prepare('SELECT autor_id FROM conteudos WHERE id = ?');
    $stmt->execute([$id]);
    $conteudo = $stmt->fetch();

    if (!$conteudo) {
        responder(['sucesso' => false, 'erro' => 'Conteúdo não encontrado.'], 404);
    }

    if ($conteudo['autor_id'] !== $usuario_id) {
        responder(['sucesso' => false, 'erro' => 'Você não tem permissão para editar este conteúdo.'], 403);
    }

    $erros = [];

    if (empty($titulo)) {
        $erros[] = 'O título é obrigatório.';
    }
    if (empty($corpo)) {
        $erros[] = 'O conteúdo não pode estar vazio.';
    }

    if (!empty($erros)) {
        responder(['sucesso' => false, 'erros' => $erros], 422);
    }

    $stmt = $pdo->prepare('UPDATE conteudos SET titulo = ?, corpo = ? WHERE id = ?');
    $stmt->execute([$titulo, $corpo, $id]);

    responder(['sucesso' => true, 'mensagem' => 'Conteúdo atualizado com sucesso!']);
}

// DELETE — Deletar conteúdo (somente professor dono)

if ($method === 'DELETE') {

    if ($tipo !== 'professor') {
        responder(['sucesso' => false, 'erro' => 'Apenas professores podem deletar conteúdos.'], 403);
    }

    $dados = input();
    $id    = (int) ($dados['id'] ?? 0);

    if (!$id) {
        responder(['sucesso' => false, 'erro' => 'ID do conteúdo é obrigatório.'], 422);
    }

    // Verifica se o conteúdo existe e pertence ao professor
    $stmt = $pdo->prepare('SELECT autor_id FROM conteudos WHERE id = ?');
    $stmt->execute([$id]);
    $conteudo = $stmt->fetch();

    if (!$conteudo) {
        responder(['sucesso' => false, 'erro' => 'Conteúdo não encontrado.'], 404);
    }

    if ($conteudo['autor_id'] !== $usuario_id) {
        responder(['sucesso' => false, 'erro' => 'Você não tem permissão para deletar este conteúdo.'], 403);
    }

    $stmt = $pdo->prepare('DELETE FROM conteudos WHERE id = ?');
    $stmt->execute([$id]);

    responder(['sucesso' => true, 'mensagem' => 'Conteúdo deletado com sucesso!']);
}

responder(['sucesso' => false, 'erro' => 'Método não permitido.'], 405);