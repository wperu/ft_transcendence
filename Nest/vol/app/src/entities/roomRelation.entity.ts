import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, Column} from "typeorm";
import { ChatRoomEntity } from "./room.entity";
import { User } from "./user.entity";

@Entity()
export class ChatRoomRelationEntity
{
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ChatRoomEntity)
	@JoinColumn()
	room: ChatRoomEntity;

	@ManyToOne(() => User)
	@JoinColumn()
	user: User;

	@Column({default: false})
	isAdmin: boolean;
}