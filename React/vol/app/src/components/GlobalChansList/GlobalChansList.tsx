import React from "react";
import UnjoinedChan from "../UnjoinedChan/UnjoinedChan";
import "./GlobalChansList.css";

function Global_chans_list()
{
	return (
		<div id="unjoined_chans_list">
			<UnjoinedChan />
			<UnjoinedChan />
			<UnjoinedChan />
			<UnjoinedChan />
			<UnjoinedChan />
			<UnjoinedChan />
		</div>
	)
}

export default Global_chans_list;
