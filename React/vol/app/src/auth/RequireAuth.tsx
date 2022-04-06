import React from "react";
import { useAuth } from "./useAuth";
import { useLocation, Navigate, Outlet } from "react-router-dom";

/**
 * Route become private to Auth user
 * 
 * example: <Route path="/Page" element={<RequireAuth children={<Page/>}/>}/>
 *//*
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

export { RequireAuth }*/


function RequireAuth(): JSX.Element
{
	let auth		= useAuth();
	let location	= useLocation();

	if (!auth.isAuth)
	{
		return <Navigate to="/login" state={{ from: location }} replace/>;
	}
	return <Outlet />;
}

export { RequireAuth }