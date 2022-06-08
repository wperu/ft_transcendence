function calculateLevel(xp: number) : string
{
	const lvl = Math.trunc(xp / 10);
	if (lvl === 0)
		return ("noob");
	return (lvl.toString());
}

export default calculateLevel;
