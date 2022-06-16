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
	addNotice: (level: ELevel, message: string, time: number | undefined) => void,
}

const notifyContext = createContext<INotifyContext>(null!);

export function useNotifyContext()
{
	return useContext(notifyContext);
}

export function ProvideNotify({children}: {children: JSX.Element} ): JSX.Element
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

	function Notice(prop: INotice)
	{
		
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

		}, [isClosing, prop.idx])

		return <li className={"notification " + prop.level}>{prop.message}<button className="delete_notif" onClick={() => { onDelete(prop.idx)}}>dismiss</button></li>
	}


	return (
		<notifyContext.Provider value={React.useMemo( () => ({addNotice}), [addNotice])}>
				<ul id="notify">
					{msgNotify.map((not) => { return <Notice key={not.idx} idx={not.idx} level={not.level} message={not.message}></Notice> })}
				</ul>
			{children}
		</notifyContext.Provider>
	);
}