import { GetFinishedGameDto } from "../../Common/Dto/pong/FinishedGameDto";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MatchHistory.css";
import { ELevel, useNotifyContext } from "../../components/NotifyContext/NotifyContext";
import { RoomOptions } from "../../Common/Game/GameConfig";

enum EWhoWhithdrew
{
	none,
	current,
	opponent
}

interface matchProps
{
	current_user_name: string;
	opponent_name: string;
	opponent_ref_id: number;
	current_score: number;
	opponent_score: number;
	game_date: Date;
	ice: boolean;
	double_ball: boolean;
	custom: boolean;
	withdrew: EWhoWhithdrew;
}

interface matchOption
{
	value: boolean;
}

interface settingsValue
{
	custom: boolean;
	ice: boolean;
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
						Ice Friction <OptionValue value={props.ice} />
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
		if (props.withdrew === EWhoWhithdrew.current
			|| (props.withdrew === EWhoWhithdrew.none
			&& props.current_score < props.opponent_score))
			return ("defeat");
		else if (props.withdrew === EWhoWhithdrew.opponent
			|| (props.withdrew === EWhoWhithdrew.none
			&& props.current_score > props.opponent_score))
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
		<li className="history_match">
			<div className="history_match_infos">
				<div className={getOutcome()}>
					{getOutcome()}
					<span className="history_withdrawal">
						{props.withdrew !== EWhoWhithdrew.none ? "by withdrawal" : ""}
					</span>
				</div>
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
			<MatchSettings custom={props.custom} ice={props.ice}
			double_ball={props.double_ball} />
		</li>
	);
}

interface historyProps
{
	ref_id: number;
	access_code: string;
}

function MatchHistory(props: historyProps)
{
	const [history, setHistory] = useState<GetFinishedGameDto[]>([]);
	const notify = useNotifyContext();

	useEffect(() => {
		fetch('/api/game-history/' + props.ref_id,
			{ headers: { authorization: props.access_code } }
		)
		.then(res => {
			if (res.status >= 200 && res.status <= 299)
				return res.json();
			notify.addNotice(ELevel.error,
				"Error while retrieving game history: " + res.statusText,
				3000);
			return ([]);
		})
		.then(result => {
			// console.log(result);
			setHistory(result);
		})
	}, [props.ref_id, props.access_code, notify]);

	function getWhoWithdrew(input: number, oneIsOpponent: boolean) : EWhoWhithdrew
	{
		if (input === 0)
			return (EWhoWhithdrew.none);
		if (oneIsOpponent)
		{
			if (input === 1)
				return (EWhoWhithdrew.opponent);
			return (EWhoWhithdrew.current);
		}
		if (input === 1)
			return (EWhoWhithdrew.current);
		return (EWhoWhithdrew.opponent);
	} 

	return (
		<ul id="match_history">
			{
				(history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
					.map(({
					date,
					ref_id_one,
					ref_id_two,
					score_one,
					score_two,
					username_one,
					username_two,
					withdrew,
					game_modes,
					custom}, index) => (
					<Match
					key={index.toString()}
					opponent_ref_id={(ref_id_one === props.ref_id)?ref_id_two:ref_id_one}
					current_user_name={(ref_id_one === props.ref_id)?username_one:username_two}
					opponent_name={(ref_id_one === props.ref_id)?username_two:username_one}
					current_score={(ref_id_one === props.ref_id)?score_one:score_two}
					opponent_score={(ref_id_one === props.ref_id)?score_two:score_one}
					game_date={date}
					ice={(game_modes & RoomOptions.ICE_FRICTION) > 0}
					double_ball={(game_modes & RoomOptions.DOUBLE_BALL) > 0}
					custom={custom}
					withdrew={getWhoWithdrew(withdrew, (ref_id_two === props.ref_id))}
					/>
				)))
				// ))).reverse()
				// )))
			}
		</ul>
	);
}

export default MatchHistory;
