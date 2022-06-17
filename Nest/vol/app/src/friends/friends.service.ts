import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EStatus, FriendShip } from 'src/entities/friend_ship.entity';
import { In, Repository } from 'typeorm';


/**
 * //TODO
 * * Request avoid friend
 * * unfriend
 * * add Try Catch on save (prevent thow from duplication of relation)
 * * send response with string return like roomService
 * * add Date() to request.
 * * maybe add getter to make a request ?
 */
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
		try
		{
			const ret = await this.friendRepository.find({
				where: {
					id_one: id_one,
					status: EStatus.FRIEND,
				},
			});
			if (ret)
				return ret;
			else
				return [];
		}
		catch(e)
		{
			return [];
		}

	}

	/**
	 *
	 * @param userId
	 * @returns
	 */
	async findBlockedOf(userId: number): Promise<FriendShip[]>
	{
		try
		{
			const ret =  await this.friendRepository.find({
				where: {
					id_one: userId,
					status: EStatus.BLOCK
				},
			});

			if (ret)
				return ret;
			else
				return [];
		}
		catch(e)
		{
			return [];
		}
	}

	/**
	 *
	 * @param userId
	 * @returns
	 */
	async findRequestOf(userId: number): Promise<FriendShip[]>
	{
		try
		{
			const ret =await this.friendRepository.find({
			where: {
				id_two: userId,
				status: EStatus.REQUEST
			},
			});
			if (ret)
				return ret;
			return [];
		}
		catch (e)
		{
			return [];
		}
	}

	async findRelById(id: number): Promise<FriendShip | undefined>
	{
		try
		{
			const rel = await this.friendRepository.findOne({
				where: {
					id: In([id])
				},
			});
			if (rel)
				return rel;
			else
				return undefined
		}
		catch (e)
		{
			return undefined;
		}
	}

	async safeFriendSave(rel : FriendShip) : Promise<FriendShip>
	{
		try {
			let ret = await this.friendRepository.save(rel);

			return ret;
		}
		catch (e)
		{
			return undefined;
		}
	}

	async safeFriendRm(rel : FriendShip) : Promise<FriendShip | undefined>
	{
		try {
			let ret = await this.friendRepository.remove(rel);

			return ret;
		}
		catch (e)
		{
			return undefined;
		}
	}

	/**
	 * return rel (1, 2)
	 * @param userIdOne
	 * @param userIdTwo
	 * @returns <FriendShip | undefined>
	 */
	async findFriendRelationOf(userIdOne: number, userIdTwo: number): Promise<FriendShip | undefined>
	{
		if (userIdOne === userIdTwo)
			return undefined;
		try
		{
			const ret = await this.friendRepository.findOne({
				where: {
					id_one: userIdOne,
					id_two: userIdTwo
				},
			});
			if (ret)
				return ret;
			else
				return undefined;
		}
		catch (e)
		{
			return undefined;
		}
	}


	//Todo if user1 and user2 request call -> accepteRequestFriend
	/**
	 * add new friend Request
	 *
	 * Send new request create or string with error or undefined for dupRequest
	 * @param userIdOne
	 * @param userIdTwo
	 * @returns
	 */
	async addRequestFriend(userIdOne: number, userIdTwo: number) : Promise<FriendShip | undefined>
	{
		if (userIdOne === userIdTwo)
			throw new Error("Don't you have any friend ?");
		const rel = await this.findFriendRelationOf(userIdOne, userIdTwo);
		if (rel !== undefined ) //request already exist or isFriend
		{
			throw new Error("Request already sent !");
		}
		else
		{
			let req: FriendShip = new FriendShip();
			const rel_two = await this.findFriendRelationOf(userIdTwo, userIdOne);

			if (rel_two !== undefined && rel_two.status === EStatus.BLOCK)
				throw new Error("Impossible request !");

			if (rel_two !== undefined && rel_two.status === EStatus.REQUEST)
			{
				rel_two.status = EStatus.FRIEND;

				if (await this.safeFriendSave(rel_two) === undefined)
					throw new Error("Impossible request !");

				req.status = EStatus.FRIEND;
			}
			else
			{
				req.status = EStatus.REQUEST;
			}
			req.id_one = userIdOne;
			req.id_two = userIdTwo;


			return await this.safeFriendSave(req);
		}
	}



	/**
	 *
	 * @param id : request_id
	 * @returns void
	 */
	async rmRequestFriend(id_two: number, id_one: number) : Promise<undefined>
	{
		const rel = await this.findFriendRelationOf(id_one, id_two);

		if (rel !== undefined)
		{
			if (rel.status === 0)
			{
				await this.safeFriendRm(rel);
				return undefined;
			}
		}
		throw new Error("No request sent !");
	}

	/**
	 *
	 * @param userIdOne
	 * @param userIdTwo
	 * @returns
	 */
	async rmFriend(userIdOne: number, userIdTwo: number): Promise<void>
	{
		if (userIdOne === userIdTwo)
			return undefined;

		try
		{
			await this.friendRepository
			    .createQueryBuilder()
			    .delete()
			    .from(FriendShip)
			    .where("id_one = :id_one", { id_one: userIdOne })
				.andWhere("id_two = :id_two", { id_two: userIdTwo })
			    .execute();

			await this.friendRepository
			    .createQueryBuilder()
			    .delete()
			    .from(FriendShip)
			    .where("id_one = :id_one", { id_one: userIdTwo })
				.andWhere("id_two = :id_two", { id_two: userIdOne })
			    .execute();
		}
		catch
		{
			throw new Error("Impossible to remove friend relation !");
		}
		return ;
	}


	/**
	 *
	 * @param id request_id
	 */
	async acceptRequestFriend(id: number) : Promise<void>
	{
		//Set relation to FRIEND (1, 2)
		const rel = await this.findRelById(id);
		if (rel === undefined)
			throw Error("Impossible to accept friend request !");
		rel.status = EStatus.FRIEND;

		if (await this.safeFriendSave(rel) === undefined)
		throw Error("Impossible to accept friend request !");
		//await this.friendRepository.(rel);

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

		if (await this.safeFriendSave(rel_two) === undefined)
			throw Error("Impossible to accept friend request !");
	}

	/**
	 *
	 * @param userIdOne
	 * @param userIdTwo
	 * @returns Blocked relation
	 */
	async blockUser(userIdOne: number, userIdTwo: number): Promise<FriendShip | undefined>
	{
		if (userIdOne === userIdTwo)
			return undefined;
		try {
			//Delete if relation exist & != Block (2, 1)
			await this.friendRepository
			    .createQueryBuilder()
			    .delete()
			    .from(FriendShip)
			    .where("id_one = :id_one", { id_one: userIdTwo })
				.andWhere("id_two = :id_two", { id_two: userIdOne })
				.andWhere("status != :status", { status: EStatus.BLOCK})
			    .execute();


			let relation = await this.findFriendRelationOf(userIdOne, userIdTwo);
			if (relation === undefined)
			{
				relation = {
					id: undefined,
					id_one: userIdOne,
					id_two: userIdTwo,
					status: EStatus.BLOCK,
					date: new Date(),
				}
			}

			relation.status	= EStatus.BLOCK;
			return await this.safeFriendSave(relation);
		}
		catch
		{
			throw new Error("Impossible to block user !");
		}
	}

	async unBlockUser(userIdOne: number, userIdTwo: number): Promise<void>
	{
		if (userIdOne === userIdTwo)
			return undefined;
		try
		{
			await this.friendRepository
			.createQueryBuilder()
			.delete()
			.from(FriendShip)
			.where("id_one = :id_one", { id_one: userIdOne })
			.andWhere("id_two = :id_two", { id_two: userIdTwo })
			.andWhere("status = :status", { status: EStatus.BLOCK})
			.execute();
		}
		catch (e)
		{
			throw new Error("Impossible to unblock user !");
		}
	}

}
