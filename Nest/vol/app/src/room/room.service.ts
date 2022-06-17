import { ChatPasswordService } from './room.password.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomListDTO, UserRoomDataDto, ELevelInRoom } from 'src/Common/Dto/chat/room';
import { ChatRoomEntity } from 'src/entities/room.entity';
import { ChatRoomRelationEntity } from 'src/entities/roomRelation.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
//import { ChatMessageService } from './room.message.service';

@Injectable()
export class RoomService
{
	constructor(


	//	@Inject(ChatMessageService)
	//	private readonly msgService: ChatMessageService,

		@Inject(ChatPasswordService)
		private readonly passwordService: ChatPasswordService,

		@InjectRepository(ChatRoomEntity)
		private roomRepo: Repository<ChatRoomEntity>,

		@InjectRepository(ChatRoomRelationEntity)
		private roomRelRepo: Repository<ChatRoomRelationEntity>,


	) {

	}

	async findRoomByName(name: string) : Promise<ChatRoomEntity | undefined>
	{
		const ret = await this.roomRepo.findOne(
			{
			where: {
				name: name,
				isDm: false,
			}
		})

		if (ret === undefined || ret !== null)
			return undefined;

		return ret;
	}

	async findRoomById(id: number) : Promise<ChatRoomEntity | undefined>
	{
		const ret = await this.roomRepo.find({
			where: {
				id : id,
			}
		})

		if (ret.length === 0 || !ret)
			return undefined

		return ret[0];
	}

	async findRelOf(id: number, refId: number) : Promise<ChatRoomRelationEntity | undefined>
	{
		const ret = await this.roomRelRepo.findOne({
			relations : ["user", "room"],
			where : {
				room: { id : id },
				user : { reference_id : refId}
			}
		})

		if (!ret)
			return undefined;

		return ret;
	}


	async getUserLevel(id : number, owner: number, refId: number)
	{
		let level : ELevelInRoom;

		if (owner === refId)
			level = ELevelInRoom.owner;
		else if (await this.isAdmin(id, refId))
			level = ELevelInRoom.admin;
		else
			level = ELevelInRoom.casual;

		return level;
	}

	/**
	 * Check if refId is in rooms
	 * @param room
	 * @param refId
	 * @returns true / false
	 */
	async isInRoom(room : ChatRoomEntity, refId: number) : Promise<boolean>
	{
		const ret = await this.findRelOf(room.id, refId);


		if (ret === undefined)
			return false;
		if (ret.ban_expire !== null)
			false
		return true;
	}

	/**
	 *
	 * @param id roomId
	 * @param refId user's refid
	 * @returns
	 */
	async isAdmin(id : number, refId: number) : Promise<boolean>
	{
		const ret = await this.roomRelRepo.findOne({
			relations : ["user", "room"],
			where : {
				room: { id : id },
				user : { reference_id : refId},
				isAdmin: true,
			}
		})

		if (!ret)
			return true;
		return false;
	}

	async findDm(user1 : User, user2: User): Promise<boolean>
	{
		const roomsDm = await this.roomRepo.find({
			where : {
			 	isDm: true,
			}
		});

		for (let r of roomsDm)
		{
			const resp = await this.roomRelRepo.find({
				relations : ["user", "room"],
				where: [
					{room: r, user: user1},
					{room: r, user: user2},
				],
			})
			if (resp.length === 2)
			{

				console.log (resp)
				return true
			}
		}

		return false;
	}

