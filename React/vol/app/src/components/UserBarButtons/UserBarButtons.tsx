import BlockLogo from "../../ressources/images/forbidden.png";
import MuteLogo from "../../ressources/images/mute.png";
import BanLogo from "../../ressources/images/hammer.png";
import InviteLogo from "../../ressources/images/pvp.png";
import PromoteLogo from "../../ressources/images/promote.png";
import "./UserBarButtons.css";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import { RoomMuteDto, RoomPromoteDto, RoomBanDto } from "../../Common/Dto/chat/room";

interface Prop
{
	user_name: string;
}

interface promoteProp
{
	user_name: string;
	already_admin: boolean;
}

interface blockProp
{
	user_name: string;
	already_blocked: boolean;
}

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

export function BanUserButton(prop: Prop)
{
	const chtCtx = useChatContext();

	function onClick()
	{
		if (chtCtx.currentRoom !== undefined)
		{
			const dto : RoomBanDto =
			{
				room_name: chtCtx.currentRoom.room_name,
				user_name: prop.user_name,
			} 
			chtCtx.socket.emit('ROOM_BAN', dto);
		}
		console.log("user banned");
	}
	return (
		<button className="user_bar_button negative_user_button" onClick={onClick}><img alt="" src={BanLogo}/>ban</button>
	);
}

export function MuteUserButton(prop: Prop)
{
	const chtCtx = useChatContext();

	function onClick()
	{
		if (chtCtx.currentRoom !== undefined)
		{
			const dto : RoomMuteDto =
			{
				room_name: chtCtx.currentRoom.room_name,
				user_name: prop.user_name,
			} 
			chtCtx.socket.emit('ROOM_MUTE', dto);
		}
	}
	return (
		<button className="user_bar_button negative_user_button" onClick={onClick}><img alt="" src={MuteLogo}/>mute</button>
	);
}

//todo Friend part
export function BlockUserButton(prop: blockProp)
{
	//const chtCtx = useChatContext();

	function blockUser()
	{
		/*if (chtCtx.currentRoom !== undefined)
		{
			const dto :  =
			{
				room_name: chtCtx.currentRoom.room_name,
				user_name: prop.user_name,
			} 
			chtCtx.socket.emit('USER_BLOCK', dto);
		}*/
	}

	function unblockUser()
	{

	}

	if (prop.already_blocked)
	{
		return (
			<button className="user_bar_button positive_user_button" onClick={unblockUser}><img alt="" src={BlockLogo}/>unblock</button>
		);
	}
	else
	{
		return (
			<button className="user_bar_button negative_user_button" onClick={blockUser}><img alt="" src={BlockLogo}/>block</button>
		);
	}
}


export function PromoteUserButton(prop: promoteProp)
{
	const chtCtx = useChatContext();

	function promote()
	{
		if (chtCtx.currentRoom !== undefined)
		{
			const dto : RoomPromoteDto =
			{
				room_name: chtCtx.currentRoom.room_name,
				user_name: prop.user_name,
				isPromote: true,
			} 
			chtCtx.socket.emit('ROOM_PROMOTE', dto);
		}
		console.log("user promoted");
	}

	function demote()
	{
		console.log("todo demote");
	}

	if (prop.already_admin)
	{
		return (
			<button className="user_bar_button negative_user_button flipped" onClick={demote}><img alt="" src={PromoteLogo}/>demote</button>
		);
	}
	else
	{
		return (
			<button className="user_bar_button positive_user_button" onClick={promote}><img alt="" src={PromoteLogo}/>promote</button>
		);
	}
}