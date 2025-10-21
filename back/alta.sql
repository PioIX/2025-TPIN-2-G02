-- 1. Crear tablas
CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    gmail VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(100) NOT NULL
);

CREATE TABLE Jugadores (
    id_jugador INT PRIMARY KEY AUTO_INCREMENT,
    nombre_jugador VARCHAR(50) NOT NULL,
    img_url VARCHAR(255)
);

CREATE TABLE Partidas (
    id_partida INT PRIMARY KEY AUTO_INCREMENT,
    estado VARCHAR(50),
    id_ganador INT,
    FOREIGN KEY (id_ganador) REFERENCES Usuario(id_usuario)
);

CREATE TABLE UsuariosPorPartida (
    id_usuariosPorPartida INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_partida INT,
    id_jugador INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_partida) REFERENCES Partidas(id_partida),
    FOREIGN KEY (id_jugador) REFERENCES Jugadores(id_jugador)
);

CREATE TABLE Mensajes (
    id_mensaje INT PRIMARY KEY AUTO_INCREMENT,
    contenido TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    id_partida INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_partida) REFERENCES Partidas(id_partida)
);

CREATE TABLE Salas (
    id_sala INT PRIMARY KEY AUTO_INCREMENT,
    nombre_sala VARCHAR(100) NOT NULL,
    cantidad_participantes INT DEFAULT 0,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
);

-- 2. Insertar usuarios
INSERT INTO Usuario (nombre, apellido, gmail, contraseña) VALUES
('Juan', 'Pérez', 'juan.perez@gmail.com', 'password123'),
('María', 'Gómez', 'maria.gomez@gmail.com', '1234abcd'),
('Carlos', 'López', 'carlos.lopez@gmail.com', 'qwerty567'),
('Ana', 'Martínez', 'ana.martinez@gmail.com', 'abc12345');


-- 4. Insertar partidas
INSERT INTO Partidas (estado, id_ganador) VALUES
('En curso', NULL),
('Finalizada', 2),
('Finalizada', 1),
('En curso', NULL);

-- 5. Insertar UsuariosPorPartida (IDs válidos según usuarios y jugadores insertados)
INSERT INTO UsuariosPorPartida (id_usuario, id_partida, id_jugador) VALUES
(1, 1, 10), -- Juan -> Virgil van Dijk
(2, 1, 1),  -- María -> Lionel Messi
(3, 2, 3),  -- Carlos -> Neymar
(4, 2, 5),  -- Ana -> Erling Haaland
(1, 3, 7),  -- Juan -> Luka Modrić
(2, 3, 8);  -- María -> Robert Lewandowski

-- 6. Insertar mensajes
INSERT INTO Mensajes (contenido, id_usuario, id_partida) VALUES
('¡Buena jugada!', 1, 1),
('Gracias, tú también', 2, 1),
('¿Listos para la revancha?', 3, 2),
('Sí, vamos', 4, 2),
('Vamos con todo', 1, 3),
('A ganar', 2, 3);
