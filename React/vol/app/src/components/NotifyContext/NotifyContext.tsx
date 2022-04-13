import React, { createContext, useContext, useState } from "react";

interface INotice
{
	id: number;
	level: string;
	message: string;
}

interface INotifyContext
{
	maxNotify : number,
	msgNotify: INotice[], 
	addNotice: (level: string, message: string, time: number | undefined) => void,
}

const notifyContext = createContext<INotifyContext>(null!);


function useProvideNotify() : INotifyContext
{
	const [id, setId] = useState<number>(0);
	const [maxNotify] = useState<number>(5);
	const [msgNotify, setMsgNotify] = useState<INotice[]>([]);

	function getMaxId()
	{
		let nu = 0;
		msgNotify.forEach((o) => {
			if (o.id === nu)
				nu = o.id;
		})
		return nu + 1;
	}

	function addNotice(level: string, message: string, time: number | undefined)
	{
		const val = id;
		const notice: INotice = {
			id: val,
			level: level,
			message: message,
		};

		setId(pre => {return pre + 1});
		setMsgNotify(pre => {
			return([...pre, notice]);
		})
		
		setTimeout(() => {
			setMsgNotify(pre => {
				setId(getMaxId());
				return pre.splice(pre.findIndex((o) => {
					return (o.id === val);
				}), 1)
			})
		  }, time);
		  console.log(msgNotify);
	}

	return({
		maxNotify,
		msgNotify,
		addNotice
	});

}


export function useNotifyContext()
{
	return useContext(notifyContext);
}

export function ProvideNotify({children}: {children: JSX.Element} ): JSX.Element
{
	const ctx = useProvideNotify();
	
	return (
		<notifyContext.Provider value={ctx}>
			{ctx.msgNotify.map(({level, message}) => {
				return <div id={level}>{message}</div>
			})}
			{children}
		</notifyContext.Provider>
	);
	
}