"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import Button from "@/app/componentes/Button/Button";
import styles from "./chats.module.css";

const SOCKET_URL_LOCAL = "ws://localhost:4000/"
const SOCKET_URL_REMOTE = "181.47.29.35"

export default function Chats() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idJugadorSeleccionado = searchParams.get("jugador");
  const room = searchParams.get("room");
  const { socket, isConnected } = useSocket({ serverUrl: SOCKET_URL_LOCAL });
  const [idLoggued, setIdLoggued] = useState(null);
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
    const idLoggued = localStorage.getItem("idLoggued");
    setIdLoggued(idLoggued);
    chatsperuser(idLoggued);
  }, []);

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

  useEffect(() => {
    async function getCantidadUsers() {
      if (room) { // Solo hacer el fetch si el nombre de la sala está definido
        let result = await fetch(`http://localhost:4000/cantidadDeUsersPorSala?room=${room}`);
        let response = await result.json(); // Convertir la respuesta a JSON
        setCantidadUsers(response.cantidadUsers); // Actualizar el estado con la cantidad de usuarios
      }
    }

    getCantidadUsers();
  }, [room]);

  async function chatsperuser(id_Loggued) {
    let result = await fetch("http://localhost:4000/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: id_Loggued }),
    });
    let response = await result.json();
    if (response.msg == 1) {
      setChats(response.respuesta);
    }
  }

  async function bringMessages(id_chat) {
    let result = await fetch("http://localhost:4000/bringmessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_chat }),
    });
    let response = await result.json();
    let resmessages = response.messages;
    setMessage(resmessages);
    return response;
  }

  async function chatSelected(id_chat, nombre, foto) {
    setChatSelected(id_chat);
    setChatName(nombre);
    setChatImg(foto);
    await bringMessages(id_chat);
    socket.emit("joinRoom", { room: id_chat });
    localStorage.setItem("id_chat", id_chat);
  }

  async function send() {
    const fecha = new Date();
    const dia = fecha.toISOString().slice(0, 10);
    const hora = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const resultado = `${dia} ${hora}:${minutos}`;
    const idLoggued = localStorage.getItem("idLoggued");
    const id_chat = localStorage.getItem("id_chat");
    if (sendMessage.trim() !== "") {
      if (sendMessage.trim().length > 255) {
        alert("El mensaje es demasiado largo, máximo 255 caracteres");
        setSendMessage("");
        return;
      } else {
        let obj = {
          nombre: idLoggued,
          fechayhora: resultado,
          texto: sendMessage,
          id_usuario: idLoggued,
          id_chat: id_chat,
        };
        socket.emit("sendMessage", { obj });
        setSendMessage("");
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleVolver() {
    router.push("/jugador");
  }

  return (
    <div className={styles.mainBgGradient}>
      <div className={styles.volverBtnContainer}>
        <Button text="VOLVER" onClick={handleVolver} />
      </div>
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
      <div className={styles.chatArea}>
        <div className={styles.chatContainer}>
          <div className={styles.messagesArea}>
            {message.length == 0 ? (
              <div className={styles.noMessages}>No hay mensajes</div>
            ) : (
              message.map((msg, idx) => {
                const idLoggued = localStorage.getItem("idLoggued");
                const isMine = msg.id_usuario == idLoggued; // ia o raro
                return (
                  <div
                    key={idx}
                    className={isMine ? styles.myMessageRow : styles.otherMessageRow}
                  >
                    <div className={isMine ? styles.myMessage : styles.otherMessage}>
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
            <button
              onClick={send}
              className={styles.sendButton}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
