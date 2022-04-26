import React, { useEffect, useState } from "react";
import { Friend, BlockedUser } from "./Users/Users"
import { InfoNotification, InviteNotification, NewFriendNotification } from "./Notification/Notification"
import "./Friends.css";
import { INotif, useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import useInterval from "../../hooks/useInterval";
import { UserDataDto } from "../../Common/Dto/chat/room";

enum ENotification
{
	INFO,
	GAME_REQUEST,
	FRIEND_REQUEST
}
interface IProp
{
	notif: INotif;
}

function Notification(prop : IProp) : JSX.Element
{
	if (prop.notif.type === ENotification.FRIEND_REQUEST
		&& prop.notif.username !== undefined
		&& prop.notif.req_id !== undefined)
		return <NewFriendNotification name={prop.notif.username} date="today" refId={prop.notif.req_id} />;
	else if (prop.notif.type === ENotification.GAME_REQUEST
			&& prop.notif.username !== undefined
			&& prop.notif.req_id !== undefined)
		return <InviteNotification name={prop.notif.username} date="today" refId={prop.notif.req_id} />;
	else if (prop.notif.type === ENotification.INFO
			&& prop.notif.content !== undefined)
		return <InfoNotification content={prop.notif.content} date="today" />;	
	return <></>;
}

//fix me status online, offline... not work
function Friends()
{
	const chtCtx = useChatContext();
	const [friendsList, setFriendsList] = useState<Array<UserDataDto>>([]);
	const [blockList, setBlockList] = useState<Array<UserDataDto>>([]);
	//const [blocks, setBlocks] = useState();

	useEffect(() => {

		chtCtx.socket.on('FRIEND_LIST', (data: UserDataDto[]) => {
			setFriendsList(data);
		});

		chtCtx.socket.emit("FRIEND_LIST");

		chtCtx.socket.on('BLOCK_LIST', (data: UserDataDto[]) => {
			setBlockList(data);
		});

		chtCtx.socket.emit("BLOCK_LIST");

	}, [])

	useInterval(() => {chtCtx.socket.emit("FRIEND_LIST");}, 1000);
	useInterval(() => {chtCtx.socket.emit("BLOCK_LIST");}, 1000);


	function addFriend(event: React.SyntheticEvent)
	{
		event.preventDefault();

		const target = event.target as typeof event.target & {
			name: {value: string};
		};

		if (target.name.value.length !== 0)
		{
			console.log("add friend with name: " + target.name.value);
			target.name.value = '';
		}
	}

						/**/

	return (
		<div id="Friends">
			<form id="add_friend_by_name_form" onSubmit={addFriend}>
				<div id="add_friend_title">Ajouter un ami</div>
				<input id="add_friend_input" type="text"
					name="name" placeholder="Nom du fdp"/>
				<input id="add_friend_button" type="submit" value="Ajouter"/>
			</form>
			<span className="friends_list_title">Notifications</span>
			<div className="friends_tab_list notifs_list">
				{chtCtx.notification.map((n, index) => {return <Notification key={index} notif={n} />})}
			</div>
			<span className="friends_list_title">Amis</span>
			<div className="friends_tab_list friends_list">
				<div className="user_status_tab">Online</div>
				{friendsList.map((u, index) => ( (u.is_connected !== undefined && u.is_connected !== false) ? <Friend key={u.reference_id} ref_id={u.reference_id} name={u.username} online={u.is_connected}/> : null ))}
				<div className="user_status_tab">Offline</div>
				{friendsList.map((u, index) => ( (u.is_connected !== undefined && u.is_connected === false) ? <Friend key={u.reference_id} ref_id={u.reference_id} name={u.username} online={u.is_connected}/> : null ))}
			</div>
			<span className="friends_list_title">Utilisateurs bloqués</span>
			<div className="friends_tab_list blocked_list">
				{blockList.map((u) => (<BlockedUser key={u.reference_id} ref_id={u.reference_id} name={u.username} /> ))}
			</div>
		</div>
	);
}

export default Friends;