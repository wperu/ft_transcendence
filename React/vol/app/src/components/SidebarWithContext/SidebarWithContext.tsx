import Sidebar from  "../Sidebar/Sidebar"
import {ProvideChat} from  "../Sidebar/ChatContext/ProvideChat"

function SidebarWithContext()
{
	return (
	<ProvideChat>
		<Sidebar />
	</ProvideChat>
	);
}

export default SidebarWithContext;
