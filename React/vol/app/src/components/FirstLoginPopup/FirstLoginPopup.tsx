import Popup from "reactjs-popup";
import TwoFactorAuthSetting from "../../components/ProfileSettings/TFAsetting/TFAsetting";
import ChangeablePP from "../../components/ProfileSettings/ChangeablePP/ChangeablePP";
import ChangeableUsername from "../../components/ProfileSettings/ChangeableUsername/ChangeableUsername";
import IUser from "../../Common/Dto/User/User";
import { useState } from "react";

interface popuprop
{
	isFirstTime : boolean;
	user : IUser;
}

function FirstLoginPopup(props: popuprop)
{
	const [open, setOpen] = useState<boolean>(props.isFirstTime);

	function close()
	{
		setOpen(false);
	}

	return (
		<Popup open={props.isFirstTime} onClose={close} modal>
			{<div className="mute_ban_popup">
				<div className="header"> Voulez vous éditer vos informations </div>
				<div className="content">
					<ChangeablePP user={props.user} />
					<ChangeableUsername user={props.user} />
					<TwoFactorAuthSetting user={props.user} is_active={true} />
				</div>
				<div className="actions">
					<input type="button" value="Close"
						onClick={close}/>
				</div>
			</div>}
		</Popup>
	);
}