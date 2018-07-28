


function pageLoaded()
{
	var url = new URL(window.location.href);
	var ref_parameter = url.searchParams.get("ref")
	if(ref_parameter !== null)
	{
		var url_json = "db" + ref_parameter + "/videos.json";
		console.log(ref_parameter);
		fetchJson(url_json, function(status, videos_json)
		{
			if( status === null)
			{
				loadJson(videos_json);
			}
		});
	}
}

function add()
{
	var youtube_id = prompt("Enter YouTube ID:", "abc123xyz");
	var video_meta = {"comment":"Kommentar", "video":"abc123xyz", "rating":1.0};
	video_meta["video"] = youtube_id;
	var video_div = createVideoElement(uuidv4(), video_meta);
	var element_ruler = document.createElement("hr");
	var videos_div = document.getElementById("videos");
	videos_div.appendChild(element_ruler);
	videos_div.appendChild(video_div);
}

function saveAs()
{
// class Video
	var videos_div = document.getElementById("videos");
	var videos = videos_div.getElementsByClassName("video");
	var meta_json = {};
	for (num = 0; num < videos.length; num++) // Node list object ...
	{
		var uuid = videos[num].id;
		var meta_data = videos[num].firstElementChild;
		var inputs = meta_data.getElementsByTagName("input");
		meta_element = {};
		for (i = 0; i < inputs.length; i++) // Node list object ...		
		{
			meta_element[inputs[i].id] = inputs[i].value;
		}
		meta_json[uuid] = meta_element;
	}
	console.log(meta_json);
	download("videos.json", JSON.stringify(meta_json, null, '    '));
}

function loadJson(videos_json)
{
	var videos_div = document.createElement("div");
	videos_div.className = "videos";
	videos_div.id = "videos";
	var videos_outer = document.getElementById("videos_outer"); // TODO fix videos_outer

	for(id in videos_json)
	{
		var video_meta = videos_json[id];
		var video_div = createVideoElement(id, video_meta);
		var element_ruler = document.createElement("hr");
		videos_div.appendChild(element_ruler);
		videos_div.appendChild(video_div);
	}
	var videos_old = document.getElementById("videos");
	videos_outer.replaceChild(videos_div, videos_old);
}

function createVideoElement(id, video_meta)
{
	var video_div = document.createElement("div");
	video_div.className = "video";
	video_div.id=id; // video_meta["video"];
	var video_meta_div = createMetaDataElement(video_meta)
	video_div.appendChild(video_meta_div);
	//video_div.appendChild(video_meta_div);
	var video_element = createYoutubeElement(video_meta["video"]);
	video_element.className = "video_data";
	video_div.appendChild(video_element);
	return video_div;
}

function deleteVideoElement(button)
{
	var video_meta = button.parentElement;
	var video = video_meta.parentElement;
	var videos = video.parentElement;
	videos.removeChild(video);
}

function createMetaDataElement(video_meta)
{
	var video_meta_div = document.createElement("div");
	video_meta_div.className = "video_data"
	for(attribut in video_meta)
	{
		var label = document.createElement("label");

		var text = document.createTextNode(attribut);
		label.appendChild(text);
		var input = document.createElement("input");
		input.id = attribut;
		input.setAttribute("type", "text");
		input.value = video_meta[attribut];
		console.log(input.value);
		var br_label = document.createElement("br");
		var br_input = document.createElement("br");
		video_meta_div.appendChild(label);
		video_meta_div.appendChild(br_label);
		video_meta_div.appendChild(input);
		video_meta_div.appendChild(br_input);
	}
	var delete_ruler = document.createElement("hr");
	var delete_button = document.createElement("button");
	var text = document.createTextNode("Löschen");
	delete_button.setAttribute("onclick", "deleteVideoElement(this)");
	delete_button.appendChild(text);
	delete_button.className = "danger";
	video_meta_div.appendChild(delete_ruler);
	video_meta_div.appendChild(delete_button);
	return video_meta_div;
}

function createYoutubeElement(youtube_id)
{
	var youtube_element =  document.createElement('div');
	var youtube_iframe = "<iframe src=\"";
	youtube_iframe += "https://www.youtube-nocookie.com/embed/" + youtube_id + "?rel=0\"";
	youtube_iframe += "frameborder=\"0\" allow=\"autoplay; encrypted-media\" allowfullscreen></iframe>";
	youtube_element.innerHTML = youtube_iframe;
	youtube_iframe = youtube_element.firstChild;
	youtube_iframe.className = "videos_verwalten";
	youtube_element.id = "yt:" + youtube_id;
	return youtube_element;
}


// super seed with fetch() in near future
// implement caching for jsons?
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

function removeAllChildren(element)
{
	var cloned_node = element.cloneNode(false);
	element.parentElement.replaceChild(cloned_node ,element);
}



function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
