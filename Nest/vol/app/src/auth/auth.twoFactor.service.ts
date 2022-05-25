import { Injectable } from "@nestjs/common";
import { authenticator } from 'otplib'; // v11.x
import qrcode from 'qrcode';

@Injectable()
export class TwoFactorService {

	constructor()
	{
		authenticator.options = { digits: 6 };	
	};
	
	private service : string = 'ft_tran';

	generateSecret() : string  { return authenticator.generateSecret(); }

	isValide(token: string, secret: string) : boolean | string
	{
		try {
			return authenticator.check(token, secret)
		}
		catch (err)
		{
			return err;
		}
	}

	getOtpAuth(username : string, secret : string) : string
	{
		const otpauth = authenticator.keyuri(username, this.service, secret);

		return otpauth;
	}

	getQrUrl(otpauth: string) : string | undefined
	{
		const url = qrcode.toDataURL(otpauth, (err, imageUrl) => {
			if (err) {
			  console.log('Error with QR');
			  return undefined;
			}
			console.log(imageUrl);
			return imageUrl;
		  });

		return url;
	}
}