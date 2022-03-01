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


function NoAcces() {
	const auth = useAuth();
	
	let login = () =>
	{
		auth?.signin();
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