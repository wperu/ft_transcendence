import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { id } from 'date-fns/locale';
import { retry } from 'rxjs';
import { RoomListDTO, UserDataDto, ChatUserDto, ELevelInRoom } from 'src/Common/Dto/chat/room';
import { ChatRoomEntity } from 'src/entities/room.entity';
import { ChatRoomRelationEntity } from 'src/entities/roomRelation.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RoomModule } from './room.module';

/** //todo
 * 	encrypte passwrd /!\
 *  ban system
 */
@Injectable()
export class RoomService
{
	constructor(
		@InjectRepository(ChatRoomEntity)
		private roomRepo: Repository<ChatRoomEntity>,

		@InjectRepository(ChatRoomRelationEntity)
		private roomRelRepo: Repository<ChatRoomRelationEntity>
	) {}
	

	async findRoomByName(name: string) : Promise<ChatRoomEntity | undefined>
	{
		const ret = await this.roomRepo.find(
			{
			where: {
				name: name,
			}
		})

		if (ret === undefined)
			return undefined

		return ret[0];
	}

	async findRoomById(id: number) : Promise<ChatRoomEntity | undefined>
	{
		const ret = await this.roomRepo.find({
			where: {
				id : id,
			}
		})

		if (ret === undefined)
			return undefined

		return ret[0];
	}

	/**
	 * Check if refId is in rooms
	 * @param room 
	 * @param refId 
	 * @returns true / false
	 */
	async isInRoom(room : ChatRoomEntity, refId: number) : Promise<boolean>
	{
		const ret = await this.roomRelRepo.findOne({
			relations : ["user", "room"],
			where : {
				room: { id : room.id },
				user : { reference_id : refId}
			}
		})

		if (ret !== undefined)
			return true;
		return false;
	}

	/**
	 * //todo : name already exist /!\
	 * //todo : encrypt password
	 *
	 * @param name 			-> name
	 * @param user			-> owner
	 * @param isPrivate		-> Private chan is not visible
	 * @param password_key	-> Protect chan with password
	 * @param isDm			-> private message
	 */
	async createRoom(name: string, user: User, isPrivate: boolean, password_key: string, isDm: boolean) : Promise<string | ChatRoomEntity>
	{
		let room	: ChatRoomEntity 			= new ChatRoomEntity();
		let roomRel	: ChatRoomRelationEntity	= new ChatRoomRelationEntity();
		
		if (await this.findRoomByName(name) !== undefined)
			return "room already exist";

		room.name = name;
		room.owner = user.reference_id;
		room.creation_date = new Date();
		room.isPrivate = isPrivate;
		room.password_key = password_key;
		room.isDm = isDm;

		room = await this.roomRepo.save(room);

		roomRel.room	= room;
		roomRel.user	= user;
		roomRel.isAdmin = true;

		await this.roomRelRepo.save(roomRel);

		return room;
	}

	/**
	 * add user in room
	 * 
	 * 
	 * @param name 
	 * @param user 
	 * @returns  string with error or undefined
	 */
	async joinRoom(name: string, user: User) : Promise<string | ChatRoomEntity>
	{
		const room = await this.findRoomByName(name);

		if (room === undefined)
			return ("no room exist");

		if (await this.isInRoom(room, user.reference_id) === true)
			return ("already in room");
		
		let roomRel	: ChatRoomRelationEntity	=  new ChatRoomRelationEntity();

		roomRel.room = room;
		roomRel.user = user;

		await this.roomRelRepo.save(roomRel);

		return (room);
	}

	/**
	 * Join room using room's name
	 * @param chanName 
	 * @param userId 
	 * @returns 
	 */
	async leaveRoomByName(chanName: string, refId: number) : Promise<boolean>
	{
		const room = await this.findRoomByName(chanName);

		if (room === undefined)
			return ;

		const ret = await this.roomRelRepo.findOne({
			relations : ["user", "room"],
			where : {
				room: { id : room.id },
				user : { reference_id : refId}
			}
		})
		if (ret  !== undefined)
			this.roomRelRepo.remove(ret);

		return (true);
	}

	/**
	 * //todo destroy chan when user last user leave
	 * Join room using room's Id
	 * @param chanName 
	 * @param userId 
	 * @returns 
	 */
	 async leaveRoomById(chanId: number, refId: number) : Promise<boolean>
	 {
		 const room = await this.findRoomById(chanId);
 
		 if (room === undefined)
			 return false;
 
		 const ret = await this.roomRelRepo.findOne({
			 relations : ["user", "room"],
			 where : {
				 room: { id : room.id },
				 user : { reference_id : refId}
			 }
		 })
		 if (ret !== undefined)
			 this.roomRelRepo.remove(ret);
		 else
		 	return (false);
 
		 return (true);
	 }

	/**
	 * return list of User in room
	 * @param id room id
	 * @param refId 
	 * @returns UserDataDto[]
	 */
	async userListOfRoom(id: number, refId: number) : Promise<UserDataDto[] | string>
	{
		const room = await this.findRoomById(id);

		if (room === undefined)
			return ("no room exist");

		if (await this.isInRoom(room, refId) === false)
			return ("not in room");
		
		const rel = await this.roomRelRepo.find({
			relations: ["user", "room"],
			where: {
				room : { id : room.id },
			}
		})
		let ret : UserDataDto[];
		ret = [];
		
		rel.forEach((r) => {
			ret.push({
				reference_id : r.user.reference_id,
				username: r.user.username,
			})
		})

		return (ret);
	}


	/**
	 * @param refId 
	 * @returns RoomListDTO[]
	 */
	async roomListOfUser(refId : number) : Promise<RoomListDTO[]>
	{
		const rooms_list = await this.roomRelRepo.find({
			relations : ["user", "room"],
			where : {
				user : { reference_id : refId}
			}
		})

		let ret : RoomListDTO[];

		ret = [];

		if (rooms_list === undefined)
			return [];
		
		rooms_list.forEach(({room}) => {
			/**
			 * create room dto
			 */
			ret.push({
				id:				room.id,
				name:			room.name,
				owner:			room.owner,
				has_password:	room.password_key !== "",
			})
		});

		return ret;
	}

	/**
	 * list of actual public rooms
	 * @returns RoomListDTO[]
	 */
	async publicRoomList() : Promise<RoomListDTO[]>
	{
		const rooms_list = await this.roomRepo.find({
			where : {
				isPrivate : false
			}
		})

		let ret : RoomListDTO[];

		ret = [];

		if (rooms_list === undefined)
			return [];
		
		rooms_list.forEach((room) => {
			ret.push({
				id: room.id,
				name: room.name,
				owner: room.owner,
				has_password: room.password_key !== "",
			})
		});

		return ret;
	}

}