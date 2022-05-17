import { useEffect, useRef } from "react";
import { UpdatePongBallDTO } from "../../Common/Dto/pong/UpdatePongBallDTO";
import { UpdatePongPlayerDTO } from "../../Common/Dto/pong/UpdatePongPlayerDTO";
import { SendPlayerKeystrokeDTO } from "../../Common/Dto/pong/SendPlayerKeystrokeDTO"
import { IPongContext, RoomState, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { useAuth } from "../../auth/useAuth";
import IUser from "../../interface/User";
import { render } from "./PongRenderer";

// TODO Make matchmaking page with options             
// TODO - Double ball mode                               
// TODO - dash mode                                                 
// TODO Refractor back end                            
// TODO socket reconnection                     
// TODO set room_id (0 = not in game) in users database
// TODO 2FA auth 

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
        return (2);
    }
    return (undefined);
}


const PongGame = (props: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const user = useAuth().user;
    let pongCtx: IPongContext = usePongContext();


    /* --- Event Listeners --- */

    /* Keypress */
    window.addEventListener('keypress', async (event: KeyboardEvent) => {
        if (pongCtx.room !== null && user !== null && pongCtx.room.state === RoomState.PLAYING)
        {
            if (event.key === "z" || event.key === "Z" || event.key === "s" || event.key === 'S')
            {
                pongCtx.room.player_1.key = (event.key === "z" || event.key === "Z") ? -1 : 1;
                pongCtx.room.player_2.key = (event.key === "z" || event.key === "Z") ? -1 : 1;
                pongCtx.room.socket.emit("SEND_PLAYER_KEYSTROKE", {
                    room_id: pongCtx.room.room_id,
                    key: (event.key === "z" || event.key === "Z") ? 1 : 0,
                    state: 1,
                } as SendPlayerKeystrokeDTO)
            }
        }   
    });

    /* Keyrelease */
    window.addEventListener('keyup', async (event: KeyboardEvent) => {
        if (pongCtx.room !== null && user !== null && pongCtx.room.state === RoomState.PLAYING)
        {
            if (event.key === "z" || event.key === "Z" || event.key === "s" || event.key === 'S')
            {
            let player_id = getPongPlayer(pongCtx, user);
               if (player_id !== undefined)
               {
                    if (player_id === 1)
                    {
                        if ((event.key === "z" || event.key === "Z") && pongCtx.room.player_1.key == -1
                        || (event.key === "s" || event.key === "S") && pongCtx.room.player_1.key == 1)
                        {
                            pongCtx.room.player_1.key = 0;
                        
                            pongCtx.room.socket.emit("SEND_PLAYER_KEYSTROKE", {
                                room_id: pongCtx.room.room_id,
                                key: 0,
                                state: 0,
                            } as SendPlayerKeystrokeDTO)
                        }
                    }
                    else 
                    {
                        if ((event.key === "z" || event.key === "Z") && pongCtx.room.player_2.key == -1
                        || (event.key === "s" || event.key === "S") && pongCtx.room.player_2.key == 1)
                        {
                            pongCtx.room.player_2.key = 0;

                            pongCtx.room.socket.emit("SEND_PLAYER_KEYSTROKE", {
                                room_id: pongCtx.room.room_id,
                                key: 0,
                                state: 0,
                            } as SendPlayerKeystrokeDTO)
                        }
                    }
                }
            }
        }
    });


    /* Updates */
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
                if (pongCtx.room && user)
                {
                    if (data.player_id === 1) 
                    {
                        pongCtx.room.player_1.position = data.position;
                        pongCtx.room.player_1.velocity = data.velocity;

                        if (pongCtx.room.player_1.username !== user.username)
                            pongCtx.room.player_1.key = data.key;
                    }
                    else if (data.player_id === 2)
                    {
                        pongCtx.room.player_2.position = data.position;
                        pongCtx.room.player_2.velocity = data.velocity;

                        if (pongCtx.room.player_2.username !== user.username)
                            pongCtx.room.player_2.key = data.key;
                    }
                }
            });
        }
    })

    useEffect(() => {
        if (pongCtx.room)
        {
            pongCtx.room.socket.on("START_GAME", () => {
                console.log("start");
                if (pongCtx.room)
                {
                    pongCtx.room.state = RoomState.PLAYING;
                    pongCtx.room.player_1.key = 0;
                    pongCtx.room.player_2.key = 0;
                    pongCtx.room.player_1.velocity = 0;
                    pongCtx.room.player_2.velocity = 0;
                }
            });

            pongCtx.room.socket.on("LOAD_GAME", () => {
                console.log("load");

                if (pongCtx.room)
                {
                    pongCtx.room.state = RoomState.LOADING;
                    pongCtx.room.ball.size = 0;
                }
            });

            pongCtx.room.socket.on("END_GAME", () => {
                console.log("end");

                if (pongCtx.room)
                {
                    pongCtx.room.state = RoomState.ENDED;
                }
            });
        }
    })

    /* render */
    useEffect(() => {
        if (canvasRef.current && user)
        {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context !== null)
            {
                context.restore();
                render(pongCtx, context, canvas, user);
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
