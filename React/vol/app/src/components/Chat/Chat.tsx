import React, {KeyboardEvent, useState, useEffect, useRef} from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import { useChatContext, IRoom } from "../Sidebar/ChatContext/ProvideChat";
import { RcvMessageDto, SendMessageDto } from "../../interface/chat/chatDto";
import "./Chat.css";
import { cursorTo } from "readline";

function Chat()
{
	const chatCtx = useChatContext();
	const chatCtxRef = useRef(useChatContext());
	const [socket, setSocket] = useState(chatCtx.socket);
	const [messages, setMessages] = useState<RcvMessageDto[] >([]);

	let msg_list_ref = React.createRef<HTMLDivElement>();
	
	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if (socket !== undefined && chatCtx.currentRoom !== undefined 
			&& event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			let data : SendMessageDto =
			{
				message: event.currentTarget.value,
				room_name: chatCtx.currentRoom.room_name
			};
			console.log(chatCtx.rooms);
			socket.emit('SEND_MESSAGE', data);
			console.log("[CHAT] sending: " + event.currentTarget.value);
			event.currentTarget.value = '';
		}
	};

	function pressedQuit()
	{
		if (chatCtx.currentRoom !== undefined)
		{
			socket.emit("LEAVE_ROOM", chatCtx.currentRoom.room_name);
			setMessages([]);
			chatCtx.rooms.splice(chatCtx.rooms.findIndex((o) => {
				return (o.room_name === chatCtx.currentRoom?.room_name);
			}), 1);
			console.log(chatCtx.rooms.length);
			chatCtx.setCurrentRoom(undefined);
		}
	};

	function update () {return (chatCtx.currentRoom?.room_message.length);}

	useEffect( () =>
	{
		if (chatCtx.currentRoom !== undefined)
			setMessages([...chatCtx.currentRoom.room_message]);
	}, [update]);

	useEffect( () =>
	{
		if (msg_list_ref.current)
		{
			msg_list_ref.current.scrollTop = msg_list_ref.current.scrollHeight;
		}
	});
	
	return (
		<div id="chat">
			<header id="chat_quick_options">
				<input type="button"
					name="chat_quick_leave" id="chat_quick_leave"
					value="Quitter" onClick={pressedQuit} />
				<input type="button"
					name="chat_quick_invite" id="chat_quick_invite"
					value="Inviter à jouer" />
			</header>
			<div id="messages_list" ref={msg_list_ref}>
				{messages.map(({message, sender, send_date}) => (<ChatMessage src_name={sender} content={message} time={send_date} />))}
			</div>
			<footer id="msg_footer">
				<input type="text" id="message_input" onKeyPress={pressedSend} 
					placeholder={chatCtx.currentRoom === undefined ? "t'es pas dans une room :/" : "Envoyer un message dans " + chatCtx.currentRoom.room_name}/>
				
			</footer>
		</div>
	);
}

export default Chat;
