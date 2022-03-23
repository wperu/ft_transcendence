interface JoinRoomDto
{
	room_name: string,
	password?: string
}

interface SendMessageDto
{
	message: string,
	room_name: string
}

interface RcvMessageDto
{
	message: string,
	sender: string,
	send_date: string,
	room_name: string
};

export type {SendMessageDto, JoinRoomDto, RcvMessageDto};
