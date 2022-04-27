import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RoomJoined } from "../../../Common/Dto/chat/RoomJoined";
import { useAuth } from "../../../auth/useAuth";
import { RcvMessageDto, RoomLeftDto, UserDataDto } from "../../../Common/Dto/chat/room";


enum ENotification
{
	INFO,
	GAME_REQUEST,
	FRIEND_REQUEST
}

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

export interface INotif
{
	id: string;
	type: ENotification;

	req_id?: number;
	username?: string;
	content? : string;

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
	socket:			Socket;
	currentRoom?:	IRoom;

	setCurrentRoom:			(room: IRoom | undefined) => void;
	setCurrentRoomByName:	(rname: string) => void;
	
	rooms:			IRoom[];
	addRoom:		(room_name: string, is_protected: boolean) => void;

	notification:	INotif[];
	rmNotif:		(id: string) => void;

	currentTab:		ECurrentTab;
	setCurrentTab:	(tab: ECurrentTab) => void;

	friendsList:	Array<UserDataDto>;
	blockList:		Array<UserDataDto>;
}

//const cltSocket = 

function useChatProvider() : IChatContext
{
	const [socket] = useState(io(process.env.REACT_APP_WS_SCHEME + "://" + process.env.REACT_APP_ORIGIN, { path: "/api/socket.io/", transports: ['websocket'], autoConnect: false,
		auth:{ 
			token: useAuth().user?.access_token_42
		}
	}));
    const [currentRoom, setCurrentRoom]		= useState<IRoom | undefined>();
    const [rooms, setRooms]					= useState<IRoom[]>([]);
	const [currentTab, setCurrentTab]		= useState<ECurrentTab>(ECurrentTab.channels);
	const [notification, setNotification] 	= useState<INotif[]>([]);
	const [friendsList, setFriendsList]		= useState<Array<UserDataDto>>([]);
	const [blockList, setBlockList]			= useState<Array<UserDataDto>>([]);

	/**
	 * ***** Room *****
	 */
	
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
	};

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
			if (currentRoom !== undefined && currentRoom.room_name === data.room_name)
				setCurrentRoom(undefined);
			
			if (data.room_name !== undefined)
				rmRoom(data.room_name);
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
		
		socket.on("disconnect", () => {
			setRooms([]); //clean rooms
			setCurrentRoom(undefined);
		  });

		socket.on("JOINED_ROOM", (data: RoomJoined) => {
			if (data.status === 0 && data.room_name !== undefined)
			{
				//alert("Channel " + data.room_name + " rejoint");
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

	/**
	 * ***** Notification *****
	 */

	function addNotif(notif: INotif[])
	{
		setNotification(prev => {
			return [...prev, ...notif];
		});
	};

	function rmNotif(id: string)
	{
		setNotification(prev => {
			return prev.filter((o) => {
				return (o.id !== id);
			})
		});
	};

	useEffect(() => {
		socket.on('RECEIVE_NOTIF', (data : INotif[]) => {
			addNotif(data);

		});
		
		return function cleanup() {		
			if (socket !== undefined)
			{
				socket.off('RECEIVE_NOTIF');
			}
		};
	}, [socket]);

	useEffect(() => {
		setNotification((prev) => { return prev.filter((n) => {
			return(!(
			n.type === ENotification.FRIEND_REQUEST
			&& n.req_id
			&& (friendsList.find((f) => {return f.reference_id === n.req_id})
			|| blockList.find((b) => {return b.reference_id === n.req_id}))))
			})
		})
	}, [friendsList, blockList]);
	
	
	/**
	 * ***** Relation Ship *****
	 */
	
	useEffect(() => {

		socket.on('FRIEND_LIST', (data: UserDataDto[]) => {
			setFriendsList(data);
		});

		socket.emit("FRIEND_LIST");

		socket.on('BLOCK_LIST', (data: UserDataDto[]) => {
			setBlockList(data);
		});

		socket.emit("BLOCK_LIST");

		return function cleanup() {		
			if (socket !== undefined)
			{
				socket.off('FRIEND_LIST');
				socket.off('BLOCK_LIST');
			}
		};

	}, [socket]);

    return({
		socket,
        currentRoom,
        setCurrentRoom,
		setCurrentRoomByName,
		currentTab,
		setCurrentTab,
        rooms,
        addRoom,
		notification,
		rmNotif,
		friendsList,
		blockList,
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