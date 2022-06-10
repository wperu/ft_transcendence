import { usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import "./Reconnect.css";

function Reconnect()
{
	const { reconnect } = usePongContext();

	return (
		<div className="reconnect_view">
			<button className="footer_button reconnect_button" onClick={reconnect}> reconnect </button>
		</div>
	);
}

export default Reconnect;
