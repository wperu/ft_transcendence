import "./404.css";
import BackToMainMenuButton from "../../components/FooterButton/BackToMainMenuButton";
import { Link } from "react-router-dom";

function QuatreCentQuatre()
{
	return (
		<div id="quatre_cent_quatre">
			<div className="logo">
				404
			</div>
			<div>
				There is no such thing here...
			</div>
			<footer>
				<Link to="/" replace={false}> <BackToMainMenuButton /> </Link>
			</footer>
		</div>
	);
}

export default QuatreCentQuatre;
