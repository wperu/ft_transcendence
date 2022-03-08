import React from "react";
import axios from "axios";

function Callback() : JSX.Element
{
	const urlParams		= location.search;
	const searchParams	= new URLSearchParams(urlParams);
	let accessCode		= searchParams.get("code");

	function authUser()
	{
		if (window.opener === null)
			return ;

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
	}	
	
	authUser();
	return <div></div>;
}

export default Callback;