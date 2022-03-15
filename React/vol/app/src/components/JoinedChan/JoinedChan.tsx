import React from "react";
import "./JoinedChan.css";

interface	chan_props
{
	name: string;
}

function JoinedChan(props: chan_props)
{
	return (
		<div className="joined_chan">
			<input id={"connect_chan" + props.name} type="button"/>
			<label htmlFor={"connect_chan" + props.name}>{props.name}</label>
		</div>
	);
}

export default JoinedChan;
