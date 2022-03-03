import React, { createContext, useContext, useState } from "react";
import { Route } from "react-router-dom";

interface IContext
{
	user: string,
	signin?: any,
	signout?: any,
}

const fakeAuth = {
	isAuthenticated: false,
	signin(cb: TimerHandler) {
	  fakeAuth.isAuthenticated = true;
	  setTimeout(cb, 100); // fake async
	},
	signout(cb: TimerHandler) {
	  fakeAuth.isAuthenticated = false;
	  setTimeout(cb, 100);
	}
 };

const authContext = createContext<IContext>({user: ''});

function useAuth()
{
	return useContext(authContext);
}

function useProvideAuth(): IContext
{
	const [user, setUser] = useState<string>("");

	const signin = (cb: () => void) =>
	{
		return fakeAuth.signin(() => 
		{
			setUser("auth");
			cb();
		});
	}

	const signout = (cb: () => void) =>
	{
		return fakeAuth.signin(() => 
		{
			setUser("");
			cb();
		});
	}
	return {
		user,
		signin,
		signout,
	};
}

function ProvideAuth( {children}: {children: JSX.Element} ): JSX.Element
{
	const auth = useProvideAuth();

	return(
		<authContext.Provider value={auth}>
			{children}
		</authContext.Provider>
		);
}

interface IProps
{
	element: JSX.Element,
}

import axios from "axios";


function ShowAuthWindow(this: any, options :any)
{
  console.log('Option set');
    options.windowName = options.windowName ||  'ConnectWithOAuth'; // should not include space for IE
    options.windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=400';
    //options.callback = options.callback || function(){ window.location.reload(); };
    var that = this;
    console.log(options.path);
    that._oauthWindow = window.open(options.path, options.windowName, options.windowOptions);
   /* that._oauthInterval = window.setInterval(function(){
        if (that._oauthWindow.closed) {
            window.clearInterval(that._oauthInterval);
            options.callback();
        }
    }, 1000);*/
} 

//create new oAuth popup window and monitor it



function NoAcces()
{
	const auth = useAuth();
	
	let login = () => {
		//auth?.signin();
		const url = "http://localhost/api/auth/login";
		let win = window.open(url, 'authWindow', "toolbar=no,scrollbars=yes,resizable=no,width=500,height=600");
		if (win instanceof Window)
		{
			
			console.log('Window created');
			/*win.setInterval(() : void => {
				/*let href : any ;
				
				try
				{
					href = win?.location.href;
				}
				catch(e)
				{
					console.log(e);
				}
				console.log("href : " + href);
				
				console.log('Win inter');
			}, 1000);*/
			
			console.log(win.location.href);


			let loginInterval = window.setInterval(function() {
				if (win instanceof Window)
				{
					console.log(win.closed);
					console.log(win.location.toString());
					const url =  win.location.toString(); 
					if (win.closed)
					{
						win.close();
						window.clearInterval(loginInterval);
					}
				}
			}, 1000);
		}

		/*let isClose = win?.closed();
		*/

	}

	return (
	  <div>
		<h3>
		  No right for <code>{location.pathname}</code>
		  <button onClick={login}>signin</button>
		</h3>
	  </div>
	);
  }

function PrivateRoute(props: IProps) : JSX.Element
{
	const auth = useAuth();

	if (auth.user)
		return (props.element);
	else
		return <NoAcces />;
}
//<Route path="/profile" element={<PrivateRoute element={<Profile/>}/>}/>

export { PrivateRoute, ProvideAuth };