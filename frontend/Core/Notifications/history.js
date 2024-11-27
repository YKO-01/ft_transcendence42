async function fetchHistory(userId) {
    let access_token = localStorage.getItem('access_token');
    let response = await fetch(`http://127.0.0.1:8000/api/matches/${userId}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });
    response = await handleAuthResponse(response, fetchHistory, userId);

    if (!response.ok) {
		urlRoute('signin');
        return null
	}
	let data = await response.json();
	return data;
}

async function fetchDateHistory(date) {
    if (!date)
        return;
	const newDate = new Date(date)
	date = newDate
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    let access_token = localStorage.getItem("access_token");
    let response = await fetch(`http://127.0.0.1:8000/api/matches/${year}-${month}-${day}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${access_token}`,
        }
    });

    response = await handleAuthResponse(response, fetchDateHistory, date);
    if (!response.ok || !access_token) {
		urlRoute('signin');
        return null
    }
	let data = await response.json();
	return data;
}

async function getYesterdatHistory() {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - 1);
    return await fetchDateHistory(newDate);
}

async function getTodayHistory() {
    const newDate = new Date();
    newDate.setDate(newDate.getDate());
    return await fetchDateHistory(newDate);

}