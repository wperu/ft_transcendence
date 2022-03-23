import React from "react";
import { useChatContext, IRoom } from "../Sidebar/ChatContext/ProvideChat";
import { JoinRoomDto } from "../../interface/chat/chatDto";
import "./ChanCreationTab.css";
import { channel } from "diagnostics_channel";

function ChanCreationTab()
{
	const chatCtx = useChatContext();
	function CreateChan(event: React.SyntheticEvent)
	{
		event.preventDefault();
		const target = event.target as typeof event.target & {
			channel_name: {value: string};
			channel_visibility: {value :string};
			password: {value: string};
			is_protected: {value: boolean};
		};
		if (target.channel_name.value.length == 0)
		{
			alert("The new channel needs a name");
		}
		else
		{
			if (target.is_protected)
			{			
				console.log("protected by pass: " + target.password.value);
				var data: JoinRoomDto =
				{
					room_name: target.channel_name.value,
					password: target.password.value
				};
			}
			else
			{
				var data: JoinRoomDto = { room_name: target.channel_name.value };
			}
			chatCtx.socket.emit("JOIN_ROOM", data);
			chatCtx.rooms.push({room_name: target.channel_name.value, room_message: []});
			chatCtx.currentRoom = target.channel_name.value;
			alert("Channel " + target.channel_name.value + " créé");
			console.log("channel created. name: " + target.channel_name.value + " visibility: " + target.channel_visibility.value);
			target.channel_name.value = '';
			target.channel_visibility.value = '';
			target.password.value = '';
			target.is_protected.value = false;
		}
	}

	return (
		<form id="create_chan" onSubmit={CreateChan}>
			<div id="visibility_options">
				<input type="radio" name="channel_visibility" id="private_chan"
					value="private_chan" />
				<label htmlFor="private_chan">Privé</label>
				<input type="radio" name="channel_visibility" id="public_chan"
					value="public_chan" defaultChecked />
				<label htmlFor="public_chan">Publique</label>
			</div>
			<input id="channel_name_input" type="text" name="channel_name"
				placeholder="Nom du channel" />
			<div id="password_options">
				<div>
					Protéger par mot de passe
					<input type="checkbox" id="protected" name="is_protected" />
				</div>
				<input type="text" name="password" placeholder="Mot de passe"/>
			</div>
			<footer id="create_chan_validation">
				<input id="create_chan_button" type="submit"
					value="Créer le channel"/>
			</footer>
		</form>
	);
}

export default ChanCreationTab;
