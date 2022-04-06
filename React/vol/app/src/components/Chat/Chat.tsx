import { useState } from "react";
import { useChatContext, ELevelInRoom } from "../Sidebar/ChatContext/ProvideChat";
import ChatTab from "../ChatTab/ChatTab";
import OwnerChannelSettings from "../OwnerChannelSettings/OwnerChannelSettings";
import ChannelSettings from "../ChannelSettings/ChannelSettings";
import ThisListIsEmpty from "../ThisListIsEmpty/ThisListIsEmpty";
import "./Chat.css";


function Chat()
{
	const chatCtx = useChatContext();
	const [currentTab, setCurrentTab] = useState<string>("chat");


	function Content() : JSX.Element
	{
		if (chatCtx.currentRoom !== undefined)
		{
			if (currentTab === "chat")
				return (<ChatTab />);
			else
			{
				if (chatCtx.currentRoom.user_level === ELevelInRoom.owner)
					return (<OwnerChannelSettings />);
				else
					return (<ChannelSettings />);
			}
		}
		else
			return (<ThisListIsEmpty text="Tu n'es pas dans un channel" />);
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>)
	{
		setCurrentTab(event.target.value);
	}

	return (
		<div id="chat">
			<header>
				<input className="chat_tab_button" type="radio"
					name="channels_tab" id="chat_tab"
					value="chat" onChange={handleChange} defaultChecked />
				<label htmlFor="chat_tab">Chat</label>
				<input className="chat_tab_button" type="radio"
					name="channels_tab" id="chat_settings"
					value="settings" onChange={handleChange} />
				<label htmlFor="chat_settings">settings</label>
			</header>
			<Content />
		</div>
	);
}

export default Chat;
