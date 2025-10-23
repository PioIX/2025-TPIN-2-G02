-- 1. Crear tabla Usuario
CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    gmail VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(100) NOT NULL
);

-- 2. Crear tabla Jugadores
CREATE TABLE Jugadores (
    id_jugador INT PRIMARY KEY AUTO_INCREMENT,
    nombre_jugador VARCHAR(50) NOT NULL,
    img_url VARCHAR(255)
);

-- 3. Crear tabla Partidas
CREATE TABLE Partidas (
    id_partida INT PRIMARY KEY AUTO_INCREMENT,
    estado VARCHAR(50),
    id_ganador INT,
    FOREIGN KEY (id_ganador) REFERENCES Usuario(id_usuario)
);

-- 4. Crear tabla UsuariosPorPartida
CREATE TABLE UsuariosPorPartida (
    id_usuariosPorPartida INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_partida INT,
    id_jugador INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_partida) REFERENCES Partidas(id_partida),
    FOREIGN KEY (id_jugador) REFERENCES Jugadores(id_jugador)
);

-- 5. Crear tabla Mensajes
CREATE TABLE Mensajes (
    id_mensaje INT PRIMARY KEY AUTO_INCREMENT,
    contenido TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    id_partida INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_partida) REFERENCES Partidas(id_partida)
);

-- 6. Crear tabla Salas
CREATE TABLE Salas (
    id_sala INT PRIMARY KEY AUTO_INCREMENT,
    nombre_sala VARCHAR(100) NOT NULL UNIQUE,
    max_jugadores INT DEFAULT 2,
    cantidad_participantes INT DEFAULT 0
);

-- 7. Crear tabla UsuariosPorSala (tabla intermedia)
CREATE TABLE UsuariosPorSala (
    id_usuariosPorSala INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT, 
    id_sala INT,     
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_sala) REFERENCES Salas(id_sala)
);

-- Insertar salas vacías
INSERT INTO Salas (nombre_sala, max_jugadores) VALUES
('Sala_1', 2),
('Sala_2', 2),
('Sala_3', 2),
('Sala_4', 2);

-- Insertar usuarios
INSERT INTO Usuario (nombre, apellido, gmail, contraseña) VALUES
('Juan', 'Pérez', 'juan.perez@gmail.com', 'password123'),
('María', 'Gómez', 'maria.gomez@gmail.com', '1234abcd'),
('Carlos', 'López', 'carlos.lopez@gmail.com', 'qwerty567'),
('Ana', 'Martínez', 'ana.martinez@gmail.com', 'abc12345');

-- Insertar jugadores
INSERT INTO Jugadores (nombre_jugador, img_url) VALUES
('Lionel Messi', 'https://example.com/messi.jpg'),
('Cristiano Ronaldo', 'https://example.com/ronaldo.jpg'),
('Neymar', 'https://example.com/neymar.jpg'),
('Luka Modrić', 'https://example.com/modric.jpg'),
('Erling Haaland', 'https://example.com/haaland.jpg');

-- Insertar partidas
INSERT INTO Partidas (estado, id_ganador) VALUES
('En curso', NULL),
('Finalizada', 2),
('Finalizada', 1),
('En curso', NULL);

-- Insertar UsuariosPorPartida
INSERT INTO UsuariosPorPartida (id_usuario, id_partida, id_jugador) VALUES
(1, 1, 1), -- Juan -> Lionel Messi
(2, 1, 2), -- María -> Cristiano Ronaldo
(3, 2, 3), -- Carlos -> Neymar
(4, 2, 4), -- Ana -> Luka Modrić
(1, 3, 5), -- Juan -> Erling Haaland
(2, 3, 1); -- María -> Lionel Messi

-- Insertar mensajes
INSERT INTO Mensajes (contenido, id_usuario, id_partida) VALUES
('¡Buena jugada!', 1, 1),
('Gracias, tú también', 2, 1),
('¿Listos para la revancha?', 3, 2),
('Sí, vamos', 4, 2),
('Vamos con todo', 1, 3),
('A ganar', 2, 3);

-- Insertar usuarios en salas
INSERT INTO UsuariosPorSala (id_usuario, id_sala) VALUES
(1, 1),  -- Juan se une a Sala_1
(2, 1),  -- María se une a Sala_1
(3, 2),  -- Carlos se une a Sala_2
(4, 2);  -- Ana se une a Sala_2