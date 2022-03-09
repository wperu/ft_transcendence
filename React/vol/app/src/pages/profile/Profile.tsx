import axios from "axios";
import UserFrom from "../../components/UserForm";
import LogOutButton from "../../components/LogOutButton/LogOutButton";

function Profile() {
	
	axios({
		method: 'get',
		url: 'http://localhost/api',
		headers: {},
	  }).then(function (response) {
		console.log(response);
	  })
	  .catch(function (error) {
		console.log(error);
	  });

	  
	  console.log("Profile log");
	 /* axios('http://nest:3000/users')
	  .then(function (response) {
		console.log(response.data);
	  })
	  .catch(function (error) {
		console.log(error);
	  });*/

	return (
		<div>
	  		<h1>Profile</h1>
	  		<UserFrom />
			 <footer>
				<LogOutButton />
			</footer>
		</div>
	);
  }
  
  export default Profile;
  
