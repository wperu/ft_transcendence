
function receiveMessage(event : any)
{
	console.log('Messeng recv from ' + event.origin);
	console.log(event.data);
	if (event.origin !== 'http://localhost/callback')
		return ;
	console.log('Messeng :');
}

function openLoginPopup() : void
{
	const apiUrl 		= process.env.REACT_APP_API_URL || "/";
	const winOptions	= "toolbar=no,scrollbars=yes,resizable=no,width=500,height=600";
	let listener		= window.addEventListener('message', receiveMessage, false);
	let winPopupRef		= window.open(apiUrl, 'authWindow', winOptions);

	console.log("Window open");
	let loginInterval = window.setInterval(function() {
		if (winPopupRef instanceof Window)
		{
			if (winPopupRef.closed || !winPopupRef)
			{
				window.removeEventListener('message', receiveMessage, false);
				window.clearInterval(loginInterval);
			}
		}
	}, 1000);
	
}

const authProvider =
{
	//isAuth: false,
	signin() {
		//this.isAuth = true;
		setTimeout(openLoginPopup, 100); // fake async
	},
	sigout(callback : VoidFunction) {
		//this.isAuth = false;
		//setTimeout(callback, 100); // fake async
	},
};


export { authProvider, openLoginPopup };