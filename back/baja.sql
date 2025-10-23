DROP TABLE IF EXISTS Mensajes;
DROP TABLE IF EXISTS UsuariosPorPartida;
DROP TABLE IF EXISTS Partidas;
DROP TABLE IF EXISTS Jugadores;
DROP TABLE IF EXISTS Salas;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS UsuariosPorSala;

DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS participantes;

-- Eliminar las claves foráneas de la tabla UsuariosPorSala
ALTER TABLE UsuariosPorSala
DROP FOREIGN KEY UsuariosPorSala_ibfk_2;  -- Clave foránea que referencia Salas

ALTER TABLE UsuariosPorSala
DROP FOREIGN KEY UsuariosPorSala_ibfk_1;  -- Clave foránea que referencia Usuario

-- Ahora puedes eliminar las tablas
DROP TABLE IF EXISTS Mensajes;
DROP TABLE IF EXISTS UsuariosPorPartida;
DROP TABLE IF EXISTS Partidas;
DROP TABLE IF EXISTS Jugadores;
DROP TABLE IF EXISTS Salas;
DROP TABLE IF EXISTS Usuario;