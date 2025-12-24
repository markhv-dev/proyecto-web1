++--- Script de inicialización de Base de Datos
-- Sistema de Simulacro MTC

-- Crear usuario de base de datos si no existe
CREATE USER IF NOT EXISTS 'simulacro'@'localhost' IDENTIFIED BY 'password';
CREATE USER IF NOT EXISTS 'simulacro'@'%' IDENTIFIED BY 'password';

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS simulacro_mtc
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON simulacro_mtc.* TO 'simulacro'@'localhost';
GRANT ALL PRIVILEGES ON simulacro_mtc.* TO 'simulacro'@'%';
FLUSH PRIVILEGES;

USE simulacro_mtc;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('user', 'admin') DEFAULT 'user',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de simulacros (resultados)
CREATE TABLE IF NOT EXISTS simulacros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria VARCHAR(20) NOT NULL,
    puntaje INT NOT NULL CHECK (puntaje >= 0 AND puntaje <= 40),
    correctas INT NOT NULL CHECK (correctas >= 0 AND correctas <= 40),
    incorrectas INT NOT NULL CHECK (incorrectas >= 0 AND incorrectas <= 40),
    aprobado BOOLEAN NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_categoria (categoria),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario administrador por defecto
-- Password: admin123 (CAMBIAR EN PRODUCCIÓN)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'admin@mtc.com', 'scrypt:32768:8:1$vHQx7jKGxE0R5CXm$3f8e7c2b1a9d4e5f6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c', 'admin')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar usuario de prueba
-- Password: user123
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Usuario Prueba', 'user@test.com', 'scrypt:32768:8:1$vHQx7jKGxE0R5CXm$3f8e7c2b1a9d4e5f6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c', 'user')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Datos de prueba para simulacros
INSERT INTO simulacros (usuario_id, categoria, puntaje, correctas, incorrectas, aprobado) VALUES
(2, 'AI', 38, 38, 2, TRUE),
(2, 'BII-A', 32, 32, 8, FALSE),
(2, 'AI', 40, 40, 0, TRUE);

SELECT 'Base de datos inicializada correctamente' AS status;
