import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface IChatContext
{
	socket: Socket;
	setCurrentRoom: (room_name: string) => void;
	currentRoom?: string;
}

const socket = io("http://localhost/", { path: "/api/socket.io/", transports: ['websocket'] });


function useChatProvider(input_socket: Socket) : IChatContext
{
	const [socket, setSocket] = useState<Socket>(input_socket);
	const [currentRoom, setCurrentRoom] = useState<string | undefined>();

	useEffect(() => {
		return function cleanup() {
			if (socket != undefined)
				socket.close();
		};
	}, [socket]);

	return({
		socket,
		setCurrentRoom,
		currentRoom,
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
		<chatContext.Provider value={useChatProvider(socket)}>
			{children}
		</chatContext.Provider>
		);
};