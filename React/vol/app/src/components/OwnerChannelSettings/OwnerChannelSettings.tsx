import { useNotifyContext, ELevel } from "../NotifyContext/NotifyContext";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import ChannelUserList from "../ChannelUserList/ChannelUserList";
import "./OwnerChannelSettings.css"
import { memo, useCallback, useState } from "react";
import { RoomChangePassDTO } from "../../Common/Dto/chat/RoomRename";

function OwnerChannelSettings ()
{
	const {addNotice} = useNotifyContext();
	const {socket, currentRoom} = useChatContext();
	const style = { "--additional_settings_space": "30vh" } as React.CSSProperties;
	const [update, setUpdate] = useState<boolean>(false);

	const passwordSubmit = useCallback((event: React.SyntheticEvent) =>
	{
		event.preventDefault();
		const target = event.target as typeof event.target & {
			password: {value: string};
			password_repeat: {value :string};
		};
		if (target.password.value.length === 0)
			addNotice(ELevel.error, "You can't set an empty password", 3000);
		else if (target.password.value !== target.password_repeat.value)
			addNotice(ELevel.error, "Your entries must be identical", 3000);
		else
		{
			if (currentRoom)
			{
				currentRoom.protected = true;
				let data : RoomChangePassDTO =
				{
					id:			currentRoom.id,
					new_pass:	target.password.value,
				};
				socket.emit('ROOM_CHANGE_PASS', data);
				setUpdate(!update);
			}
			target.password.value = "";
			target.password_repeat.value = "";
		}
	}, [addNotice, socket, currentRoom, update])

	const removePassword = useCallback(() =>
	{
		if (currentRoom !== undefined)
		{
			currentRoom.protected = false;
			let data : RoomChangePassDTO =
			{
				id: currentRoom.id,
				new_pass: null!,
			};
			socket.emit('ROOM_CHANGE_PASS', data);
			setUpdate(!update);
		}
	}, [socket, currentRoom, update])

	return (
		<div id="channel_owner_settings" style={style}>
			<ChannelUserList />
			<PasswordSettings isProtected={currentRoom?.protected === true} passwordSubmit={passwordSubmit} removePassword={removePassword} />
		</div>
	);
}


const PasswordSettings = memo((prop : {isProtected: boolean, passwordSubmit: (event: React.SyntheticEvent) => void, removePassword: () => void }) =>
	{
		if (prop.isProtected === true)
		{
			return (
				<div id="password_channel_settings" onSubmit={prop.passwordSubmit}>
					<input type="button" value="Remove password protection" onClick={prop.removePassword}/>
					<form id="password_form">
						<input type="text" name="password" placeholder="Password" />
						<input type="text" name="password_repeat"
							placeholder="Confirm the password" />
						<input type="submit" value="Change the password" />
					</form>
				</div>
			);
		}
		else
		{
			return (
				<div id="no_password_channel_settings">
					<form id="password_form" onSubmit={prop.passwordSubmit}>
						<input type="text" name="password" placeholder="Password" />
						<input type="text" name="password_repeat"
							placeholder="Confirm the password" />
						<input type="submit" value="Add a password" />
					</form>
				</div>
			);
		}
	})


export default OwnerChannelSettings
