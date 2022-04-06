import React from "react";
import "./MainMenuButton.css";

export function SimpleButton({ name } : {name:string})
{
	return <button>{name}</button>;
}