document.addEventListener("click", e => {
	const {target} = e;
	if (!target.matches("nav a"))
		return ;
	e.preventDefault();
	navigateTo(target.href)
})

const urlRoutes = {
	404: {
		page: "/pages/404.html",
		title: "Not found",
		description: ""
	},
	"/dashboard": {
		page: "/pages/dashboard.html",
		title: "Dashboard",
		description: ""
	}
	,
	"/signin": {
		page: "/pages/signin.html",
		title: "Sign in",
		description: ""
	},
	"/signup": {
		page: "/pages/signup.html",
		title: "Sign up",
		description: ""
	},
	"/messages": {
		page: "/pages/messages.html",
		title: "Messages",
		description: ""
	},
	"/history": {
		page: "/pages/history.html",
		title: "History",
		description: ""
	},
	"/profile": {
		page: "/pages/profile.html",
		title: "Profile",
		description: ""
	},
	"/tournament": {
		page: "/pages/tournament.html",
		title: "Tournament",
		description: ""
	}
}

let isUserSignedin = true;

const urlLocationHandler = async () => {
	let html = null;
	const location = window.location.pathname.toLowerCase();
	let route = urlRoutes[location] || urlRoutes[404];
	if (isUserSignedin && (location == "/" || location == "/signin" || location == "/signup"))
	{
		route = urlRoutes["/dashboard"];
		window.history.pushState({}, "", "/");
	}
	else if (!isUserSignedin && location != "/signin" && location != "/signup")
	{
		route = urlRoutes["/signin"];
		window.history.pushState({}, "", "/signin");
	}
	html = await fetch(route.page).then(response => response.text());
	document.getElementById("content").innerHTML = html;
	document.title = `${route.title} | SPA JS`;
	handleLayout();
}

window.onpopstate = urlLocationHandler;

urlLocationHandler();


const urlRoute = route => {
	window.history.pushState({}, "", route);
	urlLocationHandler();
}

const navigateTo = route => {
	urlRoute(route);
}

const handleLayout = () => {
	const main = document.getElementById("main");
	const location = window.location.pathname.toLowerCase();
	if ((location == "/" || location == "/profile"))
	{
		main.innerHTML = `<nav>
			<a href="/">Home</a>
			<a href="/messages">Messages</a>
			<a href="/history">History</a>
			<a href="/sidebar">Sidebar</a>
		</nav>`
	}
	else if (location == "/signup" || location == "/signin")
	{
		main.innerHTML = `<div>
			<h1>Ping pong</h1>
		</div>`
	}
	else 
	{
		main.innerHTML = `<nav>
			<a href="/">Home</a>
			<a href="/messages">Messages</a>
			<a href="/sidebar">Sidebar</a>
		</nav>`
	}
}
