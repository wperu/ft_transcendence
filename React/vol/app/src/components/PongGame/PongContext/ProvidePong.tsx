import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

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
    
    const [socket] = useState(io(process.env.REACT_APP_WS_SCHEME + "://" + process.env.REACT_APP_ORIGIN + "/pong", { path: "/api/socket.io/", transports: ['websocket'], autoConnect: true,
        auth: {
            // todo auth
        }
    }));
    const [rooms, setRooms] = useState<Array<IPongRoom>>([]);


    function searchRoom()
    {
    }

    useEffect(() => {
        socket.on('STARTING_ROOM', (data: any) => {
            console.log("Room is starting");
        });
     }, []);
    
    useEffect(() => {
        socket.connect();
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