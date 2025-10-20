// Página principal de chats
// Incluye: listado de chats, botón para crear chat, popup, renderizado condicional y hooks

"use client"

import { useState, useEffect } from "react";
// Popup removido: no se usa porque quitamos el apartado NuevoChat
import { io } from "socket.io-client";
import { useRouter } from 'next/navigation';
import styles from "./chats.module.css"
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// NuevoChat eliminado por petición.

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
  const router = useRouter();
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
      {/* Botón grande X en la esquina superior derecha */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 30 }}>
        <button
          onClick={() => router.back()}
          aria-label="Cerrar chat"
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            background: '#fff',
            border: 'none',
            fontSize: 36,
            fontWeight: 800,
            color: '#222',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
          }}
        >
          ✕
        </button>
      </div>

      {/* Se elimina la columna blanca (sidebar) y la envoltura whatsappContainer */}

      <div className={styles.chatArea}>
        {/* Header superior con 'MI JUGADOR:' y avatar del jugador seleccionado */}
        <div className={styles.topHeader}>
          <div className={styles.headerCol}>
            <span className={styles.headerLabel}>MI JUGADOR:</span>
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
