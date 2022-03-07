import React, {Component} from "react";
import "./Sidebar.css";
import Chat from "../Chat/Chat";
import Channels from "../Channels/Channels";
import Friends from "../Friends/Friends";

function Content(props)
{
	if (props.tab == "chats")
		return (<Chat />);
	else if (props.tab == "channels")
		return (<Channels />);
	else
		return (<Friends />)
}

class Sidebar extends Component
{
	state = {tab: ""};

	handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.state.tab = event.target.value;
	}

	render()
	{
		return (
			<div id="sidebar">
				<input id="toggle" type="checkbox"/>
				<label htmlFor="toggle"></label>
				<div id="actual_bar">
					<header>
						<input className="tab_button" type="radio" name="tab" id="friends" value="friends" onChange={this.handleChange} defaultChecked/>
						<label htmlFor="friends"></label>
						<input className="tab_button" type="radio" name="tab" id="channels" value="channels" onChange={this.handleChange} />
						<label htmlFor="channels"></label>
						<input className="tab_button" type="radio" name="tab" id="chats" value="chats" onChange={this.handleChange} />
						<label htmlFor="chats"></label>
					</header>
					<Content tab={this.state.tab} />
				</div>
			</div>
		);
	}
}

export default Sidebar;