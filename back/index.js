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
});;

const io = require('socket.io')(server, {
  cors: {
    // IMPORTANTE: REVISAR PUERTO DEL FRONTEND
    origin: ["http://localhost:3000", "http://localhost:3001"], // Permitir el origen localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"],  	// Métodos permitidos
    credentials: true                           	// Habilitar el envío de cookies
  }
});

const sessionMiddleware = session({
  //Elegir tu propia key secreta
  secret: "supersarasa",
  resave: false,
  saveUninitialized: false
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

/*
  A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET
  A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET
  A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET
*/

io.on("connection", (socket) => {
  const req = socket.request;

  socket.on('joinRoom', async (data) => {
    console.log("🚀 ~ io.on ~ req.session.room:", req.session.room);

    if (req.session.room != undefined) {
      socket.leave(req.session.room);
    }

    req.session.room = data.room;
    const contar = await realizarQuery(`
    SELECT us.id_usuario
    FROM UsuariosPorSala us
    JOIN Salas s ON us.id_sala = s.id_sala
    WHERE s.nombre_sala = '${data.room}'
  `);
    const cantidadUsuarios = contar.length;

    if (cantidadUsuarios >= 2) {
      socket.emit('maxPlayersReached', { message: "Se ha alcanzado el máximo de jugadores en esta sala." });
    } else {
      await realizarQuery(`
      INSERT INTO UsuariosPorSala (id_usuario, id_sala) 
      SELECT ${data.idLoggued}, s.id_sala 
      FROM Salas s 
      WHERE s.nombre_sala = '${data.room}'
    `);

      await realizarQuery(`
      UPDATE Salas 
      SET cantidad_participantes = cantidad_participantes + 1 
      WHERE nombre_sala = '${data.room}'
    `);

      socket.join(req.session.room);
      io.to(req.session.room).emit('chat-messages', { user: req.session.user, room: req.session.room });
      io.to(req.session.room).emit('userJoined', { user: req.session.user, message: "Un nuevo jugador se ha unido a la sala." });
    }
  });


  socket.on('sendMessage', (data) => {
    io.to(req.session.room).emit('newMessage', { room: req.session.room, message: data });
  });
  socket.on('pingAll', (data) => {
    console.log("PING ALL: ", data);
    io.emit('pingAll', { event: "Ping to all", message: data });
  });
  socket.on('disconnect', () => {
    console.log("Disconnect");
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


// ======================================
// INICIO DEL SERVIDOR
// ======================================


