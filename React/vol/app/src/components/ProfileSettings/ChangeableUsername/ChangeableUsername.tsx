import axios from "axios";
import React, { useCallback } from "react";
import { useAuth } from "../../../auth/useAuth";
import IUser from "../../../Common/Dto/User/User";
import { ELevel, useNotifyContext } from "../../NotifyContext/NotifyContext";
import "./ChangeableUsername.css";

interface userProps
{
	user: IUser;
}

function ChangeableUsername(props: userProps)
{
	const {user, setUser} = useAuth();
	const notif = useNotifyContext();

	const getUserName = useCallback(() => {
		return user?.username
	}, [user])

	const updateUsername = useCallback((event: React.SyntheticEvent) =>	{
		event.preventDefault();

		let target = event.target as typeof event.target & {
			username: {value: string};
		};
		const url = process.env.REACT_APP_API_USER + '/' + props.user.reference_id +  '/username';
		const headers = {
			'authorization'	: props.user.accessCode,
		}
		const data = {
			'username' : target.username.value,
		}
		console.log(user?.accessCode);
		axios({
			method: 'put',
			url: url,
			headers: headers,
			data: data,
		})
		.then(res => {
			if (user === null)
				return ;
			const newUser : IUser = {
				id:							user.id,
				reference_id:				user.reference_id,
				username:					target.username.value,
				accessCode:					user.accessCode,
				creation_date:				user.creation_date,
				useTwoFa: 					user.useTwoFa,
				avatar_last_update: 		user.avatar_last_update,
			}
			setUser(newUser);
			target.username.value = '';
			notif.addNotice(ELevel.info, 'Username changed', 3000);
		})
		.catch(err => {
			notif.addNotice(ELevel.error, err.response.data.message, 3000);
			target.username.value = '';
		})

		
	}, [user, setUser, props.user.reference_id, props.user.accessCode, notif])

	return (
		<form id="current_profile_username" onSubmit={updateUsername}>
			<input type="text" name="username" maxLength={20} id="profile_username_input"
				placeholder={getUserName()}  />
			<input type="submit" id="new_username_submit" value="Change" />
		</form>
	);
}

export default ChangeableUsername;
