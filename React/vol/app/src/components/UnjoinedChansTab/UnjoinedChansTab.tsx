import React, { useState, useEffect, useRef } from "react";
import UnjoinedChan from "../UnjoinedChan/UnjoinedChan";
import { useChatContext, IRoom } from "../Sidebar/ChatContext/ProvideChat";
import { JoinRoomDto } from "../../interface/chat/chatDto";

import "./UnjoinedChansTab.css";

function UnjoinedChansTab()
{
	const chatCtx = useChatContext();

	const [roomList, setRoomList] = useState<Array<{name: string, has_password: boolean}>>([]);
	
	useEffect(() => {
		chatCtx.socket.on("ROOM_LIST", (data: Array<{name: string, has_password: boolean}>) => {
			setRoomList(data);
		})
		
		chatCtx.socket.emit("ROOM_LIST");

		return function cleanup() {
			if (chatCtx.socket !== undefined)
			{
				chatCtx.socket.off("ROOM_LIST");
			}
		};
	}, [roomList]);

	function joinChan(event: React.SyntheticEvent)
	{
		event.preventDefault();

		const target = event.target as typeof event.target & {
			name: {value: string};
			password: {value: string};
		};

		if (target.name.value.length != 0)
		{
			var data: JoinRoomDto;
			if (target.password.value.length > 0)
			{			
				console.log("protected by pass: " + target.password.value);
				data =
				{
					room_name: target.name.value,
					password: target.password.value
				};
			}
			else
			{
				data = { room_name: target.name.value };
			}
			chatCtx.socket.emit("JOIN_ROOM", data);
			target.name.value = '';
			target.password.value = '';
		}
	}
	return (
		<div id="join_chans_tab">
			<div id="join_chan_by_name">
				<div className="title">
					Rejoindre un channel
				</div>
				<form  onSubmit={joinChan}>
					<div id="join_chan_by_name_inputs">
						<input className="join_chan_input" type="text"
							name="name" placeholder="Nom du channel"/>
						<input className="join_chan_input" type="password"
							name="password" placeholder="Mot de passe (si nécessaire)"/>
					</div>
					<input id="join_chan_button" type="submit" value="Rejoindre"/>
				</form>
			</div>
			<div id="globlal_chans_list">
				<div className="title">
					Liste globale des channels
				</div>
				{roomList.map(( element ) => (<UnjoinedChan name={element.name} is_protected={element.has_password} />))}
			</div>
		</div>
	);
}

export default UnjoinedChansTab;
