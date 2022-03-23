import React, { createContext, useContext, useEffect, useState } from "react";
import { RcvMessageDto} from "../../../interface/chat/chatDto";
import { io, Socket } from "socket.io-client";


export interface IRoom
{
	room_name: string;
	room_message: RcvMessageDto[];
}

interface IChatContext
{
	socket: Socket;
	currentRoom?: string;
	setCurrentRoom: (room_name: string | undefined) => void;
	
	rooms: IRoom[];
	addRoom: (room_name: string) => void;

}

function useChatProvider() : IChatContext
{
    const [socket, setSocket] = useState<Socket>(null!);
    const [currentRoom, setCurrentRoom] = useState<string | undefined>();
    const [rooms, setRooms] = useState<IRoom[]>([]);

    useEffect(() => {

        setSocket(io("http://localhost/", { path: "/api/socket.io/", transports: ['websocket'] }));
        return function cleanup() {
            if (socket !== undefined)
                socket.disconnect();
        };
    }, []);

    function addRoom (room_name: string)
    {
        let newRoom : IRoom = {
            room_name: room_name,
            room_message: []
        };

        const nextRooms = [...rooms, newRoom];

        setRooms(nextRooms);
    };

    return({
        socket,
        currentRoom,
        setCurrentRoom,
        rooms,
        addRoom,
    });
}

const chatContext = createContext<IChatContext>(null!);


/**
 * use to get chat socket
 * @returns chatContext
 */
export function useChatContext()
{
	return useContext(chatContext);
}

/**
 * Provide context to JSX.element child
 * @param children : JSX.element
 * @returns 
 */
export function ProvideChat( {children}: {children: JSX.Element} ): JSX.Element
{
	//const [context, setContext] =  useState(useChatProvider(socket));

	//todo close() socket
	

	return(
		<chatContext.Provider value={useChatProvider()}>
			{children}
		</chatContext.Provider>
		);
};