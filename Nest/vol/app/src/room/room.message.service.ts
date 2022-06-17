import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessageEntity } from "src/entities/message.entity";
import { ChatRoomEntity } from "src/entities/room.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

// @Injectable()
// export class ChatMessageService
// {
// 	constructor(
// 		@InjectRepository(ChatMessageEntity)
// 		private msgRepo: Repository<ChatMessageEntity>,
// 	){}


// 	/**
// 	 * *** Modifier *** 
// 	 */
	
// 	/** //todo
// 	 * rm all message of one room
// 	 */
// 	async rmMessageOfRoom(id: number) : Promise<void | string>
// 	{
// 		const ret = await this.msgRepo.findOne(id);
// 		if(ret === undefined)
// 			return("room nonexistent");
// 		else
// 			this.msgRepo.clear();
// 	}

// 	/** //todo	Bonus
// 	 * rm one message by owner/admin (moderation)
// 	 */
// 	async rmOneMessage(message:ChatMessageEntity, id: number, modo_id: number) :Promise <void>
// 	{
// 		const ret =  await this.msgRepo.findOne({
// 			relations : ["room", "user"],
// 			where: [{
// 				room: { id:id},
// 				user: {reference_Id : modo_id},
// 				owner: modo_id
// 			}]
// 		})
// 		if(ret !== undefined)
// 			this.msgRepo.remove(message);
// 	}

// 	/** //todo
// 	 * 
// 	 */
// 	async addMessage(message: string, id: number , senderid: number ) : Promise<ChatMessageEntity | string>
// 	{
// 		const ret = await this.msgRepo.findOne({
// 			relations : ["room","user"],
// 			where : {
// 				room: {id : id},
// 				user:{reference_Id : senderid},
// 			}
// 		})
// 		if(ret === undefined)
// 			return("user is not is room, no add message");
// 		else
// 		{
// 			if(message === undefined)
// 				return("message no exist");
		
// 			let chatmessageRel: ChatMessageEntity = new ChatMessageEntity();
		
// 			chatmessageRel.Content = message;
// 			chatmessageRel.sender = ret.sender;
		
// 			return(await this.msgRepo.save(chatmessageRel));
// 		}
// 	}

// 	/**
// 	 * *** Getter ***
// 	 */


// 	/** //todo
// 	 * fetch all message of one room
// 	 */
// 	async getAllMessageOf(room_id: number): Promise<ChatMessageEntity[] | string>
// 	{
// 		const ret = await this.msgRepo.findOne(room_id);
// 		if(ret === undefined)
// 			return("room nonexistent");
// 		else
// 			return await this.msgRepo.find();
// 	}

	

// }
