import "./ThisListIsEmpty.css"

interface	props
{
	text: string;
}

function ThisListIsEmpty (prop: props)
{
	return (
		<div className="list_is_empty">{prop.text}</div>
	);

}

export default ThisListIsEmpty;