	/**
	 * //todo : name already exist /!\
	 *
	 * @param name 			-> name
	 * @param user			-> owner
	 * @param isPrivate		-> Private chan is not visible
	 * @param password_key	-> Protect chan with password
	 * @param isDm			-> private message
	 */
	async createRoom(name: string, user: User, isPrivate: boolean, password_key: string, isDm: boolean, user2: User) : Promise<string | ChatRoomEntity>
	{
		let room	: ChatRoomEntity 			= new ChatRoomEntity();
		let roomRel	: ChatRoomRelationEntity	= new ChatRoomRelationEntity();

		if (isDm !== true && await this.findRoomByName(name) !== undefined) //useless check if is Dm
			return "Room already exists";
		if (isDm && user2 === undefined)
			return "User doesn't exist";
		if (isDm && await this.findDm(user, user2)) //fix
			return "DM room already exists";
		if (name.length < 3 || name.length > 16)
			return "Name length must be between 3 and 16";
		if (password_key && password_key.length > 16)
			return "Password length must be less than 16";
	/*	if (user.reference_id === user.reference_id)
			return "can't dm with "*/

		room.name			= name;
		room.owner			= user.reference_id;
		room.creation_date	= new Date();
		room.isPrivate		= isPrivate;
		room.password_key	= (password_key !== undefined) ? await this.passwordService.genHash(password_key) : null;
		room.isDm			= isDm;

		room = await this.roomRepo.save(room);

		roomRel.room	= room;
		roomRel.user	= user;
		roomRel.isAdmin = false;

		if (isDm && user.id !== user2.id)
		{
			let roomRel2	: ChatRoomRelationEntity	= new ChatRoomRelationEntity();

			roomRel2.room	= room;
			roomRel2.user	= user2;
			roomRel2.isAdmin = false;
			await this.roomRelRepo.save(roomRel2);
		}

		await this.roomRelRepo.save(roomRel);

		return room;
	}


	async joinRoom(room: ChatRoomEntity, user: User, password_key: string) : Promise<ChatRoomEntity | string>
	{
		if (room === undefined)
			return ("no room exist !");
		if(room.isDm === true)
			return ("You can't join dm room");
		if (await this.checkBan(room.id, user.reference_id) === true)
			return ("banned !");
		if (await this.isInRoom(room, user.reference_id) === true)
			return ("already in room !");
		if (await this.passwordService.isMatch(password_key, room.password_key) !== true)
			return ("Wrong password !");


		let roomRel	: ChatRoomRelationEntity	=  new ChatRoomRelationEntity();

		roomRel.room = room;
		roomRel.user = user;

		await this.roomRelRepo.save(roomRel);

		return (room);
	}

	/**
	 * add user in room
	 *
	 *
	 * @param name
	 * @param user
	 * @returns  string with error or undefined
	 */
	async joinRoomById(id: number, user: User, password_key: string) : Promise<string | ChatRoomEntity>
	{
		const room = await this.findRoomById(id);

		return (await this.joinRoom(room, user, password_key));
	}

