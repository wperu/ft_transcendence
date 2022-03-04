import React from "react";
import "./Sidebar.css";



function Sidebar() {
	return (
		<div id="sidebar">
			<input id="toggle" type="checkbox"/>
			<div id="actual_bar">
				<header>
					<input className="tab_button" type="radio" name="tab" id="friends" value="friends" defaultChecked/>
					<label htmlFor="friends"></label>
					<input className="tab_button" type="radio" name="tab" id="channels" value="channels" />
					<label htmlFor="channels"></label>
					<input className="tab_button" type="radio" name="tab" id="chats" value="chats" />
					<label htmlFor="chats"></label>
				</header>
			</div>
		</div>
	);
}

export default Sidebar;