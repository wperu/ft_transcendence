import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Profile from '../pages/profile/Profile';
import HomeLoggedIn from '../pages/HomeLoggedIn/HomeLoggedIn';
import HomeLoggedOut from '../pages/HomeLoggedOut/HomeLoggedOut';
import { ProvideAuth, RequireAuth } from '../auth/useAuth';
import Callback from '../pages/Callback/Callback';

function AppRoute() : JSX.Element
{
	const element =
	<ProvideAuth>
		<BrowserRouter>
			<Routes>
				<Route index element={<HomeLoggedOut />}/>
				<Route path="/logged_in" element={<HomeLoggedIn />}/>
				<Route path="/profile" element={<RequireAuth children={<Profile/>}/>}/>
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