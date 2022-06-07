import React, { useEffect, useState } from "react";
import { Friend, BlockedUser } from "./Users/Users"
import { InfoNotification, InviteNotification, NewFriendNotification } from "./Notification/Notification"
import "./Friends.css";
import { INotif, useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import useInterval from "../../hooks/useInterval";
import { info } from "console";


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
		return <NewFriendNotification name={prop.notif.username} date={prop.notif.date} refId={prop.notif.refId!} id={prop.notif.id} />;
	else if (prop.notif.type === ENotification.GAME_REQUEST
			&& prop.notif.username !== undefined
			&& prop.notif.req_id !== undefined)
		return <InviteNotification name={prop.notif.username} date={prop.notif.date} refId={prop.notif.refId!} id={prop.notif.id} roomId={prop.notif.room_id} />;
	else if (prop.notif.type === ENotification.INFO
			&& prop.notif.content !== undefined)
		return <InfoNotification content={prop.notif.content} date={prop.notif.date}  id={prop.notif.id} />;
	return <></>;
}

//fix me status online, offline... not work
function Friends()
{
	const [online, setOnline] = useState<JSX.Element[]>([]);
	const [offline, setOffline] = useState<JSX.Element[]>([]);
	const {socket, friendsList, blockList, notification} = useChatContext();

	useInterval(() => {socket.emit("FRIEND_REQUEST_LIST");}, 2000);
	useInterval(() => {socket.emit("FRIEND_LIST");}, 2000);
	useInterval(() => {socket.emit("BLOCK_LIST");}, 2000);

	function addFriend(event: React.SyntheticEvent)
	{
		event.preventDefault();

		const target = event.target as typeof event.target & {
			name: {value: string};
		};

		if (target.name.value.length !== 0)
		{
			console.log("add friend with name: " + target.name.value);
			socket.emit('ADD_FRIEND_USERNAME', target.name.value);

			target.name.value = '';
		}
	}

	useEffect(() => {
		setOnline(
			friendsList.map((u, index) => {
				if (u.is_connected !== undefined && u.is_connected === true)
					return	<Friend
						key={u.reference_id + "_online" + u.infos.status}
						ref_id={u.reference_id}
						name={u.username}
						online={u.is_connected}
						infos={u.infos}/>
				else
					return  null! }))

		setOffline(friendsList.map((u, index) => {
				if (u.is_connected === undefined || u.is_connected === false)
					return	<Friend
						key={u.reference_id + "_offline"}
						ref_id={u.reference_id}
						name={u.username}
						online={u.is_connected || false}
						infos={u.infos}/>
				else
					return  null! }))

	}, [friendsList])


	return (
		<div id="Friends">
			<form id="add_friend_by_name_form" onSubmit={addFriend}>
				<div id="add_friend_title">Add a friend</div>
				<input id="add_friend_input" type="text"
					name="name" placeholder="username"/>
				<input id="add_friend_button" type="submit" value="Add"/>
			</form>

			<span className="friends_list_title">Notifications</span>
			<div className="friends_tab_list notifs_list">
				{notification.map((n, index) => {
					return <Notification key={index} notif={n} />
				}).reverse()}
			</div>

			<span className="friends_list_title">Friends</span>
			<div className="friends_tab_list friends_list">
				<div className="user_status_tab">Online</div>
					{online.map(e => {return e})}
				<div className="user_status_tab">Offline</div>
					{offline.map(e => {return e})}
			</div>

			<span className="friends_list_title">Blocked users</span>
			<div className="friends_tab_list blocked_list">
				{blockList.map((u) => (
					<BlockedUser key={u.reference_id}
						ref_id={u.reference_id}
						name={u.username} />
				))}
			</div>
		</div>
	);
}

export default Friends;
