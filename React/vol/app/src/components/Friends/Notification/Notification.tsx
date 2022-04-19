import "./Notification.css";

interface infos
{
	content: string;
	date: string;
}

export function InfoNotification(props: infos)
{
	return (
		<div className="friends_info_notification">
			<div className="friends_notification_date">{props.date}</div>
			<div className="friends_notification_content">{props.content}</div>
		</div>
	);
}
