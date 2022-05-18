import axios from "axios";
import IUser from "../../../interface/User";
import React, { useEffect, useState } from "react";
import DefaultPP from "../../../ressources/images/user-icon-0.png";
import EditLogo from "../../../ressources/images/draw.png";
import "./ChangeablePP.css"

interface infoProp
{
	user: IUser;
}

function ChangeablePP (props :infoProp)
{
	const [img, setImg] = useState(DefaultPP);
	const [file, setFile] = useState<File | undefined >(undefined);

	function changePP(e: React.ChangeEvent<HTMLInputElement>)
	{
		if (!e.target.files || e.target.files.length === 0) {
            setFile(undefined)
            return
        }
		//setFile(e.target.files[0]);

		const value : File = e.target.files[0];
        // I've kept this example simple by using the first image instead of multiple
        
		if (props.user)
		{
			const url = process.env.REACT_APP_API_USER + '/' + props.user.id +  '/avatar';
			const headers = {
				//'authorization'	: user.access_token_42,
				//'grant-type': 'authorization-code',
				//'authorization-code': accessCode
				'content-type'	: process.env.REACT_APP_AVATAR_TYPE || '',
			}
			axios.post(url, file, {headers})
			.then(res => {
				if (process.env.NODE_ENV === "development")
				{
					console.log('Avatar Post succes');
				}
				setFile(value);
			})
			.catch(res => {
				console.log(res);
			});
		}
	}

	useEffect(() => {
		if (!file) {
			setImg(DefaultPP);
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setImg(objectUrl);

		// free memory when ever this component is unmounted
		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	return (
		<label id="pp_label">
			<img src={img} alt="PP" id="profile_pic"/>
			<img src={EditLogo} alt="edit" className="edit_logo"
				id="profile_pic_edit_logo" />
			<input id="new_pp_input" type="file" name="img" accept="image/*"
				onChange={changePP}/>
		</label>
	);
}

export default ChangeablePP;