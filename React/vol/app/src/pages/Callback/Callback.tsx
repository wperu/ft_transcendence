import React, { useEffect, useState, KeyboardEvent } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function Callback() : JSX.Element
{
	const { search  } = useLocation();
	const [needForm, setNeedForm] = useState<boolean>(true);

	function authUser()
	{
		const searchParams	= new URLSearchParams(search);
		const accessCode	= searchParams.get("code");
		
		

		if (window.opener === null)
			return ;

		

		if ( accessCode !== null)
		{
			console.log(accessCode);

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
			})
			.catch(e =>
			{
				console.log(e);
			})
				
		}
		else
		{
			console.log('no code in query');
		}
	}

	useEffect(() => {
		const searchParams	= new URLSearchParams(search);
		const register		= searchParams.get("register");

		if(register === "false")
		{
			setNeedForm(false);
			return ;
		}
	}, [])

	useEffect(() => {		
		if (needForm === false)
			authUser();
	}, [needForm])

	//todo register part
	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		const searchParams	= new URLSearchParams(search);
		const accessCode	= searchParams.get("code");

		if (event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			const url = process.env.REACT_APP_API_URL + '/auth/register';
			const resp = axios({
				method: 'post',
				url: url,
				headers: {
					'grant-type': 'authorization-code',
					'authorization-code': accessCode || ""
				},
				data: {
					username: event.currentTarget.value,
				}
				
			})
			.then((resp) => {
				setNeedForm(false);
			})
			.catch(resp => {
				console.log('bad querry');
				console.log(resp.body.message);
			})

			event.currentTarget.value = '';
		}
	};

	//todo form
	if (needForm)
		return(	<div>
				<input type="text" maxLength={20} placeholder={'username'} onKeyPress={pressedSend}  />
			</div>);
	else
		return <div></div>;
}

export default Callback;