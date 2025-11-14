"use client"; // Correct directive for client-side components

import { useState, useEffect } from "react";
import Button from "../componentes/Button/Button";
import Input from "../componentes/Input/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import styles from "@/app/jugador/jugador.module.css";
import { useIp } from "@/hooks/useIp";

export default function Jugador() {
  const [jugadores, setJugadores] = useState([]);
  const [selectedJugador, setSelectedJugador] = useState("");
  const [jugadorInfo, setJugadorInfo] = useState(null); // Nuevo state para guardar la info del jugador
  const [searchTerm, setSearchTerm] = useState("");
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRoom = searchParams.get("room");
  const idLogged = searchParams.get("idLogged");
  const { ip } = useIp();


  useEffect(() => {
    getJugadores();
  }, []);

  useEffect(() => {
    // Si se selecciona un jugador, obtenemos la información de ese jugador
    if (selectedJugador) {
      getJugadorPorId(selectedJugador);
    }
  }, [selectedJugador]);

  async function getJugadores() {
    const result = await fetch(`http://${ip}:4000/jugadores`);
    const response = await result.json();
    setJugadores(response.players);
  }

  async function getJugadorPorId(idJugador) {
    const result = await fetch(`http://${ip}:4000/jugadores/${idJugador}`);
    const response = await result.json();
    setJugadorInfo(response.player); // Guardamos la información del jugador en el estado
  }

  const filteredJugadores = jugadores.filter(
    (jugador) =>
      jugador.nombre_jugador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedJugador(""); // Reseteamos el jugador seleccionado cuando cambia la búsqueda
  };

  function handleJugar() {
    if (jugadorInfo) {
      const fotoJugador = jugadorInfo.img_url; 
      const nombreJugadorSeleccionado = jugadorInfo.nombre_jugador;
      router.push(`/chats?idLogged=${idLogged}&room=${selectedRoom}&jugador=${nombreJugadorSeleccionado}&img_url=${fotoJugador}`);
    }
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
            size={Math.min(filteredJugadores.length + 1, 4)} // Muestra máximo 4 opciones
          >
            {filteredJugadores.map((jugador) => (
              <option key={jugador.id_jugador} value={jugador.id_jugador}>
                {jugador.nombre_jugador} 
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedJugador && jugadorInfo && (
        <div className={styles.selectedInfo}>
          <strong>Jugador seleccionado:</strong> {jugadorInfo.nombre_jugador}
        </div>
      )}

      <div>
        <Button onClick={handleJugar} text={"SELECCIONAR"} />
      </div>
    </div>
  );
}
