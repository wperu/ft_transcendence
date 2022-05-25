import React, { useEffect, useState, KeyboardEvent } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ELevel, useNotifyContext } from "../../components/NotifyContext/NotifyContext";

function Callback() : JSX.Element
{
	const { search  } = useLocation();
	const [needForm, setNeedForm] = useState<boolean>(true);
	const notif = useNotifyContext();

	function authUser()
	{
		const searchParams	= new URLSearchParams(search);
		const accessCode	= searchParams.get("code");
		
		if (window.opener === null)
			return ;

		if (accessCode !== null)
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
			})
			.catch(e =>
			{
				//console.log(e);
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
			.catch(function (error) {
				if (error.response) {
				  // The request was made and the server responded with a status code
				  // that falls out of the range of 2xx
				  // console.log(error.response.data);
				  notif.addNotice(ELevel.error, error.response.data.message, 3000);
				} else if (error.request) {
				  // The request was made but no response was received
				  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				  // http.ClientRequest in node.js
				  // console.log(error.request);
				} else {
				  // Something happened in setting up the request that triggered an Error
				  // console.log('Error', error.message);
				}
			  });

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