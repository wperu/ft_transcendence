import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessageEntity } from "src/entities/message.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class ChatMessageService
{
	constructor(
		@InjectRepository(ChatMessageEntity)
		private msgRepo: Repository<ChatMessageEntity>,
	){}


	/**
	 * *** Modifier *** 
	 */
	
	/** //todo
	 * rm all message of one room
	 */
	async rmMessageOfRoom() : Promise<void>
	{
		this.msgRepo.clear();
	}

	/** //todo	Bonus
	 * rm one message by owner/admin (moderation)
	 */
	async rmOneMessage(message:ChatMessageEntity) :Promise <void>
	{
		this.msgRepo.remove(message);
	}

	/** //todo
	 * 
	 */
	async addMessage(message: string, sender: User) : Promise<ChatMessageEntity | string>
	{
		if(message === undefined)
			return("message no exist");
		
		let chatmessageRel: ChatMessageEntity = new ChatMessageEntity();
		
		chatmessageRel.Content = message;
		chatmessageRel.sender = sender;

		return(await this.msgRepo.save(chatmessageRel));

	}

	/**
	 * *** Getter ***
	 */


	/** //todo
	 * fetch all message of one room
	 */
	async getAllMessageOf(): Promise<ChatMessageEntity[]>
	{
		return await this.msgRepo.find();
	}

	

}