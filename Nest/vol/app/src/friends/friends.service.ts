import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EStatus, FriendShip } from 'src/entities/friend_ship.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class FriendsService
{

	constructor(
		@InjectRepository(FriendShip)
		private friendRepository: Repository<FriendShip>,
	) {}

	/**
	 * 
	 * @param userId 
	 * @returns Array of relation
	 */
	async findFriendOf(id_one: number): Promise<FriendShip[]>
	{
		
		const ret = await this.friendRepository.find({
			where: {
				id_one: id_one,
			},
		});
		return ret;
	}
	
	/**
	 * 
	 * @param userId 
	 * @returns 
	 */
	async findBlockedOf(userId: number): Promise<FriendShip[]>
	{
		const ret =  await this.friendRepository.find({
			where: {
				id_one: userId,
				status: EStatus.BLOCK
			},
		});

		return ret;
	}

	/**
	 * 
	 * @param userId 
	 * @returns 
	 */
	async findRequestOf(userId: number): Promise<FriendShip[]>
	{
		return await this.friendRepository.find({
			where: {
				id_two: userId,
				status: EStatus.REQUEST
			},
		});
	}

	/**
	 * return rel (1, 2)
	 * @param userIdOne 
	 * @param userIdTwo 
	 * @returns <FriendShip | undefined>
	 */
	async findFriendRelationOf(userIdOne: number, userIdTwo: number): Promise<FriendShip | undefined>
	{
		return await this.friendRepository.findOne({
			where: {
				id_one: userIdOne,
				id_two: userIdTwo
			},
		});
	}


	//Todo if user1 and user2 request call -> accepteRequestFriend
	/**
	 * add new friend Request
	 * @param userIdOne 
	 * @param userIdTwo 
	 * @returns friendRequest
	 */
	async addRequestFriend(userIdOne: number, userIdTwo: number) : Promise<FriendShip>
	{
		const rel = await this.findFriendRelationOf(userIdOne, userIdTwo);
		if (rel !== undefined) //request already exist or isFriend
		{
			return rel;
		}
		else
		{
			let req: FriendShip = new FriendShip();
			const rel_two = await this.findFriendRelationOf(userIdTwo, userIdOne);

			if (rel_two !== undefined && rel_two.status === EStatus.REQUEST)
			{
				rel_two.status = EStatus.FRIEND;
				await this.friendRepository.save(rel_two);
				req.status = EStatus.FRIEND;
			}
			else
			{
				req.status = EStatus.REQUEST;
			}
			req.id_one = userIdOne;
			req.id_two = userIdTwo;
			return await this.friendRepository.save(req);
		}
	}

	/**
	 * 
	 * @param id : request_id 
	 * @returns void
	 */
	async rmRequestFriend(id: number) : Promise<void>
	{
		await this.friendRepository
		    .createQueryBuilder()
		    .delete()
		    .from(FriendShip)
		    .where("id = :id", { id: id })
		    .execute()
		return ;
	}

	async rmFriend(userIdOne: number, userIdTwo: number): Promise<void>
	{
		await this.friendRepository
		    .createQueryBuilder()
		    .delete()
		    .from(FriendShip)
		    .where("id_one = :id", { id: userIdOne })
			.andWhere("id_two = :id", { id: userIdTwo })
		    .execute();

		await this.friendRepository
		    .createQueryBuilder()
		    .delete()
		    .from(FriendShip)
		    .where("id_one = :id", { id: userIdTwo })
			.andWhere("id_two = :id", { id: userIdOne })
		    .execute();
		return ;
	}
	

	/**
	 * 
	 * @param id request_id
	 */
	async acceptRequestFriend(id: number) : Promise<void>
	{
		//Set relation to FRIEND (1, 2)
		const rel = await this.friendRepository.findOne({ 
			where: {
				id: In([id])
			},
		});
		rel.status = EStatus.FRIEND;

		await this.friendRepository.save(rel);

		//set relation (2, 1)

		let rel_two = await this.findFriendRelationOf(rel.id_two, rel.id_two);

		if (rel_two === undefined)
		{
			rel_two = new FriendShip();

			rel_two.id_one = rel.id_two;
			rel_two.id_two = rel.id_one;
			rel_two.status = EStatus.FRIEND;
		}
		else
		{
			rel_two.status = EStatus.FRIEND; //avoid block or request
		}

		await this.friendRepository.save(rel_two);
	}

	/**
	 * 
	 * @param userIdOne 
	 * @param userIdTwo 
	 * @returns Blocked relation
	 */
	async blockUser(userIdOne: number, userIdTwo: number): Promise<FriendShip>
	{
		//Delete if relation exist & != Block (2, 1)
		await this.friendRepository
		    .createQueryBuilder()
		    .delete()
		    .from(FriendShip)
		    .where("id_one = :id", { id: userIdTwo })
			.andWhere("id_two = :id", { id: userIdOne })
			.andWhere("status = :status", { status: EStatus.FRIEND})
		    .execute();

		//Update relation (1, 2)
		let relation = await this.findFriendRelationOf(userIdOne, userIdTwo);
		if (relation === undefined)
		{
			relation = {
				id: undefined,
				id_one: userIdOne,
				id_two: userIdTwo,
				status: EStatus.BLOCK,
			}
		}
		relation.status	= EStatus.BLOCK;

		return await this.friendRepository.save(relation);
	}

	async unBlockUser(userIdOne: number, userIdTwo: number): Promise<void>
	{
		
		await this.friendRepository
		.createQueryBuilder()
		.delete()
		.from(FriendShip)
		.where("id_one = :id", { id: userIdOne })
		.andWhere("id_two = :id", { id: userIdTwo })
		.andWhere("status = :status", { status: EStatus.BLOCK})
		.execute();
	}

}
