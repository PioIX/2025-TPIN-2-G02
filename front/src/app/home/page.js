"use client";

import Button from "@/app/componentes/Button/Button";
import Input from "@/app/componentes/Input/input"; 
import Title from "@/app/componentes/Title/Title";
import styles from "./home.module.css";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function socketPage() {
    const { socket, isConnected } = useSocket();
    const router = useRouter();

    useEffect(() => {
        if (!socket) return;

        const handlePingAll = (recibido) => {
            console.log("PING RECIBIDO: ", recibido);
        };

        const handleNewMessage = (data) => {
            console.log("MENSAJE NUEVO: ", data);
        };

        socket.on("pingAll", handlePingAll);
        socket.on("newMessage", handleNewMessage);

        return () => {
            // Limpieza de eventos al desmontar el componente
            socket.off("pingAll", handlePingAll);
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket]);

    function pingAll() {
        if (isConnected) {
            socket.emit("pingAll", { mensaje: "ping desde el front" });
        } else {
            console.error("Socket no está conectado");
        }
    }

    function joinRoom() {
        if (isConnected) {
            socket.emit("joinRoom", { room: "pio" });
            router.push("/jugador");
        } else {
            console.error("Socket no está conectado");
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Title text={"Bienvenido"} />

                <p className={styles.notice}>Conecta con el servidor para jugar.</p>

                <div className={styles.controls}>
                    <div className={styles.actions}>
                        {/*<Button text={"PingAll"} onClick={pingAll} />*/}
                        <Button text={"Unirse a la sala"} onClick={joinRoom} />
                    </div>
                </div>
            </div>
        </div>
    );
}