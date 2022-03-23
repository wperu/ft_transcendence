import React, {useState} from "react";
import JoinedChan from "../JoinedChan/JoinedChan";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./JoinedChansList.css";



function Joined_chans_list()
{
	const chatCtx = useChatContext();
	const [currentRoom, setCurrentRoom] = useState<string | undefined>(chatCtx.currentRoom);
	const [socket, setSocket] = useState(chatCtx.socket);

	return (
		<div id="joined_chans_list">
			{chatCtx.rooms.map(({room_name}) => <JoinedChan name={room_name}/> )}
		</div>
	);
}

export default Joined_chans_list;
