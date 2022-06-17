import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatPasswordService
{
	private readonly saltOrRounds: number;
	constructor()
	{
		this.saltOrRounds = 10;
	}

	async genHash(password: string): Promise<string>
	{
		const salt = await bcrypt.genSalt(this.saltOrRounds);
		const hash = await bcrypt.hash(password, salt);
		
		return hash;
	}

	async isMatch(password: string | null, hash: string | null): Promise<boolean>
	{
		if (hash === null)
			return true;
		if (password === null)
			return false;
		
		const ret = await bcrypt.compare(password, hash);

		return ret;
	}
	
}