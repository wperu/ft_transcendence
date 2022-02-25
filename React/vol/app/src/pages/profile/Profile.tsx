import axios from "axios";


function Profile() {
	
	/*axios({
		method: 'post',
		url: 'http://nest:3000/users',
		data: {
		  id: 1,
		  firstName: 'Fred',
		  lastName: 'Flintstone',
		  isActive: true
		}
	  }).then(function (response) {
		console.log(response);
	  })
	  .catch(function (error) {
		console.log(error);
	  });*/

	  console.log("Profile log");
	  axios('http://nest:3000/users')
	  .then(function (response) {
		console.log(response.data);
	  })
	  .catch(function (error) {
		console.log(error);
	  });

	return (
	  <h1>Profile</h1>
	);
  }
  
  export default Profile;
  