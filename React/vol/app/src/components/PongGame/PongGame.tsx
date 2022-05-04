import { truncate } from "fs/promises";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { deflateRawSync } from "zlib";
import { UpdatePongRoomDTO } from "../../Common/Dto/pong/UpdatePongRoomDTO";
import { UpdatePongBallDTO } from "../../Common/Dto/pong/UpdatePongBallDTO";
import { UpdatePongPlayerDTO } from "../../Common/Dto/pong/UpdatePongPlayerDTO";
import { SendPlayerKeystrokeDTO } from "../../Common/Dto/pong/SendPlayerKeystrokeDTO"
import { IPongBall, IPongContext, IPongRoom, IPongUser, ProvidePong, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { useAuth } from "../../auth/useAuth";

interface CanvasProps
{
    width: number;
    height: number;
}


async function draw(pong_ctx: IPongContext, ctx : CanvasRenderingContext2D | null, canvas: HTMLCanvasElement)
{

    /* Background */
    ctx = canvas.getContext('2d');     // gets reference to canvas context
    if (!ctx)
        return (console.log("null cnv"));
    if (pong_ctx === null || pong_ctx.room === null)
    {
        console.log("ctx is null");
        return ;
    }

    // TODO review clearing pattern     
    ctx.beginPath();    // clear existing drawing paths
    ctx.save();         // store the current transformation matrix
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();        // restore the transform
    ctx.fillStyle = '#000000'
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);



    /* Terrain */
    let terrain_w = canvas.width, terrain_h = canvas.height,
        terrain_x, terrain_y;

    if (terrain_h * 0.3 < terrain_w)
    {
        terrain_h = terrain_w * 0.6;
    }
    else
    {
        terrain_w = terrain_h * 0.3;
    }

    terrain_h *= 0.8;
    terrain_w *= 0.8;
    terrain_x = (canvas.width - terrain_w) * 0.5;
    terrain_y = (canvas.height - terrain_h) * 0.5;

    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 10;
    ctx.strokeRect(terrain_x, terrain_y, terrain_w, terrain_h);
    /* ******** */


    
    /* Players */
    let player_1_x, player_1_y, player_1_sz_x, player_1_sz_y;
    let player_2_x, player_2_y, player_2_sz_x, player_2_sz_y;
    
    player_1_sz_y = terrain_h * 0.25;
    player_1_sz_x = terrain_w * 0.02;
    player_2_sz_y = terrain_h * 0.25;
    player_2_sz_x = terrain_w * 0.02;


    let terrain_padding = terrain_w * 0.03;

    player_1_x = terrain_x + terrain_padding;
    player_1_y = terrain_y + (pong_ctx.room.player_1.position) * terrain_h - player_1_sz_y * 0.5;

    player_2_x = terrain_x + terrain_w - terrain_padding - player_2_sz_x;
    player_2_y = terrain_y + (pong_ctx.room.player_2.position) * terrain_h - player_2_sz_y * 0.5;


    let ball_x = 0, ball_y = 0;
    if (pong_ctx !== null && pong_ctx.room !== null)
    {
        ball_x = terrain_x + (pong_ctx.room.ball.pos_x) * (terrain_w * 0.5);
        ball_y = terrain_y + (pong_ctx.room.ball.pos_y) * terrain_h;
    }

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(player_1_x, player_1_y, player_1_sz_x, player_1_sz_y);
    ctx.fillRect(player_2_x, player_2_y, player_2_sz_x, player_2_sz_y);



    /* Ball */
    
    ctx.fillStyle = '#FFFFFF'
    ctx.ellipse(ball_x,
                ball_y, 
                pong_ctx && pong_ctx.room ? pong_ctx.room.ball.size : 20,
                pong_ctx && pong_ctx.room ? pong_ctx.room.ball.size : 20,
                Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();

    requestAnimationFrame(() => draw(pong_ctx, ctx, canvas));
}

const PongGame = (props: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const user = useAuth().user;
    let pongCtx: IPongContext = usePongContext();


    window.addEventListener('keypress', (event: KeyboardEvent) => {
        if (pongCtx.room !== null && user !== null)
        {
            if (event.key === "z" || event.key === "Z" || event.key === "s" || event.key === 'S')
            {
                pongCtx.room.socket.emit("SEND_PLAYER_KEYSTROKE", {
                    room_id: pongCtx.room.room_id,
                    player_id: pongCtx.room.player_1.username === user.username ? 1 : 2,
                    key: (event.key === "z" || event.key === "Z") ? 1 : 0,
                    state: 1,
                } as SendPlayerKeystrokeDTO)
            }
        }   
    });

    window.addEventListener('keyup', (event: KeyboardEvent) => {
        if (pongCtx.room !== null && user !== null)
        {
            if (event.key === "z" || event.key === "Z" || event.key === "s" || event.key === 'S')
            {
                pongCtx.room.socket.emit("SEND_PLAYER_KEYSTROKE", {
                    room_id: pongCtx.room.room_id,
                    player_id: pongCtx.room.player_1.username === user.username ? 1 : 2,
                    key: (event.key === "z" || event.key === "Z") ? 1 : 0,
                    state: 0,
                } as SendPlayerKeystrokeDTO)
            }
        }
    });


    useEffect(() => {
        if (pongCtx.room)
        {
            pongCtx.room.socket.on("UPDATE_PONG_BALL", (data: UpdatePongBallDTO) => {
                if (pongCtx.room)
                {
                    pongCtx.room.ball.pos_x = data.ball_x;
                    pongCtx.room.ball.pos_y = data.ball_y;
                }
            });

            pongCtx.room.socket.on("UPDATE_PONG_PLAYER", (data: UpdatePongPlayerDTO) => {
                if (pongCtx.room)
                {
                    if (data.player_id === 1) 
                        pongCtx.room.player_1.position = data.position;
                    else if (data.player_id === 2)
                        pongCtx.room.player_2.position = data.position;
                }
            });
        }
    })

    useEffect(() => {
        if (canvasRef.current)
        {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context !== null)
            {
                context.restore();
                draw(pongCtx, context, canvas);
            }
        }       
    });

    return (
        <canvas ref={canvasRef} height={props.height} width={props.width} />
    );
};

PongGame.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight
};

export { PongGame };
