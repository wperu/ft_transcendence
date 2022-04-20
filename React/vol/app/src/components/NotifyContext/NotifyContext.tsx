import React, { createContext, useContext, useEffect, useState } from "react";
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
	maxNotify : number,
	msgNotify: INotice[], 
	addNotice: (level: ELevel, message: string, time: number | undefined) => void,
	onDelete: (id: string) => void
}

const notifyContext = createContext<INotifyContext>(null!);

const generateKey = (id : number) => {
    return `${ id }_${ new Date().getTime()}_${Math.random() * 25}`;
}

function useProvideNotify() : INotifyContext
{
	const [maxNotify] = useState<number>(5);
	const [msgNotify, setMsgNotify] = useState<INotice[]>([]);
	const [id, setId] = useState<number>(0);

	function onDelete(id : string)
	{
		setMsgNotify(msgNotify.filter((o) => { return o.idx !== id}));
	}

	function addNotice(level: ELevel, message: string, time: number | undefined)
	{
		const notice: INotice = {
			idx: generateKey(id),
			level: level,
			message: message,
		};
		setId(id + 1);

		setMsgNotify(pre => {
			

			const ret = [...pre, notice];
			
			return ret;
		})

	}


	return({
		maxNotify,
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
	const ctx = useNotifyContext();
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
			ctx.onDelete(prop.idx);

	}, [isClosing])

	return <li className={"notification " + prop.level}>{prop.message}<button onClick={() => { ctx.onDelete(prop.idx)}}></button></li>
}

export function ProvideNotify({children}: {children: JSX.Element} ): JSX.Element
{
	const ctx = useProvideNotify();
	
	return (
		<notifyContext.Provider value={ctx}>
					<ul id="notify">
						{ctx.msgNotify.map((not, index) => { return <Notice key={not.idx} idx={not.idx} level={not.level} message={not.message}></Notice> })}
					</ul>
			{children}
		</notifyContext.Provider>
	);
	
}