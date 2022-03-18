import React, {Component} from "react";
import "./Sidebar.css";
import Chat from "../Chat/Chat";
import Channels from "../Channels/Channels";
import Friends from "../Friends/Friends";
import { ProvideChat } from "./ChatContext/ProvideChat";

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

class Sidebar extends Component
{
	state = {tab: "channels"};

	handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({tab: event.target.value});
	}

	render()
	{
		return (

			<ProvideChat>
				<div id="sidebar">
					<input id="toggle" type="checkbox" />
					<label htmlFor="toggle"></label>
					<div id="actual_bar">
						<header>
							<input className="tab_button" type="radio" name="tab" id="friends" value="friends" onChange={this.handleChange}/>
							<label htmlFor="friends"></label>
							<input className="tab_button" type="radio" name="tab" id="channels" value="channels" onChange={this.handleChange} />
							<label htmlFor="channels"></label>
							<input className="tab_button" type="radio" name="tab" id="chats" value="chats" onChange={this.handleChange}  defaultChecked/>
							<label htmlFor="chats"></label>
						</header>
						<Content tab={this.state.tab} />
					</div>
				</div>
			</ProvideChat>
		);
	}
}

export default Sidebar;
