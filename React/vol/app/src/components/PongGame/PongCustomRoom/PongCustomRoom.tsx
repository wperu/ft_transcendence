import { cleanup } from "@testing-library/react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { usePongContext } from "../PongContext/ProvidePong";
import { UserCustomRoomDTO } from "../../../Common/Dto/pong/UserCustomRoomDTO";
import { useAuth } from "../../../auth/useAuth";



//Reload When chang id;
export function PongCustomRoom() : JSX.Element
{
	const { socket, isAuth }	= usePongContext();
	const { user }				= useAuth();
	const [inRoom, setInRoom]	= useState<boolean>(false);
	const [users, setUsers]		= useState<Array<UserCustomRoomDTO> >([]);
	const { id }				= useParams<("id")>();
	const navigate				= useNavigate();
	const [isOwner, setIsOwner]				= useState<boolean>(false);
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
		//	socket.emit("LEAVE_CUSTOM_ROOM", id);
		//	setInRoom(false);
		}
		navigate("/matchmaking", { replace: false })
	}, [inRoom, socket, navigate])

	useEffect(() => {
		return () =>  {
			socket.emit("LEAVE_CUSTOM_ROOM", id);
		}
	}, [])

	useEffect(() => {
		if (user && users.length !== 0 && user.reference_id === users[0].reference_id)
		{
			setIsOwner(true);
		}
		else
		{
			setIsOwner(false);
		}
	}, [users, user])

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

	const startGame = useCallback(() => {
			socket.emit("START_CUSTOM_ROOM", id);
	}, [socket, id])


	return	<div>
				auth :				{isAuth ? "true" : "false"}<br/>
				status :			{inRoom ? "true" : "false"}<br/>
				can play : 			{users.length >= 2 ? "true" : "false"}<br/>
				numbers of users :	{users.length}<br/>
				owner : 			{users.length !== 0 ? users[0].username : "n/a"}<br/>

				<button onClick={leaveRoom}>Leave</button><br/>
				{users.map((u, index) => {return <li key={index}>{u.username}</li>})}
				<Link to="/" replace={false}><button>main</button></Link>

				{isOwner && users.length >= 2 ? <><button onClick={startGame}>Start</button></>: <></>  }
			</div>;
}
