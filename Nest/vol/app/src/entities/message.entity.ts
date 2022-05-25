import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatRoomEntity } from "./room.entity";
import { User } from "./user.entity";

@Entity()
export class ChatMessageEntity
{
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => ChatRoomEntity)
	@JoinColumn()
	room: ChatRoomEntity;

	@ManyToOne(() => User)
	@JoinColumn()
	sender: User;

	@Column()
	Content: string

	@CreateDateColumn()
	date: Date;
}