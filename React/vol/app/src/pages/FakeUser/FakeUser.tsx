import axios from "axios";
import React, {KeyboardEvent} from "react";


function submitFakeUser(event: React.KeyboardEvent<HTMLInputElement>)
{
    console.log(event);
    if (event.key === "Enter" && event.currentTarget.value.length > 0)
    {
        const url : string	= process.env.REACT_APP_API_AUTH + "/dev-user" || "/";
        const username = event.currentTarget.value;

        axios.post(url, undefined, { 
            headers: {
                username: username,
            }
        }).then(() => {
            console.log(`sent request for creating dev user ${username}`);
        });
        event.currentTarget.value = '';
    }
}

function FakeUser()
{
    return (
        <div>
            <h3>Fake Username: </h3>
            <input type="text" onKeyPress={submitFakeUser}></input>
        </div>
    );
}

export { FakeUser };