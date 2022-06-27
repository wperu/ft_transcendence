import "./ChatMessage.css";

interface MessageProps
{
	time: Date;
	src_name: string;
	content: string;
	refId: number;
}

function addZero(value: number) : string
{
	if (value < 10)
		return ("0" + value);
	return (value.toString());
}

function getDateFormat(date: Date) : string
{
	const in_date = new Date(date);
	const curr_date = new Date();
	let out_string = in_date.getDate() + "/" + addZero(in_date.getMonth() + 1);

	if (in_date.getFullYear() !== curr_date.getFullYear())
		out_string += "/" + in_date.getFullYear();
	out_string += " " + in_date.getHours() + ":" + addZero(in_date.getMinutes()); 
	return (out_string);
}

function ChatMessage(props: MessageProps)
{
		return (
			<div className="message">
				<header>
					<div className="msg_src">{props.src_name}</div>
					<div className="msg_time">{getDateFormat(props.time)}</div>
				</header>
				<div className="msg_content">{props.content}</div>
			</div>
		);
}

export default ChatMessage;
