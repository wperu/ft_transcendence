import axios from "axios";
import React, { Props } from "react";

type State = {
	lastName: string;
	firstName: string;
	isActive: boolean;
	[key: string]: any;
};


class UserFrom extends React.Component<{}, State>
{
	state: Readonly<State> = 
	{
		lastName: "",
		firstName: "",
		isActive: false,
	};

	handleChange =
	(event: React.FormEvent<HTMLInputElement>): void => {
		const target = event.currentTarget;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		this.setState({[name]: value});
	}

	SendForm()
	{
		axios({
			method: 'post',
			url: 'http://localhost/api/users',
			data: {
				lastName: this.state.lastName,
				firstName: this.state.firstName,
				isActive: this.state.isActive,
			},
		  }).then(function (response) {
			console.log(response);
		  })
		  .catch(function (error) {
			console.log(error);
		  });
	}

	handleSubmit =
	(event: React.SyntheticEvent): void => {
		alert("Data send");
		this.SendForm();
		
		this.setState({['isActive']: false});
		this.setState({['lastName']: ""});
		this.setState({['firstName']: ""});
		event.preventDefault();
	};

	render(): React.ReactNode
	{
		return (
			<form onSubmit={this.handleSubmit}>
				<label>first name:</label>
					<input type="text" name="firstName" value={this.state.firstName} onChange={this.handleChange}/><br/>
				<label>last name:</label>
					<input type="text" name="lastName" value={this.state.lastName} onChange={this.handleChange} /><br/>
				<label>is Active:</label>
				<input type="checkbox" name="isActive" checked={this.state.isActive} onChange={this.handleChange}/><br/>
				<input type="submit" value="Send"/>
			</form>
		);
	}
}

export default UserFrom;