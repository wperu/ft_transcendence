import IUser from "../interface/User";

/**
	Open login popup

	set 'user' in localstorage

	//fixme
	wait end of event to send auth's response
*/
function openLoginPopup()
{
	const apiUrl 		= process.env.REACT_APP_API_URL || "/";
	const winOptions	= "toolbar=no,scrollbars=yes,resizable=no,width=500,height=600";
	let listener		= window.addEventListener('message', receiveMessage, false);
	let winPopupRef		= window.open(apiUrl, 'authWindow', winOptions);

	function receiveMessage(event : any)
	{
		console.log('Messeng recv from ' + event.origin);
		console.log(event.data);
		
		
		if (event.origin !== process.env.REACT_APP_ORIGIN)
			return ;

		const user : IUser	= event.data;
		

		//todo
		//do stuff with user
		localStorage.setItem("user", JSON.stringify(user));
	}


	console.log("Window open");
	let loginInterval = window.setInterval(function() {
		if (winPopupRef !== null)
		{
			if (winPopupRef.closed || !winPopupRef)
			{
				window.removeEventListener('message', receiveMessage, false);
				window.clearInterval(loginInterval);
			}
		}
	}, 1000);
}


export default openLoginPopup ;