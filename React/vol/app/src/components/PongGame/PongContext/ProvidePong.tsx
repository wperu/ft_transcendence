import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../../auth/useAuth";

export interface IPongUser
{
    username: string,
    points: number,
}

export enum RoomState {
    WAITING, 
    PLAYING,
    FINISHED,
}

export interface IPongRoom
{
    player_1: IPongUser,
    player_2: IPongUser,
    spectators: Array<IPongUser>,
    state: RoomState,
}

export interface IPongContext
{
    rooms: Array<IPongRoom>,
}



function usePongProvider() : IPongContext
{
    const [inGame, setInGame] = useState<boolean>(false);
    const [socket] = useState(io(process.env.REACT_APP_WS_SCHEME + "://" + process.env.REACT_APP_ORIGIN + "/pong", { path: "/api/socket.io/", transports: ['websocket'], autoConnect: true,
        auth: {
			token: useAuth().user?.access_token_42,
        }
    }));
    const [rooms, setRooms] = useState<Array<IPongRoom>>([]);
    const navigate = useNavigate();


    function searchRoom()
    {
    }

    useEffect(() => {
        socket.on('STARTING_ROOM', (data: any) => {
            console.log("Room is starting");
            setInGame(true);
        });
     }, []);

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
        socket.emit("SEARCH_ROOM");
        console.log(socket);
    }, []);

    return ({rooms});
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