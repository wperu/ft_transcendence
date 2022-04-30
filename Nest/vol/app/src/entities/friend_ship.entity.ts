import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

export enum EStatus
{
	REQUEST,
	FRIEND,
	BLOCK,
}

@Entity()
@Unique("relation", ['id_one', 'id_two'])
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