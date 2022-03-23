import React, {KeyboardEvent, useState, useEffect} from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import { useChatContext, IRoom } from "../Sidebar/ChatContext/ProvideChat";
import { RcvMessageDto, SendMessageDto } from "../../interface/chat/chatDto";
import "./Chat.css";

function Chat()
{
	const chatCtx = useChatContext();
	const [socket, setSocket] = useState(chatCtx.socket);
	const [room, setRoom] = useState<string | undefined>(chatCtx.currentRoom);

	const [messages, setMessages] = useState<RcvMessageDto[]>([]);
	let msg_list_ref = React.createRef<HTMLDivElement>();
	
	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if (socket !== undefined && room !== undefined 
			&& event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			let data : SendMessageDto =
			{
				message: event.currentTarget.value,
				room_name: room
			};
			socket.emit('SEND_MESSAGE', data);
			console.log("[CHAT] sending: " + event.currentTarget.value);
			event.currentTarget.value = '';
		}
	};

	function pressedQuit()
	{
		function isMyRoom(elem: IRoom) :boolean
		{
			return (elem.room_name == room);
		};
		socket.emit("LEAVE_ROOM", room);
		setMessages([]);
		if (room !== undefined)
			chatCtx.rooms.splice(chatCtx.rooms.findIndex(isMyRoom), 1);
		console.log(chatCtx.rooms.length);
		setRoom(undefined);
		chatCtx.setCurrentRoom(undefined);
	};

	useEffect( () => 
	{
		let currentRoom = chatCtx.rooms.find(o => (o.room_name === room));
		if (currentRoom !== undefined && currentRoom.room_message)
			setMessages(currentRoom.room_message);
		if (socket !== undefined)
		{
			console.log("Connection status : " + socket.connected);
			socket.on('RECEIVE_MSG', (data : RcvMessageDto) => {
				if (currentRoom !== undefined)
				{
					console.log("[CHAT] rcv: ", data);
					currentRoom.room_message.push(data);
					setMessages([...currentRoom.room_message]);
				}
			});
		}
		return (() => {socket.off('RECEIVE_MSG')} );
	}, []);

	useEffect( () =>
	{
		if (msg_list_ref.current)
		{
			msg_list_ref.current.scrollTop = msg_list_ref.current.scrollHeight;
		}
	} );
	
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
					placeholder={room === undefined ? "t'es pas dans une room :/" : "Envoyer un message dans " + room}/>
				
			</footer>
		</div>
	);
}

export default Chat;
