import "./MatchHistory.css";

interface matchProps
{
	current_user_name: string;
	opponent_name: string;
	current_score: number;
	opponent_score: number;
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

	return (
		<li className="history_match">
			<div className={getOutcome()}>{getOutcome()}</div>
			<div className="history_match_user">{props.current_user_name}</div>
			<div className="history_match_score">{props.current_score}</div>
			<div className="match_score_separator">|</div>
			<div className="history_match_score">{props.opponent_score}</div>
			<div className="history_match_user">{props.opponent_name}</div>
			<div className="outcome_counterweight"></div>

		</li>
	);
}

function MatchHistory ()
{
	return (
		<ul id="match_history">
			<Match current_user_name="michel" opponent_name="abdul" current_score={2} opponent_score={4} />
			<Match current_user_name="michel" opponent_name="jerem" current_score={78} opponent_score={6} />
			<Match current_user_name="michel" opponent_name="morandini" current_score={0} opponent_score={12} />
			<Match current_user_name="michel" opponent_name="truc" current_score={9} opponent_score={2} />
			<Match current_user_name="michel" opponent_name="sheesh" current_score={82} opponent_score={2} />
			<Match current_user_name="michel" opponent_name="huh" current_score={5} opponent_score={100} />
			<Match current_user_name="michel" opponent_name="feasgjer" current_score={12} opponent_score={12} />
			<Match current_user_name="michel" opponent_name="machin" current_score={4} opponent_score={4} />
			<Match current_user_name="michel" opponent_name="okdacor" current_score={666} opponent_score={442} />
			<Match current_user_name="michel" opponent_name="menfou" current_score={45} opponent_score={54} />
			<Match current_user_name="michel" opponent_name="gneeeeee" current_score={54} opponent_score={45} />
			<Match current_user_name="michel" opponent_name="abdul" current_score={2} opponent_score={4} />
			<Match current_user_name="michel" opponent_name="jerem" current_score={78} opponent_score={6} />
			<Match current_user_name="michel" opponent_name="morandini" current_score={0} opponent_score={12} />
			<Match current_user_name="michel" opponent_name="truc" current_score={9} opponent_score={2} />
			<Match current_user_name="michel" opponent_name="sheesh" current_score={82} opponent_score={2} />
			<Match current_user_name="michel" opponent_name="huh" current_score={5} opponent_score={100} />
			<Match current_user_name="michel" opponent_name="feasgjer" current_score={12} opponent_score={12} />
			<Match current_user_name="michel" opponent_name="machin" current_score={4} opponent_score={4} />
			<Match current_user_name="michel" opponent_name="okdacor" current_score={666} opponent_score={442} />
			<Match current_user_name="michel" opponent_name="menfou" current_score={45} opponent_score={54} />
			<Match current_user_name="michel" opponent_name="gneeeeee" current_score={54} opponent_score={45} />
		</ul>
	);
}

export default MatchHistory;