import React, { createContext, useContext, useState } from "react";
import "./NotifyContext.css";

export enum ELevel
{
	info = "info",
	error = "error",
}

interface INotice
{
	id: number;
	level: ELevel;
	message: string;
}

interface INotifyContext
{
	maxNotify : number,
	msgNotify: INotice[], 
	addNotice: (level: ELevel, message: string, time: number | undefined) => void,
}

const notifyContext = createContext<INotifyContext>(null!);


function useProvideNotify() : INotifyContext
{
	const [id, setId] = useState<number>(0);
	const [maxNotify] = useState<number>(5);
	const [msgNotify, setMsgNotify] = useState<INotice[]>([]);

	function getMaxId(tab: INotice[])
	{
		let nu = 0;
		tab.forEach((o) => {
			if (o.id === nu)
				nu = o.id;
		})
		return nu + 1;
	}

	function addNotice(level: ELevel, message: string, time: number | undefined)
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
				setId(getMaxId(pre));
				
				return pre.splice(pre.findIndex((o) => {
					return (o.id === val);
				}), 1)
			})
			
			console.log("val: " + val);
			console.log("id: " + id);
		  }, 5000);
		 
		
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
					<ul id="notify">
						{ctx.msgNotify.map(({id, level, message}) => { return <li key={id} className={"notification " + level}>{message}</li> })}
					</ul>
			{children}
		</notifyContext.Provider>
	);
	
}