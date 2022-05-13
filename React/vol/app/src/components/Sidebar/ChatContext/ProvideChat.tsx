import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RoomJoinedDTO } from "../../../Common/Dto/chat/RoomJoined";
import { useAuth } from "../../../auth/useAuth";
import { RcvMessageDto, RoomLeftDto, UserDataDto, RoomUpdatedDTO} from "../../../Common/Dto/chat/room";
import { useNotifyContext } from "../../NotifyContext/NotifyContext";
import { NoticeDTO } from "../../../Common/Dto/chat/notice";

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

export enum JOINSTATUS
{
	JOIN = 0,
	ERROR = 1,
	CONNECT = 2,
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
	id:				number
	private:		boolean;
	protected:		boolean;
	user_level:		ELevelInRoom;
	room_name:		string;
	room_message:	RcvMessageDto[];
	isDm:			boolean;
	owner:			number;
	nb_notifs:		number;
}

interface IChatContext
{
	socket:			Socket;
	currentRoom?:	IRoom;

	setCurrentRoom:			(room: IRoom | undefined) => void;
	setCurrentRoomById:		(id: number) => void;
	findRoomById:			(id: number) => IRoom | undefined;
	
	rooms: IRoom[];
	//addRoom: (id: number, room_name: string, is_protected: boolean, level: ELevelInRoom) => void;

	notification:	INotif[];
	rmNotif:		(id: string) => void;
	rmFriendNotif: 	(id: number) => void;

	currentTab:		ECurrentTab;
	setCurrentTab:	(tab: ECurrentTab) => void;
	awaitDm:		(refId: number) => void;
	goToDmWith		(id: number) : boolean;

	friendsList:			Array<UserDataDto>;
	blockList:				Array<UserDataDto>;
	//RequestList:		Array<UserDataDto>;
}

function useChatProvider() : IChatContext
{
	const notify	= useNotifyContext();
	const [socket]	= useState(io(process.env.REACT_APP_WS_SCHEME + "://" + process.env.REACT_APP_ORIGIN, { path: "/api/socket.io/", transports: ['websocket'], autoConnect: false,
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
	const [jumpDm, awaitDm]					= useState<number | undefined>(undefined);

	/**
	 * ***** Room *****
	 */


	const goToDmWith = useCallback((id: number) => {
		const res = rooms.find((r) => (r.isDm === true && r.owner === id));
		
		if (res === undefined)
			return false;
		setCurrentRoom(res);
		setCurrentTab(ECurrentTab.chat);
		return true;
	}, [rooms])

	const setCurrentRoomById = useCallback((id: number) => {
		setCurrentRoom(rooms.find(o => {
			return (o.id === id);
		}));
	}, [rooms]);
	
    const addRoom = useCallback((room: RoomJoinedDTO) => {
		const newRoom : IRoom = {
			id: room.id,
			user_level: room.level,
			room_name: room.room_name,
			room_message: [],
			private: false, //fix me ?!
			protected: room.protected,
			isDm: room.isDm,
			owner: room.owner,
			nb_notifs: 0,
		};
		
		setRooms(prevRooms => { return ([...prevRooms, newRoom]); });
		if (currentRoom !== undefined)
			setCurrentRoomById(currentRoom.id);

    }, [currentRoom, setCurrentRoomById]);


	const rmRoom = useCallback((id: number) => {
		setRooms(prev => {
			return prev.filter((o) => {
				return (o.id !== id);
			})
		});
	}, []);

	const findRoomById = useCallback((id: number) => 
	{
		return (rooms.find(o => {
			return (o.id === id);
		}));
	}, [rooms]);

	useEffect(() => {
		if (jumpDm !== undefined)
		{
			const room = rooms.find(r => (r.isDm === true && r.owner === jumpDm))
			if (room !== undefined)
			{
				setCurrentRoomById(room.id);
				setCurrentTab(ECurrentTab.chat);
				awaitDm(undefined);
			}
		}
	}, [jumpDm, rooms, setCurrentRoomById])

	useEffect(() => {
		
		socket.on('RECEIVE_MSG', (data : RcvMessageDto) => {
			let targetRoom = findRoomById(data.room_id);
			if (targetRoom !== undefined)
			{
				targetRoom.room_message.push(data);
				targetRoom.nb_notifs++;
			}
		});

		return function cleanup() {		
			if (socket !== undefined)
			{
				socket.off('RECEIVE_MSG');
			}
		};
	}, [rooms, findRoomById, socket]);

	useEffect(() => {
		socket.on("LEFT_ROOM", (data: RoomLeftDto) => {
			if (currentRoom !== undefined && currentRoom.id === data.id)
				setCurrentRoom(undefined);
			if (data.id !== undefined)
				rmRoom(data.id);
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
			awaitDm(undefined);
		  });

		return function cleanup() {
			if (socket !== undefined)
			{
				socket.disconnect();
			}
		};
	}, [socket])

	useEffect(() => {

		socket.on("JOINED_ROOM", (data: RoomJoinedDTO) => {
			addRoom(data);
		});

		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off('JOINED_ROOM');
			}
		};
	}, [socket, addRoom]);

	useEffect(() => {
		socket.on("UPDATE_ROOM", (data: RoomUpdatedDTO) => {
			//todo for each modification
			let refR = findRoomById(data.id);
			if (refR !== undefined)
			{
				if (data.isPrivate !== undefined) refR.private = data.isPrivate;
				if (data.name !== undefined) refR.room_name = data.name;
				if (data.level !== undefined) refR.user_level = data.level;
			}

		});

		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off('ROOM_UPDATE');
			}
		};
	}, [rooms, socket])

	/**
	 * **** Notice *****
	 */

	 
	useEffect(() => {
		socket.on('NOTIFICATION', (data : NoticeDTO) => {
			notify.addNotice(data.level, data.content, 3000);
		});
		
		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off('NOTIFICATION');
			}
		};
	}, [socket, notify]);

	/**
	 * ***** Notification *****
	 */

	const addNotif = useCallback((notif: INotif[]) =>{
		setNotification(prev => {
			//notif.filter((n) => {return (!(prev.find((p) => (n.req_id && p.req_id && n.req_id === p.req_id))))});
			return [...prev, ...notif];
		});
	}, []);

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
			addNotif(data);
		});
		
		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off('RECEIVE_NOTIF');
			}
		};
	}, [socket, addNotif]);

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

	}, [notification, isNotified, socket, addNotif])

	useEffect(() => {
		rmDeadNotif(requestList);
	}, [requestList]);

    return({
		socket,
		currentRoom,
		setCurrentRoom,
		setCurrentRoomById,
		findRoomById,
		currentTab,
		setCurrentTab,
	    rooms,
	   // addRoom,
		notification,
		rmNotif,
		rmFriendNotif,
		awaitDm,
		goToDmWith,
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