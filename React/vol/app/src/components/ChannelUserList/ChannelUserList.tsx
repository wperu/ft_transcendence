import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ChatUser from "../ChatUser/ChatUser";
import { useChatContext, ELevelInRoom } from "../Sidebar/ChatContext/ProvideChat";
import "./ChannelUserList.css"

function ChannelUserList ()
{
	const chatCtx = useChatContext();
	let user_lvl : ELevelInRoom = ELevelInRoom.casual;
	const [userList, setUserList] = useState<Array<string>>([]);
	
	useEffect(() => {
		chatCtx.socket.on("USER_LIST", (data: Array<string>) => {
			setUserList(data);
		})
		
		chatCtx.socket.emit("USER_LIST", chatCtx.currentRoom?.room_name);

		return function cleanup() {
			if (chatCtx.socket !== undefined)
			{
				chatCtx.socket.off("USER_LIST");
			}
		};
	}, [userList]);


	if (chatCtx.currentRoom)
		user_lvl = chatCtx.currentRoom.user_level;
	return (
		<div id="channel_users_list">
			{userList.map((name) => (<ChatUser username={name} currentUserLvl={user_lvl}/>))}
		</div>
	);
}

export default ChannelUserList