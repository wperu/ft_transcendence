import { memo, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import {ELevelInRoom, useChatContext} from "../Sidebar/ChatContext/ProvideChat"
import {InviteUserButton, BanUserButton, MuteUserButton, BlockUserButton,
	PromoteUserButton, AddFriendButton, DirectMessage} from "../UserBarButtons/UserBarButtons"
import "./ChatUser.css"

interface	props
{
	currentUserLvl: ELevelInRoom;
	targetUsername: string;
	refId: number;
	targetUserLvl: ELevelInRoom;
	isBlockedByCurrentUser: boolean;
	isMuted: boolean;
	isDm: boolean;
	isBanned: boolean;
	isFriend: boolean;
}

const ChatUser = memo((data: props) =>
{
	const { user } = useAuth();

	const Buttons = useCallback(() =>
	{
		if (data.refId === user?.reference_id)
			return <></>; 
		if (data.currentUserLvl <= data.targetUserLvl || data.isDm)
		{
			return (
				<div className="chat_user_button_div">
					<DirectMessage name={data.targetUsername} refId={data.refId}/>
					<InviteUserButton  refId={data.refId}/>
					<AddFriendButton user_name={data.targetUsername}
							already_friend={data.isFriend} refId={data.refId}/>
					<BlockUserButton user_name={data.targetUsername}
						already_blocked={data.isBlockedByCurrentUser} refId={data.refId}/>
				</div>
			);
		}
		else
		{
			if (data.currentUserLvl === ELevelInRoom.admin)
			{
				return (
					<div className="chat_user_button_div">
						<DirectMessage name={data.targetUsername} refId={data.refId}/>
						<InviteUserButton refId={data.refId}/>
						<AddFriendButton user_name={data.targetUsername}
							already_friend={data.isFriend} refId={data.refId}/>
						<BlockUserButton user_name={data.targetUsername}
							already_blocked={data.isBlockedByCurrentUser} refId={data.refId}/>
						<MuteUserButton user_name={data.targetUsername} refId={data.refId} isMuted={data.isMuted} />
						<BanUserButton user_name={data.targetUsername} refId={data.refId} isBanned={data.isBanned}/>
					</div>
				);
			}
			else
			{
				return (
					<div className="chat_user_button_div">
						<DirectMessage name={data.targetUsername} refId={data.refId}/>
						<InviteUserButton refId={data.refId}/>
						<AddFriendButton user_name={data.targetUsername}
							already_friend={data.isFriend} refId={data.refId}/>
						<PromoteUserButton user_name={data.targetUsername}
							already_admin={data.targetUserLvl !== ELevelInRoom.casual} refId={data.refId}/>
						<BlockUserButton user_name={data.targetUsername}
							already_blocked={data.isBlockedByCurrentUser} refId={data.refId}/>
						<MuteUserButton user_name={data.targetUsername} refId={data.refId} isMuted={data.isMuted}/>
						<BanUserButton user_name={data.targetUsername} refId={data.refId} isBanned={data.isBanned}/>
					</div>
				);
			}
		}
	}, [data, user?.reference_id])

	const getSym = useCallback((e: ELevelInRoom) =>
	{
		if (e === ELevelInRoom.owner)
			return ' 👑';
		else if (e === ELevelInRoom.admin)
			return ' ⚔️';
		else
			return '';

	}, [])

	return (
		<div className="chat_user" >
			<div className="chat_user_username">
        <Link to={"/profile/" + data.refId}>{data.targetUsername + getSym(data.targetUserLvl) }</Link>
      </div>
			<Buttons />
		</div>
	);
})

export default ChatUser;