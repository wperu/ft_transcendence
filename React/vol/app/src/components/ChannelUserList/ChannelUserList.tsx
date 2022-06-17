import { memo, useEffect, useState } from "react";
import { UserRoomDataDto } from "../../Common/Dto/chat/room";
import ChatUser from "../ChatUser/ChatUser";
import { chatContext, ELevelInRoom } from "../Sidebar/ChatContext/ProvideChat";
import "./ChannelUserList.css"


function ChannelUserList ()
{
	return (
		<chatContext.Consumer>
			{value => (<ChannelUserListTest currentRoom={value.currentRoom} socket={value.socket} ></ChannelUserListTest>)}
		</chatContext.Consumer>
	)
}


const ChannelUserListTest = memo((prop: {currentRoom: any, socket: any}) =>
{
	/*const {prop.socket, prop.currentRoom, /*friendsList} = useChatContext();*/
	const user_lvl = (prop.currentRoom !== undefined ) ? prop.currentRoom.user_level : ELevelInRoom.casual;
	const [userList, setUserList] = useState<Array<UserRoomDataDto>>([]);
	const [ban, setBanned] = useState<JSX.Element[]>([]);
	const [users, setUsers] = useState<JSX.Element[]>([]);

	useEffect(() => {
		prop.socket.on("USER_LIST", (data: Array<UserRoomDataDto>) => {
				setUserList(data);
		})

		return function cleanup() {
			if (prop.socket !== undefined)
			{
				prop.socket.off("USER_LIST");
			}
		};
	}, [prop.socket]);

	useEffect(() => {
		console.log("CALL USERLIST")
		prop.socket.emit("USER_LIST", prop.currentRoom?.id);
	}, [prop.socket, prop.currentRoom, prop.currentRoom?.id])


	useEffect(() => {

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
							isDm={prop.currentRoom !== undefined? prop.currentRoom.isDm : false}
							isBanned={false}
							/>
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
							isDm={prop.currentRoom !== undefined? prop.currentRoom.isDm : false}
							isBanned={true}
							/>
						);
				}
				else
					return (null!);
			})
		)
	}, [userList, prop.currentRoom, user_lvl])

	return (
		<div id="channel_users_list">
			<ul>
				<span className="chat_user_status_tab">Users</span>
				{users}
				<span className="chat_user_status_tab">Banned users</span>
				{ban}
			</ul>
		</div>
	);
})



export default ChannelUserList
