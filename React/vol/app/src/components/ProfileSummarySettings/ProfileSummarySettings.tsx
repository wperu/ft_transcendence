import React, {useState, useRef, useEffect} from "react";
import "./ProfileSummarySettings.css";
import defaultLogo from "../../ressources/images/user-icon-0.png";
import IUser from "../../interface/User";
import { useAuth } from "../../auth/useAuth";

function ProfileSummarySettings() {

	const { user } = useAuth();
	const [img, setImg] = useState(defaultLogo);
	const [file, setFile] = useState<File | undefined >(undefined);

	const inputEl = useRef(null);


	function getUserName() : string
	{
		if (user === null)
			return ("default");
		return (user.username);
	}
	//<img src={defaultLogo} alt="truc" />

	function selectFile(e: React.ChangeEvent<HTMLInputElement>)
	{
		if (!e.target.files || e.target.files.length === 0) {
            setFile(undefined)
            return
        }

        // I've kept this example simple by using the first image instead of multiple
        setFile(e.target.files[0]);
		
	}
	useEffect(() => {
        if (!file) {
            setImg(defaultLogo);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setImg(objectUrl);

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

	return (
		<aside id="profile">
			<div id="img-upload">
				<label >
					<img src={img} alt="truc" />
					<input id="input-img" type="file" src={defaultLogo} name="img" accept="image/*"  ref={inputEl} onChange={selectFile}/>
				</label>
			</div>

			<div id="infos">
				<p> {'> '} {getUserName()}</p>
				<p> {'> '} Level</p>
			</div>
		</aside>
	);
}

export default ProfileSummarySettings;