"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import Title from "../componentes/Title/Title";
import Button from "../componentes/Button/Button";
import styles from "./register.module.css";
import { useIp } from "@/hooks/useIp";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState(""); // 🔹 Nuevo campo
  const [gmail, setGmail] = useState("");
  const [contraseña, setContraseña] = useState(""); // renombrado
  const [error, setError] = useState("");
  const { ip } = useIp();

  async function handleRegister() {
    setError("");

    if (!nombre.trim() || !apellido.trim() || !gmail.trim() || !contraseña.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    try {
      const res = await fetch(`http://${ip}:4000/usuarioRegistro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellido,
          gmail,
          contraseña,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        alert("✅ Usuario registrado con éxito. Ahora inicia sesión.");
        router.push("/login");
      } else {
        setError(data.mensaje || "❌ Error al registrar usuario.");
      }
    } catch (err) {
      console.error("Error en el registro:", err);
      setError("Error de conexión con el servidor.");
    }
  }

  return (
    <div className={`${styles.container} ${poppins.className}`}>
      <div className={styles.card}>
        <Title text="REGISTRO" />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.fields}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />
        </div>

        <Button
          text="CREAR UNA CUENTA"
          onClick={handleRegister}
          variant="primary"
        />

        <p className={styles.footer}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className={styles.link}>
            INICIA SESIÓN
          </Link>
        </p>
      </div>
    </div>
  );
}
