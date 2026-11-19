<?php

$dsn = "mysql:host=localhost;dbname=minershu_minershub_db;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

$pdo = new PDO(
    $dsn,
    'minershu_minershub_user',
    'RedStone@1234',
    $options
);