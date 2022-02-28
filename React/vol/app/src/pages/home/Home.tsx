import "./Home.css"
import SignInButton from  "../../components/SignInButton"

function SignInClick ()
{
	alert("allo");
}

function Home() {
	return (
		<div id="homepage">
			<header>
				<h1>PONG</h1>
			</header>
			<button onClick={SignInClick}>Sign In</button>
		</div>
	);
}

export default Home;
