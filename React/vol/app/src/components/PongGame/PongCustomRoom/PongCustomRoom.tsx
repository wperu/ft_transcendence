import { cleanup } from "@testing-library/react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { usePongContext } from "../PongContext/ProvidePong";
import { UserCustomRoomDTO } from "../../../Common/Dto/pong/UserCustomRoomDTO";

export function PongCustomRoom() : JSX.Element
{
	const {socket, isAuth}		= usePongContext();
	const [inRoom, setInRoom]	= useState<boolean>(false);
	const [users, setUsers]		= useState<Array<UserCustomRoomDTO> >([]);
	const { id }				= useParams<("id")>();


	/**
	 *
	 */
	useEffect(() => {
		if (isAuth && inRoom === false)
		{
			console.log("Sent !");
			socket.emit("JOIN_CUSTOM_ROOM", id)
		}
	}, [socket, id, isAuth, inRoom])


	const leaveRoom = useCallback(() => {
		if (inRoom)
		{
			socket.emit("LEAVE_CUSTOM_ROOM", id)
			setInRoom(false);
		}
	}, [inRoom, socket])

	useEffect(() => {
		return () =>  {
			socket.emit("LEAVE_CUSTOM_ROOM", id)
		}
	}, [])

	useEffect(() => {
			socket.on("JOINED_CUSTOM_ROOM", () => {

				setInRoom(true);
				console.log("Room joined");
			})

			socket.on("LEFT_CUSTOM_ROOM", () => {

				setInRoom(false);
				console.log("Room left");
			})

			socket.on("USERS_CUSTOM_ROOM", (users : Array<UserCustomRoomDTO>) => {
					setUsers(users);
					console.log(users);
			})

		//CleanUp
		return () => {
			socket.off("JOINED_CUSTOM_ROOM");
			socket.off("LEFT_CUSTOM_ROOM");
			socket.off("USERS_CUSTOM_ROOM");
		}

	}, [socket])


	return	<div>
				auth :				{isAuth ? "true" : "false"}<br/>
				status :			{inRoom ? "true" : "false"}<br/>
				numbers of users :	{users.length}<br/>
				owner : 			{users.length !== 0 ? users[0].username : "n/a"}<br/>

				<button onClick={leaveRoom}>Leave</button><br/>
				{users.map((u, index) => {return <li key={index}>{u.username}</li>})}
			</div>;
}
