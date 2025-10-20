//🔹 Obtener jugadores
async function getJugadores() {
  const res = await fetch("http://localhost:3000/jugadores");
  const data = await res.json();
  console.log("Jugadores:", data);
  return data;
}

//🔹 Crear jugador
async function crearJugador(nombre_jugador, img_url) {
  const res = await fetch("http://localhost:3000/jugadores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre_jugador, img_url })
  });
  const data = await res.json();
  console.log("Jugador creado:", data);
  return data;
}


//🔹 Obtener todas las partidas
async function getPartidas() {
  const res = await fetch("http://localhost:3000/partidas");
  const data = await res.json();
  console.log("Partidas:", data);
  return data;
}

//🔹 Crear una nueva partida
async function crearPartida(estado = "En curso", id_ganador = null) {
  const res = await fetch("http://localhost:3000/partidas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado, id_ganador })
  });
  const data = await res.json();
  console.log("Partida creada:", data);
  return data;
}


//🔹 Obtener jugadores y usuarios de una partida
async function getUsuariosPorPartida(id_partida) {
  const res = await fetch(`http://localhost:3000/usuariosPorPartida/${id_partida}`);
  const data = await res.json();
  console.log("Usuarios por partida:", data);
  return data;
}

//🔹 Agregar un usuario a una partida
async function agregarUsuarioAPartida(id_usuario, id_partida, id_jugador) {
  const res = await fetch("http://localhost:3000/usuariosPorPartida", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_usuario, id_partida, id_jugador })
  });
  const data = await res.json();
  console.log("Usuario agregado a partida:", data);
  return data;
}

//🔹 Obtener mensajes de una partida
async function getMensajes(id_partida) {
  const res = await fetch(`http://localhost:3000/mensajes/${id_partida}`);
  const data = await res.json();
  console.log("Mensajes:", data);
  return data;
}

//🔹 Enviar mensaje
async function enviarMensaje(contenido, id_usuario, id_partida) {
  const res = await fetch("http://localhost:3000/mensajes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contenido, id_usuario, id_partida })
  });
  const data = await res.json();
  console.log("Mensaje enviado:", data);
  return data;
}

// 🔹 Obtener todas las salas
async function getSalas() {
  const res = await fetch("http://localhost:3000/salas");
  const data = await res.json();
  console.log("Salas:", data);
  return data;
}

// 🔹 Crear una nueva sala
async function crearSala(nombre_sala, id_usuario1, id_usuario2) {
  const res = await fetch("http://localhost:3000/salas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre_sala, id_usuario1, id_usuario2 })
  });
  const data = await res.json();
  console.log("Sala creada:", data);
  return data;
}
