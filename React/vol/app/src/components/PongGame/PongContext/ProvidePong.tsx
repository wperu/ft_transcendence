import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../../../auth/useAuth";
import { ReconnectPlayerDTO } from "../../../Common/Dto/pong/ReconnectPlayerDTO";
import { StartPongRoomDTO } from '../../../Common/Dto/pong/StartPongRoomDTO'
import { GameConfig } from "../../../Common/Game/GameConfig";
import { getPongPlayer } from "../PongGame";
import { defaultParticleEmitter, ParticleEmitter } from "../PongParticleSystem";
import { TrailFX } from "../PongTrail";

export interface IPongUser
{
    username: string,
    points: number,
    position: number,
    velocity: number,
    key: number,
}

export interface IPongBall
{
    pos_x: number,
    pos_y: number,
    size: number,
    vel_y: number;
    vel_x: number;
}

export enum RoomState {
    LOADING, 
    PLAYING,
    FINISHED,
    ENDED,
    PAUSED,
}

export interface IPongRoom
{
    room_id: string,
    player_1: IPongUser,
    player_2: IPongUser,
    ball: IPongBall,
    spectators: Array<IPongUser>,
    state: RoomState,
    socket: Socket,
}

export interface FX
{
    trail: TrailFX
}

export interface IPongContext
{
    room: IPongRoom | null,
    fx: FX,
}



function usePongProvider() : IPongContext
{
    const user = useAuth().user;
    const [inGame, setInGame] = useState<boolean>(false);
    const [socket] = useState(io(process.env.REACT_APP_WS_SCHEME + "://" + process.env.REACT_APP_ORIGIN + "/pong", { path: "/api/socket.io/", transports: ['websocket'], autoConnect: false,
        auth: {
			token: user?.access_token_42,
        }
    }));
    const [room, setRoom] = useState<IPongRoom | null>(null);
    const navigate = useNavigate();


    useEffect(() => {
        socket.on('STARTING_ROOM', (data: StartPongRoomDTO) => {
            console.log("Room is starting");
            setRoom({
                room_id: data.room_id,
                player_1: {
                    username: data.player_1.username,
                    points: 0,
                    position: 0.5,
                    velocity: 0,
                    key: 0,
                } as IPongUser,

                player_2: {
                    username: data.player_2.username,
                    points: 0,
                    position: 0.5,
                    velocity: 0,
                    key: 0,
                } as IPongUser,

                ball: {
                    pos_x: 1,
                    pos_y: 0.5,
                    size: 0,
                    vel_x: 0,
                    vel_y: 0
                } as IPongBall,

                spectators: [],
                state: RoomState.ENDED,
                socket: socket,
            } as IPongRoom);

            setInGame(true);
        });

        return () => {
            socket.off('STARTING_ROOM');
        };
     }, [inGame, room]);



    useEffect(() => {
        if (inGame === true)
        {
            console.log("switching")
            /**
             *  maybe use a /game/:id syntax with some id passed in a StartRoomDTO
             */
            navigate("/game", { replace: true });
        }
    }, [inGame])

    
    useEffect(() => {
        socket.connect();
        console.log(socket);

        return (() => {
            socket.disconnect();
        })
    }, [socket]);


    useEffect(() => {
        socket.on("AUTHENTIFICATED", () => {
            socket.emit("SEARCH_ROOM");
        })
    }, [])


    useEffect(() => {
        socket.on("RECONNECT_YOU", (data: ReconnectPlayerDTO) => {
            console.log("getting reconnected");
            setRoom({
                room_id: data.room_id,
                player_1: {
                    username: data.player_1.username,
                    points: data.player_1.points,
                    position: data.player_1.position,
                    velocity: 0,
                    key: 0,
                } as IPongUser,

                player_2: {
                    username: data.player_2.username,
                    points: data.player_1.points,
                    position: data.player_1.position,
                    velocity: 0,
                    key: 0,
                } as IPongUser,

                ball: {
                    pos_x: data.ball.x,
                    pos_y: data.ball.y,
                    size: GameConfig.BALL_SIZE,
                    vel_x: data.ball.vel_x,
                    vel_y: data.ball.vel_y
                } as IPongBall,

                spectators: [],
                state: RoomState.LOADING,
                socket: socket,
            });
            setInGame(true);
        });

        return (() => {
            socket.off("RECONNECT_YOU")
        })
    }, [room])


    return ({
        room: room,
        fx: initFx(),
    });
}

function initFx() : FX
{
    return ({
        trail: {
            system: {
                emitters: [
                    {
                        particles: [],
                        speed: 0,
                        start_size: 10,
                        spread_amount: 0,
                        end_size: 9,
                        start_color: { r: 27, g: 147, b: 198, a: 50 },
                        end_color:  { r: 27, g: 198, b: 160, a: 0 },
                        lifetime: 0.6,
                        center_x: 0,
                        center_y: 0,
                        max_particles: 50,
                        emission_amount: 1
                    } as ParticleEmitter,
                    {
                        particles: [],
                        speed: 0.2,
                        start_size: 3,
                        spread_amount: 5,
                        end_size: 0,
                        start_color: { r: 187, g: 224, b: 237, a: 255 },
                        end_color:  { r: 187, g: 237, b: 228, a: 0 },
                        lifetime: 1,
                        center_x: 0,
                        center_y: 0,
                        max_particles: 50,
                        emission_amount: 5
                    } as ParticleEmitter,
                ]
            }
        } as TrailFX
    } as FX)
}


const pongContext = createContext<IPongContext>(null!);


export function usePongContext()
{
    return (useContext(pongContext));
}

export function ProvidePong({children}: {children: JSX.Element} ) : JSX.Element
{
    const pongCtx = usePongProvider();

	return(
		<pongContext.Provider value={pongCtx}>
			{children}
		</pongContext.Provider>
    );
}