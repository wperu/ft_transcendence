import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
 
@Entity()
export class ChatRoomEntity
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	owner: number;

	@Column()
	creation_date : Date
	
	@Column({default: false})
	isPrivate : boolean;

	@Column({ nullable: true })
	password_key : string

	@Column({ nullable: true })
	isDm : boolean;

}

/*
@Entity()
export class ChatRoomMessageEntity
{
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => ChatRoomEntity)
	@JoinColumn()
	chanId: ChatRoomEntity;

	@OneToOne(() => User)
	@JoinColumn()
	UserId: User;

	@Column()
	content: string;
}*/