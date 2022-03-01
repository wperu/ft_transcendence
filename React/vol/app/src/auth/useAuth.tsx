import React, { createContext, useContext, useState } from "react";

interface IUser
{

}

interface IContext
{
	IUser
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

const authContext = createContext(null);

function useAuth()
{
	return useContext(authContext);
}

function useProvideAuth()
{
	const [user, setUser] = useState<IUser | null>(null);

	const signin = (cb: () => void) =>
	{
		return fakeAuth.signin(() => 
		{
			setUser("user");
			cb();
		});
	}

	const signout = (cb: () => void) =>
	{
		return fakeAuth.signin(() => 
		{
			setUser(null);
			cb();
		});
	}
	return {
		user,
		signin,
		signout,
	};
}

function ProvideAuth(children: JSX.Element): JSX.Element
{
	const auth = useProvideAuth();

	return(
		<authContext.Provider value={auth}>
			{children}
		</authContext.Provider>
		);
}