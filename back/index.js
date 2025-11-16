const { realizarQuery } = require('./modulos/mysql');
const port = process.env.PORT || 4000;

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const app = express(); // Inicializamos Express

// Middlewares
app.use(express.json());
app.use(cors());

const server = app.listen(port, () => {
  console.log(`Servidor NodeJS corriendo en http://localhost:${port}/`);
});

const io = require('socket.io')(server, {
  cors: {
    // IMPORTANTE: REVISAR PUERTO DEL FRONTEND
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"], // Permitir el origen localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"],  	// Métodos permitidos
    credentials: true                           	// Habilitar el envío de cookies
  }
});

const sessionMiddleware = session({
  secret: "supersarasa",
  resave: false,
  saveUninitialized: false
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

let roomPlayers = {};
let contadorParticipantes = 0;
let salas = [{ cantidad_participantes: 0, id_sala: 1, max_jugadores: 2, nombre_sala: "Sala_1" }, { cantidad_participantes: 0, id_sala: 2, max_jugadores: 2, nombre_sala: "Sala_2" }, { cantidad_participantes: 0, id_sala: 3, max_jugadores: 2, nombre_sala: "Sala_3" }, { cantidad_participantes: 0, id_sala: 4, max_jugadores: 2, nombre_sala: "Sala_4" }];

io.on("connection", (socket) => {
  const req = socket.request;

  socket.on('leaveRoom', async (data) => {
    let id_sala = await realizarQuery(`
    SELECT id_sala 
    FROM Salas 
    WHERE nombre_sala = '${data.room}'
  `);

    if (id_sala && id_sala.length > 0) {
      const IndiceSala = id_sala[0].id_sala - 1;
      salas[IndiceSala].cantidad_participantes -= 1;

      await realizarQuery(`
      UPDATE Salas
      SET cantidad_participantes = ${salas[IndiceSala].cantidad_participantes}
      WHERE id_sala = ${id_sala[0].id_sala}
    `);

      // Emitir a todos la actualización
      io.emit('cantJugadores', {
        id_sala: id_sala[0].id_sala,
        cantidad_participantes: salas[IndiceSala].cantidad_participantes
      });
    }

  });

  socket.on('joinRoom', async (data) => {
    console.log("🚀 ~ io.on ~ req.session.room:", req.session.room);

    let id_sala = await realizarQuery(`
    SELECT id_sala 
    FROM Salas 
    WHERE id_sala = ${data.room}
  `);

    console.log("ID SALA JOINROOM:", id_sala);

    // VALIDAR que la sala existe ANTES de continuar
    if (!id_sala || id_sala.length === 0) {
      console.log("No existe la sala");
      socket.emit('roomNotFound', { message: "La sala no existe." });
      return;
    }

    const IndiceSala = id_sala[0].id_sala - 1;

    // Si el usuario ya estaba en otra sala, salir de ella
    if (req.session.room != undefined) {
      socket.leave(req.session.room);
      salas[IndiceSala].cantidad_participantes -= 1;

      // Emitir actualización de la sala anterior
      io.emit('cantJugadores', {
        id_sala: id_sala[0].id_sala,
        cantidad_participantes: salas[IndiceSala].cantidad_participantes
      });
    }

    req.session.room = data.room;

    // Verificar si la sala está llena
    if (salas[IndiceSala].cantidad_participantes >= 2) {
      console.log('maxPlayersReached');
      socket.emit('maxPlayersReached', { message: "Se ha alcanzado el máximo de jugadores en esta sala." });
      return; // No permitir unirse
    }

    // Incrementar participantes
    salas[IndiceSala].cantidad_participantes += 1;
    console.log("Cantidad participantes:", salas[IndiceSala].cantidad_participantes);

    // Actualizar en la base de datos
    await realizarQuery(`
    UPDATE Salas
    SET cantidad_participantes = ${salas[IndiceSala].cantidad_participantes}
    WHERE id_sala = ${id_sala[0].id_sala}
  `);

    socket.join(req.session.room);

    // EMITIR A TODOS los clientes la actualización de participantes
    io.emit('cantJugadores', {
      id_sala: id_sala[0].id_sala,
      cantidad_participantes: salas[IndiceSala].cantidad_participantes
    });

    io.to(req.session.room).emit('chat-messages', { user: req.session.user, room: req.session.room });
    io.to(req.session.room).emit('userJoined', {
      user: req.session.user,
      message: "Un nuevo jugador se ha unido a la sala.",
      roomId: req.session.room
    });
  });

  socket.on('joinRoomChat', (data) => {
    console.log("🚀 ~ io.on ~ req.session.room (chat):", req.session.room);
    if (req.session.room != undefined) {
      socket.leave(req.session.room);
    }
    req.session.room = data.room;
    socket.join(req.session.room);
  });

  socket.on('sendMessage', (data) => {
    console.log("Mensaje recibido:", data.message, "Y la sala: ", req.session.room);
    io.to(req.session.room).emit('newMessage', { room: req.session.room, message: data });
    socket.emit('newMessage', { room: req.session.room, message: data });
  });

  socket.on('pingAll', (data) => {
    console.log("PING ALL: ", data);
    io.emit('pingAll', { event: "Ping to all", message: data });
  });

  socket.on('disconnect', () => {
    console.log("Disconnect");
  });

  socket.on('setSecretPlayer', async (data) => {
    const { room, playerId, userId } = data;

    try {
      // Verificar si ya existe un registro para este usuario en esta partida
      const existente = await realizarQuery(`
      SELECT * FROM UsuariosPorPartida 
      WHERE id_usuario = ${userId} AND id_partida = ${room}
    `);

      if (existente && existente.length > 0) {
        // Actualizar el jugador seleccionado
        await realizarQuery(`
        UPDATE UsuariosPorPartida 
        SET id_jugador = ${playerId}
        WHERE id_usuario = ${userId} AND id_partida = ${room}
      `);
        console.log(`Usuario ${userId} actualizó su jugador secreto a ${playerId}`);
      } else {
        // Insertar nuevo registro
        await realizarQuery(`
        INSERT INTO UsuariosPorPartida (id_usuario, id_partida, id_jugador)
        VALUES (${userId}, ${room}, ${playerId})
      `);
        console.log(`Usuario ${userId} estableció jugador secreto ${playerId}`);
      }

      socket.emit('secretPlayerSet', { success: true });
    } catch (error) {
      console.error('Error al guardar jugador secreto:', error);
      socket.emit('secretPlayerSet', { success: false, error: error.message });
    }


  });


  // ====================
  //  ADIVINAR JUGADOR
  // ====================
  socket.on("guessPlayer", ({ room, userId, guessedPlayerId }) => {
    console.log("⚡ guessPlayer recibido:", { room, userId, guessedPlayerId });

    if (!roomPlayers[room]) {
      console.log("❌ No existe registro de jugadores en esta sala");
      return;
    }

    const playersInRoom = roomPlayers[room];
    const me = playersInRoom[userId];
    const opponent = Object.values(playersInRoom).find(p => p.userId !== userId);

    if (!me || !opponent) {
      console.log("❌ Usuario u oponente no encontrado");
      return;
    }

    const myGuess = guessedPlayerId;
    const opponentChoice = opponent.chosenPlayerId;

    if (myGuess === opponentChoice) {
      console.log("🎉 ACIERTO DEL JUGADOR");

      // Solo a este socket (el ganador)
      io.to(socket.id).emit("guessResult", { success: true });

      // Solo al oponente → falló
      io.to(opponent.socketId).emit("guessResult", { success: false });

      // Avisar a TODOS quién ganó
      io.to(room).emit("endGame", { winner: userId });

      io.socketsLeave(room);
    } else {
      console.log("❌ Falló la adivinanza");

      // Solo al que falló
      io.to(socket.id).emit("guessResult", { success: false });
    }
  });



  socket.on("choosePlayer", ({ room, userId, chosenPlayerId }) => {
    if (!roomPlayers[room]) {
      roomPlayers[room] = {};
    }

    roomPlayers[room][userId] = {
      userId,
      chosenPlayerId
    };

    console.log(`👌 Jugador elegido en sala ${room}:`, roomPlayers[room]);
  });


});





// ========================================
//
// ========================================
app.get("/cantidadDeUsersPorSala", async (req, res) => {
  let contar = await realizarQuery(`SELECT * FROM UsuariosPorSala WHERE id_sala = (SELECT id_sala FROM Salas WHERE nombre_sala = '${req.query.room}')`);
  res.send({ cantidadUsers: contar.length });
});

// ======================================
// LOGIN Y REGISTRO
// ======================================

// 🔹 LOGIN
app.post("/usuarioLogin", async (req, res) => {
  console.log("Login body:", req.body);
  const { gmail, contraseña } = req.body;
  try {
    const rows = await realizarQuery(
      "SELECT * FROM Usuario WHERE gmail = ? AND contraseña = ?",
      [gmail, contraseña]
    );
    if (rows.length === 1) {
      res.send({ ok: true, usuario: rows[0] });
    } else {
      res.send({ ok: false, mensaje: "Usuario o contraseña incorrectos" });
    }
  } catch (err) {
    res.status(500).send({ ok: false, error: err.message });
  }
});

// 🔹 REGISTRO
app.post("/usuarioRegistro", async (req, res) => {
  const { nombre, apellido, gmail, contraseña } = req.body;
  try {
    const existe = await realizarQuery("SELECT * FROM Usuario WHERE gmail = ?", [gmail]);
    if (existe.length > 0) {
      return res.send({ ok: false, mensaje: "Ya existe un usuario con ese correo" });
    }
    const result = await realizarQuery(
      "INSERT INTO Usuario (nombre, apellido, gmail, contraseña) VALUES (?, ?, ?, ?)",
      [nombre, apellido, gmail, contraseña]
    );
    res.send({ ok: true, id_usuario: result.insertId, mensaje: "Usuario registrado correctamente" });
  } catch (err) {
    res.status(500).send({ ok: false, error: err.message });
  }
});

// Permitir obtener usuarios vía GET (lista completa o por id)
app.get('/usuarioRegistro', async (req, res) => {
  try {
    const { id_usuario } = req.query;
    if (id_usuario) {
      const rows = await realizarQuery('SELECT * FROM Usuario WHERE id_usuario = ?', [id_usuario]);
      if (rows.length === 1) return res.json(rows[0]);
      return res.json(rows);
    }
    const rows = await realizarQuery('SELECT * FROM Usuario');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ======================================
// USUARIOS
// ======================================
app.get("/usuarios", async (req, res) => {
  try {
    const rows = await realizarQuery("SELECT * FROM Usuario");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================
// JUGADORES
// ======================================
app.get("/jugadores", async (req, res) => {
  try {
    const players = await realizarQuery("SELECT * FROM Jugadores");
    res.send({ players });
  } catch (err) {
    res.send(err.message)
  }
});

// Endpoint para obtener un jugador específico por su id_jugador
app.get("/jugadores/:id_jugador", async (req, res) => {
  const { id_jugador } = req.params;  // Obtenemos el id_jugador de la URL

  try {
    // Realiza la consulta a la base de datos para obtener el jugador
    const players = await realizarQuery("SELECT * FROM Jugadores WHERE id_jugador = ?", [id_jugador]);

    // Si no se encuentra ningún jugador, devolvemos un error 404
    if (players.length === 0) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    // Si encontramos el jugador, lo devolvemos
    res.json({ player: players[0] });
  } catch (err) {
    // En caso de error, devolvemos el mensaje de error
    res.status(500).json({ error: err.message });
  }
});


app.post("/jugadores", async (req, res) => {
  const { nombre_jugador, img_url } = req.body;
  try {
    const result = await realizarQuery(
      "INSERT INTO Jugadores (nombre_jugador, img_url) VALUES (?, ?)",
      [nombre_jugador, img_url]
    );
    res.json({ id_jugador: result.insertId, nombre_jugador, img_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================
// PARTIDAS
// ======================================
app.get("/partidas", async (req, res) => {
  try {
    const rows = await realizarQuery(`
      SELECT p.id_partida, p.estado, u.nombre AS nombre_ganador, u.apellido AS apellido_ganador
      FROM Partidas p
      LEFT JOIN Usuario u ON p.id_ganador = u.id_usuario
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/partidas", async (req, res) => {
  const { estado, id_ganador } = req.body;
  try {
    const result = await realizarQuery(
      "INSERT INTO Partidas (estado, id_ganador) VALUES (?, ?)",
      [estado || "En curso", id_ganador || null]
    );
    res.json({ id_partida: result.insertId, estado, id_ganador });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================
// USUARIOS POR PARTIDA
// ======================================
app.get("/usuariosPorPartida/:id_partida", async (req, res) => {
  const { id_partida } = req.params;
  try {
    const rows = await realizarQuery(`
      SELECT upp.id_usuariosPorPartida, u.nombre, u.apellido, j.nombre_jugador, j.img_url
      FROM UsuariosPorPartida upp
      JOIN Usuario u ON upp.id_usuario = u.id_usuario
      JOIN Jugadores j ON upp.id_jugador = j.id_jugador
      WHERE upp.id_partida = ?
    `, [id_partida]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/usuariosPorPartida", async (req, res) => {
  const { id_usuario, id_partida, id_jugador } = req.body;
  try {
    const result = await realizarQuery(
      "INSERT INTO UsuariosPorPartida (id_usuario, id_partida, id_jugador) VALUES (?, ?, ?)",
      [id_usuario, id_partida, id_jugador]
    );
    res.json({ id_usuariosPorPartida: result.insertId, id_usuario, id_partida, id_jugador });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================
// MENSAJES
// ======================================
app.get("/mensajes/:id_partida", async (req, res) => {
  const { id_partida } = req.params;
  try {
    const rows = await realizarQuery(`
      SELECT m.id_mensaje, m.contenido, m.fecha_envio, u.nombre, u.apellido
      FROM Mensajes m
      JOIN Usuario u ON m.id_usuario = u.id_usuario
      WHERE m.id_partida = ?
      ORDER BY m.fecha_envio ASC
    `, [id_partida]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/mensajes", async (req, res) => {
  const { contenido, id_usuario, id_partida } = req.body;
  try {
    const result = await realizarQuery(
      "INSERT INTO Mensajes (contenido, id_usuario, id_partida) VALUES (?, ?, ?)",
      [contenido, id_usuario, id_partida]
    );
    res.json({ id_mensaje: result.insertId, contenido, id_usuario, id_partida });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rutas básicas para chats - endpoint mínimo para evitar 404 en el front
// Nota: la implementación completa de chats/participantes requiere tablas adicionales.
app.post('/chatsUsuario', async (req, res) => {
  try {
    const { id_usuario, nuevoChat } = req.body || {};

    // Caso: petición para crear un chat (frontend envía `nuevoChat`)
    if (nuevoChat) {
      // Aquí debería crearse la lógica para insertar chat y participantes en la BD.
      // Por ahora devolvemos un mensaje indicando que la funcionalidad no está implementada.
      return res.json({ ok: false, mensaje: 'Creación de chats no implementada en el backend (aún).' });
    }

    // Caso: petición para obtener chats de un usuario
    if (id_usuario) {
      // Implementación mínima: devolver lista vacía para que el front no obtenga HTML 404.
      // Reemplazar por consulta real cuando exista la estructura de chats en la BD.
      return res.json({ ok: true, chats: [] });
    }

    return res.status(400).json({ ok: false, mensaje: 'Faltan parámetros (id_usuario o nuevoChat).' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


// ULTIMO POST:

// ======================================
// CREACIÓN DE SALAS
// ======================================
app.post("/salas", async (req, res) => {
  const { nombre_sala } = req.body;

  if (!nombre_sala) {
    return res.status(400).json({ ok: false, mensaje: "Falta el nombre de la sala." });
  }

  try {
    // Insertar la nueva sala sin usuarios
    const result = await realizarQuery(
      "INSERT INTO Salas (nombre_sala, cantidad_participantes) VALUES (?, ?)",
      [nombre_sala, 0] // Inicia con 0 participantes
    );

    // Responder con los datos de la sala creada
    res.json({
      ok: true,
      id_sala: result.insertId,
      nombre_sala,
      cantidad_participantes: 0, // Inicialmente vacío
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/Salas", async (req, res) => {
  try {
    //const sala = await realizarQuery("SELECT * FROM Salas");
    res.send({ sala: salas });
  } catch (err) {
    res.send(err.message)
  }
});


// ======================================
// INICIO DEL SERVIDOR
// ======================================


