"use client"

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/app/componentes/Button/Button";
import styles from "./inicio.module.css";
import { Poppins } from "next/font/google";
import Popup from "../componentes/PopUp/PopUp";
import Instruccion from "../componentes/Instruccion/Instruccion";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});


export default function Inicio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showInstrucciones, setShowInstrucciones] = useState(false);
  const handleOpenInstrucciones = () => setShowInstrucciones(true);
  const handleCloseInstrucciones = () => setShowInstrucciones(false);
  const idLogged = searchParams.get("idLogged");

  function handleEntrar() {
    router.push(`/home?idLogged=${idLogged}`);
  }

  return (
    <div className={`${styles.hero} ${poppins.className}`}>
      <div className={styles.headerBar}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>¿QUIEN ES QUIEN?</h1>
        </div>
      </div>

      <div className={styles.centerArea}>
        <p className={styles.subtitle}>DEMOSTRÁ TU INSTINTO FUTBOLERO</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlLeft}>
          <Button text="JUGAR" onClick={handleEntrar} />
        </div>
        <div className={styles.controlRight}>
          <Button text="INSTRUCCIONES" onClick={handleOpenInstrucciones} />
        </div>
      </div>

      <Popup showPopup={showInstrucciones} closePopup={handleCloseInstrucciones}>
        <Instruccion onClose={handleCloseInstrucciones} />
      </Popup>
    </div>
  );
}
