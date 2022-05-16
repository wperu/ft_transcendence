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
	
	function compare_arrays(array1: Array<any>, array2: Array<any>) {
		// if the other array is a falsy value, return
		if (!array1 || !array2)
			return false;
	
		// compare lengths - can save a lot of time 
		if (array1.length != array2.length)
			return false;
	
		for (var i = 0, l=array1.length; i < l; i++) {
			// Check if we have nested arrays
			if (array1[i] instanceof Array && array2[i] instanceof Array) {
				// recurse into the nested arrays
				if (!array1[i].equals(array2[i]))
					return false;
			}           
			else if (array1[i] != array2[i]) { 
				// Warning - two different object instances will never be equal: {x:20} != {x:20}
				return false;   
			}           
		}       
		return true;
	}

	useEffect(() => {
		socket.on("USER_LIST", (data: Array<UserRoomDataDto>) => {
			if (!compare_arrays(data, userList))
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

	// useInterval(() => {socket.emit("USER_LIST", currentRoom?.id);}, 2000);
	
	return (
		<div id="channel_users_list">
			<ul>
				<span className="chat_user_status_tab">Utilisateurs</span>
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
						return (null);
					}
				})}
				<span className="chat_user_status_tab">Bannis</span>
				{userList.map((user) => {
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
					{
						return (null);
					}
				})}
			</ul>
		</div>
	);
}

export default ChannelUserList