import BlockLogo from "../../ressources/images/forbidden_empty.png";
import MuteLogo from "../../ressources/images/forbidden_empty.png";
import BanLogo from "../../ressources/images/hammer.png";
import InviteLogo from "../../ressources/images/forbidden_empty.png";
import "./UserBarButtons.css";

export function InviteUserButton()
{
	function onClick()
	{
		console.log("user ivnited");
	}
	return (
		<button className="user_bar_button" onClick={onClick}><img src={InviteLogo}/></button>
	);
}


export function BanUserButton()
{
	function onClick()
	{
		console.log("user banned");
	}
	return (
		<button className="user_bar_button" onClick={onClick}><img src={BanLogo}/></button>
	);
}


export function MuteUserButton()
{
	function onClick()
	{
		console.log("user muted");
	}
	return (
		<button className="user_bar_button" onClick={onClick}><img src={MuteLogo}/></button>
	);
}


export function BlockUserButton()
{
	function onClick()
	{
		console.log("user blocked");
	}
	return (
		<button className="user_bar_button" onClick={onClick}><img src={BlockLogo}/></button>
	);
}