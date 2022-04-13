import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Profile from '../pages/profile/Profile';
import HomeLoggedIn from '../pages/HomeLoggedIn/HomeLoggedIn';
import HomeLoggedOut from '../pages/HomeLoggedOut/HomeLoggedOut';
import { ProvideAuth } from '../auth/useAuth';
import { RequireAuth } from '../auth/RequireAuth';
import Callback from '../pages/Callback/Callback';
import SidebarWithContext from '../components/SidebarWithContext/SidebarWithContext';
import { ProvideNotify } from '../components/NotifyContext/NotifyContext';


interface Props{
	element:any;
	path:string;
	children?:any;
  }

function ProtectedRoute({element, path, children}:Props)
{

}


function AppRoute() : JSX.Element
{
	const element =
	<ProvideAuth>
		<ProvideNotify>
			<BrowserRouter>
				<Routes>
				<Route path="/login" element={<HomeLoggedOut />}/>
				<Route path="/login/callback" element={<Callback />}/>
				<Route path="*" element={<NoMatch />}/>
				<Route element={<RequireAuth/>}>
					<Route element={<>
										<SidebarWithContext />
										<Outlet />
									</>}>
						<Route path="/" element={<HomeLoggedIn />}/>
						<Route path="/profile" element={<Profile/>}/>
						<Route path="/profile/:id" element={<Profile/>}/>
					</Route>
				</Route>
				</Routes>
			</BrowserRouter>
		</ProvideNotify>
	</ProvideAuth>;
	return element;
}

function NoMatch() {
	let location = useLocation();

	return (
		<div>
			<h3>
				No match for <code>{location.pathname}</code>
			</h3>
		</div>
	);
}

export default AppRoute;