import { AddFriendButton, BlockUserButton, InviteUserButton, AcceptGameInvitation } from "../../UserBarButtons/UserBarButtons";
import "./Notification.css";

interface infos
{
	content: string;
	date: string;
}

interface invite
{
	name: string;
	date: string;
}

interface fren
{
	name: string;
	date: string;
}


export function InfoNotification(props: infos)
{
	return (
		<div className="friends_info_notification">
			<div className="friends_notification_date">{props.date}</div>
			<div className="friends_info_notification_content">{props.content}</div>
		</div>
	);
}

export function InviteNotification(props: invite)
{
	return (
		<div className="friends_interactive_notification">
			<div className="friends_notification_date">{props.date}</div>
			<div className="friends_notif_name">{props.name}</div>
			<div className="friends_interactive_notif_content">t'as invité à jouer</div>
			<div className="notif_button_div">
				<AcceptGameInvitation src_name={props.name} />
				<InviteUserButton />
				<BlockUserButton user_name={props.name} already_blocked={false} />
			</div>
		</div>
	);
}

export function NewFriendNotification(props: fren)
{
	return (
		<div className="friends_interactive_notification">
			<div className="friends_notification_date">{props.date}</div>
			<div className="friends_notif_name">{props.name}</div>
			<div className="friends_interactive_notif_content"> t'as ajouté à ses amis</div>
			<div className="notif_button_div">
				<AddFriendButton user_name={props.name} already_friend={false} />
				<InviteUserButton />
				<BlockUserButton user_name={props.name} already_blocked={false} />
			</div>
		</div>
	);
}
