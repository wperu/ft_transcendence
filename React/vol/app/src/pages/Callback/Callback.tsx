import React from "react";
import axios from "axios";

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
				url: 'http://localhost/api/auth/token',
				headers: {
					'grant-type': 'authorization-code',
					'authorization-code': accessCode
				},
			})
			.then(res => {				
				window.opener.postMessage(res.data, "http://localhost");
				window.close();
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