import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import "./NotifyContext.css";

export enum ELevel
{
	info = "info",
	error = "error",
}

interface INotice
{
	idx: string;
	level: ELevel;
	message: string;
}

interface INotifyContext
{
	msgNotify: INotice[], 
	addNotice: (level: ELevel, message: string, time: number | undefined) => void,
	onDelete: (id: string) => void
}

const notifyContext = createContext<INotifyContext>(null!);



function useProvideNotify() : INotifyContext
{
	const [msgNotify, setMsgNotify] = useState<INotice[]>([]);
	//const [id, setId] = useState<number>(0);

	console.log("[Notify CTX] : rerender !");

	const onDelete = useCallback((id : string) => {
		setMsgNotify(msgNotify.filter((o) => { return o.idx !== id}));
	}, [msgNotify]);

	const generateKey = useCallback(() => {
		return `${ "notice" }_${ new Date().getTime()}_${Math.random() * 25}`;
	}, [])

	const addNotice = useCallback((level: ELevel, message: string, time: number | undefined) =>	{
		const notice: INotice = {
			idx: generateKey(),
			level: level,
			message: message,
		};
		//setId(prev => prev + 1);

		setMsgNotify(pre => {
			const ret = [...pre, notice];		
			return ret;
		})
	}, [generateKey]);


	return({
		msgNotify,
		addNotice,
		onDelete
	});

}

export function useNotifyContext()
{
	return useContext(notifyContext);
}

function Notice(prop: INotice)
{
	const {onDelete} = useNotifyContext();
	const closeTime = 3000;

	const [isClosing, setIsClosing] = useState<boolean>(false);

	useEffect(() => {
		if (isClosing === false)
		{
			const timeId = setTimeout(() => {
				setIsClosing(true);
			}, closeTime);

			return () => {clearTimeout(timeId)}
		}
		else
			onDelete(prop.idx);

	}, [isClosing, onDelete, prop.idx])

	return <li className={"notification " + prop.level}>{prop.message}<button className="delete_notif" onClick={() => { onDelete(prop.idx)}}>dismiss</button></li>
}

export function PrintNotify()
{
	const ctx = useNotifyContext();

	return (
		<ul id="notify">
			{ctx.msgNotify.map((not) => { return <Notice key={not.idx} idx={not.idx} level={not.level} message={not.message}></Notice> })}
		</ul>
	);
}

export function ProvideNotify({children}: {children: JSX.Element[]} ): JSX.Element
{
	const ctx: INotifyContext = useProvideNotify();

	useEffect(() => {
		console.log("ctx : change")
	}, [ctx]);
	
	useEffect(() => {
		console.log("addNotice : change")
	}, [ctx.addNotice]);

	return (
		<notifyContext.Provider value={React.useMemo( () => ({msgNotify: ctx.msgNotify, addNotice: ctx.addNotice, onDelete: ctx.onDelete,}), [ctx, ctx.onDelete, ctx.addNotice, ctx.msgNotify])}>
			{children}
		</notifyContext.Provider>
	);
}