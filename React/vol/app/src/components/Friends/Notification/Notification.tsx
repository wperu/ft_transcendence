import { Link } from "react-router-dom";
import { AddFriendButton, BlockUserButton, InviteUserButton, AcceptGameInvitation, DirectMessage, DeleteNotification } from "../../UserBarButtons/UserBarButtons";
import "./Notification.css";

interface infos
{
	id:			string;
	content:	string;
	date:		Date;
}

interface invite
{
	id:			string;
	name:		string;
	date:		Date;
	refId:		number;
	roomId:		string | undefined;
}

interface fren
{
	id:			string;
	name: string;
	date: Date;
	refId: number;
}

function getTimeSince(date : Date) : string
{
	let tmp = new Date(date);
	let time = Math.floor((Date.now() - tmp.getTime()) / 1000);
	let finalString: string =  "";
	if (Math.floor(time / 3600))
	{
		time = Math.floor(time / 3600);
		if (Math.floor(time / 24))
		{
			time = Math.floor(time / 24);
			if (Math.floor(time / 30))
			{
				finalString += (Math.floor((time / 30))).toString() + " month";
				if ((Math.floor((time / 30))) > 1)
					finalString += 's';
				finalString += " ago";
			}
			else
			{
				finalString += time.toString() + " day";
				if (time > 1)
					finalString += 's';
				finalString += " ago";
			}
		}
		else
		{
			finalString += time.toString() + " hour";
			if (time > 1)
				finalString += 's';
			finalString += " ago";
		}
	}
	else
	{
		time = Math.floor((time / 60));
		if (time)
		{
			finalString += time.toString() + " minute";
			if (time > 1)
				finalString += 's';
			finalString += " ago";
		}
		else
			finalString = "just now";
	}
	return (finalString);
}

export function InfoNotification(props: infos)
{
	return (
		<div className="friends_info_notification">
			<DeleteNotification refId={0} id={props.id} isRequestFriend={false}/>
			<div className="friends_notification_date">{getTimeSince(props.date)}</div>
			<div className="friends_info_notification_content">{props.content}</div>
		</div>
	);
}


export function InviteNotification(props: invite)
{
	return (
		<div className="friends_interactive_notification">
			<DeleteNotification refId={props.refId} id={props.id} isRequestFriend={false}/>
			<div className="friends_notification_date">{getTimeSince(props.date)}</div>
      <div className="friends_notif_name"><Link to={"/profile/" + props.refId}>{props.name}</Link></div>
			<div className="friends_interactive_notif_content">invited you to play</div>
			<div className="notif_button_div">
				<AcceptGameInvitation src_name={props.name} refId={props.refId} gameId={props.roomId}/>
				<DirectMessage name={props.name} refId={props.refId}/>
				<AddFriendButton user_name={props.name} already_friend={false} refId={props.refId}/>
				<BlockUserButton user_name={props.name} already_blocked={false} refId={props.refId}/>
			</div>
		</div>
	);
}

export function NewFriendNotification(props: fren)
{
	return (
		<div className="friends_interactive_notification">
			<DeleteNotification refId={props.refId} id={props.id} isRequestFriend={true} />
			<div className="friends_notification_date">{getTimeSince(props.date)}</div>
			<div className="friends_notif_name"><Link to={"/profile/" + props.refId}>{props.name}</Link></div>
			<div className="friends_interactive_notif_content"> added you as friend</div>
			<div className="notif_button_div">
				<InviteUserButton refId={props.refId}/>
				<DirectMessage name={props.name} refId={props.refId}/>
				<AddFriendButton user_name={props.name} already_friend={false} refId={props.refId}/>
				<BlockUserButton user_name={props.name} already_blocked={false} refId={props.refId}/>
			</div>
		</div>
	);
}
