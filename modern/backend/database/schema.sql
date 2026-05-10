CREATE DATABASE IF NOT EXISTS smartcart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartcart;

CREATE TABLE roles (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    senha      VARCHAR(255) NOT NULL,
    role_id    INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO roles (nome) VALUES ('cliente'), ('admin');

-- Admin padrão (senha: admin123)
INSERT INTO users (nome, email, senha, role_id) VALUES
    ('Administrador', 'admin@smartcart.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2);
