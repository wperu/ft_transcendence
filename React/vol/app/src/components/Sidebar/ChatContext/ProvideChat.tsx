import React, { createContext, useContext, useEffect, useState } from "react";
import { RcvMessageDto} from "../../../interface/chat/chatDto";
import { io, Socket } from "socket.io-client";
import { EnumType } from "typescript";

export enum ELevelInRoom
{
	casual = "casual",
	admin = "admin",
	owner = "owner",
}

export enum ERoomVisibility
{
	public = "public",
	private = "private",
	protected = "protected",
}


export enum ECurrentTab
{
	friends = "friends",
	channels = "channels",
	chat = "chat",
}

export interface IRoom
{
	visibility: ERoomVisibility;
	password?: string;
	user_level: ELevelInRoom;
	room_name: string;
	room_message: RcvMessageDto[];
}

interface IChatContext
{
	socket: Socket;
	currentRoom?: IRoom;
	setCurrentRoom: (room: IRoom | undefined) => void;
	setCurrentRoomByName: (rname: string) => void;
	
	rooms: IRoom[];
	addRoom: (room_name: string) => void;

	currentTab: ECurrentTab;
	setCurrentTab: (tab: ECurrentTab) => void;
}

function useChatProvider() : IChatContext
{
    const [socket, setSocket] = useState<Socket>(io("http://localhost/",
		{ path: "/api/socket.io/", transports: ['websocket'] }));
    const [currentRoom, setCurrentRoom] = useState<IRoom | undefined>();
    const [rooms, setRooms] = useState<IRoom[]>([]);
	const [currentTab, setCurrentTab] = useState<ECurrentTab>(ECurrentTab.channels);

	
    function addRoom(room_name: string, password?: string)
    {
		const newRoom : IRoom = {
			user_level: ELevelInRoom.owner,
			room_name: room_name,
            room_message: [],
			visibility: ERoomVisibility.public,
			password: password
        };
		
        setRooms([...rooms, newRoom]);
		if (currentRoom !== undefined)
			setCurrentRoomByName(currentRoom.room_name);
    };
	
	function setCurrentRoomByName (name: string)
	{
		setCurrentRoom(rooms.find(o => {
			return (o.room_name === name);
		}));
	};

	function findRoomByName (name: string)
	{
		return (rooms.find(o => {
			return (o.room_name === name);
		}));
	}

	useEffect(() => {
		socket.on('RECEIVE_MSG', (data : RcvMessageDto) => {
			let targetRoom = findRoomByName(data.room_name);
			if (targetRoom !== undefined)
			{
				console.log("[CHAT] rcv: ", data);
				targetRoom.room_message.push(data);
			}
		});
			
		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off('RECEIVE_MSG');
			}
		};
	}, [rooms]);

	useEffect(() => {

		// socket.on('JOINED_ROOM', (data : JoinChatDto) => { //A REVOIR
		// 	setRooms([...rooms, ])
		// 	if (targetRoom !== undefined)
		// 	{
		// 		console.log("[CHAT] rcv: ", data);
		// 		targetRoom.room_message.push(data);
		// 	}
		// });

		return function cleanup() {
			if (socket !== undefined)
			{
				socket.disconnect();
			}
		};
	}, []);
	
    return({
		socket,
        currentRoom,
        setCurrentRoom,
		setCurrentRoomByName,
		currentTab,
		setCurrentTab,
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