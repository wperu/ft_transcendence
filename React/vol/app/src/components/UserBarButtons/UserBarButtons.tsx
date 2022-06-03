import "./UserBarButtons.css";
import BlockLogo from "../../ressources/images/forbidden.png";
import MuteLogo from "../../ressources/images/mute.png";
import BanLogo from "../../ressources/images/hammer.png";
import InviteLogo from "../../ressources/images/pvp.png";
import PromoteLogo from "../../ressources/images/promote.png";
import AddFriendLogo from "../../ressources/images/add-friend.png";
import AcceptInvitationLogo from "../../ressources/images/accept.png";
import ChatLogo from "../../ressources/images/chatting.png";
import CloseLogo from "../../ressources/images/close.png";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import { RoomMuteDto, RoomPromoteDto, RoomBanDto, CreateRoomDTO } from "../../Common/Dto/chat/room";
import Popup from "reactjs-popup";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Prop
{
	user_name: string;
	refId: number;
}

interface muteProp extends Prop
{
	isMuted: boolean;
}

interface banProp extends Prop
{
	isBanned: boolean;
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

interface acceptGameInvitationProp
{
	src_name: string;
	refId: number;
	notifId: string;
	gameId: string | undefined;
}

interface dmProp
{
	name: string;
	refId: number;
}

interface gameInvitationProp
{
	refId: number;
}

interface refuseProp
{
	isRequestFriend:	boolean;
	refId:				number;
	id:					string;
}

export function InviteUserButton(prop: gameInvitationProp)
{
	const {invitePlayer}		= useChatContext();

	function onClick()
	{
		invitePlayer(prop.refId);
	}
	return (
		<button className="user_bar_button positive_user_button" onClick={onClick}><img alt="" src={InviteLogo}/>invite</button>
	);
}

export function BanUserButton(prop: banProp)
{
	const chtCtx = useChatContext();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [duration, setDuration] = useState<number>(0);

	function close()
	{
		setIsOpen(false);
	}

	function open()
	{
		setIsOpen(true);
	}

	const ban = useCallback(() => {
		if (chtCtx.currentRoom !== undefined)
		{
			const dto : RoomBanDto =
			{
				id: chtCtx.currentRoom.id,
				refId: prop.refId,
				expires_in: duration,
				isBan: true,
			}
			chtCtx.socket.emit('ROOM_BAN', dto);
		}
		close();
	}, [duration])

	function unban()
	{
		if (chtCtx.currentRoom !== undefined)
		{
			const dto : RoomBanDto =
			{
				id: chtCtx.currentRoom.id,
				refId: prop.refId,
				expires_in: -1,
				isBan: false,
			}
			chtCtx.socket.emit('ROOM_BAN', dto);
		}
		close();
	}

	if (!prop.isBanned)
	{
		return (
		<React.Fragment>
			<button className="user_bar_button negative_user_button" onClick={open}>
				<img alt="" src={BanLogo}/>
				ban
			</button>
			<Popup onClose={close} open={isOpen} modal>
				{<div className="mute_ban_popup">
					<div className="header"> Ban duration </div>
					<div className="content">
						<input type="number" min="1" placeholder="duration"
							value={duration} onChange={(e) => {
								setDuration(parseInt(e.target.value))
								}}
							/>
						hours
					</div>
					<div className="actions">
						<input type="button" value="cancel"
							onClick={close}/>
						<input type="button" value={"ban " + prop.user_name}
							onClick={ban}/>
					</div>
				</div>}
			</Popup>
		</React.Fragment>
		);
	}
	return (
		<React.Fragment>
			<button className="user_bar_button positive_user_button" onClick={open}>
				<img alt="" src={BanLogo}/>
				ban
			</button>
			<Popup open={isOpen} onClose={close} modal>
				{<div className="mute_ban_popup">
					<div className="header"> Are you sure ? </div>
					<div className="actions">
						<input type="button" value="cancel"
							onClick={close}/>
						<input type="button" value={"unban " + prop.user_name}
						onClick={unban}/>
					</div>
				</div>}
			</Popup>
		</React.Fragment>
	);
}

export function MuteUserButton(prop: muteProp)
{
	const chtCtx = useChatContext();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [duration, setDuration] = useState<number>(0);

	function close()
	{
		setIsOpen(false);
	}

	function open()
	{
		setIsOpen(true);
	}

	function handleSubmit()
	{
		close()
		if (prop.isMuted)
			unmute();
		else
			mute();
	}

	function mute()
	{
		if (chtCtx.currentRoom !== undefined)
		{
			const dto : RoomMuteDto =
			{
				roomId: chtCtx.currentRoom.id,
				refId: prop.refId,
				isMute: true,
				expires_in: duration,
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

	if (!prop.isMuted)
	{
		return (
		<React.Fragment>
			<button className="user_bar_button negative_user_button" onClick={open} >
				<img alt="" src={MuteLogo}/>
				mute
			</button>
			<Popup onClose={close} open={isOpen} modal>
				{<div className="mute_ban_popup">
					<div className="header"> Mute duration </div>
					<div className="content">
						<input type="number" min="1" placeholder="duration"
							value={duration} onChange={(e) => {
								setDuration(parseInt(e.target.value))
								}}
							/>
						hours
					</div>
					<div className="actions">
						<input type="button" value="cancel"
							onClick={close}/>
						<input type="button" value={"mute " + prop.user_name}
							onClick={handleSubmit}/>
					</div>
				</div>}
			</Popup>
		</React.Fragment>
		);
	}
	return (
		<React.Fragment>
			<button className="user_bar_button positive_user_button" onClick={open} >
				<img alt="" src={MuteLogo}/>
				unmute
			</button>
			<Popup open={isOpen} onClose={close} modal>
				{<div className="mute_ban_popup">
					<div className="header"> Are you sure ? </div>
					<div className="actions">
						<input type="button" value="cancel"
							onClick={close}/>
						<input type="button" value={"unmute " + prop.user_name}
						onClick={handleSubmit}/>
					</div>
				</div>}
			</Popup>
		</React.Fragment>
	);
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
		chtCtx.rmFriendNotif(prop.refId);
		chtCtx.socket.emit('ADD_FRIEND', prop.refId);
	}

	function removeFriend()
	{
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

export function AcceptGameInvitation(prop: acceptGameInvitationProp)
{
	const navigate = useNavigate()

	const { rmNotif } = useChatContext();
	function close()
	{
		rmNotif(prop.notifId);
	}
	function accept()
	{
		navigate(`/matchmaking/custom/${prop.gameId}`);
		close();
	}
	return (
		<button className="user_bar_button positive_user_button" onClick={accept}><img alt="" src={AcceptInvitationLogo}/>play</button>
	);
}

export function DeleteNotification(prop: refuseProp)
{
	const {rmNotif, socket} = useChatContext();
	function close()
	{
		rmNotif(prop.id);

		console.log("refuse invitation");

		if (prop.isRequestFriend === true)
		{
			socket.emit("RM_REQUEST_FRIEND", prop.refId);
		}
	}
	return (<button className="close_notification_button" onClick={close}><img alt="" src={CloseLogo}/></button>)
}

export function DirectMessage(prop: dmProp)
{
	const { socket, awaitDm, goToDmWith } = useChatContext();

	function goDM()
	{
		if (goToDmWith(prop.refId) === false)
		{
			awaitDm(prop.refId);
			const dto : CreateRoomDTO = {
					room_name:		prop.name,
					private_room:	true,
					isDm:			true,
					with:			prop.refId,
			}
			socket.emit("CREATE_ROOM", dto);
		}
	}
	return (
		<button className="user_bar_button positive_user_button" onClick={goDM}><img alt="" src={ChatLogo}/>DM</button>
	);
}
