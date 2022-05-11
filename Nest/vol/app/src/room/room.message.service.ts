import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessageEntity } from "src/entities/message.entity";
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
	async rmMessageOfRoom()
	{

	}

	/** //todo	Bonus
	 * rm one message by owner/admin (moderation)
	 */
	async rmOneMessage()
	{

	}

	/** //todo
	 * 
	 */
	async addMessage()
	{

	}

	/**
	 * *** Getter ***
	 */


	/** //todo
	 * fetch all message of one room
	 */
	async getAllMessageOf()
	{

	}

	

}