<?php

// index.php — Ponto de entrada da API Prisma

header('Content-Type: application/json');

echo json_encode([
    'api'     => 'Prisma Ensino Personalizado',
    'versao'  => '1.0',
    'status'  => 'online',
    'rotas'   => [
        'cadastro'    => '/api/model/cadastro.php',
        'login'       => '/api/model/login.php',
        'logout'      => '/api/model/logout.php',
        'perfil'      => '/api/model/perfil.php',
        'conteudos'   => '/api/model/conteudos.php',
        'comentarios' => '/api/model/comentarios.php',
        'materiais'   => '/api/model/materiais.php',
        'forum'       => '/api/model/forum.php',
    ]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);