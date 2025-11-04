"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import Button from "@/app/componentes/Button/Button";
import styles from "./chats.module.css";
import fetch from "../componentes/fetch";

const SOCKET_URL_LOCAL = "ws://localhost:4000/";
const SOCKET_URL_REMOTE = "181.47.29.35";

export default function Chats() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idJugadorSeleccionado = searchParams.get("jugador");
  const room = searchParams.get("room");
  const fotoJugadorSeleccionado = searchParams.get("img_url");
  const { socket, isConnected } = useSocket({ serverUrl: SOCKET_URL_LOCAL });
  const [idLogged, setIdLogged] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [cantidadUsers, setCantidadUsers] = useState(0);
  const [chat, setChats] = useState([]);
  const [sendMessage, setSendMessage] = useState("");
  const [message, setMessage] = useState([]);
  const [chatSelectedById, setChatSelected] = useState(null);
  const [chatSelectedByName, setChatName] = useState("");
  const [chatSelectedByImg, setChatImg] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, chatSelectedById]); //ia

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", (data) => {
      let newMessage = data.message;
      setMessage((prevMessages) => [...prevMessages, newMessage]);
    });
    return () => {
      socket.off("newMessage");
    };
  }, [socket]);

  async function send() {
    const fecha = new Date();
    const dia = fecha.toISOString().slice(0, 10);
    const hora = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const resultado = `${dia} ${hora}:${minutos}`;
    // Enviar mensaje al servidor
    // Actualizar estado localmente
    const resultEnviarMensaje= await fetch.enviarMensaje(sendMessage, idLogged, room);
    console.log("Mensaje enviado:", resultEnviarMensaje);
    // Enviar por socket elmensaje
    socket.emit("sendMessage", { message: sendMessage });
  }
  // Pablo dijo que probaramos si funciona esto.

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleVolver() {
    if (isConnected) {
      router.push("/jugador");
    }
    //Aramr  leaveRoom en el back -> Sacar al jugador de la bdd
  }

  return (
    <div className={styles.mainBgGradient}>
      <div className={styles.volverBtnContainer}>
        <Button text="VOLVER" onClick={handleVolver} />
      </div>
      <div className={styles.topHeader}>
        <div className={styles.headerCol}>
          <span className={styles.headerLabel}>MI JUGADOR:</span>
          {fotoJugadorSeleccionado ? (
            <img
              src={fotoJugadorSeleccionado}
              alt="Mi Jugador"
              className={styles.avatar}
            />
          ) : (
            <img src="/window.svg" alt="Mi Jugador" className={styles.avatar} />
          )}
        </div>
      </div>
      <div className={styles.chatArea}>
        <div className={styles.chatContainer}>
          <div className={styles.messagesArea}>
            {message.length == 0 ? (
              <div className={styles.noMessages}>No hay mensajes</div>
            ) : (
              message.map((msg, idx) => {
                const idLoggedLocal = localStorage.getItem("idLogged");
                const MensajeUsuario = (msg.id_usuario = idLoggedLocal); //ia o raro
                return (
                  <div
                    key={idx}
                    className={
                      MensajeUsuario
                        ? styles.myMessageRow
                        : styles.otherMessageRow
                    }
                  >
                    <div
                      className={
                        MensajeUsuario ? styles.myMessage : styles.otherMessage
                      }
                    >
                      <div className={styles.messageText}>{msg.texto}</div>
                      <div className={styles.messageTime}>{msg.fechayhora}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className={styles.chatInput}
            />
            <button onClick={send} className={styles.sendButton}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
