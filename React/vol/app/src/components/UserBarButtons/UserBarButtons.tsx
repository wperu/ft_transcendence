import BlockLogo from "../../ressources/images/forbidden.png";
import MuteLogo from "../../ressources/images/mute.png";
import BanLogo from "../../ressources/images/hammer.png";
import InviteLogo from "../../ressources/images/pvp.png";
import PromoteLogo from "../../ressources/images/promote.png";
import "./UserBarButtons.css";

export function InviteUserButton()
{
	function onClick()
	{
		console.log("user invited");
	}
	return (
		<button className="user_bar_button positive_user_button" onClick={onClick}><img alt="" src={InviteLogo}/>invite</button>
	);
}

export function BanUserButton()
{
	function onClick()
	{
		console.log("user banned");
	}
	return (
		<button className="user_bar_button negative_user_button" onClick={onClick}><img alt="" src={BanLogo}/>ban</button>
	);
}

export function MuteUserButton()
{
	function onClick()
	{
		console.log("user muted");
	}
	return (
		<button className="user_bar_button negative_user_button" onClick={onClick}><img alt="" src={MuteLogo}/>mute</button>
	);
}

export function BlockUserButton()
{
	function onClick()
	{
		console.log("user blocked");
	}
	return (
		<button className="user_bar_button negative_user_button" onClick={onClick}><img alt="" src={BlockLogo}/>block</button>
	);
}

export function PromoteUserButton()
{
	function onClick()
	{
		console.log("user promoted");
	}
	return (
		<button className="user_bar_button positive_user_button" onClick={onClick}><img alt="" src={PromoteLogo}/>promote</button>
	);
}