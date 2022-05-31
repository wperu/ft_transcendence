import "./MainMenuButton.css";
import { useNotifyContext, ELevel } from "../NotifyContext/NotifyContext";

function ProfileButton ()
{
	const notify = useNotifyContext();

	function ProfileClick ()
	{
	}
	return <button className="main_menu_button" onClick={ProfileClick}>My Profile</button>;
}

export default ProfileButton;
