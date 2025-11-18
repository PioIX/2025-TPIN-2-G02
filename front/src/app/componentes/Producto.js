"use client"

import React from 'react';
import Title from './TitleRivas';
import Description from './Description';
import Button from './ButtonRivas';

export default function Producto(props) {
    return (
        <div>
            <Title text={props.nombre} />
            <Description text={props.descripcion} />
            <Button text="Comprar" onClick={props.comprar} />
        </div>
    )
}   