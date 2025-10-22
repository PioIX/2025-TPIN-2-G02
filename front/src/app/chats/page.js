"use client"

import { useState, useEffect } from "react";
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
  const { socket, isConnected } = useSocket({ serverUrl: SOCKET_URL_LOCAL });
  const [idLoggued, setIdLoggued] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [selectedJugador, setSelectedJugador] = useState(null);

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

  return (
    <div className={styles.mainBgGradient}>
      <div style={{ position: "absolute", top: 18, right: 24, zIndex: 30 }}>
        <Button text="Volver" onClick={handleVolver} />
      </div>
      <div className={styles.chatArea}>
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

      </div>
    </div>
  );
}
