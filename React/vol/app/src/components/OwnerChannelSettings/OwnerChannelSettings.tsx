import { useNotifyContext, ELevel } from "../NotifyContext/NotifyContext";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import ChannelUserList from "../ChannelUserList/ChannelUserList";
import "./OwnerChannelSettings.css"
import { useState } from "react";
import { RoomChangePassDTO } from "../../Common/Dto/chat/RoomRename";

function OwnerChannelSettings ()
{
	const notify = useNotifyContext();
	const chatCtx = useChatContext();
	const style = { "--additional_settings_space": "30vh" } as React.CSSProperties;
	const [update, setUpdate] = useState<boolean>(false);

	function passwordSubmit(event: React.SyntheticEvent)
	{
		event.preventDefault();
		const target = event.target as typeof event.target & {
			password: {value: string};
			password_repeat: {value :string};
		};
		if (target.password.value.length == 0)
			notify.addNotice(ELevel.error, "You can't set an empty password", 3000);
		else if (target.password.value !== target.password_repeat.value)
			notify.addNotice(ELevel.error, "Your entries must be identical", 3000);
		else
		{
			if (chatCtx.currentRoom)
			{
				chatCtx.currentRoom.protected = true;
				let data : RoomChangePassDTO =
				{
					id:			chatCtx.currentRoom.id,
					new_pass:	target.password.value,
				};
				chatCtx.socket.emit('ROOM_CHANGE_PASS', data);
			}
			target.password.value = "";
			target.password_repeat.value = "";
			setUpdate(!update);
		}
	}
		
	function removePassword()
	{
		if (chatCtx.currentRoom !== undefined)
		{
			chatCtx.currentRoom.protected = false;
			let data : RoomChangePassDTO =
			{
				id: chatCtx.currentRoom.id,
				new_pass: null!,
			};
			chatCtx.socket.emit('ROOM_CHANGE_PASS', data);
			setUpdate(!update);
		}
	}

	function PasswordSettings()
	{
		if (chatCtx.currentRoom?.protected == true)
		{
			return (
				<div id="password_channel_settings" onSubmit={passwordSubmit}>
					<input type="button" value="Retirer le mot de passe" onClick={removePassword}/>
					<form id="password_form">
						<input type="text" name="password" placeholder="Mot de passe" />
						<input type="text" name="password_repeat"
							placeholder="Confirmez le mot de passe" />
						<input type="submit" value="Changer le mot de passe" />
					</form>
				</div>
			);
		}
		else
		{
			return (
				<div id="no_password_channel_settings">
					<form id="password_form" onSubmit={passwordSubmit}>
						<input type="text" name="password" placeholder="Mot de passe" />
						<input type="text" name="password_repeat"
							placeholder="Confirmez le mot de passe" />
						<input type="submit" value="Mettre un mot de passe" />
					</form>
				</div>
			);
		}
	}

	return (
		<div id="channel_owner_settings" style={style}>
			<ChannelUserList />
			<PasswordSettings />
		</div>
	);
}

export default OwnerChannelSettings