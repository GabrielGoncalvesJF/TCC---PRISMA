<?php

session_start();
require_once 'db.php';

if (!isset($_SESSION['usuario_id'])) {
    responder(['sucesso' => false, 'erro' => 'Não autorizado.'], 401);
}

$usuario_id = $_SESSION['usuario_id'];

// GET — Retorna os dados do perfil

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $stmt = $pdo->prepare(
        'SELECT id, nome, email, tipo, foto_perfil, criado_em FROM usuarios WHERE id = ?'
    );
    $stmt->execute([$usuario_id]);
    $usuario = $stmt->fetch();

    responder(['sucesso' => true, 'usuario' => $usuario]);
}

// POST — Atualiza os dados do perfil
// Aceita FormData (necessário para envio de arquivo)

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nome           = trim($_POST['nome']           ?? '');
    $email          = trim($_POST['email']          ?? '');
    $senha_atual    = $_POST['senha_atual']         ?? '';
    $senha_nova     = $_POST['senha_nova']          ?? '';
    $senha_confirma = $_POST['senha_confirma']      ?? '';

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

    // --- Verifica e-mail duplicado ---
    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? AND id != ?');
    $stmt->execute([$email, $usuario_id]);
    if ($stmt->fetch()) {
        $erros[] = 'Este e-mail já está em uso por outro usuário.';
    }

    // --- Troca de senha (opcional) ---
    $nova_hash = null;
    if (!empty($senha_nova)) {
        $stmt = $pdo->prepare('SELECT senha_hash FROM usuarios WHERE id = ?');
        $stmt->execute([$usuario_id]);
        $row = $stmt->fetch();

        if (!password_verify($senha_atual, $row['senha_hash'])) {
            $erros[] = 'A senha atual está incorreta.';
        } elseif (strlen($senha_nova) < 6) {
            $erros[] = 'A nova senha deve ter pelo menos 6 caracteres.';
        } elseif ($senha_nova !== $senha_confirma) {
            $erros[] = 'A confirmação da nova senha não confere.';
        } else {
            $nova_hash = password_hash($senha_nova, PASSWORD_BCRYPT);
        }
    }

    // --- Upload de foto (opcional) ---
    $foto_path = null;
    if (!empty($_FILES['foto_perfil']['name'])) {
        $foto       = $_FILES['foto_perfil'];
        $permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $tamanho_max = 2 * 1024 * 1024; // 2MB

        if (!in_array($foto['type'], $permitidos)) {
            $erros[] = 'Foto inválida. Use JPG, PNG, WEBP ou GIF.';
        } elseif ($foto['size'] > $tamanho_max) {
            $erros[] = 'A foto deve ter no máximo 2MB.';
        } else {
            $pasta = 'uploads/fotos/';
            if (!is_dir($pasta)) {
                mkdir($pasta, 0755, true);
            }
            $extensao     = pathinfo($foto['name'], PATHINFO_EXTENSION);
            $nome_arquivo = 'usuario_' . $usuario_id . '_' . time() . '.' . $extensao;
            $destino      = $pasta . $nome_arquivo;

            if (move_uploaded_file($foto['tmp_name'], $destino)) {
                $foto_path = $destino;
            } else {
                $erros[] = 'Erro ao salvar a foto. Tente novamente.';
            }
        }
    }

    if (!empty($erros)) {
        responder(['sucesso' => false, 'erros' => $erros], 422);
    }

    // --- Atualiza no banco ---
    $campos = 'nome = ?, email = ?';
    $params = [$nome, $email];

    if ($nova_hash) {
        $campos .= ', senha_hash = ?';
        $params[] = $nova_hash;
    }

    if ($foto_path) {
        $campos .= ', foto_perfil = ?';
        $params[] = $foto_path;
    }

    $params[] = $usuario_id;

    $stmt = $pdo->prepare("UPDATE usuarios SET $campos WHERE id = ?");
    $stmt->execute($params);

    $_SESSION['usuario_nome'] = $nome;

    responder(['sucesso' => true, 'mensagem' => 'Perfil atualizado com sucesso!']);
}

responder(['sucesso' => false, 'erro' => 'Método não permitido.'], 405);