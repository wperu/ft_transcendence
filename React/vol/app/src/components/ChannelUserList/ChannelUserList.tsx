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
	const [users, setUsers] = useState<JSX.Element[]>([]);
	const [ban, setBanned] = useState<JSX.Element[]>([]);


	useEffect(() => {
		socket.on("USER_LIST", (data: Array<UserRoomDataDto>) => {
				setUserList(data);
		})

		return function cleanup() {
			if (socket !== undefined)
			{
				socket.off("USER_LIST");
			}
		};
	}, [socket, userList]);

	useEffect(() => {
		socket.emit("USER_LIST", currentRoom?.id);
	}, [socket, currentRoom?.id])


	/*useEffect(() => {
		setUsers(
			userList.map((user) => {
				if (!user.isBan)
				{
					return (
							<ChatUser key={user.reference_id}
							isBlockedByCurrentUser={false}
							targetUserLvl={user.level}
							targetUsername={user.username}
							refId={user.reference_id}
							currentUserLvl={user_lvl}
							isMuted={user.isMuted}
							isDm={currentRoom !== undefined? currentRoom.isDm : false}
							isBanned={false}/>
						);
				}
				else
				{
					return (null!);
				}
			})
		)
		
		setBanned(
			userList.map((user) => {
				if (user.isBan)
				{
					return (
							<ChatUser key={user.reference_id}
							isBlockedByCurrentUser={false}
							targetUserLvl={user.level}
							targetUsername={user.username}
							refId={user.reference_id}
							currentUserLvl={user_lvl}
							isMuted={user.isMuted}
							isDm={currentRoom !== undefined? currentRoom.isDm : false}
							isBanned={true}
							/>
						);
				}
				else
					return (null!);
			})
		)
	}, [userList])*/

	// useInterval(() => {socket.emit("USER_LIST", currentRoom?.id);}, 2000);

	return (
		<div id="channel_users_list">
			<ul>
				<span className="chat_user_status_tab">Users</span>
				{userList.map((user) => {
					if (!user.isBan)
					{
						return (
								<ChatUser key={user.reference_id}
								isBlockedByCurrentUser={false}
								targetUserLvl={user.level}
								targetUsername={user.username}
								refId={user.reference_id}
								currentUserLvl={user_lvl}
								isMuted={user.isMuted}
								isDm={currentRoom !== undefined? currentRoom.isDm : false}
								isBanned={false}/>
							);
					}
					else
					{
						return (null!);
					}
				})
				}
				<span className="chat_user_status_tab">Banned users</span>
				{}
			</ul>
		</div>
	);
}

export default ChannelUserList
