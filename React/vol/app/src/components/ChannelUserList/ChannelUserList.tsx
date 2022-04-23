import { useEffect, useState } from "react";
import { UserDataDto } from "../../Common/Dto/chat/room";
import useInterval from "../../hooks/useInterval";
import ChatUser from "../ChatUser/ChatUser";
import { useChatContext, ELevelInRoom } from "../Sidebar/ChatContext/ProvideChat";
import "./ChannelUserList.css"

function ChannelUserList ()
{
	const chatCtx = useChatContext();
	let user_lvl : ELevelInRoom = ELevelInRoom.casual;
	const [userList, setUserList] = useState<Array<UserDataDto>>([]);
	
	useEffect(() => {
		chatCtx.socket.on("USER_LIST", (data: Array<UserDataDto>) => {
			setUserList(data);
			console.log(data);
		})
		
		

		return function cleanup() {
			if (chatCtx.socket !== undefined)
			{
				chatCtx.socket.off("USER_LIST");
			}
		};
	}, []);

	useEffect(() => {
		chatCtx.socket.emit("USER_LIST", chatCtx.currentRoom?.room_name);
	}, [chatCtx.socket])

	useInterval(() => {chatCtx.socket.emit("USER_LIST", chatCtx.currentRoom?.room_name);}, 1000);


	if (chatCtx.currentRoom)
		user_lvl = chatCtx.currentRoom.user_level;
	return (
		<div id="channel_users_list">
			<ul>
				{userList.map((user, index) => (
 				<li key={index}>
				 	<ChatUser isBlockedByCurrentUser={false} targetUserLvl={ELevelInRoom.casual} targetUsername={user.username} refId={user.reference_id} currentUserLvl={user_lvl}/>
				</li>))}
			</ul>
		</div>
	);
}

export default ChannelUserList