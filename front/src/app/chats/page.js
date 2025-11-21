"use client";


import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useIp } from "@/hooks/useIp";
import Button from "@/app/componentes/Button/Button";
import styles from "./chats.module.css";
import Input from "../componentes/Input/input";
import Popup from "../componentes/PopUp/PopUp";


const SOCKET_URL_LOCAL = `ws://localhost:4000/`;
const SOCKET_URL_REMOTE = "181.47.29.35";


export default function Chats() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ip } = useIp();


  const idJugadorSeleccionado = searchParams.get("jugador");
  const room = searchParams.get("room");
  const fotoJugadorSeleccionado = searchParams.get("img_url");
  const { socket, isConnected } = useSocket({ serverUrl: SOCKET_URL_LOCAL });
  //const [socket, isConnected] = useSocket();


  const [idLogged, setIdLogged] = useState(null);
  const [selectedJugador, setSelectedJugador] = useState("");
  const [sendMessage, setSendMessage] = useState("");  // Aquí es el estado para el mensaje
  const [message, setMessage] = useState([]);
  const messagesEndRef = useRef(null);
  const [allowSearch, setAllowSearch] = useState(false);
  const [jugadores, setJugadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [popupGanaste, setPopupGanaste] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [popupPerdiste, setPopupPerdiste] = useState(false);


  useEffect(() => {
    const idLogged = searchParams.get("idLogged");
    if (idLogged) {
      setIdLogged(idLogged);
    }
  }, []);


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedJugador(""); // Reseteamos el jugador seleccionado cuando cambia la búsqueda
  };


  useEffect(() => {
    getJugadores();
  }, []);



  async function getJugadores() {
    const result = await fetch(`http://${ip}:4000/jugadores`);
    const response = await result.json();
    setJugadores(response.players);
  }


  // Renombramos la función para evitar el conflicto con el estado
  async function postMensaje(contenido, id_usuario, id_partida) {
    const res = await fetch(`http://${ip}:4000/mensajes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido, id_usuario, id_partida })
    });
    const data = await res.json();
    console.log("Mensaje enviado:", data);
    return data;
  }


  function handleChangeSearch() {
    setAllowSearch(!allowSearch);
  }


  const filteredJugadores = jugadores.filter(
    (jugador) =>
      jugador.nombre_jugador.toLowerCase().includes(searchTerm.toLowerCase())
  );


  useEffect(() => {
    if (isConnected) {
      socket.emit("joinRoomChat", { room: room });
    }
  }, [isConnected]);

  useEffect(() => {
    if (!socket) return;

    socket.on("ResultadoDeAcierto", ({ acierto }) => {
      // Cerrar ambos popups antes de abrir uno nuevo
      setPopupGanaste(false);
      setPopupError(false);

      if (acierto) {
        setPopupGanaste(true);

        // Cerrar popup automáticamente
        setTimeout(() => setPopupGanaste(false), 4000);
      } else {
        setPopupError(true);

        // Cerrar popup automáticamente
        setTimeout(() => setPopupError(false), 4000);
      }
    });

    return () => {
      socket.off("ResultadoDeAcierto");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleFinDelJuego = ({ ganador }) => {
      console.log("🔥 La partida terminó. Ganador:", ganador);

      if (String(ganador) === String(idLogged)) {
        setPopupGanaste(true);
      } else {
        setPopupPerdiste(true);
      }

      setTimeout(() => {
        router.push(`/inicio?idLogged=${idLogged}`);
      }, 2000);
    };

    socket.on("finDelJuego", handleFinDelJuego);

    return () => {
      socket.off("finDelJuego", handleFinDelJuego);
    };
  }, [socket, idLogged]);




  function adivinarJugador() {
    if (!selectedJugador) return;

    socket.emit("adivinarJugador", {
      room,
      userId: idLogged,
      idJugadorAdivinado: selectedJugador
    });
  }




  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", (data) => {
      if (idLogged != data.message.id) {
        console.log("Nuevo mensaje recibido:", data.message.message);
        const newMessage = {
          texto: data.message.message,
          id_usuario: data.message.id,
          fechayhora: new Date().toLocaleTimeString()
        };
        setMessage(prev => [...prev, newMessage]);
      }
    });
    return () => {
      socket.off("newMessage");
    };
  }, [socket]);


  // Función que envía el mensaje al servidor
  async function send() {
    if (!sendMessage) return;


    const idLogged = searchParams.get("idLogged");
    setIdLogged(idLogged);


    // Llamamos a la función renombrada postMensaje
    const resultEnviarMensaje = await postMensaje(sendMessage, idLogged, room);
    console.log("Mensaje enviado:", resultEnviarMensaje, " Texto enviado:", sendMessage);


    const newMessage = {
      texto: sendMessage,
      id_usuario: idLogged,
      fechayhora: new Date().toLocaleTimeString()
    };
    setMessage(prev => [...prev, newMessage]);


    socket.emit("sendMessage", { message: sendMessage, id: idLogged });


    setSendMessage("");  // Limpiar el estado del mensaje después de enviarlo
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

          {/* AREA DE MENSAJES */}
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
                    className={
                      MensajeUsuario
                        ? styles.myMessageRow
                        : styles.otherMessageRow
                    }
                  >
                    <div
                      className={
                        MensajeUsuario
                          ? styles.myMessage
                          : styles.otherMessage
                      }
                    >
                      <div className={styles.messageText}>{msg.texto}</div>
                      <div className={styles.messageTime}>
                        {msg.fechayhora}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT MENSAJES */}
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

          {/* MOSTRAR BUSCADOR DE JUGADOR */}
          <button className={styles.botoncito} onClick={handleChangeSearch}>
            Tu jugador es...
          </button>

          {allowSearch && (
            <>
              {/* Input búsqueda */}
              <div className={styles.searchBox}>
                <Input
                  type="text"
                  placeholder="Buscar jugador..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  name="searchJugador"
                />
              </div>

              {/* Selector de jugadores */}
              <div className={styles.searchBox}>
                <select
                  className={styles.select}
                  value={selectedJugador}
                  onChange={(e) => setSelectedJugador(e.target.value)}
                  size={Math.min(filteredJugadores.length + 1, 4)}
                >
                  {filteredJugadores.map((jugador) => (
                    <option
                      key={jugador.id_jugador}
                      value={jugador.id_jugador}
                    >
                      {jugador.nombre_jugador}
                    </option>
                  ))}
                </select>
              </div>

              {/* BOTÓN ADIVINAR */}
              <button
                className={styles.botoncito}
                onClick={adivinarJugador}
                disabled={!selectedJugador}
              >
                ADIVINAR
              </button>
            </>
          )}
        </div>
      </div>


      <Popup showPopup={popupGanaste} closePopup={() => setPopupGanaste(false)}>
        <div className={styles.popupContent}>
          <h2>🎉 ¡GANASTE!</h2>
          <p>Adivinaste correctamente el jugador del rival.</p>
        </div>
      </Popup>

      <Popup showPopup={popupError} closePopup={() => setPopupError(false)}>
        <div className={styles.popupContent}>
          <h2>❌ Jugador incorrecto</h2>
          <p>Seguí intentando...</p>
        </div>
      </Popup>

      <Popup showPopup={popupPerdiste} closePopup={() => setPopupPerdiste(false)}>
        <div className={styles.popupContent}>
          <h2>❌ ¡PERDISTE!</h2>
          <p>El rival adivinó tu jugador.</p>
        </div>
      </Popup>

    </div>
  );

}
