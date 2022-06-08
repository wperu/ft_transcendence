import { GetFinishedGameDto } from "../../Common/Dto/pong/FinishedGameDto";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MatchHistory.css";

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
	custom: boolean;
}

interface matchOption
{
	value: boolean;
}

interface settingsValue
{
	custom: boolean;
	dashes: boolean;
	double_ball: boolean;
}

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

function MatchSettings(props: settingsValue)
{
	function HistorySettingsContent()
	{
		if (props.custom)
			return (
				<div className="history_settings">
					<div>
						Dashes <OptionValue value={props.dashes} />
					</div>
					<div>
						Double ball <OptionValue value={props.double_ball} />
					</div>
				</div>
			);
		else
		return (
			<div className="history_settings">
			</div>
		);
	}

	return (
		<div className="history_match_settings">
			<div className="history_custom">
				Custom {props.custom ?
					<span className="match_option_on">YES</span>
					: <span className="match_option_off">NO</span>}
			</div>
			<HistorySettingsContent />
		</div>
	);
}

function Match(props: matchProps)
{
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
		let minutes = date.getMinutes().toString();
		if (minutes.length < 2)
			return (date.getHours() + ":0" + date.getMinutes());
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
				<div className="history_match_user">
					<Link to={"/profile/" + props.opponent_ref_id}>
						{props.opponent_name}
					</Link>
				</div>
				<div className="history_match_date">
					<span>{ parsDate() }</span>
					<span>{ parsTime() }</span>
				</div>
			</div>
			<MatchSettings custom={props.custom} dashes={props.dashes}
			double_ball={props.double_ball} />
		</li>
	);
}

interface historyProps
{
	ref_id: number;
}

function MatchHistory(props: historyProps)
{
	const [history, setHistory] = useState<GetFinishedGameDto[]>([]);

	useEffect(() => {
		fetch('/api/game-history/' + props.ref_id)
		.then(res => res.json())
		.then(result => {
			setHistory(result);
		}, error => {
			if (error)
			console.log("fetch error");
		});
	}, [props.ref_id]);

	return (
		<ul id="match_history">
			{
				(history.map(({date, ref_id_one, ref_id_two, score_one, score_two, username_one, username_two, custom}, index) => (
					<Match
					index={index}
					opponent_ref_id={(ref_id_one === props.ref_id)?ref_id_two:ref_id_one}
					current_user_name={(ref_id_one === props.ref_id)?username_one:username_two}
					opponent_name={(ref_id_one === props.ref_id)?username_two:username_one}
					current_score={(ref_id_one === props.ref_id)?score_one:score_two}
					opponent_score={(ref_id_one === props.ref_id)?score_two:score_one}
					game_date={date}
					dashes={false}
					double_ball={false}
					custom={custom}
					/>
				))).reverse()
				// )))
				// ))).sort((a, b) => new Date(a.props.date).parsTime() - new Date(b.props.date).parsTime())
			}
		</ul>
	);
}

export default MatchHistory;
