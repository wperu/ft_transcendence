import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RoomOptions, usePongContext } from "../PongContext/ProvidePong";
import { UserCustomRoomDTO } from "../../../Common/Dto/pong/UserCustomRoomDTO";
import { UpdateCustomRoomDTO } from "../../../Common/Dto/pong/UpdateCustomRoomDTO";
import { useAuth } from "../../../auth/useAuth";
import BackToMainMenuButton from "../../FooterButton/BackToMainMenuButton";
import "./PongCustomRoom.css";

interface pongUserProp
{
	username: string;
	ref_id: number;
	position: number;
}

function PongUser(props: pongUserProp)
{
	let	status: string;

	if (props.position === 0)
		status = "player, owner";
	else if (props.position === 1)
		status = "player";
	else
		status = "spectator";

	return (
		<div key={props.position} className="custom_room_user">
			<Link to={"/profile/" + props.ref_id}  replace={false}>
				<img alt="" className="custom_room_avatar"
					src={process.env.REACT_APP_API_USER + '/' + props.ref_id.toString() + '/avatar'} />
			</Link>
			<Link to={"/profile/" + props.ref_id}  replace={false}>
				{props.username}
			</Link>
			<div className="custom_room_user_status">{status}</div>
		</div>
	);
}

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

	const [doubleBall, setDoubleBall]		= useState<boolean>(false);
	const [iceFritction, setIceFrition]		= useState<boolean>(false);

	useEffect(() => {
		if (isAuth && inRoom === false)
		{
			// console.log("Sent !");
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
	}, [inRoom, navigate])

	const updateOptions = useCallback((opt: number, mode: number /* 1- set / 0- unset */) => {
		if (opt & RoomOptions.DOUBLE_BALL)
			setDoubleBall(mode === 0 ? false : true);
	
		if (opt & RoomOptions.ICE_FRICTION)
			setIceFrition(mode === 0 ? false : true);
		
		socket.emit("UPDATE_CUSTOM_ROOM", {room_id: id, options: opt, mode: mode} as UpdateCustomRoomDTO)
	}, [id, socket]);

	useEffect(() => {
		return () =>  {
			socket.emit("LEAVE_CUSTOM_ROOM", id);
			setInRoom(false);
			setUsers([]);
		}
	}, [id, socket])

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
				// console.log("Room joined");
			})

			socket.on("LEFT_CUSTOM_ROOM", () => {
				setInRoom(false);
				// console.log("Room left");
			})

			socket.on("USERS_CUSTOM_ROOM", (users : Array<UserCustomRoomDTO>) => {
				setUsers(users);
				// console.log(users);
			})

			socket.on("CUSTOM_ROOM_UPDATE_MODE", (data: { options: number, mode: number }) => {
				if (data.options & RoomOptions.DOUBLE_BALL)
					setDoubleBall(data.mode === 0 ? false : true);
				if (data.options & RoomOptions.ICE_FRICTION)
					setIceFrition(data.mode === 0 ? false : true);
			})

		//CleanUp
		return () => {
			socket.off("JOINED_CUSTOM_ROOM");
			socket.off("LEFT_CUSTOM_ROOM");
			socket.off("USERS_CUSTOM_ROOM");
			socket.off("CUSTOM_ROOM_UPDATE_MODE")
		}

	}, [socket])

	const startGame = useCallback(() => {
			socket.emit("START_CUSTOM_ROOM", id);
	}, [socket, id])

	function OwnerGameModes()
	{
		return (
			<div id="owner_view">
				<label className="option_checkbox">
					<input type='checkbox' checked={doubleBall} onChange= { (e) => updateOptions(RoomOptions.DOUBLE_BALL, e.target.checked === true ? 1 : 0) }></input>
					Double ball
				</label>
	
				<label className="option_checkbox">
					<input type='checkbox' checked={iceFritction} onChange= { (e) => updateOptions(RoomOptions.ICE_FRICTION, e.target.checked === true ? 1 : 0) }></input>
					Ice friction
				</label>
			</div>
		);
	}

	function PlayerGameModes()
	{
		return (
			<div id="not_owner_view">
				<div id="options">
					{/* <span>Game modes selected:</span> */}
					{doubleBall ? <span className="selected_option">Double ball</span> : null}
					{iceFritction ? <span className="selected_option">Ice friction</span> : null}
					{/* {!iceFritction && !doubleBall? "none" : null} */}
				</div>
				<div id="info"> Waiting for the owner of the room </div>
			</div>
		);
	}

	return (
		<div id="custom_room">
			<div id="custom_room_users">
				{users.map(({username, reference_id}, index) => {
					return (
						<PongUser key={index} username={username} ref_id={reference_id} position={index}/>
					);
				})}
			</div>
			{isOwner?<OwnerGameModes />:<PlayerGameModes/>}
			<footer>
				<Link to="/" replace={false}> <BackToMainMenuButton /> </Link>
				{isOwner && users.length >= 2 ?
					<button className="start_game_button" onClick={startGame}>Start</button>
					: null}
				<button className="footer_button" onClick={leaveRoom}>Go to matchmaking</button>
			</footer>
		</div>
	);
}
