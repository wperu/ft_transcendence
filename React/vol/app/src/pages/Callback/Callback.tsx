import React, { useEffect, useState, KeyboardEvent, useCallback } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ELevel, useNotifyContext } from "../../components/NotifyContext/NotifyContext";
import "./Callback.css";

function Callback()
{
	const { search  } = useLocation();
	const [needForm, setNeedForm] = useState<boolean>(true);
	const [useTwoFactor, setUseTwoFactor] = useState<boolean>(true);
	const notif = useNotifyContext();

	const authUser = useCallback((data: any = undefined) =>
	{
		const searchParams	= new URLSearchParams(search);
		const accessCode	= searchParams.get("code");

		if (window.opener === null)
			return ;

		if (accessCode !== null)
		{
			const url = process.env.REACT_APP_API_URL + '/auth/token';
			axios({
				method: 'post',
				url: url,
				headers: {
					'grant-type': 'authorization-code',
					'authorization-code': accessCode
				},
				data: data
			})
			.then(res => {
				window.opener.postMessage(res.data, process.env.REACT_APP_ORIGIN_URL);
				window.close();
			})
			.catch(error =>
			{
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
			})

		}
		else
		{
			// console.log('no code in query');
		}
	}, [notif, search])

	useEffect(() => {
		const searchParams	= new URLSearchParams(search);
		const register		= searchParams.get("register");
		const twoFactor		= searchParams.get("useTwoFactor");

		if(twoFactor === "false")
		{
			setUseTwoFactor(false);
		}
		if(register === "false")
		{
			setNeedForm(false);
		}
	}, [search])

	useEffect(() => {
		if (needForm === false && useTwoFactor === false)
			authUser();
	}, [needForm, authUser, useTwoFactor])


	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		const searchParams	= new URLSearchParams(search);
		const accessCode	= searchParams.get("code");

		if (event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			const url = process.env.REACT_APP_API_URL + '/auth/register';
			axios({
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

	function sendToken(event: KeyboardEvent<HTMLInputElement>)
	{
		if (event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			authUser({token: event.currentTarget.value});
			event.currentTarget.value = '';
		}
	}

	if (needForm)
	{
		return (
			<div className="first_login">
				Please choose your username and press Enter
				<input className="first_login_username" type="text" maxLength={20}
					placeholder={'username'} onKeyPress={pressedSend} />
			</div>
		);
	}
	else if (useTwoFactor)
	{
		return (
			<div className="first_login">
				Please your google authentificator code and press Enter
				<input className="first_login_username" type="text" maxLength={6}
					placeholder={'token'} onKeyPress={sendToken} />
			</div>
		);
	}
	else
		return null;
}

export default Callback;
