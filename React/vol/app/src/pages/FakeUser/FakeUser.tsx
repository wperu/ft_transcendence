import axios from "axios";
import React, {KeyboardEvent} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import IUser from "../../Common/Dto/User/User";




function FakeUser()
{
	const navigate	= useNavigate();
	const auth		= useAuth();

	function submitFakeUser(event: React.KeyboardEvent<HTMLInputElement>)
	{
		

	    //console.log(event);
	    if (event.key === "Enter" && event.currentTarget.value.length > 0)
	    {
	        const url : string	= process.env.REACT_APP_API_AUTH + "/dev-user" || "/";
	        const username = event.currentTarget.value;

	        axios.post(url, undefined, { 
	            headers: {
	                username: username,
	            }
	        }).then((rep) => {
	            console.log(`sent request for creating dev user ${username}`);

				const user = rep.data as IUser;
				auth.setUser(user);
				auth.setIsAuth(true);
				
				navigate("/", {replace: true});
	        });
	        event.currentTarget.value = '';
	    }
	}

    return (
        <div>
            <h3>Fake Username: </h3>
            <input type="text" onKeyPress={submitFakeUser}></input>
        </div>
    );
}

export { FakeUser };