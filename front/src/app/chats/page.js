// Página principal de chats
// Incluye: listado de chats, botón para crear chat, popup, renderizado condicional y hooks

"use client"

import { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { io } from "socket.io-client";
import Title from "@/app/componentes/Title/Title"
import styles from "./chats.module.css"
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// ==============================================
// Componente: Botón y popup para crear nuevo chat
// ==============================================
function NuevoChatButton({ onCreate, idLoggued }) {
  const [open, setOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState([]); // IDs seleccionados
  const [titulo, setTitulo] = useState("");

  // Obtener todos los usuarios menos el logueado
  const fetchUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/usuarioRegistro", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      let data = await res.json();
      if (Array.isArray(data)) {
        data = data.filter(u => String(u.id_usuario) !== String(idLoggued));
      }
      setUsuarios(data);
    } catch {
      setError("Error al cargar usuarios");
    }
    setLoading(false);
  };

  const handleNuevoChatClick = () => {
    setOpen(true);
    setSelected([]);
    setTitulo("");
    fetchUsuarios();
  };

  const handleToggleUsuario = (id_usuario) => {
    setSelected(prev =>
      prev.includes(id_usuario)
        ? prev.filter(id => id !== id_usuario)
        : [...prev, id_usuario]
    );
  };

  const handleCreate = async () => {
    if (selected.length === 0) {
      setError("Selecciona al menos un usuario");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Participantes: el logueado (admin) + seleccionados
      const participantes = [
        { id_usuario: Number(idLoggued), es_admin: 1 },
        ...selected.map(id => ({ id_usuario: id, es_admin: 0 }))
      ];
      await onCreate({
        titulo: titulo || null,
        es_grupo: selected.length > 1 ? 1 : 0,
        participantes
      });
      setOpen(false);
    } catch {
      setError("Error al crear el chat");
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleNuevoChatClick}
        className={styles.nuevoChatButton + ' ' + poppins.className}
        type="button"
      >
        Nuevo Oponente
      </button>

      <Popup
        open={open}
        onClose={() => setOpen(false)}
        modal
        nested
        contentStyle={{
          background: '#f3f3f3',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          padding: '40px 32px',
          minWidth: '340px',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div className={styles.popupContent}>
          <h2 className={styles.nuevoChatTitle}>Nuevo chat</h2>

          <input
            type="text"
            placeholder="Título (opcional)"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            style={{
              marginBottom: 12,
              width: '100%',
              padding: 8,
              borderRadius: 8,
              border: '1px solid #ccc'
            }}
          />

          {loading && <div style={{ marginBottom: 12 }}>Cargando...</div>}
          {error && <div className={styles.nuevoChatError}>{error}</div>}

          <div
            className={styles.usuariosList}
            style={{ maxHeight: 200, overflowY: 'auto' }}
          >
            {usuarios.length > 0 ? (
              usuarios.map(usuario => (
                <div
                  key={usuario.id_usuario}
                  className={styles.usuarioItem}
                  onClick={() => handleToggleUsuario(usuario.id_usuario)}
                  style={{
                    background: selected.includes(usuario.id_usuario)
                      ? '#e0e0e0'
                      : 'transparent'
                  }}
                >
                  <img src={usuario.foto_url} />
                  <div className={styles.usuarioInfo}>
                    <span className={styles.usuarioNombre}>{usuario.nombre}</span>
                    <span className={styles.usuarioEmail}>{usuario.email}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selected.includes(usuario.id_usuario)}
                    readOnly
                    style={{ marginLeft: 'auto' }}
                  />
                </div>
              ))
            ) : (
              <div style={{ color: '#888' }}>No hay usuarios disponibles</div>
            )}
          </div>

          <button
            onClick={handleCreate}
            style={{
              marginTop: 18,
              padding: "8px 20px",
              borderRadius: 10,
              background: "#222",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontSize: 15
            }}
          >
            Crear chat
          </button>
        </div>
      </Popup>
    </>
  );
}

// =====================================
// Componente: Tarjeta de chat individual
// =====================================
function Chat({ nombre, description, foto_url }) {
  return (
    <div className={styles["chat-card"]}>
      <div className={styles["chat-row"]}>
        <img src={foto_url} alt="avatar" className={styles.avatar} />
        <div>
          <h3 className={styles["chat-title"]}>{nombre}</h3>
          <p className={styles["chat-desc"]}>{description}</p>
        </div>
      </div>
    </div>
  )
}

// ================================
// Componente principal de Chats
// ================================
export default function Chats() {
  const [chat, setChat] = useState([]);
  const [idLoggued, setIdLoggued] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); // Nuevo estado para el usuario logueado
  const [selectedJugador, setSelectedJugador] = useState(null); // Jugador elegido desde Home
  const [selectedChat, setSelectedChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Conexión WebSocket
  useEffect(() => {
    const socketIo = io("http://localhost:4000");
    setSocket(socketIo);

    socketIo.on("connect", () => setIsConnected(true));
    socketIo.on("disconnect", () => setIsConnected(false));

    return () => {
      socketIo.disconnect();
    };
  }, []);

  // Cargar chats y usuario logueado al montar el componente
  useEffect(() => {
    const id = localStorage.getItem("idLoggued")
    setIdLoggued(id)

    async function chatsperuser(id_usuario) {
      try {
        let result = await fetch("http://localhost:4000/chatsUsuario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_usuario })
        })
        let response = await result.json()
        if (response.ok) {
          setChat(response.chats)
        } else {
          console.error("Error del backend:", response.mensaje)
        }
      } catch (err) {
        console.error("Error en fetch:", err)
      }
    }

    async function dataUserLoggued(){
      const idLoggued = localStorage.getItem("idLoggued")
      let reuslt = await fetch('http://localhost:4000/')
    }

    async function fetchUsuarioLogueado(id_usuario) {
      try {
        const res = await fetch(`http://localhost:4000/usuarioRegistro?id_usuario=${id_usuario}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const user = data.find(u => String(u.id_usuario) === String(id_usuario));
          setUsuarioLogueado(user);
        } else if (data && data.id_usuario) {
          setUsuarioLogueado(data);
        }
      } catch (err) {
        setUsuarioLogueado(null);
      }
    }

    if (id) {
      chatsperuser(id);
      fetchUsuarioLogueado(id);
    }
    // Obtener jugador seleccionado desde Home (localStorage)
    const idJugadorSeleccionado = localStorage.getItem('selectedJugador');
    if (idJugadorSeleccionado) {
      // Obtener lista de jugadores y buscar el seleccionado
      (async () => {
        try {
          const res = await fetch('http://localhost:4000/jugadores');
          const data = await res.json();
          const players = data.players || [];
          const encontrado = players.find(p => String(p.id_jugador) === String(idJugadorSeleccionado));
          if (encontrado) setSelectedJugador(encontrado);
        } catch (err) {
          // no hacer nada si falla
        }
      })();
    }
  }, [])

  // Crear un nuevo chat
  const handleCreateChat = async (nuevoChat) => {
    try {
      const res = await fetch("http://localhost:4000/chatsUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: idLoggued, nuevoChat })
      });
      const data = await res.json();
      if (data.ok) {
        const result = await fetch("http://localhost:4000/chatsUsuario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_usuario: idLoggued })
        });
        const response = await result.json();
        if (response.ok) setChat(response.chats);
      }
    } catch (e) {
      console.error("Error al crear chat:", e);
    }
  };

  // Cargar mensajes de un chat
  const cargarMensajes = async (id_chat) => {
    try {
      const res = await fetch(`http://localhost:4000/mensajes?chat_id=${id_chat}`);
      const data = await res.json();
      setMensajes(data);
    } catch {
      setMensajes([]);
    }
  };

  // Seleccionar un chat
  const handleSelectChat = (element) => {
    setSelectedChat(element);
    cargarMensajes(element.id_chat);
    if (isConnected && socket) {
      socket.emit("joinRoom", { room: String(element.id_chat) });
      socket.emit("pingAll", { mensaje: `ping entre usuarios en chat ${element.id_chat}` });
    }
  };

  // Enviar mensaje
  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !selectedChat) return;

    let participante = null;
    if (selectedChat.participantes) {
      participante = selectedChat.participantes.find(u => String(u.id_usuario) === String(idLoggued));
    }
    let idParticipante = participante && participante.id_participante;

    if (!idParticipante && selectedChat.id_chat && idLoggued) {
      try {
        const res = await fetch(`http://localhost:4000/participantes?chat_id=${selectedChat.id_chat}`);
        const data = await res.json();
        const encontrado = data.find(p => String(p.id_usuario) === String(idLoggued));
        if (encontrado) {
          idParticipante = encontrado.id_participante;
        }
      } catch {
        alert("No se pudo obtener el participante");
        return;
      }
    }

    if (!idParticipante) {
      alert("No eres participante de este chat");
      return;
    }

    // Enviar por WebSocket
    if (isConnected && socket) {
      socket.emit("sendMessage", {
        message: nuevoMensaje,
        id: idParticipante,
        chat_id: selectedChat.id_chat
      });
      setNuevoMensaje("");
      // El backend debe guardar el mensaje solo al recibir el evento del socket
    } else {
      // fallback HTTP
      try {
        const res = await fetch("http://localhost:4000/mensajes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_chat: selectedChat.id_chat,
            id_participante: idParticipante,
            contenido: nuevoMensaje,
            fecha_envio: new Date().toISOString().slice(0, 19).replace('T', ' ')
          })
        });
        const data = await res.json();
        if (data.ok) {
          setNuevoMensaje("");
          cargarMensajes(selectedChat.id_chat);
        }
      } catch (err) {
        console.error("Error enviando mensaje:", err);
      }
    }
  };

  // Escuchar mensajes nuevos en tiempo real
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (msg) => {
      setMensajes(prev => [...prev, msg]);
    };
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, isConnected, selectedChat]);

  // Renderizado principal
  return (
    <div className={styles.mainBgGradient}>
      <div className={styles.whatsappContainer + " " + poppins.className}>
        <div className={styles.sidebar}>
          {/* Header eliminado del sidebar, solo queda el título */}
          <div className={styles.title}>OPONENTES</div>
          <NuevoChatButton onCreate={handleCreateChat} idLoggued={idLoggued} />
          <div className={styles["chats-list"]}>
            {chat.length > 0 ? (
              chat.map(element => {
                let contacto = null;
                if (!element.es_grupo && element.participantes) {
                  contacto = element.participantes.find(u => String(u.id_usuario) !== String(idLoggued));
                }
                return (
                  <div
                    key={element.id_chat}
                    className={
                      styles.chatListItem +
                      (selectedChat && selectedChat.id_chat === element.id_chat ? " " + styles.selected : "")
                    }
                    onClick={() => handleSelectChat(element)}
                  >
                    <Chat
                      nombre={contacto ? contacto.nombre : element.nombre}
                      description={element.es_grupo ? "Grupo" : "Chat privado"}
                      foto_url={
                        !element.es_grupo
                          ? (contacto ? contacto.foto_url : undefined)
                          : element.foto_url
                      }
                    />
                  </div>
                );
              })
            ) : (
              <div className={styles["no-chats"]}>Sin oponentes</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.chatArea}>
        {/* Header superior con oponente y mi jugador */}
        <div className={styles.topHeader}>
          <div className={styles.headerCol}>
          </div>
          <div className={styles.headerCol}>
            <span className={styles.headerLabel}>Mi Jugador:</span>
            {/* Mostrar imagen del jugador seleccionado (priorizar sobre usuarioLogueado) */}
            {selectedJugador && selectedJugador.img_url ? (
              <img src={selectedJugador.img_url} alt="Mi Jugador" className={styles.avatar} />
            ) : usuarioLogueado && usuarioLogueado.foto_url ? (
              <img src={usuarioLogueado.foto_url} alt="Mi Jugador" className={styles.avatar} />
            ) : (
              <img src="/window.svg" alt="Mi Jugador" className={styles.avatar} />
            )}
          </div>
        </div>
        {selectedChat ? (
          <div className={styles.chatContent}>
            <h2>
              {!selectedChat.es_grupo && selectedChat.participantes
                ? selectedChat.participantes.find(u => String(u.id_usuario) !== String(idLoggued))?.nombre
                : selectedChat.nombre}
            </h2>
            <p>{selectedChat.es_grupo ? "Grupo" : "Chat privado"}</p>

            {/* Mensajes del chat */}
            <div className={styles.chatMessages}>
              {mensajes.length > 0 ? (
                mensajes.map((msg, idx) => (
                  <div
                    key={msg.id_mensaje ? `msg-${msg.id_mensaje}` : `temp-${idx}`}
                    className={styles.mensajeItem}
                  >
                    {msg.foto_url && (
                      <img src={msg.foto_url} alt={msg.nombre} className={styles.mensajeAvatar} />
                    )}
                    <div>
                      <b className={styles.mensajeNombre}>{msg.nombre}:</b> {msg.contenido}
                      <div className={styles.mensajeFecha}>{msg.fecha_envio}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#888' }}>No hay mensajes en este chat.</div>
              )}
            </div>

            {/* Input + botón enviar */}
            <div className={styles.chatInputContainer}>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                className={styles.chatInput}
              />
              <button onClick={handleEnviarMensaje} className={styles.sendButton}>
                Enviar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.chatPlaceholder}>
            <h2>Selecciona un chat</h2>
            <p>Elige un chat de la lista para ver la conversación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
