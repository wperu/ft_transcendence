import Login from "../components/Login/Login";


function openLoginPopup() : void
{
	const apiUrl 		= "http://localhost/api/auth/login";
	const winOptions	= "toolbar=no,scrollbars=yes,resizable=no,width=500,height=600";
	let winPopupRef		= window.open(apiUrl, 'authWindow', winOptions);

	let loginInterval = window.setInterval(function() {
		if (winPopupRef instanceof Window)
		{
			if (winPopupRef.closed || !winPopupRef)
			{
				window.clearInterval(loginInterval);
			}
			else
			{
				winPopupRef.close();
			}
		}
	}, 3000);
	
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