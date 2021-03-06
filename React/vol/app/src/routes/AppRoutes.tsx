import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Profile from '../pages/profile/Profile';
import HomeLoggedIn from '../pages/HomeLoggedIn/HomeLoggedIn';
import HomeLoggedOut from '../pages/HomeLoggedOut/HomeLoggedOut';
import { ProvideAuth } from '../auth/useAuth';
import { RequireAuth } from '../auth/RequireAuth';
import Callback from '../pages/Callback/Callback';
import SidebarWithContext from '../components/Sidebar/SidebarWithContext';
import { ProvideNotify } from '../components/NotifyContext/NotifyContext';
import { Pong } from '../pages/Pong/Pong';
// import { FakeUser } from '../pages/FakeUser/FakeUser';
import { PongMatchmaking } from '../pages/PongMatchmaking/PongMatchmaking';
import { ProvidePong } from '../components/PongGame/PongContext/ProvidePong';
import PongRequestRoom from '../components/PongGame/PongRequestRoom/PongRequestRoom';
import { PongCustomRoom } from '../components/PongGame/PongCustomRoom/PongCustomRoom';
import QuatreCentQuatre from "../pages/404/404";

function AppRoute() : JSX.Element
{
	// <Route path="/dev_user" element={<FakeUser/>}/>

	const element =
	<ProvideNotify>
		<ProvideAuth>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<HomeLoggedOut />}/>
					<Route path="/login/callback" element={<Callback />}/>
					<Route path="*" element={<QuatreCentQuatre/>}/>
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
								<Route path="/matchmaking/custom" element={<PongRequestRoom />}/>
								<Route path="/matchmaking/custom/:id" element={<PongCustomRoom />}/>
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

export default AppRoute;
