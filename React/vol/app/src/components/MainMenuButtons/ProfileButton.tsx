import "./MainMenuButton.css";
import { useNotifyContext, ELevel } from "../NotifyContext/NotifyContext";

function ProfileButton ()
{
	const notify = useNotifyContext();

	function ProfileClick ()
	{
	}
	return <button className="main_menu_button" onClick={ProfileClick}>Mon Profil</button>;
}

export default ProfileButton;
