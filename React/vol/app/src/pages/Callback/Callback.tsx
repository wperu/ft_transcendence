import React from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function Callback() : JSX.Element
{
	let location		= useLocation();
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
				const url = process.env.REACT_APP_API_URL + '/auth/token';
				const response = axios({
					method: 'post',
					url: url,
					headers: {
						'grant-type': 'authorization-code',
						'authorization-code': accessCode
					},
				})
				.then(res => {				
					window.opener.postMessage(res.data, process.env.REACT_APP_ORIGIN_URL);
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
	//todo in with useEffect() try
	authUser();
	return <div></div>;
}

export default Callback;