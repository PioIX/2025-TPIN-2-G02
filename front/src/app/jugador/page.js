"use client";

import React, { useState, useEffect } from "react";
import Button from "../componentes/Button/Button";
import Input from "../componentes/Input/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import styles from "@/app/jugador/jugador.module.css";

export default function Home() {
  const [jugadores, setJugadores] = useState([]);
  const [selectedJugador, setSelectedJugador] = useState("");
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  useEffect(() => {
    getJugadores();
    joinRoom();
  }, []);

  function joinRoom() {
    if (isConnected) {
      const idLogged = searchParams.get("idLogged");
      const roomName = searchParams.get("room") || "Sala_1";

      socket.emit("joinRoom", { room: roomName, idLogged: idLogged });

      router.push(`/jugador?room=${roomName}&idLogged=${idLogged}`);
    }
  }

  async function getJugadores() {
    let result = await fetch("http://localhost:4000/jugadores");
    let response = await result.json();
    setJugadores(response.players);
  }

  const filteredJugadores = jugadores.filter(
    (jugador) =>
      jugador.nombre_jugador.toLowerCase().includes(searchTerm.toLowerCase()) //filtra los jugadores que contengan lo que escribí
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedJugador("");
  };

  function handleJugar() {
    // Obtener room e idLogged desde query o localStorage
    const selectedRoom = searchParams.get("room") || localStorage.getItem("room") || "Sala_1";
    const idLogged = searchParams.get("idLogged") || localStorage.getItem("idLoggued") || "";

    console.log('handleJugar:', { selectedJugador, selectedRoom, idLogged });

    // Navegar siempre a /chats (incluso si selectedJugador está vacío)
    router.push(`/chats?jugador=${encodeURIComponent(selectedJugador || '')}&room=${encodeURIComponent(selectedRoom)}&idLogged=${encodeURIComponent(idLogged)}`);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ELIJA SU JUGADOR PARA COMENZAR</h1>

      <div className={styles.searchBox}>
        <Input
          type="text"
          placeholder="Buscar jugador..."
          value={searchTerm}
          onChange={handleSearchChange}
          name="searchJugador"
        />
      </div>

      {searchTerm && (
        <div className={styles.searchBox}>
          <select
            className={styles.select}
            value={selectedJugador}
            onChange={(e) => setSelectedJugador(e.target.value)}
            size={Math.min(filteredJugadores.length + 1, 4)} //muestra máximo 4 opciones asi el select no ocupa toda la pantalla
          >
            {filteredJugadores.map((jugador) => (
              <option key={jugador.id_jugador} value={jugador.id_jugador}>
                {jugador.nombre_jugador}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedJugador && (
        <div className={styles.selectedInfo}>
          <strong>Jugador seleccionado:</strong>{" "}
          {
            jugadores.find((j) => j.id_jugador === parseInt(selectedJugador))
              ?.nombre_jugador
          }
          {/*Busca el jugador por ID, conviértelo a número y muestra su nombre (si existe)*/}
        </div>
      )}

      <div>
        <Button onClick={handleJugar} text={"SELECCIONAR"} />
      </div>
    </div>
  );
}
