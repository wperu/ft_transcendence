import "./InfoButton.css";

function InfoButton () {
	return (
		<details id="infos">
			<summary>Qui sommes nous ?</summary>
			<small>
				<p>Ce projet a été réalisé par cfrancoi, wperu, lrobino et rkowalsk</p>
				<p>Les technologies utilisées sont : NodeJS, React, NestJS, Nginx et PostgreSQL</p>
			</small>
		</details>
	);
}

export default InfoButton;
