import { useEffect, useRef } from "react";
import { UpdatePongBallDTO } from "../../Common/Dto/pong/UpdatePongBallDTO";
import { UpdatePongPlayerDTO } from "../../Common/Dto/pong/UpdatePongPlayerDTO";
import { SendPlayerKeystrokeDTO } from "../../Common/Dto/pong/SendPlayerKeystrokeDTO"
import { UpdatePongPointsDTO } from "../../Common/Dto/pong/UpdatePongPointsDTO"
import { IPongContext, IPongUser, RoomOptions, RoomState, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { useAuth } from "../../auth/useAuth";
import IUser from "../../Common/Dto/User/User";
import { useRender } from "./PongRenderer";
import './PongGame.css'


interface CanvasProps
{
    width: number;
    height: number;
}

export function getPongPlayer(pong_ctx: IPongContext, user: IUser) : IPongUser | undefined // 1 - 2
{
    if (pong_ctx.room && user.username === pong_ctx.room.player_1.username)
    {
        return (pong_ctx.room.player_1);
    }
    else if (pong_ctx.room)
    {
        return (pong_ctx.room.player_2);
    }
    return (undefined);
}

export function getPongOpponent(pong_ctx: IPongContext, user: IUser) : IPongUser | undefined // 1 - 2
{
    if (pong_ctx.room && user.username !== pong_ctx.room.player_1.username)
    {
        return (pong_ctx.room.player_1);
    }
    else if (pong_ctx.room)
    {
        return (pong_ctx.room.player_2);
    }
    return (undefined);
}



const PongGame = (props: CanvasProps) => {

    const canvasRef	= useRef<HTMLCanvasElement>(null);
    const { user }	= useAuth();
    const pongCtx: IPongContext = usePongContext();

	console.log("/game rerender !");

    /* --- Event Listeners --- */

    /* Keypress */

	useEffect(() => {
		window.addEventListener('keydown', (event: KeyboardEvent) => {
			if (pongCtx.room !== null && user !== null && pongCtx.room.state === RoomState.PLAYING)
			{
                console.log(event.code);
                if (event.code === "ArrowUp" || event.code === "ArrowDown")
				{
					pongCtx.room.player_1.key = (event.code === "ArrowUp") ? -1 : 1;
					pongCtx.room.player_2.key = (event.code === "ArrowUp") ? -1 : 1;
					pongCtx.room.socket.emit("SEND_PLAYER_KEYSTROKE", {
						room_id: pongCtx.room.room_id,
						key: (event.code === "ArrowUp") ? 1 : 0,
						state: 1,
					} as SendPlayerKeystrokeDTO)
				}
			}   
		});
	
		/* Keyrelease */
		window.addEventListener('keyup', (event: KeyboardEvent) => {
			if (pongCtx.room !== null && user !== null && pongCtx.room.state === RoomState.PLAYING)
			{
                if (event.code === "ArrowUp" || event.code === "ArrowDown")
				{
					let player = getPongPlayer(pongCtx, user);
					if (player !== undefined)
					{
						if ((event.code === "ArrowUp"
						&& player.key === -1) || (event.code === "ArrowDown"
						&& player.key === 1))
						{
							player.key = 0;
						
							pongCtx.room.socket.emit("SEND_PLAYER_KEYSTROKE", {
								room_id: pongCtx.room.room_id,
								key: 0,
								state: 0,
							} as SendPlayerKeystrokeDTO)
						}
					}
				}
			}
		});


	}, [pongCtx, user])

	useEffect(() => {
		if (canvasRef.current)
		{
			canvasRef.current.width = window.innerWidth;
			canvasRef.current.height =  window.innerHeight;
		}
	}, [])

    useEffect(() => {
        window.addEventListener('resize', () => {
            if (pongCtx.room && canvasRef.current)
            {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height =  window.innerHeight;
            }
        })
    }, [pongCtx])
    


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

                    console.log("update ball");
                    console.log(pongCtx.room.ball2);
                    console.log(data.ball2);

                    if (pongCtx.room.options & RoomOptions.DOUBLE_BALL && pongCtx.room.ball2 !== undefined && data.ball2 !== undefined)
                    {
                        console.log("recv double ball update");
                        console.log(data.ball2);
                        pongCtx.room.ball2.pos_x = data.ball2.ball_x;
                        pongCtx.room.ball2.pos_y = data.ball2.ball_y;
                        pongCtx.room.ball2.vel_x = data.ball2.vel_x;
                        pongCtx.room.ball2.vel_y = data.ball2.vel_y;
                    }
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

            pongCtx.room.socket.on("UPDATE_POINTS", (data: UpdatePongPointsDTO) => {
                if (pongCtx.room)
                {
                    pongCtx.room.player_1.points = data.player_1_score;
                    pongCtx.room.player_2.points = data.player_2_score;
                }
            })
        }
    }, [pongCtx.room, user])

    useEffect(() => {
        if (pongCtx.room)
        {
            pongCtx.room.socket.on("START_GAME", () => {
                if (pongCtx.room && pongCtx.room.state !== RoomState.PAUSED)
                {
                    pongCtx.room.state = RoomState.PLAYING;
                    pongCtx.room.player_1.key = 0;
                    pongCtx.room.player_2.key = 0;
                    pongCtx.room.player_1.velocity = 0;
                    pongCtx.room.player_2.velocity = 0;
                }
            });

            pongCtx.room.socket.on("LOAD_GAME", () => {
                if (pongCtx.room && pongCtx.room.state !== RoomState.PAUSED)
                {
                    pongCtx.room.state = RoomState.LOADING;
                    pongCtx.room.ball.size = 0;
                }
            });

            pongCtx.room.socket.on("END_GAME", () => {
                if (pongCtx.room && pongCtx.room.state !== RoomState.PAUSED)
                {
                    pongCtx.room.state = RoomState.ENDED;
                }
            });

            pongCtx.room.socket.on("PLAYER_DISCONNECT", () => {
                if (pongCtx.room)
                    pongCtx.room.state = RoomState.PAUSED;
            });

            pongCtx.room.socket.on("PLAYER_RECONNECT", () => {
                if (pongCtx.room)
                    pongCtx.room.state = RoomState.LOADING;
            });

            pongCtx.room.socket.on("ROOM_FINISHED", (data: UpdatePongPointsDTO) => {
                if (pongCtx.room)
                {
                    pongCtx.room.player_1.points = data.player_1_score;
                    pongCtx.room.player_2.points = data.player_2_score;
                    pongCtx.room.state = RoomState.FINISHED;
                    pongCtx.room.setAsFinished(true);
                    pongCtx.room.ball.size = 0;
                    pongCtx.room.withdrawal = data.withdrawal;
                }
            });
        }
    }, [pongCtx])

	useRender(canvasRef, user!);



    return (
        <canvas ref={canvasRef} height={props.height} width={props.width} />
    );
};

PongGame.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight
};

export { PongGame };
