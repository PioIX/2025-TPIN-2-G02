"use client";

import { useEffect, useState } from "react";
import Button from "../componentes/Button/Button";
import Input from "../componentes/Input/input.js";
import Title from "../componentes/Title/Title";

export default function ContadorPage() {
  const [cuenta, setCuenta] = useState(0);
  const [nombre, setNombre] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (cuenta === 20 || cuenta === -20) {
      setCuenta(0);
    }
  }, [cuenta]);

  function subeYBaja() {
    if (isChecked) {
      setCuenta((prev) => prev + 1);
    } else {
      setCuenta((prev) => prev - 1);
    }
  }

  function cambioCheck(event) {
    setIsChecked(event.target.checked);
  }

  function reiniciar() {
    setCuenta(0);
  }

  function guardarInput(event) {
    setNombre(event.target.value);
  }

  return (
    <>
      <Title text="Pagina del contador" />
      <h2>Contador = {cuenta}</h2>
      <Button texto="subeYBaja" onClick={subeYBaja} />
      <Button texto="reiniciar" onClick={reiniciar} />
      <Input type="checkbox" onChange={cambioCheck} placeholder="che"/>
      <Input type="text" placeholder="Escribe tu nombre" onChange={guardarInput} />
      <h2>Hola = {nombre}</h2>
    </>
  );
}
