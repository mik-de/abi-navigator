


//
function pageLoaded()
{
	var pl_id = "PLS5VdiU0mGpWvE1uDbZYP3zdy06XrbBwa";
	var key = "AIzaSyCClib9G8pB2vsC-29Bnzhw58w5cEL66Mk";
	var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=";
	url += pl_id;
	url += "&key=" + key;
	// fetch playlist...
	fetchJson(url, plLoaded)
	
}

function fetchJson(url, fetch_callback)
{
	var http_request = new XMLHttpRequest();
	http_request.open('GET', url, true);
	http_request.responseType = 'json';
	http_request.onload = function() {
		var status = http_request.status;

		if (status === 200 || status === 304)
		{
			fetch_callback(null, http_request.response);
		}
		else
		{
			fetch_callback(status, http_request.response);
		}
	};
	http_request.send(); // non-blocking? // trigger callbacks when completed
};


function plLoaded(status, response)
{
	if( status === null)
	{
	
	var body = document.getElementById("body");
	
	var items = response.items;
	video_ids = [];
	for(element in items)
	{
		video_ids.push(items[element].contentDetails.videoId);
	}
	console.log(video_ids);

	// filter video_ids
	
	// ul - li
}
