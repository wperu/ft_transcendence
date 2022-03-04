import React, { createContext, useContext, useState } from "react";
import { Route } from "react-router-dom";

interface IContext
{
	user: string,
	signin?: any,
	signout?: any,
	isAuth: boolean,
}


const authContext = createContext<IContext>({user: '', isAuth: false});

function useAuth()
{
	return useContext(authContext);
}

function useProvideAuth(): IContext
{
	const [user, setUser] = useState<string>("");
	const [isAuth, setIsAuth] = useState<boolean>(false);

	const signin = (cb: () => void) =>
	{
		setIsAuth(true);
		cb();
	}

	const signout = (cb: () => void) =>
	{
		setIsAuth(false);
		cb();
	}

	return {
		user,
		signin,
		signout,
		isAuth,
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

function NoAccess()
{
	const auth = useAuth();
	
	let login = () => {
		auth.signin();
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

	const logout = () => {
		auth.signout();
	}

	if (auth.isAuth)
	{
		return (
			<div>
				<button onClick={logout}>signout</button>
				{ props.element }
			</div>
		);
	}
	else
		return <NoAccess />;
}
//<Route path="/profile" element={<PrivateRoute element={<Profile/>}/>}/>

export { PrivateRoute, ProvideAuth };