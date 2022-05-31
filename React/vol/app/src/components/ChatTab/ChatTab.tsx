import React, {KeyboardEvent, useState, useEffect} from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import { useChatContext, ECurrentTab } from "../Sidebar/ChatContext/ProvideChat";
import useInterval from '../../hooks/useInterval';
import { RcvMessageDto, SendMessageDTO } from "../../Common/Dto/chat/room";
import "./ChatTab.css";
import { GameInviteDTO } from "../../Common/Dto/chat/gameInvite";

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
			let data : SendMessageDTO =
			{
				message: event.currentTarget.value,
				room_id: chatCtx.currentRoom.id,
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
			let dto = {
				id:		chatCtx.currentRoom.id,
				name:	chatCtx.currentRoom.room_name,
			}
			chatCtx.socket.emit("LEAVE_ROOM", dto);
			setMessages([]);
			chatCtx.setCurrentTab(ECurrentTab.channels);
		}
	}

	function sendInvite()
	{
		if (chatCtx.currentRoom !== undefined)
		{
			let dto : GameInviteDTO = {
				gameRoomId: 0, //todo create room and send
				refId: undefined,
				chatRoomId: chatCtx.currentRoom.id,
			}
			chatCtx.socket.emit('GAME_INVITE', dto);
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
	}, [chatCtx.currentRoom, messages.length]);

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
		if (chatCtx.currentRoom)
			chatCtx.currentRoom.nb_notifs = 0;
		if (msg_list_ref.current && updated === true)
		{
			msg_list_ref.current.scrollTop = msg_list_ref.current.scrollHeight;
			setUpdated(false);
		}
	}, [updated, msg_list_ref, chatCtx.currentRoom]);

	return (
		<div id="ChatTab">
			<header id="chat_quick_options">
				<input type="button"
					name="chat_quick_leave" id="chat_quick_leave"
					value="Leave" onClick={pressedQuit} />
				<input type="button"
					name="chat_quick_invite" id="chat_quick_invite"
					value="Invite to play" onClick={sendInvite} />
			</header>
			<div id="messages_list" ref={msg_list_ref}>
				<ul>
				{
					messages.map(({message, sender, send_date, refId} , index) => {
						if (chatCtx.blockList.find(b => (b.reference_id === refId)) === undefined)
							return <li key={index}><ChatMessage src_name={sender} content={message} time={send_date} refId={refId} /></li>
						return (null);
						})}
				</ul>
			</div>
			<footer id="msg_footer">
				<input type="text" id="message_input" onKeyPress={pressedSend}
					placeholder={chatCtx.currentRoom === undefined ? "you are not in a room :/" : "Send a message to " + chatCtx.currentRoom?.room_name}/>
			</footer>
		</div>
	);
}

export default ChatTab;
