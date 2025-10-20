"use client"

// ============================
// Página principal de Chats
// ============================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import Button from "@/app/componentes/Button/Button";
import styles from "./chats.module.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});



// ================================
// Componente principal de Chats
// ================================
export default function Chats() {
  const router = useRouter();
  const { socket, isConnected } = useSocket(); // ✅ Hook de socket
  const [chat, setChat] = useState([]);
  const [idLoggued, setIdLoggued] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  // ==============================
  // Cargar datos iniciales por fetch
  // ==============================
  useEffect(() => {
    const id = localStorage.getItem("idLoggued");
    setIdLoggued(id);

    if (id) {
      getChatsPorUsuario(id);
      getUsuarioLogueado(id);
    }

    const idJugadorSeleccionado = localStorage.getItem("selectedJugador");
    if (idJugadorSeleccionado) getJugadorSeleccionado(idJugadorSeleccionado);
  }, []);

  async function getChatsPorUsuario(id_usuario) {
    try {
      let result = await fetch("http://localhost:4000/chatsUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario }),
      });
      let response = await result.json();
      if (response.ok) setChat(response.chats);
    } catch (err) {
      console.error("Error cargando chats:", err);
    }
  }

  async function getUsuarioLogueado(id_usuario) {
    try {
      const res = await fetch(
        `http://localhost:4000/usuarioRegistro?id_usuario=${id_usuario}`
      );
      const data = await res.json();
      if (data && data.id_usuario) setUsuarioLogueado(data);
    } catch {
      setUsuarioLogueado(null);
    }
  }

  async function getJugadorSeleccionado(idJugadorSeleccionado) {
    try {
      const res = await fetch("http://localhost:4000/jugadores");
      const data = await res.json();
      const encontrado = data.players.find(
        (p) => String(p.id_jugador) === String(idJugadorSeleccionado)
      );
      if (encontrado) setSelectedJugador(encontrado);
    } catch {}
  }





  // ==============================
  // Enviar mensaje (socket o HTTP)
  // ==============================
  async function handleEnviarMensaje() {
    if (!nuevoMensaje.trim() || !selectedChat) return;

    let idParticipante = null;

    try {
      const res = await fetch(
        `http://localhost:4000/participantes?chat_id=${selectedChat.id_chat}`
      );
      const data = await res.json();
      const encontrado = data.find((p) => String(p.id_usuario) === String(idLoggued));
      if (encontrado) idParticipante = encontrado.id_participante;
    } catch {
      console.error("No se pudo obtener el participante");
      return;
    }

    if (!idParticipante) return;

    if (isConnected && socket) {
      socket.emit("sendMessage", {
        message: nuevoMensaje,
        id: idParticipante,
        chat_id: selectedChat.id_chat,
      });
      setNuevoMensaje("");
    } else {
      try {
        const res = await fetch("http://localhost:4000/mensajes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_chat: selectedChat.id_chat,
            id_participante: idParticipante,
            contenido: nuevoMensaje,
            fecha_envio: new Date()
              .toISOString()
              .slice(0, 19)
              .replace("T", " "),
          }),
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
  }

  // ==============================
  // Escuchar mensajes en tiempo real
  // ==============================
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (msg) => {
      setMensajes((prev) => [...prev, msg]);
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, isConnected, selectedChat]);

  // ==============================
  // Renderizado principal
  // ==============================
  return (
    <div className={styles.mainBgGradient}>
      {/* ✅ Botón VOLVER arriba a la derecha */}
      <div style={{ position: "absolute", top: 18, right: 24, zIndex: 30 }}>
        <Button text="Volver" onClick={() => router.push("/home")} />
      </div>

      <div className={styles.chatArea}>
        {/* Header superior con jugador logueado */}
        <div className={styles.topHeader}>
          <div className={styles.headerCol}>
            <span className={styles.headerLabel}>MI JUGADOR:</span>
            {selectedJugador && selectedJugador.img_url ? (
              <img
                src={selectedJugador.img_url}
                alt="Mi Jugador"
                className={styles.avatar}
              />
            ) : usuarioLogueado && usuarioLogueado.foto_url ? (
              <img
                src={usuarioLogueado.foto_url}
                alt="Mi Jugador"
                className={styles.avatar}
              />
            ) : (
              <img src="/window.svg" alt="Mi Jugador" className={styles.avatar} />
            )}
          </div>
        </div>

        {selectedChat ? (
          <div className={styles.chatContent}>
            <h2>
              {!selectedChat.es_grupo && selectedChat.participantes
                ? selectedChat.participantes.find(
                    (u) => String(u.id_usuario) !== String(idLoggued)
                  )?.nombre
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
                      <img
                        src={msg.foto_url}
                        alt={msg.nombre}
                        className={styles.mensajeAvatar}
                      />
                    )}
                    <div>
                      <b className={styles.mensajeNombre}>{msg.nombre}:</b>{" "}
                      {msg.contenido}
                      <div className={styles.mensajeFecha}>{msg.fecha_envio}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#888" }}>No hay mensajes en este chat.</div>
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