	async joinRoomByName(name: string, user: User, password_key: string) : Promise<string | ChatRoomEntity>
	{
		const room = await this.findRoomByName(name);

		return (await this.joinRoom(room, user, password_key));
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
			return false;

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
	 async leaveRoomById(chanId: number, refId: number) : Promise<undefined | string | number>
	 {
		const room = await this.findRoomById(chanId);

		if (room === undefined)
			 return "no room !";
		if (room.isDm === true)
			return ("You can't leave dm room !");

		 const ret = await this.roomRelRepo.findOne({
			 relations : ["user", "room"],
			 where : {
				 room: { id : room.id },
				 user : { reference_id : refId}
			 }
		 })
		 if (ret === undefined)
		 	return ("your are not in room");

		await this.roomRelRepo.remove(ret);
		const rels = await this.roomRelRepo.find({
			relations : ["room"],
			where : {
				room : { id : room.id },
				ban_expire: null,
			}
		})

		if (rels.length === 0)
		{
			await this.roomRelRepo.createQueryBuilder()
				.relation("room")
				.of({id: chanId})
				.delete()
				.execute();

			await this.roomRepo.remove(room);
		}
		else if (refId === room.owner)
		{
			let newOwner : number;
			const rel = await this.roomRelRepo.findOne({
				relations : ["room", "user"],
				where : {
					room : { id : room.id },
					isAdmin: true,
				}
			})
			if (rel !== undefined)
			{
				newOwner = rel.user.reference_id;
			}
			else
			{
				const rel = await this.roomRelRepo.findOne({
					relations : ["room", "user"],
					where : {
						room : { id : room.id },
						ban_expire: null
					}
				})
				rel.mute_expire = null;
				rel.isAdmin = true;
				newOwner = rel.user.reference_id;

				await this.roomRelRepo.save(rel);
			}
			room.owner = newOwner;
			this.roomRepo.save(room);
			return (room.owner);
		}
		return (undefined);
	 }

	/**
	 * return list of User in room
	 * @param id room id
	 * @param refId
	 * @returns UserDataDto[]
	 */
	async userListOfRoom(id: number, refId: number) : Promise<UserRoomDataDto[] | string>
	{
		const room = await this.findRoomById(id);

		if (room === undefined)
			return ("no room exist");

		if (await this.isInRoom(room, refId) === false)
			return ("not in room");

		const rel = await this.roomRelRepo.find({
			relations: ["user", "room"],
			where: {
				room: { id : room.id },
			}
		})
		let ret : UserRoomDataDto[];
		ret = [];

		for(const r of rel)
		{
			await this.checkBan(room.id, r.user.reference_id);
				ret.push({
					reference_id :	r.user.reference_id,
					username:		r.user.username,
					level:			await this.getUserLevel(room.id, room.owner, r.user.reference_id),
					isMuted:		await this.isMute(room.id, r.user.reference_id),
					isBan:			r.ban_expire !== null,
					is_connected:	false, // default value change in chat service
				})
		}

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
				user : { reference_id : refId},
				ban_expire: null
			}
		})

		let ret : RoomListDTO[];

		ret = [];

		if (rooms_list === [])
			return [];

		for (let rel of rooms_list)
		{
			let room = rel.room;
			/**
			 * create room dto
			 */

			if (room.isDm)
			{
				const rel2 = await this.roomRelRepo.find({
					relations : ["user", "room"],
					where : {
						room: room,
					}
				})

				rel2.forEach(r => {
					if (r.user.reference_id !== refId)
					{
						room.name = r.user.username;
						room.owner = r.user.reference_id;
					}
				});
			}

			ret.push({
				id:				room.id,
				name:			room.name,
				owner:			room.owner,
				has_password:	room.password_key !== null,
				isDm:			room.isDm,
			})
		};

		return ret;
	}

	/**
	 *
	 * @param id
	 * @param refId
	 * @returns
	 */
	async checkBan(id: number, refId: number) : Promise<boolean>
	{
		let rel = await this.findRelOf(id, refId);

		if (rel === undefined)
			return false;
		if (rel.ban_expire === null)
			return (false);

		if (rel.ban_expire <= new Date())
		{
			await this.roomRelRepo.remove(rel); //todo
			return (false);
		}
		else
			return (true);
	}

	async banUser(id: number, senderRefId: number, refId: number, expires_in: Date) : Promise<string | ChatRoomEntity>
	{
		const room = await this.findRoomById(id);

		if (room === undefined)
			return ("Room doesn't exist !")
		if (room.isDm === true)
			return ("You can't do that in dm room !");
		if (room.owner !== senderRefId && await this.isAdmin(room.id, senderRefId) === false)
			return "No Right !";
		if (await this.isAdmin(room.id, refId) === true && room.owner !== senderRefId)
			return "You can't mute room operator !";

		const rel = await this.findRelOf(id, refId);
		if (rel === undefined)
			return "User not in room !";

		rel.ban_expire = expires_in;

		console.log(expires_in);
		await this.roomRelRepo.save(rel);

		return room;
	}

	async unbanUser(id: number, senderRefId: number, refId: number) : Promise<string | ChatRoomEntity>
	{
		const room = await this.findRoomById(id);

		if (room === undefined)
			return ("Room doesn't exist !")
		if (room.isDm === true)
			return ("You can't do that in dm room !");
		if (room.owner !== senderRefId && await this.isAdmin(room.id, senderRefId) === false)
			return "No Right !";
		if (await this.isAdmin(room.id, refId) === true && room.owner !== senderRefId)
			return "You can't mute room operator !";

		const rel = await this.findRelOf(id, refId);
		if (rel === undefined)
			return "User not in room !";
		if (rel.ban_expire === null)
			return "User is not Banned !";

		await this.roomRelRepo.remove(rel);
		return room;
	}

	/**
	 * //fix only owner or admin too
	 * @param id
	 * @param refId
	 * @param password
	 * @returns
	 */
	async roomChangePass(id: number, refId: number, password: string | undefined)
	{
		const room = await this.findRoomById(id);

		if (room === undefined)
			return ("Room doesn't exist !")
		if (room.isDm === true)
			return ("You can't do that in dm room !");
		if (password !== null && (password.length > 16))
			return ("Password must be less than 16 characters long");
		if (room.owner !== refId && await this.isAdmin(room.id, refId) === false)
			return "Only the room owner can change the password !";
		if (password === null)
			room.password_key = null;
		else
			room.password_key = await this.passwordService.genHash(password);

		await this.roomRepo.save(room);
	}

	/**
	 * check if mute is set & update if mute_expire is passed
	 * @param id
	 * @param refId
	 * @returns true / false
	 */
	async isMute(id: number, refId: number) : Promise<boolean>
	{
		let rel = await this.findRelOf(id, refId);

		if (rel === undefined || rel.mute_expire === null)
			return false;

		if (rel.mute_expire <= new Date())
		{
			rel.mute_expire = null;
			await this.roomRelRepo.save(rel);
			return (false)
		}
		else
			return (true);
	}

	async roomMute(id: number, senderRefId : number, refId: number, mute_expire: Date): Promise<string | boolean>
	{
		const room = await this.findRoomById(id);

		if (room === undefined)
			return ("Room doesn't exist !")
		if (room.isDm === true)
			return ("You can't do that in dm room !");
		if (room.owner !== senderRefId && await this.isAdmin(room.id, senderRefId) === false)
			return "No Right !";
		if (await this.isAdmin(room.id, refId) === true && room.owner !== senderRefId)
			return "You can't mute room operator !";

		const rel = await this.findRelOf(id, refId);
		if (rel === undefined)
			return "User not in room !";
		rel.mute_expire = mute_expire;

		await this.roomRelRepo.save(rel);
		return (true);
	}

	async roomUnmute(id: number, senderRefId : number, refId: number): Promise<string | boolean>
	{
		const room = await this.findRoomById(id);

		if (room === undefined)
			return ("Room doesn't exist !")
		if (room.isDm === true)
			return ("You can't do that in dm room !");
		if (room.owner !== senderRefId && await this.isAdmin(room.id, senderRefId) === false)
			return "No Right !";
		if (await this.isAdmin(room.id, refId) === true && room.owner !== senderRefId)
			return "You can't unmute room operator !";

		const rel = await this.findRelOf(id, refId);
		if (rel === undefined)
			return "User not in room !";
		rel.mute_expire = null;

		await this.roomRelRepo.save(rel);
		return (true);
	}

	async setIsAdmin(id: number, refId: number, senderId: number, isAdmin: boolean) : Promise<string | undefined>
	{
		const room = await this.findRoomById(id);

		if (room === undefined)
			return "Unknown room";
		if (room.isDm === true)
			return ("You can't do that in dm room !");
		if (room.owner !== senderId)
			return "Only the room owner can promote/demote !";

		if (room.owner === refId)
			return "Owner can't be demote !"
		const ret = await this.findRelOf(id, refId);

		if (ret === undefined)
			return "User need to be in room !";

		ret.isAdmin = isAdmin;
		await this.roomRelRepo.save(ret);
		return undefined;
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
				has_password: room.password_key !== null,
				isDm: room.isPrivate,
			})
		});

		return ret;
	}

}
