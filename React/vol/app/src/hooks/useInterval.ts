import React, { useEffect, useRef } from "react";

function useInterval(callback: () => void, delay: number) {
	const savedCallback = useRef(callback);

	// Remember the latest callback.
	useEffect(() => {
	savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	useEffect(() => {
	function tick() {
		if (savedCallback !== undefined)
			savedCallback.current();
	}
	if (delay !== null) {
		let id = setInterval(tick, delay);
		return () => clearInterval(id);
	}
	}, [delay]);
}

export default useInterval;