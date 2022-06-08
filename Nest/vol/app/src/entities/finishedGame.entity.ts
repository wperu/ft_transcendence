import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class FinishedGame
{
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User)
	player_one: User;

	@ManyToOne(() => User)
	player_two: User;

	@Column()
	player_one_score: number;

	@Column()
	player_two_score: number;

	@Column()
	custom: boolean;

	@Column()
	date: Date;
}
