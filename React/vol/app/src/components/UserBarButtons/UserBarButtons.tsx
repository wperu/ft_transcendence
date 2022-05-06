import BlockLogo from "../../ressources/images/forbidden.png";
import MuteLogo from "../../ressources/images/mute.png";
import BanLogo from "../../ressources/images/hammer.png";
import InviteLogo from "../../ressources/images/pvp.png";
import PromoteLogo from "../../ressources/images/promote.png";
import AddFriendLogo from "../../ressources/images/add-friend.png";
import AcceptInvitationLogo from "../../ressources/images/accept.png";
import ChatLogo from "../../ressources/images/chatting.png";
import "./UserBarButtons.css";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import { RoomMuteDto, RoomPromoteDto, RoomBanDto } from "../../Common/Dto/chat/room";

interface Prop
{
	user_name: string;
	refId: number;
	
}

interface muteProp extends Prop
{
	isMuted: boolean;
}

interface promoteProp
{
	user_name: string;
	already_admin: boolean;
	refId: number;
}


interface friendProp
{
	user_name: string;
	already_friend: boolean;
	refId: number;
}

interface blockProp
{
	user_name: string;
	already_blocked: boolean;
	refId: number;
}

interface gameInvitationProp
{
	src_name: string;
	refId: number;
}

interface dmProp
{
	name: string;
	refId: number;
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
				id: chtCtx.currentRoom.id,
				refId: prop.refId,
				expires_in: 50000,
				isBan: true,
			} 
			chtCtx.socket.emit('ROOM_BAN', dto);
		}
		console.log("user banned");
	}
	return (
		<button className="user_bar_button negative_user_button" onClick={onClick}><img alt="" src={BanLogo}/>ban</button>
	);
}

export function MuteUserButton(prop: muteProp)
{
	const chtCtx = useChatContext();

	function mute()
	{
		if (chtCtx.currentRoom !== undefined)
		{
			const dto : RoomMuteDto =
			{
				roomId: chtCtx.currentRoom.id,
				refId: prop.refId,
				isMute: true,
				expires_in: 10000,
			} 
			chtCtx.socket.emit('ROOM_MUTE', dto);
		}
	}

	function unmute()
	{
		if (chtCtx.currentRoom !== undefined)
		{
			const dto : RoomMuteDto =
			{
				roomId: chtCtx.currentRoom.id,
				refId: prop.refId,
				isMute: false,
				expires_in: -1,
			}
			chtCtx.socket.emit('ROOM_MUTE', dto);
		}
	}

	if (prop.isMuted)
		return (<button className="user_bar_button positive_user_button" onClick={unmute}><img alt="" src={MuteLogo}/>unmute</button>);
	return (<button className="user_bar_button negative_user_button" onClick={mute}><img alt="" src={MuteLogo}/>mute</button>);
}

//todo Friend part
export function BlockUserButton(prop: blockProp)
{
	const chtCtx = useChatContext();
	
	function blockUser()
	{
		chtCtx.rmFriendNotif(prop.refId);
		chtCtx.socket.emit('BLOCK_USER', prop.refId);
	}

	function unblockUser()
	{
		chtCtx.socket.emit('UNBLOCK_USER', prop.refId);
	}

	if (chtCtx.blockList.find((b) => (b.reference_id === prop.refId)))
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
				room_id: chtCtx.currentRoom.id,
				refId: prop.refId,
				isPromote: true,
			} 
			chtCtx.socket.emit('ROOM_PROMOTE', dto);
		}
		console.log("user promoted");
	}

	function demote()
	{
		if (chtCtx.currentRoom !== undefined)
		{
			const dto : RoomPromoteDto =
			{
				room_id: chtCtx.currentRoom.id,
				refId: prop.refId,
				isPromote: false,
			} 
			chtCtx.socket.emit('ROOM_PROMOTE', dto);
		}
	}

	if (prop.already_admin)
		return (<button className="user_bar_button negative_user_button flipped" onClick={demote}><img alt="" src={PromoteLogo}/>demote</button>);
	else
		return (<button className="user_bar_button positive_user_button" onClick={promote}><img alt="" src={PromoteLogo}/>promote</button>);
}

export function AddFriendButton(prop: friendProp)
{
	const chtCtx = useChatContext();

	function addFriend()
	{
		console.log(prop.user_name + " friend :D");

		chtCtx.rmFriendNotif(prop.refId);
		chtCtx.socket.emit('ADD_FRIEND', prop.refId);
	}
	
	function removeFriend()
	{
		console.log(prop.user_name + " not friend anymore");
		chtCtx.socket.emit('RM_FRIEND', prop.refId);
	}

	if (prop.already_friend)
	{
		return (
			<button className="user_bar_button negative_user_button" onClick={removeFriend}><img alt={AddFriendLogo} src={AddFriendLogo}/>unfriend</button>
		);
	}
	else
	{
		return (
			<button className="user_bar_button positive_user_button" onClick={addFriend}><img alt="" src={AddFriendLogo}/>friend</button>
		);
	}
}

export function AcceptGameInvitation(prop: gameInvitationProp)
{
	function accept()
	{
		console.log("accepted game invitation from " + prop.src_name)
	}
	return (
		<button className="user_bar_button positive_user_button" onClick={accept}><img alt="" src={AcceptInvitationLogo}/>play</button>
	);
}

export function DirectMessage(prop: dmProp)
{
	function goDM()
	{
		console.log("go dm avec " + prop.name)
	}
	return (
		<button className="user_bar_button positive_user_button" onClick={goDM}><img alt="" src={ChatLogo}/>DM</button>
	);
}
