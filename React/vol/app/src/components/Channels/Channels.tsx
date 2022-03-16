import React, { useState, KeyboardEvent, useEffect } from "react";
import { JoinRoomDto } from "../../interface/chat/chatDto";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./Channels.css";

function Channels()
{
	const [socket, setSocket] = useState(useChatContext().socket);
	const chatCtx = useChatContext();

	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if (event.key === "Enter")
		{
			let data : JoinRoomDto = {
				room_name: event.currentTarget.value, 
			}
			socket.emit('JOIN_ROOM', data);
			chatCtx.setCurrentRoom(data.room_name);
		}
	};


	return (
		<div id="Channels">
			chans
			<footer id="msg_footer">
				<input type="text" id="message_input" placeholder="placeholder" onKeyPress={pressedSend}/>
			</footer>
		</div>
	);
}

export default Channels;
