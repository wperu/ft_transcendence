export enum ENotification
{
	INFO,
	GAME_REQUEST,
	FRIEND_REQUEST
}



 /*
export type ENotification = //'INFO' | 'GAME_REQUEST' | 'GAME_REQUEST';
{
	INFO: 'INFO',
	GAME_REQUEST: 'GAME_REQUEST',
	FRIEND_REQUEST: 'GAME_REQUEST',
}*/


//type ENotification = typeof ENotification[keyof typeof ENotification];

export interface NotifDTO
{
	type:		ENotification;
	req_id:		number;
	content:	string;
	username:	string;
	date:		Date;
	refId?:		number;
}

export interface FriendDTO
{

}

export interface BlockedDTO
{
	
}