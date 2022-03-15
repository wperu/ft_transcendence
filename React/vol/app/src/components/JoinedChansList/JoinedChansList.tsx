import React from "react";
import JoinedChan from "../JoinedChan/JoinedChan";
import "./JoinedChansList.css";



function Joined_chans_list()
{
	return (
		<div id="joined_chans">
			<JoinedChan name="chan a"/>
			<JoinedChan name="chan b"/>
			<JoinedChan name="chan c"/>
			<JoinedChan name="chan d"/>
			<JoinedChan name="chan e"/>
		</div>
	);
}

export default Joined_chans_list;
