import IUser from "../interface/User";

/**
 * 	Open login popup
 * 	
 *  if auth is success
 * 	set 'user' in localstorage and launch cb()
 * 	
 * @param cb : callback fct
 */
function openLoginPopup(cb: () => void)
{
	window.addEventListener('message', messageListener, false);
	const apiUrl 		= process.env.REACT_APP_API_LOGIN || "/";
	const winOptions	= "toolbar=no,scrollbars=yes,resizable=no,width=500,height=600";
	let winPopupRef		= window.open(apiUrl, 'authWindow', winOptions);

	function messageListener(event : any)
	{
		console.log('Messeng recv from ' + event.origin);
		console.log(event.data);
		
		
		if (event.origin !== process.env.REACT_APP_ORIGIN)
		{
			console.log("event.origin" + event.origin);
			return ;
		}
		
		console.log("Get IUser");
		const user : IUser	= event.data;

		//todo
		//do stuff with user
		localStorage.setItem("user", JSON.stringify(user));
		cb();
	}


	console.log("Window open");
	let loginInterval = window.setInterval(function() {
		if (winPopupRef !== null)
		{
			if (winPopupRef.closed || !winPopupRef)
			{
				window.removeEventListener('message', messageListener, false);
				window.clearInterval(loginInterval);
			}
		}
	}, 1000);
}


export default openLoginPopup ;