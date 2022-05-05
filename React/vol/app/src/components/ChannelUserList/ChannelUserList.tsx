import { useEffect, useState } from "react";
import { UserRoomDataDto } from "../../Common/Dto/chat/room";
import useInterval from "../../hooks/useInterval";
import ChatUser from "../ChatUser/ChatUser";
import { useChatContext, ELevelInRoom } from "../Sidebar/ChatContext/ProvideChat";
import "./ChannelUserList.css"

function ChannelUserList ()
{
	const {socket, currentRoom} = useChatContext();
	const user_lvl = (currentRoom !== undefined ) ? currentRoom.user_level : ELevelInRoom.casual;
	const [userList, setUserList] = useState<Array<UserRoomDataDto>>([]);
	
	useEffect(() => {
		socket.on("USER_LIST", (data: Array<UserRoomDataDto>) => {
			setUserList(data);
			console.log(data);
		})

		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off("USER_LIST");
			}
		};
	}, []);

	useEffect(() => {
		socket.emit("USER_LIST", currentRoom?.id);
	}, [socket])

	useInterval(() => {socket.emit("USER_LIST", currentRoom?.id);}, 2000);


	
	return (
		<div id="channel_users_list">
			<ul>
				{userList.map((user, index) => (
 				<li key={user.reference_id}>
					<ChatUser
						isMuted={false}
						isBlockedByCurrentUser={false}
						targetUserLvl={user.level}
						targetUsername={user.username}
						refId={user.reference_id}
						currentUserLvl={user_lvl}
						 />
				</li>))}
			</ul>
		</div>
	);
}

export default ChannelUserList