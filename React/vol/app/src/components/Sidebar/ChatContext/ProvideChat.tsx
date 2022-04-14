import React, { createContext, useContext, useEffect, useState } from "react";
import { RcvMessageDto} from "../../../interface/chat/chatDto";
import { io, Socket } from "socket.io-client";
import { room_joined } from "../../../Common/Dto/chat/room_joined";
import { useAuth } from "../../../auth/useAuth";
import { RoomLeftDto } from "../../../Common/Dto/chat/room";

export enum ELevelInRoom
{
	casual = 0,
	admin = 1,
	owner = 2,
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

//const cltSocket = 

function useChatProvider() : IChatContext
{
	const [socket] = useState(io(process.env.REACT_APP_WS_SCHEME + "://" + process.env.REACT_APP_ORIGIN, { path: "/api/socket.io/", transports: ['websocket'], autoConnect: false,
		auth:{ 
			token: useAuth().user?.access_token_42
		}
	}));
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

	function rmRoom(room_name: string, is_protected: boolean)
    {
		rooms.splice(rooms.findIndex((o) => {
			return (o.room_name === room_name);
		}), 1);
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

		socket.on("LEFT_ROOM", (data: RoomLeftDto) => {
			
			if (currentRoom !== undefined && currentRoom.room_name == data.room_name)
				setCurrentRoom(undefined);

			setRooms(prevRooms => {
				return prevRooms.splice(prevRooms.findIndex((o) => {
					return (o.room_name === data.room_name);
				}), 1)
			});
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