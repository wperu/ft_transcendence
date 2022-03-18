//import axios from "axios";
import LogOutButton from "../../components/LogOutButton/LogOutButton";
import ProfileSummary from "../../components/ProfileSummary/ProfileSummary";

function Profile() {
	
	

	return (
		<div>
			<header id="home_header">
				<ProfileSummary />
				<h1>Profile</h1>
			</header>
			 <footer>
				<LogOutButton />
			</footer>
		</div>
	);
  }
  
  export default Profile;
  
