<?php

// logout.php — Encerra a sessão do usuário
// POST /logout.php

session_start();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['sucesso' => false, 'erro' => 'Método não permitido.'], 405);
}

session_unset();
session_destroy();

responder(['sucesso' => true, 'mensagem' => 'Logout realizado com sucesso!']);