import React, { createContext, useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import openLoginPopup from "./authProvider";

interface IContext
{
	user: string,
	signin: (callback: VoidFunction) => void,
	signout: (callback: VoidFunction) => void,
	isAuth: boolean,
}

const authContext = createContext<IContext>(null!);

function useAuth() : IContext
{
	return useContext(authContext);
}

function useProvideAuth(): IContext
{
	const [user, setUser] = useState<string>("");
	const [isAuth, setIsAuth] = useState<boolean>(false);

	const signin = (cb: VoidFunction) =>
	{
		//FIXME
		//wait end of rcv event to check connexion
		openLoginPopup();
		if (localStorage.getItem('user') !== null)
			setIsAuth(true);
	}

	const signout = (cb: VoidFunction) =>
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
};

interface IProps
{
  element: JSX.Element,
}

function RequireAuth({ children }: {children: JSX.Element}): JSX.Element
{
	let auth		= useAuth();
	let location	= useLocation();

	if (!auth.isAuth)
	{
		return <Navigate to="/" state={{ from: location }} replace/>;
	}
	return children;
}

export { useAuth, ProvideAuth, RequireAuth };