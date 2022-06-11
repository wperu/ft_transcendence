import React, {KeyboardEvent, useState, useEffect, useCallback} from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import { useChatContext, ECurrentTab } from "../Sidebar/ChatContext/ProvideChat";
import useInterval from '../../hooks/useInterval';
import { RcvMessageDto, SendMessageDTO } from "../../Common/Dto/chat/room";
import "./ChatTab.css";

function ChatTab ()
{
	const {
		socket,
		currentRoom,
		setCurrentTab,
		invitePlayer,
		blockList,
	} = useChatContext();
	const [messages, setMessages] = useState<RcvMessageDto[]>([]);
	const [updated, setUpdated] = useState<Boolean>(false);

	let msg_list_ref = React.createRef<HTMLDivElement>();

	const pressedSend = useCallback((event: KeyboardEvent<HTMLInputElement>) =>	{
		if (socket !== undefined && currentRoom !== undefined
			&& event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			let data : SendMessageDTO =
			{
				message: event.currentTarget.value,
				room_id: currentRoom.id,
			};
			socket.emit('SEND_MESSAGE', data);
			console.log("[CHAT] sending: " + event.currentTarget.value);
			event.currentTarget.value = '';
		}
	}, [socket, currentRoom]);

	const pressedQuit = useCallback(() => {
		if (currentRoom !== undefined)
		{
			let dto = {
				id:		currentRoom.id,
				name:	currentRoom.room_name,
			}
			socket.emit("LEAVE_ROOM", dto);
			setMessages([]);
			setCurrentTab(ECurrentTab.channels);
		}
	}, [currentRoom, setCurrentTab, socket])

	const sendInvite = useCallback(() => 
	{
		if (currentRoom !== undefined)
		{
			invitePlayer(undefined, currentRoom.id);
		}
	}, [invitePlayer, currentRoom])

	useEffect(() =>
	{
		if (currentRoom !== undefined
			&& currentRoom.room_message.length !== messages.length)
		{
			setMessages([...currentRoom.room_message]);
			setUpdated(true);
		}
	}, [currentRoom, messages.length]);

	useInterval(() =>
	{
		if (currentRoom !== undefined
			&& currentRoom.room_message.length !== messages.length)
		{
			setMessages([...currentRoom.room_message]);
			setUpdated(true);
		}
	}, 200);


	useEffect( () =>
	{
		if (currentRoom)
			currentRoom.nb_notifs = 0;
		if (msg_list_ref.current && updated === true)
		{
			msg_list_ref.current.scrollTop = msg_list_ref.current.scrollHeight;
			setUpdated(false);
		}
	}, [updated, msg_list_ref, currentRoom]);

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
						if (blockList.find(b => (b.reference_id === refId)) === undefined)
							return <li key={index}><ChatMessage src_name={sender} content={message} time={send_date} refId={refId} /></li>
						return (null);
						})}
				</ul>
			</div>
			<footer id="msg_footer">
				<input type="text" id="message_input" onKeyPress={pressedSend}
					placeholder={currentRoom === undefined ? "you are not in a room :/" : "Send a message to " + currentRoom?.room_name}/>
			</footer>
		</div>
	);
}

export default ChatTab;
