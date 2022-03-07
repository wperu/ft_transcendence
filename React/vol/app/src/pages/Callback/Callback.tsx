import React from "react";
import axios from "axios";
import { firstValueFrom } from "rxjs";

function Callback() : JSX.Element
{

	const urlParams		= location.search;
	let searchParams	= new URLSearchParams(urlParams);
	

	console.log("url is : " + urlParams);
	let accessCode = searchParams.get("code");
		
	if ( accessCode !== null)
	{
		try
		{
			const response = axios({
				method: 'post',
				url: 'http://localhost/api/users',
				headers: {
					'authorization-code': accessCode
				},
			})
			.then(res => {
				console.log(res);
			});

		}
		catch(e)
		{
			console.log(e);
		}
	}
	else
	{
		console.log('no code in query');
	}

	return <div></div>;
}

export default Callback;