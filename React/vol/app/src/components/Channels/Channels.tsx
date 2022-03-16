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
			let room = chatCtx.rooms.find(o => (o.room_name === event.currentTarget.value));

			if (room === undefined)
			{
				let data : JoinRoomDto = {
					room_name: event.currentTarget.value, 
				}
				socket.emit('JOIN_ROOM', data);
				chatCtx.addRoom(data.room_name);
			}
			
			chatCtx.setCurrentRoom(event.currentTarget.value);
			event.currentTarget.value = '';
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
