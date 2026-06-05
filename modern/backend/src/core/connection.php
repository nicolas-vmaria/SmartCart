<?php

class Connection {
    private static ?PDO $instance = null;

    public static function get(): PDO {
        if (self::$instance !== null) {
            try {
                self::$instance->query('SELECT 1');
            } catch (PDOException) {
                self::$instance = null;
            }
        }

        if (self::$instance === null) {
            $host = $_ENV['DB_HOST'];
            $name = $_ENV['DB_NAME'];
            $user = $_ENV['DB_USER'];
            $pass = $_ENV['DB_PASS'];
            $port = $_ENV['DB_PORT'] ?? '3306';

            self::$instance = new PDO(
                "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4",
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    Pdo\Mysql::ATTR_FOUND_ROWS   => true,
                ]
            );
        }

        return self::$instance;
    }
}
