import { AddFriendButton, BlockUserButton, InviteUserButton, AcceptGameInvitation, DirectMessage, DeleteNotification } from "../../UserBarButtons/UserBarButtons";
import "./Notification.css";

interface infos
{
	id:			string;
	content:	string;
	date:		string;
}

interface invite
{
	id:			string;
	name: string;
	date: string;
	refId: number;
}

interface fren
{
	id:			string;
	name: string;
	date: string;
	refId: number;
}

export function InfoNotification(props: infos)
{
	return (
		<div className="friends_info_notification">
			<DeleteNotification refId={0} id={props.id} isRequestFriend={false}/>
			<div className="friends_notification_date">{props.date}</div>
			<div className="friends_info_notification_content">{props.content}</div>
		</div>
	);
}


export function InviteNotification(props: invite)
{
	return (
		<div className="friends_interactive_notification">
			<DeleteNotification refId={props.refId} id={props.id} isRequestFriend={false}/>
			<div className="friends_notification_date">{props.date}</div>
			<div className="friends_notif_name">{props.name}</div>
			<div className="friends_interactive_notif_content">t'as invité à jouer</div>
			<div className="notif_button_div">
				{/* <AcceptGameInvitation src_name={props.name} refId={props.refId}/>
				<DirectMessage name={props.name} refId={props.refId}/> */}
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
			<div className="friends_notification_date">{props.date}</div>
			<div className="friends_notif_name">{props.name}</div>
			<div className="friends_interactive_notif_content"> t'as ajouté à ses amis</div>
			<div className="notif_button_div">
				<InviteUserButton refId={props.refId}/>
				<DirectMessage name={props.name} refId={props.refId}/>
				<AddFriendButton user_name={props.name} already_friend={false} refId={props.refId}/>
				<BlockUserButton user_name={props.name} already_blocked={false} refId={props.refId}/>
			</div>
		</div>
	);
}
