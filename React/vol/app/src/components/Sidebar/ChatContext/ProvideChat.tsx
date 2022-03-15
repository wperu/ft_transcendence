import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket = io("http://localhost/", { path: "/api/socket.io/", transports: ['websocket'] });
const chatContext = createContext<Socket>(socket);

/**
 * use to get chat socket
 * @returns chatContext
 */
export function useChatSocket()
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
	return(
		<chatContext.Provider value={socket}>
			{children}
		</chatContext.Provider>
		);
};