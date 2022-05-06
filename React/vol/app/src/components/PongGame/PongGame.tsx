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
import { GameConfig } from '../../Common/Game/GameConfig'
import IUser from "../../interface/User";

interface CanvasProps
{
    width: number;
    height: number;
}

function getPongPlayer(pong_ctx: IPongContext, user: IUser) : number | undefined // 1 - 2
{
    if (pong_ctx.room && user.username === pong_ctx.room.player_1.username)
    {
        return (1);
    }
    else if (pong_ctx.room && user.username === pong_ctx.room.player_2.username)
    {
        return (2)
    }
    return (undefined);
}

function update(pong_ctx: IPongContext, ctx : CanvasRenderingContext2D | null, canvas: HTMLCanvasElement, deltaTime: number)
{
    let room = pong_ctx.room;
    if (!room)
        return ;

    if (room.player_1.key !== 0)
        room.player_1.velocity = room.player_1.key * 0.9
    else 
        room.player_1.velocity *= 0.5;

    if (room.player_2.key !== 0)
        room.player_2.velocity = room.player_2.key * 0.9
    else 
        room.player_2.velocity *= 0.5;


    
    room.ball.pos_x += room.ball.vel_x * deltaTime;
    room.ball.pos_y += room.ball.vel_y * deltaTime;
    room.player_1.position += room.player_1.velocity * deltaTime;
    room.player_2.position += room.player_2.velocity * deltaTime;


    /* Player wall collisions */
    // 1
    if (room.player_1.position < 0.13)
    {
        room.player_1.velocity = 0;
        room.player_1.position = 0.13;
    }

    if (room.player_1.position > 1 - 0.13)
    {
        room.player_1.velocity = 0;
        room.player_1.position = 1 - 0.13;
    }

    // 2
    if (room.player_2.position < 0.13)
    {
        room.player_2.velocity = 0;
        room.player_2.position = 0.13;
    }

    if (room.player_2.position > 1 - 0.13)
    {
        room.player_2.velocity = 0;
        room.player_2.position = 1 - 0.13;
    }
}


async function draw(pong_ctx: IPongContext, ctx : CanvasRenderingContext2D | null, canvas: HTMLCanvasElement, user: IUser, last_time: number = performance.now())
{
    /* timed update  */
    let current_time = performance.now();
    let delta = (current_time - last_time) / 1000.0
    update(pong_ctx, ctx, canvas, delta);

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
    ctx.fillStyle = '#101016'
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

    ctx.strokeStyle = '#353540'
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo(terrain_x + terrain_w * 0.5, terrain_y);
    ctx.lineTo(terrain_x + terrain_w * 0.5, terrain_y + terrain_h);
    ctx.stroke();
    ctx.restore();

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

    let player_pos = 0;
    let opponent_pos = 0;

    let ball_x = 0, ball_y = 0;

    /* Player 1-2 in the context ARE NOT the same as player_1 and player_2 in front-end
       player_1 is always the current player, and player_2 is the opponent */    
    if (user.username === pong_ctx.room.player_1.username)
    {
        player_pos = pong_ctx.room.player_1.position;
        opponent_pos = pong_ctx.room.player_2.position;

        ball_x = terrain_x + (pong_ctx.room.ball.pos_x) * (terrain_w * 0.5);
        ball_y = terrain_y + (pong_ctx.room.ball.pos_y) * terrain_h;
    }
    else if (user.username === pong_ctx.room.player_2.username)
    {
        player_pos = pong_ctx.room.player_2.position;
        opponent_pos = pong_ctx.room.player_1.position;  

        ball_x = terrain_x + terrain_w - ((pong_ctx.room.ball.pos_x) * (terrain_w * 0.5));
        ball_y = terrain_y +  (pong_ctx.room.ball.pos_y) * terrain_h;
    }

    player_1_x = terrain_x + terrain_padding;
    player_1_y = terrain_y + (player_pos) * terrain_h - player_1_sz_y * 0.5;

    player_2_x = terrain_x + terrain_w - terrain_padding - player_2_sz_x;
    player_2_y = terrain_y + (opponent_pos) * terrain_h - player_2_sz_y * 0.5;


    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(player_1_x, player_1_y, player_1_sz_x, player_1_sz_y);
    ctx.fillRect(player_2_x, player_2_y, player_2_sz_x, player_2_sz_y);



    /* Ball */
    let ball_size = terrain_h * 0.03;
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath();
    ctx.ellipse(ball_x,
                ball_y, 
                ball_size,
                ball_size,
                Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();

    requestAnimationFrame(() => draw(pong_ctx, ctx, canvas, user, current_time));
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
                let player_id = getPongPlayer(pongCtx, user);
                if (player_id !== undefined)
                {
                    if (player_id === 1)
                        pongCtx.room.player_1.key = (event.key === "z" || event.key === "Z") ? -1 : 1;
                    else 
                        pongCtx.room.player_2.key = (event.key === "z" || event.key === "Z") ? -1 : 1;
                }
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
                let player_id = getPongPlayer(pongCtx, user);
                if (player_id !== undefined)
                {
                    if (player_id === 1)
                        pongCtx.room.player_1.key = 0;
                    else 
                        pongCtx.room.player_2.key = 0;
                }
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
                    pongCtx.room.ball.vel_x = data.vel_x;
                    pongCtx.room.ball.vel_y = data.vel_y;
                }
            });

            pongCtx.room.socket.on("UPDATE_PONG_PLAYER", (data: UpdatePongPlayerDTO) => {
                if (pongCtx.room)
                {
                    if (data.player_id === 1) 
                    {
                        pongCtx.room.player_1.position = data.position;
                        pongCtx.room.player_1.velocity = data.velocity;
                    }
                    else if (data.player_id === 2)
                    {
                        pongCtx.room.player_2.position = data.position;
                        pongCtx.room.player_2.velocity = data.velocity;
                    }
                }
            });
        }
    })

    useEffect(() => {
        if (canvasRef.current && user)
        {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context !== null)
            {
                context.restore();
                draw(pongCtx, context, canvas, user);
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
