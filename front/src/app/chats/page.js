"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import Button from "@/app/componentes/Button/Button";
import styles from "./chats.module.css";
import { useRef } from "react";

const SOCKET_URL_LOCAL = "ws://localhost:4000/"
const SOCKET_URL_REMOTE = "181.47.29.35"

export default function Chats() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idJugadorSeleccionado = searchParams.get("jugador");
  const { socket, isConnected } = useSocket({ serverUrl: SOCKET_URL_LOCAL });
  const [idLoggued, setIdLoggued] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [selectedJugador, setSelectedJugador] = useState(null);

  // Estado del chat
  const [messages, setMessages] = useState([]); // { id, from, text, ts }
  const [text, setText] = useState("");
  const messagesRef = useRef(null);

  /*useEffect(() => {
    const id = localStorage.getItem("idLoggued");
    setIdLoggued(id);

    if (id) {
      getUsuarioLogueado(id);
    }

    if (idJugadorSeleccionado) {
      getJugadorSeleccionado(idJugadorSeleccionado);
    }
  }, [idJugadorSeleccionado]);

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
      const res = await fetch(`http://localhost:4000/jugador?id_jugador=${idJugadorSeleccionado}`);
      const data = await res.json();
      if (data && data.id_jugador) setSelectedJugador(data);
    } catch { }
  }*/

  function handleVolver() {
    router.push("/jugador");
  }

  async function sendChatMessage() {
    const content = (text || "").trim();
    if (!content) return;

    const payload = {
      type: "message",
      from: idLoggued || localStorage.getItem("idLoggued") || "cliente",
      to: selectedJugador?.id_jugador || null,
      text: content,
      ts: Date.now(),
    };

    // Enviar por WebSocket si está disponible
    try {
      if (socket && socket.readyState === 1) socket.send(JSON.stringify(payload));
    } catch (e) {
      // ignore send errors for now
    }

    // Persistir en la base de datos via REST
    try {
      const id_usuario = Number(idLoggued || localStorage.getItem("idLoggued")) || null;
      await fetch("http://localhost:4000/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: content, id_usuario, id_partida: null })
      });
    } catch (err) {
      // no interrumpimos la UX si falla el guardado
      console.warn("No se pudo guardar el mensaje en la BDD:", err.message || err);
    }

    // Añadir a la UI inmediatamente
    const myMsg = { id: `${Date.now()}-me`, from: "me", text: content, ts: payload.ts };
    setMessages((m) => [...m, myMsg]);
    setText("");

    // Scroll al final (pequeño retraso para que el DOM renderice)
    setTimeout(() => {
      if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, 50);
  }

  return (
    <div className={styles.mainBgGradient}>
      {/* Botón Volver: ahora estará dentro del headerRight para evitar superposiciones */}
      <div className={styles.chatArea}>
        <div className={styles.topHeader}>
          <div className={styles.headerLeft}>
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

          <div className={styles.headerRight}>
            <div className={styles.volverButton}>
              <Button text="Volver" onClick={handleVolver} />
            </div>
          </div>
        </div>

        {/* CUADRO BLANCO CENTRAL (mensajes + input) */}
        <div className={styles.chatContent}>
          <div className={styles.chatMessages} ref={messagesRef}>
            {messages.length === 0 ? (
              <div className={styles.chatPlaceholder}>No hay mensajes todavía</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={styles.mensajeItem}>
                  <div className={styles.mensajeBubble}>
                    <div className={styles.mensajeTexto}>{m.text}</div>
                    <div className={styles.mensajeFecha}>{new Date(m.ts).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.chatInputContainer}>
            <textarea
              className={styles.chatInput}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje..."
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
            />

            <button className={styles.sendButton} onClick={sendChatMessage}>Enviar</button>
          </div>
        </div>

      </div>
    </div>
  );
}
