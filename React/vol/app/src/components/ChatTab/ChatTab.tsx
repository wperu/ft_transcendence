import React, {KeyboardEvent, useState, useEffect, useRef} from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import { useChatContext, IRoom, ECurrentTab } from "../Sidebar/ChatContext/ProvideChat";
import { RcvMessageDto, SendMessageDto } from "../../interface/chat/chatDto";
import "./ChatTab.css"


function useInterval(callback: () => void, delay: number) {
	const savedCallback = useRef(callback);

	// Remember the latest callback.
	useEffect(() => {
	savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	useEffect(() => {
	function tick() {
		if (savedCallback !== undefined)
			savedCallback.current();
	}
	if (delay !== null) {
		let id = setInterval(tick, delay);
		return () => clearInterval(id);
	}
	}, [delay]);
}

function ChatTab ()
{
	const chatCtx = useChatContext();
	const [messages, setMessages] = useState<RcvMessageDto[]>([]);
	const [updated, setUpdated] = useState<Boolean>(false);

	let msg_list_ref = React.createRef<HTMLDivElement>();

	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if (chatCtx.socket !== undefined && chatCtx.currentRoom !== undefined 
			&& event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			let data : SendMessageDto =
			{
				message: event.currentTarget.value,
				room_name: chatCtx.currentRoom.room_name
			};
			chatCtx.socket.emit('SEND_MESSAGE', data);
			console.log("[CHAT] sending: " + event.currentTarget.value);
			event.currentTarget.value = '';
		}
	};

	function pressedQuit()
	{
		if (chatCtx.currentRoom !== undefined)
		{
			chatCtx.socket.emit("LEAVE_ROOM", chatCtx.currentRoom.room_name);
			setMessages([]);
			chatCtx.rooms.splice(chatCtx.rooms.findIndex((o) => {
				return (o.room_name === chatCtx.currentRoom?.room_name);
			}), 1);
			chatCtx.setCurrentRoom(undefined);
			chatCtx.setCurrentTab(ECurrentTab.channels);
		}
	}

	useEffect(() =>
	{
		if (chatCtx.currentRoom !== undefined
			&& chatCtx.currentRoom.room_message.length !== messages.length)
		{
			setMessages([...chatCtx.currentRoom.room_message]);
			setUpdated(true);
		}
	}, []);

	useInterval(() =>
	{
		if (chatCtx.currentRoom !== undefined
			&& chatCtx.currentRoom.room_message.length !== messages.length)
		{
			setMessages([...chatCtx.currentRoom.room_message]);
			setUpdated(true);
		}
	}, 200);


	useEffect( () =>
	{
		if (msg_list_ref.current && updated === true)
		{
			msg_list_ref.current.scrollTop = msg_list_ref.current.scrollHeight;
			setUpdated(false);
		}
	}, [updated]);

	return (
		<div id="ChatTab">
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
					placeholder={chatCtx.currentRoom === undefined ? "t'es pas dans une room :/" : "Envoyer un message dans " + chatCtx.currentRoom?.room_name}/>
			</footer>
		</div>
	);
}

export default ChatTab;