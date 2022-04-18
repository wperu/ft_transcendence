import "./MainMenuButton.css";
import { useNotifyContext, ELevel } from "../NotifyContext/NotifyContext";

function ProfileButton ()
{
	const notify = useNotifyContext();

	function ProfileClick ()
	{
		notify.addNotice(ELevel.info, "Have a nice day :D", 3000);
	}
	return <button className="main_menu_button" onClick={ProfileClick}>Mon Profil</button>;
}

export default ProfileButton;
