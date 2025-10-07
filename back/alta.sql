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

-- 2. Insertar usuarios
INSERT INTO Usuario (nombre, apellido, gmail, contraseña) VALUES
('Juan', 'Pérez', 'juan.perez@gmail.com', 'password123'),
('María', 'Gómez', 'maria.gomez@gmail.com', '1234abcd'),
('Carlos', 'López', 'carlos.lopez@gmail.com', 'qwerty567'),
('Ana', 'Martínez', 'ana.martinez@gmail.com', 'abc12345');

-- 3. Insertar jugadores (solo los primeros 10 como ejemplo)
INSERT INTO Jugadores (nombre_jugador, img_url) VALUES
('Lionel Messi', 'https://commons.wikimedia.org/wiki/File:Lionel_Messi_20180626.jpg'),
('Cristiano Ronaldo', 'https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_2018.jpg'),
('Neymar Junior', 'https://commons.wikimedia.org/wiki/File:Neymar_2018.jpg'),
('Kylian Mbappé', 'https://commons.wikimedia.org/wiki/File:Kylian_Mbapp%C3%A9_2019.jpg'),
('Erling Haaland', 'https://commons.wikimedia.org/wiki/File:Erling_Haaland_2023.jpg'),
('Kevin De Bruyne', 'https://commons.wikimedia.org/wiki/File:Kevin_De_Bruyne_20180710.jpg'),
('Luka Modrić', 'https://commons.wikimedia.org/wiki/File:Luka_Modri%C4%87_2018.jpg'),
('Robert Lewandowski', 'https://commons.wikimedia.org/wiki/File:Robert_Lewandowski_2023.jpg'),
('Mohamed Salah', 'https://commons.wikimedia.org/wiki/File:Mohamed_Salah_2018.jpg'),
('Virgil van Dijk', 'https://commons.wikimedia.org/wiki/File:Virgil_van_Dijk_2023.jpg'),
('Karim Benzema', 'https://commons.wikimedia.org/wiki/File:Karim_Benzema_2022.jpg'),
('Sergio Ramos', 'https://commons.wikimedia.org/wiki/File:Sergio_Ramos_2018.jpg'),
('Antoine Griezmann', 'https://commons.wikimedia.org/wiki/File:Antoine_Griezmann_2018.jpg'),
('Toni Kroos', 'https://commons.wikimedia.org/wiki/File:Toni_Kroos_2018.jpg'),
('Harry Kane', 'https://commons.wikimedia.org/wiki/File:Harry_Kane_2018.jpg'),
('Gianluigi Donnarumma', 'https://commons.wikimedia.org/wiki/File:Gianluigi_Donnarumma_2021.jpg'),
('Jude Bellingham', 'https://commons.wikimedia.org/wiki/File:Jude_Bellingham_2023.jpg'),
('Vinícius Júnior', 'https://commons.wikimedia.org/wiki/File:Vinicius_Junior_2022.jpg'),
('Rodri', 'https://commons.wikimedia.org/wiki/File:Rodri_2023.jpg'),
('Pedri', 'https://commons.wikimedia.org/wiki/File:Pedri_2021.jpg'),
('Phil Foden', 'https://commons.wikimedia.org/wiki/File:Phil_Foden_2022.jpg'),
('Bruno Fernandes', 'https://commons.wikimedia.org/wiki/File:Bruno_Fernandes_2021.jpg'),
('Kepa Arrizabalaga', 'https://commons.wikimedia.org/wiki/File:Kepa_Arizzabalaga_2018.jpg'),
('Sadio Mané', 'https://commons.wikimedia.org/wiki/File:Sadio_Man%C3%A9_2019.jpg'),
('Raheem Sterling', 'https://commons.wikimedia.org/wiki/File:Raheem_Sterling_2018.jpg'),
('Paul Pogba', 'https://commons.wikimedia.org/wiki/File:Paul_Pogba_2018.jpg'),
('Sergio Busquets', 'https://commons.wikimedia.org/wiki/File:Sergio_Busquets_2018.jpg'),
('Andrés Iniesta', 'https://commons.wikimedia.org/wiki/File:Andr%C3%A9s_Iniesta_2018.jpg'),
('Xavi Hernández', 'https://commons.wikimedia.org/wiki/File:Xavi_2015.jpg'),
('Diego Maradona', 'https://commons.wikimedia.org/wiki/File:Diego_Maradona_1986.jpg'),
('Pelé', 'https://commons.wikimedia.org/wiki/File:Pel%C3%A9_1965.jpg'),
('Zinedine Zidane', 'https://commons.wikimedia.org/wiki/File:Zinedine_Zidane_2011.jpg'),
('Ronaldinho Gaúcho', 'https://commons.wikimedia.org/wiki/File:Ronaldinho_2011.jpg'),
('Ronaldo Nazário', 'https://commons.wikimedia.org/wiki/File:Ronaldo_2006.jpg'),
('Francesco Totti', 'https://commons.wikimedia.org/wiki/File:Francesco_Totti_2013.jpg'),
('Andrea Pirlo', 'https://commons.wikimedia.org/wiki/File:Andrea_Pirlo_2017.jpg'),
('Thierry Henry', 'https://commons.wikimedia.org/wiki/File:Thierry_Henry_2012.jpg'),
('Eric Cantona', 'https://commons.wikimedia.org/wiki/File:Eric_Cantona_1996.jpg'),
('Paolo Maldini', 'https://commons.wikimedia.org/wiki/File:Paolo_Maldini_2012.jpg'),
('Franco Baresi', 'https://commons.wikimedia.org/wiki/File:Franco_Baresi_2009.jpg'),
('Johan Cruyff', 'https://commons.wikimedia.org/wiki/File:Johan_Cruyff_1974.jpg'),
('Luis Suárez', 'https://commons.wikimedia.org/wiki/File:Luis_Su%C3%A1rez_2018.jpg'),
('Andriy Shevchenko', 'https://commons.wikimedia.org/wiki/File:Andriy_Shevchenko_2018.jpg'),
('Iker Casillas', 'https://commons.wikimedia.org/wiki/File:Iker_Casillas_2018.jpg'),
('Gianluigi Buffon', 'https://commons.wikimedia.org/wiki/File:Gianluigi_Buffon_2017.jpg'),
('Clarence Seedorf', 'https://commons.wikimedia.org/wiki/File:Clarence_Seedorf_2009.jpg'),
('Cafu', 'https://commons.wikimedia.org/wiki/File:Cafu_1999.jpg'),
('Roberto Carlos', 'https://commons.wikimedia.org/wiki/File:Roberto_Carlos_2006.jpg'),
('Carlos Tevez', 'https://commons.wikimedia.org/wiki/File:Carlos_T%C3%A9vez_2010.jpg'),
('Sergio Agüero', 'https://commons.wikimedia.org/wiki/File:Sergio_%C3%A1g%C3%BCero_2017.jpg'),
('Ángel Di María', 'https://commons.wikimedia.org/wiki/File:%C3%81ngel_Di_Mar%C3%ADa_2018.jpg'),
('Gareth Bale', 'https://commons.wikimedia.org/wiki/File:Gareth_Bale_2018.jpg'),
('Edinson Cavani', 'https://commons.wikimedia.org/wiki/File:Edinson_Cavani_2018.jpg'),
('Zlatan Ibrahimović', 'https://commons.wikimedia.org/wiki/File:Zlatan_Ibrahimovic_2018.jpg'),
('David Beckham', 'https://commons.wikimedia.org/wiki/File:David_Beckham_2013.jpg'),
('Wayne Rooney', 'https://commons.wikimedia.org/wiki/File:Wayne_Rooney_2016.jpg'),
('Steven Gerrard', 'https://commons.wikimedia.org/wiki/File:Steven_Gerrard_2014.jpg'),
('Frank Lampard', 'https://commons.wikimedia.org/wiki/File:Frank_Lampard_2014.jpg'),
('John Terry', 'https://commons.wikimedia.org/wiki/File:John_Terry_2013.jpg'),
('Rio Ferdinand', 'https://commons.wikimedia.org/wiki/File:Rio_Ferdinand_2012.jpg'),
('Nemanja Vidić', 'https://commons.wikimedia.org/wiki/File:Nemanja_Vidi%C4%87_2011.jpg'),
('Patrice Evra', 'https://commons.wikimedia.org/wiki/File:Patrice_Evra_2014.jpg'),
('Ashley Cole', 'https://commons.wikimedia.org/wiki/File:Ashley_Cole_2012.jpg'),
('Didier Drogba', 'https://commons.wikimedia.org/wiki/File:Didier_Drogba_2012.jpg'),
('Petr Čech', 'https://commons.wikimedia.org/wiki/File:Petr_%C4%8Cech_2013.jpg'),
('Eden Hazard', 'https://commons.wikimedia.org/wiki/File:Eden_Hazard_2018.jpg'),
('Romelu Lukaku', 'https://commons.wikimedia.org/wiki/File:Romelu_Lukaku_2021.jpg'),
('Kevin Gameiro', 'https://commons.wikimedia.org/wiki/File:Kevin_Gameiro_2018.jpg'),
('Marco Reus', 'https://commons.wikimedia.org/wiki/File:Marco_Reus_2018.jpg'),
('Mats Hummels', 'https://commons.wikimedia.org/wiki/File:Mats_Hummels_2018.jpg'),
('Thomas Müller', 'https://commons.wikimedia.org/wiki/File:Thomas_M%C3%BCller_2018.jpg'),
('Manuel Neuer', 'https://commons.wikimedia.org/wiki/File:Manuel_Neuer_2018.jpg'),
('Jerome Boateng', 'https://commons.wikimedia.org/wiki/File:Jerome_Boateng_2018.jpg'),
('Joshua Kimmich', 'https://commons.wikimedia.org/wiki/File:Joshua_Kimmich_2019.jpg'),
('Leroy Sané', 'https://commons.wikimedia.org/wiki/File:Leroy_Sane_2023.jpg'),
('Kai Havertz', 'https://commons.wikimedia.org/wiki/File:Kai_Havertz_2023.jpg'),
('Ilkay Gündogan', 'https://commons.wikimedia.org/wiki/File:Ilkay_Gundogan_2019.jpg'),
('Mesut Özil', 'https://commons.wikimedia.org/wiki/File:Mesut_%C3%96zil_2018.jpg'),
('Mario Götze', 'https://commons.wikimedia.org/wiki/File:Mario_G%C3%B6tze_2018.jpg'),
('Jadon Sancho', 'https://commons.wikimedia.org/wiki/File:Jadon_Sancho_2021.jpg'),
('Marcus Rashford', 'https://commons.wikimedia.org/wiki/File:Marcus_Rashford_2021.jpg'),
('Bukayo Saka', 'https://commons.wikimedia.org/wiki/File:Bukayo_Saka_2023.jpg'),
('Jack Grealish', 'https://commons.wikimedia.org/wiki/File:Jack_Grealish_2023.jpg'),
('Declan Rice', 'https://commons.wikimedia.org/wiki/File:Declan_Rice_2023.jpg'),
('Mason Mount', 'https://commons.wikimedia.org/wiki/File:Mason_Mount_2021.jpg'),
('Reece James', 'https://commons.wikimedia.org/wiki/File:Reece_James_2022.jpg'),
('Trent Alexander-Arnold', 'https://commons.wikimedia.org/wiki/File:Trent_Alexander-Arnold_2022.jpg'),
('Andrew Robertson', 'https://commons.wikimedia.org/wiki/File:Andrew_Robertson_2022.jpg'),
('Alisson Becker', 'https://commons.wikimedia.org/wiki/File:Alisson_Becker_2022.jpg'),
('Fabinho', 'https://commons.wikimedia.org/wiki/File:Fabinho_2021.jpg'),
('Thiago Alcântara', 'https://commons.wikimedia.org/wiki/File:Thiago_Alcantara_2021.jpg'),
('Casemiro', 'https://commons.wikimedia.org/wiki/File:Casemiro_2022.jpg'),
('Eder Militão', 'https://commons.wikimedia.org/wiki/File:Eder_Milit%C3%A3o_2022.jpg'),
('Ferland Mendy', 'https://commons.wikimedia.org/wiki/File:Ferland_Mendy_2022.jpg'),
('Eduardo Camavinga', 'https://commons.wikimedia.org/wiki/File:Eduardo_Camavinga_2023.jpg'),
('Aurélien Tchouaméni', 'https://commons.wikimedia.org/wiki/File:Aurelien_Tchouameni_2023.jpg'),
('Federico Valverde', 'https://commons.wikimedia.org/wiki/File:Federico_Valverde_2023.jpg'),
('Ousmane Dembélé', 'https://commons.wikimedia.org/wiki/File:Ousmane_Dembele_2023.jpg'),
('Raphinha', 'https://commons.wikimedia.org/wiki/File:Raphinha_2023.jpg'),
('João Félix', 'https://commons.wikimedia.org/wiki/File:Joao_Felix_2023.jpg'),
('Ferran Torres', 'https://commons.wikimedia.org/wiki/File:Ferran_Torres_2023.jpg');

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
