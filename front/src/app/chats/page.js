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

  // Recoger los parámetros de la URL
  const idJugadorSeleccionado = searchParams.get("jugador");
  const room = searchParams.get("room");
  const fotoJugadorSeleccionado = searchParams.get("img_url");
  const { socket, isConnected } = useSocket({ serverUrl: SOCKET_URL_LOCAL });

  const [idLogged, setIdLogged] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [cantidadUsers, setCantidadUsers] = useState(0);
  const [sendMessage, setSendMessage] = useState("");
  const [message, setMessage] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const idLogged = searchParams.get("idLogged");
    if (idLogged) {
      setIdLogged(idLogged);
    }

    

  }, []);

  useEffect(() => {
    if (isConnected) {
      socket.emit("joinRoomChat", { room: room });
    }
  }, [isConnected])

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", (data) => {
      if (idLogged != data.message.id) {
        console.log("Nuevo mensaje recibido:", data.message.message);
        let newMessage = data.message.message;
        console.log("Mensajes:", message);
        let arr = message
        arr.push(newMessage);
        setMessage(arr); //revisar, recibe el mensaje por consola pero no se guarda en el vector mensajes
        setChatMessages(prev => [...prev, newMessage]);
      }
    });
    return () => {
      socket.off("newMessage");
    };
  }, [socket]);

  async function send() {
    if (!sendMessage) return;

    const idLogged = searchParams.get("idLogged");
    setIdLogged(idLogged);

    const resultEnviarMensaje = await fetch.enviarMensaje(sendMessage, idLogged, room);
    console.log("Mensaje enviado:", resultEnviarMensaje, " Texto enviado:", sendMessage);

    const newMessage = {
      texto: sendMessage,
      id_usuario: idLogged,
      fechayhora: new Date().toLocaleTimeString()
    };
    setMessage([newMessage]);

    socket.emit("sendMessage", { message: sendMessage, id: idLogged });

    setSendMessage("");
  }

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
            {message.length === 0 ? (
              <div className={styles.noMessages}>No hay mensajes</div>
            ) : (
              message.map((msg, idx) => {
                const idLoggedLocal = localStorage.getItem("idLogged");
                const MensajeUsuario = msg.id_usuario === idLoggedLocal;
                return (
                  <div
                    key={idx}
                    className={MensajeUsuario ? styles.myMessageRow : styles.otherMessageRow}
                  >
                    <div className={MensajeUsuario ? styles.myMessage : styles.otherMessage}>
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
