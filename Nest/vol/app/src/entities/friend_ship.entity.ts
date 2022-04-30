import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum EStatus
{
	REQUEST,
	FRIEND,
	BLOCK,
}

@Entity()
export class FriendShip
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	id_one: number;

	@Column()
	id_two: number;

	@Column()
	status: EStatus;
}