import React, { Component } from "react";
import GlobalChansList from "../GlobalChansList/GlobalChansList";
import JoinedChansList from "../JoinedChansList/JoinedChansList";
import "./Channels.css";

type tabProp = {
	tab: string;
}

function Content(content: tabProp)
{
	if (content.tab === "joined_chans")
		return (<JoinedChansList />);
	else
		return (<GlobalChansList />)
}

class Channels extends Component {
	state = {tab: "joined_chans"};

	handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({tab: event.target.value});
	}

	render()
	{
		return (
			<div id="channels">
				<header>
					<input className="channels_tab_button" type="radio"
						name="channels_tab" id="global_chans"
						value="global_chans" onChange={this.handleChange}/>
					<label htmlFor="global_chans">Global chans</label>
					<input className="channels_tab_button" type="radio"
						name="channels_tab" id="joined_chans"
						value="joined_chans" onChange={this.handleChange}
						defaultChecked/>
					<label htmlFor="joined_chans">Joined chans</label>
				</header>
				<Content tab={this.state.tab} />
			</div>
		);
	}
}

export default Channels;
