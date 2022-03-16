import React, {KeyboardEvent, useEffect, useState} from "react";
import { io, Socket } from "socket.io-client";
import { JoinRoomDto, RcvMessageDto, SendMessageDto } from "../../interface/chat/chatDto";
import ChatMessage from "../ChatMessage/ChatMessage";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./Chat.css";



interface IState
{
	data : Array<JSX.Element>;
}

function Chat()
{
	const [socket, setSocket] = useState(useChatContext().socket);
	const [room, setRoom] = useState<string | undefined>(useChatContext().currentRoom);
	const [msgLst, setMsgLst] = useState<Array<string>>([]);
	const chatCtx = useChatContext();

	//Todo array of msg
	function addMsg(content : any) : void
	{
		setMsgLst(prevMsgLst => (
			[...prevMsgLst, content]
		));
	};

	//todo cancel socket.on() in cleanup()
	useEffect(() => {
		console.log("useEffect");

		
		if (socket !== undefined)
		{
			
			console.log("Connection status : " + socket.connected);

			socket.on('RECEIVE_MSG', (data : RcvMessageDto) => {
				console.log("[CHAT] rcv: ", data);
				addMsg(data.message);
			});
		}

	}, []);

	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		
		if (event.key === "Enter" && chatCtx.currentRoom !== undefined)
		{
			console.log("[CHAT] sending: " + event.currentTarget.value);
			
			let data : SendMessageDto = {
				message: event.currentTarget.value,
				room_name: chatCtx.currentRoom,
			};

			if (socket !== undefined)
				socket.emit('SEND_MESSAGE', data);
			console.log("msg : " + msgLst.length);
			event.currentTarget.value = '';
		}
		
	};
	
	return (
		<div id="chat">
			<div id="messages_list" >
			<ul>
				{msgLst.map((el, i) => <li key={i}>{<ChatMessage src_name="a" content={el} time="12/34/56 à 12h34" />}</li>)}
			</ul>
			</div>
			<footer id="msg_footer">
				<input type="text" id="message_input" placeholder={"send to " + chatCtx.currentRoom} onKeyPress={pressedSend}/>
				
			</footer>
		</div>
	);
}

export default Chat;
