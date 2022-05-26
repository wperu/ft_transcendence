import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Profile from '../pages/profile/Profile';
import HomeLoggedIn from '../pages/HomeLoggedIn/HomeLoggedIn';
import HomeLoggedOut from '../pages/HomeLoggedOut/HomeLoggedOut';
import { ProvideAuth } from '../auth/useAuth';
import { RequireAuth } from '../auth/RequireAuth';
import Callback from '../pages/Callback/Callback';
import SidebarWithContext from '../components/SidebarWithContext/SidebarWithContext';
import { ProvideNotify } from '../components/NotifyContext/NotifyContext';
import { Pong } from '../pages/Pong/Pong';
import { FakeUser } from '../pages/FakeUser/FakeUser';
import { PongMatchmaking } from '../pages/PongMatchmaking/PongMatchmaking';
import { ProvidePong } from '../components/PongGame/PongContext/ProvidePong';

function AppRoute() : JSX.Element
{
	const element =
	<ProvideNotify>
		<ProvideAuth>
			<BrowserRouter>
				<Routes>

					<Route path="/login" element={<HomeLoggedOut />}/>
					<Route path="/login/callback" element={<Callback />}/>



					<Route path="/dev_user" element={<FakeUser/>}/>
					<Route path="*" element={<NoMatch />}/>

					<Route element={<RequireAuth/>}>
						<Route element={<>
											<SidebarWithContext />
											<Outlet />
										</>}>
							<Route element= {
											<ProvidePong>
												<Outlet/>
											</ProvidePong>
											}>
								<Route path="/matchmaking" element={<PongMatchmaking />}/>
								<Route path="/game/:id" element={<Pong />}/>
							</Route>
							<Route path="/" element={<HomeLoggedIn />}/>
							<Route path="/profile" element={<Profile/>}/>
							<Route path="/profile/:id" element={<Profile/>}/>
						</Route>
					</Route>
				</Routes>
			</BrowserRouter>
		</ProvideAuth>
	</ProvideNotify>;

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