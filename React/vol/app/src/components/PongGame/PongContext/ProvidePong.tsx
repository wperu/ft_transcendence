import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { NumberLiteralType } from "typescript";
import { useAuth } from "../../../auth/useAuth";
import { StartPongRoomDTO } from '../../../Common/Dto/pong/StartPongRoomDTO'
import { UpdatePongRoomDTO } from '../../../Common/Dto/pong/UpdatePongRoomDTO'

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
    WAITING, 
    PLAYING,
    FINISHED,
}

export interface IPongRoom
{
    room_id: number,
    player_1: IPongUser,
    player_2: IPongUser,
    ball: IPongBall,
    spectators: Array<IPongUser>,
    state: RoomState,
    socket: Socket,
}

export interface IPongContext
{
    room: IPongRoom | null,
}



function usePongProvider() : IPongContext
{
    const [inGame, setInGame] = useState<boolean>(false);
    const [socket] = useState(io(process.env.REACT_APP_WS_SCHEME + "://" + process.env.REACT_APP_ORIGIN + "/pong", { path: "/api/socket.io/", transports: ['websocket'], autoConnect: false,
        auth: {
			token: useAuth().user?.access_token_42,
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
                    size: 14,
                    vel_x: 0,
                    vel_y: 0
                } as IPongBall,

                spectators: [],
                state: RoomState.PLAYING,
                socket: socket,
            } as IPongRoom);

            setInGame(true);
        });

        return () => {
            socket.off('STARTING_ROOM');
        };
     }, [inGame]);



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
    }, []);


    useEffect(() => {
        socket.on("AUTHENTIFICATED", () => {
            socket.emit("SEARCH_ROOM");
        })
    })

    return ({
        room: room
    });
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