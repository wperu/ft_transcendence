import React, { useEffect, useState } from "react";
import { Friend, BlockedUser } from "./Users/Users"
import { InfoNotification, InviteNotification, NewFriendNotification } from "./Notification/Notification"
import "./Friends.css";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import useInterval from "../../hooks/useInterval";
import { UserDataDto } from "../../Common/Dto/chat/room";

//fix me status online, offline... not work
function Friends()
{
	const chtCtx = useChatContext();
	const [friendsList, setFriendsList] = useState<Array<UserDataDto>>([]);
	//const [blocks, setBlocks] = useState();

	useEffect(() => {

		chtCtx.socket.on('FRIEND_LIST', (data: UserDataDto[]) => {
			setFriendsList(data);
			console.log(data);
		});

		chtCtx.socket.emit("FRIEND_LIST");

	}, [])

	useInterval(() => {chtCtx.socket.emit("FRIEND_LIST");}, 1000);


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

						/*{friendsList.map((u, index) => (
						<Friend key={index} name={u.username} online={true}/>
					))}*/

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
				<InviteNotification name="michel" date="today" />
				<NewFriendNotification name="michel" date="today" />
				<InviteNotification name="jean abdul de la street" date="today" />
				<InfoNotification content="ceci est une info" date="today" />
				<InfoNotification content="ceci est une info dkslgabbj wjk 
					bfewhj hj fhjds Vfhj vfhjes bfh vF Hsv hjfdsv hfd jsvdh
					vfd hjs fhvhj vdfhsjv df mdr bite" date="today" />
				<InfoNotification content="ceci est une info" date="today" />
				<InfoNotification content="ceci est une info" date="today" />
				<InfoNotification content="ceci est une info" date="today" />
			</div>
			<span className="friends_list_title">Amis</span>
			<div className="friends_tab_list friends_list">
				<div className="user_status_tab">Online</div>

				<div className="user_status_tab">Offline</div>
				<Friend name="gilly" online={false}/>
				<Friend name="hilly" online={false}/>
				<Friend name="iilly" online={false}/>
				<Friend name="jilly" online={false}/>
				<Friend name="killy" online={false}/>
			</div>
			<span className="friends_list_title">Utilisateurs bloqués</span>
			<div className="friends_tab_list blocked_list">
				<BlockedUser name="a" />
				<BlockedUser name="a" />
				<BlockedUser name="a" />
				<BlockedUser name="a" />
				<BlockedUser name="a" />
				<BlockedUser name="a" />
				<BlockedUser name="fgerabgadjrf abFVHMWEgrfvsgnadbgrmfesvfbejfve666" />
				<BlockedUser name="a" />
				<BlockedUser name="a" />
				<BlockedUser name="a" />
				<BlockedUser name="a" />
				<BlockedUser name="z" />
			</div>
		</div>
	);
}

export default Friends;