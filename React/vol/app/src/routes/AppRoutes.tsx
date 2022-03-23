import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Profile from '../pages/profile/Profile';
import HomeLoggedIn from '../pages/HomeLoggedIn/HomeLoggedIn';
import HomeLoggedOut from '../pages/HomeLoggedOut/HomeLoggedOut';
import { ProvideAuth } from '../auth/useAuth';
import { RequireAuth } from '../auth/RequireAuth';
import Callback from '../pages/Callback/Callback';


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
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomeLoggedOut />}/>
				<Route element={<RequireAuth/>}>
					<Route path="/profile" element={<Profile/>}/>
					<Route path="/example" element={<Profile/>}/>
				</Route>
				<Route path="/login/callback" element={<Callback />}/>
				<Route path="*" element={<NoMatch />}/>
			</Routes>
		</BrowserRouter>
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