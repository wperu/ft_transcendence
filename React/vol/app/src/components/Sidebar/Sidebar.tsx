import React, {useState, useEffect} from "react";
import "./Sidebar.css";
import Chat from "../Chat/Chat";
import Channels from "../Channels/Channels";
import Friends from "../Friends/Friends";

type tabProp = {
	tab: string;
}

function Content(content: tabProp)
{
	if (content.tab === "chats")
		return (<Chat />);
	else if (content.tab === "friends")
		return (<Friends />);
	else
	return (<Channels />);
}

function Sidebar()
{
	const [state, setState] = useState<string>("channels");

	function handleChange(event: React.ChangeEvent<HTMLInputElement>)
	{
		setState(event.target.value);
	};

	return (
		<div id="sidebar">
			<input id="toggle" type="checkbox" />
			<label htmlFor="toggle"></label>
			<div id="actual_bar">
				<header>
					<input className="tab_button" type="radio"
						name="tab" id="friends" value="friends"
						onChange={handleChange} />
					<label htmlFor="friends"></label>
					<input className="tab_button" type="radio" 
						name="tab" id="channels" value="channels" 
						onChange={handleChange} defaultChecked/>
					<label htmlFor="channels"></label>
					<input className="tab_button" type="radio" 
						name="tab" id="chats" value="chats" 
						onChange={handleChange} />
					<label htmlFor="chats"></label>
				</header>
				<Content tab={state} />
			</div>
		</div>
	);
}

export default Sidebar;
