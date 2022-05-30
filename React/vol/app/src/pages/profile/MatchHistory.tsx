import { GetFinishedGameDto } from "../../Common/Dto/FinishedGameDto";
import { useAuth } from "../../auth/useAuth";
import "./MatchHistory.css";
import { useEffect, useState } from "react";

interface matchProps
{
	current_user_name: string;
	opponent_name: string;
	opponent_ref_id: number;
	current_score: number;
	opponent_score: number;
	index: number;
	game_date: Date;
	dashes: boolean;
	double_ball: boolean;
}

interface matchOption
{
	value: boolean;
}

function Match(props: matchProps)
{
	function OptionValue(props: matchOption)
	{
		if (props.value === true)
		{
			return (
				<span className="match_option_on">ON</span>
			);
		}
		else
		{
			return (
				<span className="match_option_off">OFF</span>
			);
		}
	}

	function getOutcome()
	{
		if (props.current_score < props.opponent_score)
			return ("defeat");
		else if (props.current_score > props.opponent_score)
			return ("victory");
		else
			return ("draw");
	}

	function parsDate() : string
	{
		let date = new Date(props.game_date);
		return (date.getDay() + "/"
			+ (date.getMonth() + 1) + "/"
			+ date.getFullYear());
	}

	function parsTime() : string
	{
		let date = new Date(props.game_date);
		return (date.getHours() + ":" + date.getMinutes());
	}

	return (
		<li key={props.index} className="history_match">
			<div className="history_match_infos">
				<div className={getOutcome()}>{getOutcome()}</div>
				<div className="history_match_user">{props.current_user_name}</div>
				<div className="history_match_score">{props.current_score}</div>
				<div className="match_score_separator">|</div>
				<div className="history_match_score">{props.opponent_score}</div>
				<div className="history_match_user">{props.opponent_name}</div>
				<div className="history_match_date">
					<span>{ parsDate() }</span>
					<span>{ parsTime() }</span>
				</div>
			</div>
			<div className="history_match_settings">
				<div>
					Dashes <OptionValue value={props.dashes} />
				</div>
				<div>
					Double balle <OptionValue value={props.double_ball} />
				</div>
			</div>
		</li>
	);
}

function MatchHistory ()
{
	const	auth = useAuth();
	const	[history, setHistory] = useState<GetFinishedGameDto []>([]);

	useEffect(() => {
		fetch('/api/game-history/' + auth.user?.id)
			.then(res => res.json())
			.then(result => {
				setHistory(result);
				}, error => {
				console.log("error test");
				if (error)
					console.log("fetch error");
			});
	}, [auth]);

	return (
		<ul id="match_history">
			{
				(history.map(({date, ref_id_one, ref_id_two, score_one, score_two, username_one, username_two}, index) => (
					<Match
					index={index}
					current_user_name={(auth.user?.username !== undefined)? auth.user.username : "undefined"}
					opponent_name={(ref_id_one !== auth.user?.reference_id)?username_one:username_two}
					opponent_ref_id={(ref_id_one !== auth.user?.reference_id)?ref_id_one:ref_id_two}
					current_score={(ref_id_one === auth.user?.reference_id)?score_one:score_two}
					opponent_score={(ref_id_one !== auth.user?.reference_id)?score_one:score_two}
					game_date={date}
					dashes={false}
					double_ball={false}
					/>
				)))
				// ))).sort((a, b) => new Date(a.props.date).parsTime() - new Date(b.props.date).parsTime())
				// ))).reverse()
			}
		</ul>
	);
}

export default MatchHistory;
