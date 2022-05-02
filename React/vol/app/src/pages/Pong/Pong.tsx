import { calculateNewValue } from "@testing-library/user-event/dist/utils";
import React, { createRef, useEffect, useRef, useState } from "react";
import { deflateRawSync } from "zlib";
import { ProvidePong, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { PongGame } from "../../components/PongGame/PongGame";

interface CanvasProps
{
    width: number;
    height: number;
}

function draw(ctx : CanvasRenderingContext2D, canvas: CanvasProps)
{
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, ctx.canvas.width / 2, ctx.canvas.height)
}

const Pong = ({ width, height }: CanvasProps) =>
{
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current)
        {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');  
            if (context !== null)
            {
                draw(context, {width, height});
            }
        }       
    },[]);

    return (
        <ProvidePong>
            <canvas ref={canvasRef} height={height} width={width} />
        </ProvidePong>
    );
};

Pong.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight
};

export { Pong };
