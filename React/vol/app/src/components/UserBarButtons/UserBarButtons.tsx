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
	user_name: string
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
export function BlockUserButton(prop: Prop)
{
	//const chtCtx = useChatContext();

	function onClick()
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
	return (
		<button className="user_bar_button negative_user_button" onClick={onClick}><img alt="" src={BlockLogo}/>block</button>
	);
}


export function PromoteUserButton(prop: Prop)
{
	const chtCtx = useChatContext();

	function onClick()
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
	return (
		<button className="user_bar_button positive_user_button" onClick={onClick}><img alt="" src={PromoteLogo}/>promote</button>
	);
}