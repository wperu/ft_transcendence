import React, { Component } from "react";
import UnjoinedChansTab from "../UnjoinedChansTab/UnjoinedChansTab";
import JoinedChansList from "../JoinedChansList/JoinedChansList";
import ChanCreationTab from "../ChanCreationTab/ChanCreationTab";
import "./Channels.css";

type tabProp = {
	tab: string;
}

function Content(content: tabProp)
{
	if (content.tab === "joined_chans")
		return (<JoinedChansList />);
	else if (content.tab === "global_chans")
		return (<UnjoinedChansTab />);
	else
		return (<ChanCreationTab />);
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
						value="global_chans" onChange={this.handleChange} />
					<label htmlFor="global_chans">Global chans</label>
					<input className="channels_tab_button" type="radio"
						name="channels_tab" id="joined_chans"
						value="joined_chans" onChange={this.handleChange} defaultChecked/>
					<label htmlFor="joined_chans">Joined chans</label>
					<input className="channels_tab_button" type="radio"
						name="channels_tab" id="create_chan"
						value="create_chan" onChange={this.handleChange} />
					<label htmlFor="create_chan">Create chan</label>
				</header>
				<Content tab={this.state.tab} />
			</div>
		);
	}
}

export default Channels;
