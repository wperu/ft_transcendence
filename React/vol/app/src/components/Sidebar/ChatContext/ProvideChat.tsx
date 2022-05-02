import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RoomJoined } from "../../../Common/Dto/chat/RoomJoined";
import { useAuth } from "../../../auth/useAuth";
import { RcvMessageDto, RoomLeftDto, UserDataDto } from "../../../Common/Dto/chat/room";
import { useNotifyContext, ELevel } from "../../NotifyContext/NotifyContext";

/** //fix
 *  NOTIF rework notif system
 * 	dub request && invalide request...
 * 	room add is_pm
 */

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
	rmFriendNotif: 	(id: number) => void;

	currentTab:		ECurrentTab;
	setCurrentTab:	(tab: ECurrentTab) => void;

	friendsList:			Array<UserDataDto>;
	blockList:				Array<UserDataDto>;
	//RequestList:		Array<UserDataDto>;
}

function useChatProvider() : IChatContext
{
	const notify = useNotifyContext();
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
	const [requestList, setRequestList]		= useState<Array<UserDataDto>>([]);
	const [blockList, setBlockList]			= useState<Array<UserDataDto>>([]);

	/**
	 * ***** Room *****
	 */

	const setCurrentRoomByName = useCallback((name: string) => {
		setCurrentRoom(rooms.find(o => {
			return (o.room_name === name);
		}));
	}, [rooms]);
	
    const addRoom = useCallback((room_name: string, is_protected: boolean) => {
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
    }, [currentRoom, setCurrentRoomByName]);


	const rmRoom = useCallback((room_name: string) => {
		setRooms(prev => {
			return prev.filter((o) => {
				return (o.room_name !== room_name);
			})
		});
	}, []);

	

	const findRoomByName = useCallback((name: string) => 
	{
		return (rooms.find(o => {
			return (o.room_name === name);
		}));
	}, [rooms]);

	useEffect(() => {
		
		socket.on('RECEIVE_MSG', (data : RcvMessageDto) => {
			let targetRoom = findRoomByName(data.room_name);
			if (targetRoom !== undefined)
			{
				targetRoom.room_message.push(data);
			}
		});

		

		return function cleanup() {		
			if (socket !== undefined)
			{
				socket.off('RECEIVE_MSG');
			}
		};
	}, [rooms, findRoomByName, socket]);

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
	}, [currentRoom, rooms, socket, rmRoom]);


	useEffect(() => {

		socket.connect();
		
		socket.on("disconnect", () => {
			setRooms([]); //clean rooms
			setCurrentRoom(undefined);
		  });

		return function cleanup() {
			if (socket !== undefined)
			{
				socket.disconnect();
			}
		};
	}, [socket])
	useEffect(() => {

		socket.on("JOINED_ROOM", (data: RoomJoined) => {
			if (data.status === 0 && data.room_name !== undefined)
			{
				addRoom(data.room_name, false);
				notify.addNotice(ELevel.info, "Room " + data.room_name + " joined", 3000);
			}
			else if (data.status_message !== undefined)
			{
				notify.addNotice(ELevel.error, data.status_message, 3000);
			}
		})

		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off('JOINED_ROOM');
			}
		};
	}, [socket, addRoom]);

	/**
	 * ***** Notification *****
	 */

	function addNotif(notif: INotif[])
	{
		setNotification(prev => {
			//notif.filter((n) => {return (!(prev.find((p) => (n.req_id && p.req_id && n.req_id === p.req_id))))});
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

	function rmFriendNotif(id: number)
	{
		setNotification(prev => {
			return prev.filter((o) => {
				return (!(o.type === ENotification.FRIEND_REQUEST && o.req_id === id));
			})
		});
	};

	useEffect(() => {
		socket.on('RECEIVE_NOTIF', (data : INotif[]) => {
			//addNotif(data);
		});
		
		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off('RECEIVE_NOTIF');
			}
		};
	}, [socket]);

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

	const isNotified = useCallback((req : number) => {
		return ((notification.find((n) => ( req === n.req_id))));
	}, [notification]);

	function rmDeadNotif(data : UserDataDto[])
	{
		setNotification((prev) => (prev.filter((n) => (!(n.type === ENotification.FRIEND_REQUEST && data.find((d) => ( d.reference_id === n.req_id)) === undefined)))))
	}

	useEffect(() => {
		socket.on('FRIEND_REQUEST_LIST', (data : UserDataDto[]) => {
			let not : INotif[];

			not = [];
			data.forEach((req) => {
				

				
				if (!isNotified(req.reference_id))
				{
					not.push({
						id: "",
						type: ENotification.FRIEND_REQUEST,
						req_id: req.reference_id,
						username: req.username
					});
				}
				
			})
			addNotif(not);

			setRequestList(data);
			
		});

		return function cleanup() {		
			if (socket !== undefined)
			{
				socket.off('FRIEND_REQUEST_LIST');
			}
		};

	}, [notification, isNotified, socket])

	useEffect(() => {
		rmDeadNotif(requestList);
	}, [requestList]);

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
		rmFriendNotif,
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