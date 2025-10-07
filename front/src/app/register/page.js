"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import Title from "../componentes/Title/Title";
import Button from "../componentes/Button/Button";
import styles from "./register.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // --- Función para registrar un nuevo usuario ---
  async function handleRegister() {
    setError("");

    // Validación básica
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    try {
      // Generar fecha SQL (por si tu tabla tiene campo fecha_creacion)
      const fecha_creacion = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // Enviar datos al backend
      const res = await fetch("http://localhost:4000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          password,
          fecha_creacion,
          foto_url: "https://ui-avatars.com/api/?name=" + encodeURIComponent(nombre),
          es_admin: false,
        }),
      });

      const data = await res.json();

      // Si registro correcto
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

        {/* Mostrar error si existe */}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.fields}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
