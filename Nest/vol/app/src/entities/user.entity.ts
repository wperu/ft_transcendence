import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, OneToOne, Unique } from 'typeorm';

@Entity()
@Unique('username', ['username'])
export class User
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	reference_id: number;

	@Column({nullable: true, default: null})
	login: string;

	@Column({nullable: true, default: null})
	username: string;
 
	@Column({nullable: true})
	access_token?: string;

	@Column({nullable: false, default: false})
	setTwoFA: boolean;

	@Column()
	SecretCode: string;

	@CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
	creation_date: Date;

	@Column()
	avatar_file: string;

	@Column()
	xp: number = 0; //win = 8xp loss = 2xp draw = 5xp -> total = 10xp

	@Column()
	wins: number = 0;

	@Column()
	losses: number = 0;

	@Column()
	draws: number = 0;

  //TODO : create nb_won, nb_lose,block_list,friend_list
}
