import React, { createContext, useContext, useState } from "react";
import IUser from "../Common/Dto/User/User";
import openLoginPopup from "./openLoginPopup";

interface IContext
{
	signin:		(callback: () => void) => void,
	signout:	(callback: () => void) => void,
	isAuth:		boolean,
	setIsAuth:	(auth : boolean) => void,
	user: 		IUser | null;
	setUser:	(user: IUser | null) => void,
}

const authContext = createContext<IContext>(null!);

/**
 * /!\ component must be in \<ProvideAuth\>
 *
 * @returns authContext : IContext
 */
function useAuth() : IContext
{
	return useContext(authContext);
}

/**
 * Set auth context
*/
function useProvideAuth(): IContext
{
	const [isAuth, setIsAuth] = useState<boolean>(false);
	const [user, setUser] = useState<IUser | null>(null);

	const signin = (cb: () => void) =>
	{
		openLoginPopup(cb);
	}

	const signout = (cb: VoidFunction) =>
	{
		setIsAuth(false);
		cb();
	}


	return {
		signin,
		signout,
		isAuth,
		setIsAuth,
		user,
		setUser,
	};
}

/**
 * Init context for children
 */
function ProvideAuth( {children}: {children: JSX.Element} ): JSX.Element
{
	const auth = useProvideAuth();

	return(
		<authContext.Provider value={auth}>
			{children}
		</authContext.Provider>
		);
};

export { useAuth, ProvideAuth };
