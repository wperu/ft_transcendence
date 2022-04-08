import React, { createContext, useContext, useEffect, useState } from "react";
import { RcvMessageDto} from "../../../interface/chat/chatDto";
import { io, Socket } from "socket.io-client";
import { room_joined } from "../../../Common/Dto/chat/room_joined";

export enum ELevelInRoom
{
	casual = "casual",
	admin = "admin",
	owner = "owner",
}

export enum ECurrentTab
{
	friends = "friends",
	channels = "channels",
	chat = "chat",
}

export interface IRoom
{
	private: boolean;
	protected: boolean;
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
	addRoom: (room_name: string, is_protected: boolean) => void;

	currentTab: ECurrentTab;
	setCurrentTab: (tab: ECurrentTab) => void;
}

const cltSocket = io(process.env.REACT_APP_WS_SCHEME + "://" + process.env.REACT_APP_ORIGIN, { path: "/api/socket.io/", transports: ['websocket'], autoConnect: false});

function useChatProvider() : IChatContext
{
	const [socket] = useState(cltSocket);
    const [currentRoom, setCurrentRoom] = useState<IRoom | undefined>();
    const [rooms, setRooms] = useState<IRoom[]>([]);
	const [currentTab, setCurrentTab] = useState<ECurrentTab>(ECurrentTab.channels);

	
    function addRoom(room_name: string, is_protected: boolean)
    {
		const newRoom : IRoom = {
			user_level: ELevelInRoom.owner,
			room_name: room_name,
            room_message: [],
			private: false,
			protected: is_protected,
        };
		
        setRooms(prevRooms => { return ([...prevRooms, newRoom]); });
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
		socket.connect();
		
		socket.on("JOINED_ROOM", (data: room_joined) => {
			if (data.status === 0 && data.room_name !== undefined)
			{
				alert("Channel " + data.room_name + " rejoint");
				addRoom(data.room_name, false);
			}
			else if (data.status_message !== undefined)
			{
				alert(data.status_message);
			}
		})

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
	const chatCtx = useChatProvider();

	return(
		<chatContext.Provider value={chatCtx}>
			{children}
		</chatContext.Provider>
		);
};