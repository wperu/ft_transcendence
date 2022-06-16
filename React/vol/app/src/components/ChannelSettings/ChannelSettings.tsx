import { memo } from "react";
import ChannelUserList from "../ChannelUserList/ChannelUserList";
import "./ChannelSettings.css";

const ChannelSettings = memo(() =>
{
	var style = { "--additional_settings_space": "0vh" } as React.CSSProperties;

	return (
		<div style={style}>
			<ChannelUserList />
		</div>
	);
})

export default ChannelSettings;