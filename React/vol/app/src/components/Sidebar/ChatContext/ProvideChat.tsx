import React, { createContext, useContext, useEffect, useState } from "react";
import { RcvMessageDto} from "../../../interface/chat/chatDto";
import { io, Socket } from "socket.io-client";
import { RoomJoined } from "../../../Common/Dto/chat/RoomJoined";
import { useAuth } from "../../../auth/useAuth";
import { RoomLeftDto } from "../../../Common/Dto/chat/room";
import { useNotifyContext, ELevel } from "../../NotifyContext/NotifyContext";
import { RoomPassChange } from "../../../Common/Dto/chat/RoomRename";

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
	addRoom: (room_name: string, is_protected: boolean, level: ELevelInRoom) => void;

	currentTab: ECurrentTab;
	setCurrentTab: (tab: ECurrentTab) => void;
}

//const cltSocket = 

function useChatProvider() : IChatContext
{
	const notify = useNotifyContext();
	const [socket] = useState(io(process.env.REACT_APP_WS_SCHEME + "://" + process.env.REACT_APP_ORIGIN, { path: "/api/socket.io/", transports: ['websocket'], autoConnect: false,
		auth:{ 
			token: useAuth().user?.access_token_42
		}
	}));
	const [currentRoom, setCurrentRoom] = useState<IRoom | undefined>();
	const [rooms, setRooms] = useState<IRoom[]>([]);
	const [currentTab, setCurrentTab] = useState<ECurrentTab>(ECurrentTab.channels);
	
	function addRoom(room_name: string, is_protected: boolean, level: ELevelInRoom)
	{
		const newRoom : IRoom = {
			user_level: level,
			room_name: room_name,
			room_message: [],
			private: false,
			protected: is_protected,
		};
		
		setRooms(prevRooms => { return ([...prevRooms, newRoom]); });
		if (currentRoom !== undefined)
		setCurrentRoomByName(currentRoom.room_name);
	};
	
	
	function rmRoom(room_name: string)
	{
		setRooms(prev => {
			return prev.filter((o) => {
				return (o.room_name !== room_name);
			})
		});
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
		socket.on("LEFT_ROOM", (data: RoomLeftDto) => {
			if (data.status === 1)
			{
				if (currentRoom !== undefined && currentRoom.room_name === data.room_name)
					setCurrentRoom(undefined);
				/*setRooms(prevRooms => {
					return prevRooms.splice(prevRooms.findIndex((o) => {
						return (o.room_name === data.room_name);
					}), 1)
				});*/
				if (data.room_name !== undefined)
					rmRoom(data.room_name);
				notify.addNotice(ELevel.info, "Room " + data.room_name + " left", 3000);
			}
			else if (data.status_message !== undefined)
			{
				notify.addNotice(ELevel.error, data.status_message, 3000);
			}
		})

		return function cleanup() {		
			if (socket !== undefined)
			{
				socket.off('LEFT_ROOM');
			}
		};
	}, [currentRoom, rooms]);

	useEffect(() => {

		socket.connect();
		
		socket.on("JOINED_ROOM", (data: RoomJoined) => {
			if (data.status === 0 && data.room_name !== undefined)
			{
				if (data.protected !== undefined && data.user_is_owner !== undefined)
					addRoom(data.room_name, data.protected, (data.user_is_owner
						? ELevelInRoom.owner : ELevelInRoom.casual));
				else
					console.log("wtf (joined_room)");
				notify.addNotice(ELevel.info, "Room " + data.room_name + " joined", 3000);
			}
			else if (data.status_message !== undefined)
			{
				notify.addNotice(ELevel.error, data.status_message, 3000);
			}
		});

		socket.on('ROOM_PASS_CHANGE', (data : RoomPassChange) => {
			if (data.status == 0)
				notify.addNotice(ELevel.info, "Password modification of room " +
					data.room_name + " successful", 4000);
			else if (data.status_message)
				notify.addNotice(ELevel.error, data.status_message, 4000);
		});

		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off('ROOM_PASS_CHANGE');
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