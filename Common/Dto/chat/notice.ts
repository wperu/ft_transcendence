export enum ELevel
{
	info = "info",
	error = "error",
}

export interface NoticeDTO
{
	level:		ELevel;
	content:	string;
}