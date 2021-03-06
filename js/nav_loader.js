// TODO REWORK Dokumentation
// Navigation: Bundesland > Schule > Klasse > Fach > Thema > Stichwort
// Pfad: by__gym__k10__mathe__kk__pi / by/gym/k10/mathe/kk/pi
// Dateistruktur:
// auswahl__schule.json [Bundesland -> Schule]
// -> schule/auswahl__<Bundesland>__<Schule>.json [Klasse -> Fach]
// --> schule/<Bundesland>__<Schule>/auswahl__<Klasse>.json [ Thema[Fach] -> Stichwort[Fach]]

// Navigations-Struktur
// Bundesland / Schule
// Klasse / Fach
// Thema 



var g_hierarchien = [ "Bundesland", "Schule", "Klasse", "Fach", "Thema", "Stichwort" ]; // hierarchie als linked list...
var g_hierarchie_pfad = [];
var g_nav_hierarchie = -1; /// Gibt aktuell angezeigte Hierarchie Ebene an. // TODO -1 für Wurzel? // TODO Rework Zählung der Hierarchie Ebenen

// Analyses permalink parameters
// Refactor -> LoadButtons/ToggleButtons generiert aus g_hierarchie
// Test -> g_hierarchien korrekt gesetzt. 
function pageLoaded()
{
	var nav_layers = document.getElementById("nav_layers");
	var nav_path = document.getElementById("nav_path");
	var hierarchie = 0;
	console.log(nav_layers);
	var url = new URL(window.location.href);
	var ref_parameter = url.searchParams.get("ref")
	if(ref_parameter !== null)
	{
		console.log(ref_parameter)
		var pfad = ref_parameter.split("/");
	}

	if(ref_parameter === null || pfad.length == 0)
	{
		var [url_json, pfad] = resolveJsonUrl(g_hierarchie_pfad, "auswahl");
		var nav_layer =	createNavLayer(nav_layers, g_hierarchien[0]);
		loadLayerButtons(nav_layer, url_json);
	}
	else
	{ // ref Parameter gesetzt
		var final_pfad="";
		var pfad_url_json = null; 
		for(num in pfad) // TODO final "/" in url
		{
			if(num != 0)
			{
			//	continue;
				g_hierarchie_pfad.push(pfad[num]);
			}
			hierarchie = num; // TODO -1
			console.log(pfad[num]);
			var [url_json, final_pfad] = resolveJsonUrl(g_hierarchie_pfad, "auswahl");
			var nav_layer =	createNavLayer(nav_layers, g_hierarchien[hierarchie]);
			// TODO nav path
			if(num != 0)
			{
				addNavPath(nav_path, g_hierarchien[hierarchie], g_hierarchie_pfad[hierarchie-1], pfad_url_json);
			}
			if(g_hierarchie_pfad.length < (g_hierarchien.length-1)) // letzte Hierarchie Ebene?
			{
				loadLayerButtons(nav_layer, url_json);
			}
			else
			{
				loadToggleButtons(nav_layer, url_json);
			}			
			pfad_url_json = url_json
		}
		updatePermalink(final_pfad);
	}
	showButtons(g_hierarchien[hierarchie]);
	g_nav_hierarchie = hierarchie;
}

// TODO
// Alte nav_layers sind nicht angezeigt
function showButtons(hierarchie, display)
{
	if(typeof display === "undefined")
	{
		display = true;
	}
	console.log(arguments.callee.name + ": " + hierarchie);
	console.trace()
	var nav_layer = document.getElementById(hierarchie);
	if(display === true)
	{
		nav_layer.style.display = "block";
	}
	else
	{
		nav_layer.style.display = "none";
	}
}


// Benutzen die Buttons im nav_path
// hierarchie : Hierachie Ebene die angezeigt werden soll.
// Test TODO
function navButton(hierarchie)
{
	var hierarchie_level = 0;
	if( typeof hierarchie !== "undefined" ) // Wurzel
	{
		for(num in g_hierarchien)
		{
			if(g_hierarchien[num] === hierarchie)
			{
				hierarchie_level = num;
				break;
			}
		}
	}
	if(g_nav_hierarchie !== -1)
	{
		showButtons(g_hierarchien[g_nav_hierarchie], false);
	}
	showButtons(g_hierarchien[hierarchie_level]);
	g_nav_hierarchie = hierarchie_level;
}



// Benutzen die Buttons im nav_layer
// Refactor -> LoadButtons/ToggleButtons generiert aus g_hierarchie
// Test -> g_hierarchien korrekt gesetzt.
// TODO Nav Layers vs Nav Layer
function manageButtons(element)
{
	console.log(element)
	console.log(g_hierarchie_pfad)
	
// TODO Error handling
//	if(hierarchie_level
	var nav_path = document.getElementById("nav_path");
	var current_nav_layer = element.parentElement;
	if(current_nav_layer.tagName.toLowerCase() === "span") // span block of toggle buttons // TODO what?
	{
             current_nav_layer = current_nav_layer.parentElement;
	}
	var nav_layers = current_nav_layer.parentElement;
	
	console.log(current_nav_layer.id)
	var button_hierarchie_level = g_hierarchien.indexOf(current_nav_layer.id) + 1; // Neue hierarchie ebene // TODO check hierarchie_level for -1
	console.log(arguments.callee.name + ": Hierarchie level: " + button_hierarchie_level + " / Element Id: " + nav_layers.id + " / Button Id: " + element.id);	
	if(button_hierarchie_level <  g_hierarchien.length) // Hierarchie-Stufe laden "else" Videos listen
	{
		// Videos wegräumen / neuer Nav-Pfad gewählt
		var videos = document.getElementById("videos");
		removeAllChildren(videos);
		
		// Darunterliegende Nav Layer entfernen // TODO removeAllChildren(nav_layers)?
		var clean_nav_layer = current_nav_layer.previousElementSibling; 
		var next;
		while(clean_nav_layer !== null)
		{
			next = clean_nav_layer.previousElementSibling
			console.log("Entferne Layer mit ID: " + clean_nav_layer.id);
			nav_layers.removeChild(clean_nav_layer);
			clean_nav_layer = next;
		}
		
		// Remove lower nav levels from hierarchie -> Besser alles ab Nav level entfernen
		while(button_hierarchie_level <= g_hierarchie_pfad.length)
		{
			g_hierarchie_pfad.pop();
			nav_path.removeChild(nav_path.lastElementChild);
		}
				

		// Neuen Nav level aus JSON in den nav_path laden
		var [path_url_json, pfad] = resolveJsonUrl(g_hierarchie_pfad, "auswahl");
		g_hierarchie_pfad.push(element.id);
		addNavPath(nav_path, g_hierarchien[button_hierarchie_level], g_hierarchie_pfad[button_hierarchie_level-1], path_url_json);
		var next_nav_layer = createNavLayer(nav_layers, g_hierarchien[button_hierarchie_level]);
		
		console.log(nav_layers);
		console.log(next_nav_layer);
		console.log(element.id);
		console.log(next_nav_layer.id);
		
		// Neue Buttons in den nav_layer laden
		var [url_json, pfad] = resolveJsonUrl(g_hierarchie_pfad, "auswahl");
		if(button_hierarchie_level < (g_hierarchien.length-1))
		{
			loadLayerButtons(next_nav_layer, url_json);
		}
		else
		{
			loadToggleButtons(next_nav_layer, url_json);
		}
		
		if(button_hierarchie_level > 0) // Schadet nicht, auch bei Rückwärtsnavigation
		{
			showButtons(g_hierarchien[button_hierarchie_level-1], false);
		}
		
		
		showButtons(g_hierarchien[button_hierarchie_level]);
		g_nav_hierarchie = button_hierarchie_level;
		updatePermalink(pfad);
	}
	else // Videos listen
	{
		// Toggle buttons
		// Toggeln nur bei Toggle id
		
		{
			// de toggle andere


			selectButton(element, true); // toggle Button is not bound to stichwort_ids
		}
		// loadVideos(g_hierarchie, g_toggle_status);
		console.log(arguments.callee.name + ": element " + element.id);
		loadVideos(g_hierarchie_pfad, element.id);
	}
}


// TODO
function selectButton(element, selected)
{
	if(selected == true)
	{
		element.className = "success_selected";
	}
	else
	{
		element.className = "success_not_selected";
	}
}

// Updates permalink with given pfad
// Test -> Random Nav then hover permalink
function updatePermalink(pfad)
{
	console.log(arguments.callee.name + ": Pfad: " + pfad);

	var permalink = document.getElementById("permalink");
	var link = permalink.firstElementChild
	if (link === null)
	{
		link = document.createElement('a');
		permalink.appendChild(link);
	}
	var url = new URL(window.location.href);
	var url_string = "?ref=" + pfad;
	link.href = url_string;
	link.text = "Permalink";
}

// TODO REWORK!!!!// TODO REWORK!!!!// TODO REWORK!!!!// TODO REWORK!!!!// TODO REWORK!!!!// TODO REWORK!!!!


// Lädt ein Video-Playliste und setzt damit das Element "video" neu
// Test TODO
function loadVideos(hierarchie, stichwort_id)
{
	console.log("loadVideos "  + stichwort_id);
	// for each stichwort_id fetch video ids
	// promote videos that match all video ids
	// TODO fix Toogle
	var pl_id = stichwort_id;
	var key = "AIzaSyCClib9G8pB2vsC-29Bnzhw58w5cEL66Mk";
	var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=";
	url += pl_id;
	url += "&key=" + key;
	// fetch playlist...
	fetchJson(url, function (status, response)
	{
		if( status === null)
		{
	
			var items = response.items;
			video_ids = [];
			for(element in items)
			{
				video_ids.push(items[element].contentDetails.videoId);
			}
			console.log(video_ids);
			var videos_next = createVideoElements(video_ids);
			console.log("Done!");
			var videos = document.getElementById("videos");
			var videos_outer = document.getElementById("videos_outer");
			videos_outer.replaceChild(videos_next, videos);
		}
	});
}


// Erzeugt aus einer Youtube-Id eine DIV-Sektion mit iFrames
// Test TODO
function createVideoElements(video_list)
{
	var videos = document.createElement('div');
	videos.id = "videos";
	for(num in video_list)
	{
		var youtube_id = video_list[num];
		var youtube_element =  document.createElement('div');
		var youtube_iframe = "<iframe src=\"";
		youtube_iframe += "https://www.youtube-nocookie.com/embed/" + youtube_id + "?rel=0\"";
		youtube_iframe += "frameborder=\"0\" allow=\"autoplay; encrypted-media\" allowfullscreen></iframe>";
		youtube_element.innerHTML = youtube_iframe;
		youtube_element = youtube_element.firstChild;
		youtube_element.id = "video";
		videos.appendChild(youtube_element);
	}
//	console.log(youtube_iframe);
	return videos;
}


// Erzeuge Buttons mit Toggle-Funktion aus den Daten vom JSON
// Test -> No / Usage
function loadToggleButtons(parentElement, url_json)
{
	fetchJson(url_json, function(status, json)
	{
		if( status === null)
		{

			for(element in json)
			{
				var element_button = createButton(element, json[element], "success_not_selected");
				parentElement.appendChild(element_button);
			}
		}
	});
}

// Erzeuge Standard-Buttons aus JSON (für den Nav-Layer)
// Test -> No / Usage
function loadLayerButtons(parentElement, url_json)
{
	fetchJson(url_json, function(status, json)
	{
		if( status === null)
		{
			for(element in json)
			{
				var elementButton = createButton(element, json[element]);
				parentElement.appendChild(elementButton);
			}
		}
		else
		{
		        console.trace();
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////

// HELPER

// TODO JSON cache?

// Button im Nav Path
// Ist immer eins hinten dran iaw id
// Test TODO
function addNavPath(parentElement, hierarchie, id, url_json)
{
	console.log("addNavPath",id);
	console.trace()
	fetchJson(url_json, function(status, json)
	{
		if( status === null)
		{
			for(element in json)
			{
				if(json[element] === id)  // find element
				{
					var elementButton = createButton(element, id, "nav_path", "navButton(\"" + hierarchie + "\")");
					parentElement.appendChild(elementButton);
					break;
				}
			}
		}
	});
	
	
}

// Nav Select layer -> Für jede navigation neu
// InsertBefore
// Test TODO
function createNavLayer(parentElement, id)
{
	var nav_layer = document.createElement("div");
	nav_layer.id = id;
	nav_layer.setAttribute("class", "nav_layer");
	nav_layer.style.display = "none";
	parentElement.insertBefore(nav_layer, parentElement.firstElementChild);
	
	return nav_layer;
}


// Erzeugt einen Button mit Text, Id, Class und Function gesetzt
// Test -> No
function createButton(label, id, className, functionName)
{
	var button = document.createElement("button");
	var text = document.createTextNode(label);
	if( typeof className === "undefined" )
	{
		className = "success";
	}
	if( typeof functionName === "undefined" )
	{
		functionName = "manageButtons(this)";
	}
	button.id = id;
	button.setAttribute("onclick", functionName);
	button.appendChild(text);
	button.className = className;
	return button;
}


// Generiere Pfad-Hierarchie für die JSON-Dateien
// Test -> No
function resolveJsonUrl(hierarchie, name)
{
	var base = "db";
	var url = base;
	var pfad = "";

	for(schicht in hierarchie)
	{
		pfad += "/" + hierarchie[schicht];
		
	}
	url += pfad + "/" + name + ".json";

	return [url, pfad];
}

// Fetch JSON-Datei für Callback
// Test -> No
// super seed with fetch() in near future
// implement caching for jsons?
function fetchJson(url, fetch_callback)
{
	var http_request = new XMLHttpRequest();
	http_request.open('GET', url, true);
	http_request.responseType = 'json';
	http_request.onload = function() {
		var status = http_request.status;

		if (status === 0 || status === 200 || status === 304)
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

// Macht wie es heißt
// Test -> No
function removeAllChildren(element)
{
	var cloned_node = element.cloneNode(false);
	element.parentElement.replaceChild(cloned_node ,element);
}


////////////////////////////////////////////////////////////////////////////////////

// U..N..U..S..E..D


// TODO
function makeList(stichwort_ids, videos_json, stichwort_json)
{
	var video_ids_pro_stichwort = []
	if(stichwort_ids.length === 0)
	{
		return []; // nix
	}
	for(num in stichwort_ids)
	{
		video_ids_pro_stichwort.push(stichwort_json[stichwort_ids[num]]);
	}
	var video_ids_match = [];
	
	if(video_ids_pro_stichwort.length == 1)
	{
		video_ids_match = video_ids_pro_stichwort[0];
	}
	for(num_outer in video_ids_pro_stichwort)
	{
		var video_ids_outer = video_ids_pro_stichwort[num_outer];
		for(outer in video_ids_outer) // Videos für einzenles Stichwort
		{
			var outer_video_id = video_ids_outer[outer];
			for(num_inner in video_ids_pro_stichwort) // inneres 
			{
				if(num_inner === num_outer)
				{
					continue; // do not match self
				}
				var video_ids_inner = video_ids_pro_stichwort[num_inner];
				for(inner in video_ids_pro_stichwort[num_inner])
				{
					if(video_ids_inner[inner] === outer_video_id)
					{
						if(false===video_ids_match.includes(outer_video_id)) // keine Duplikate
						{
							video_ids_match.push(outer_video_id);
						}
					}
				}
			}
		}
	}
	// Duplikatzähler ergibt Übereinstimmung mit Stichwort
    // 2 => 2 / 3 => 6 / n => n * (n-1) // keine Duplikate in video_ids_pro_stichwort zulässig

	var list = [];
	for(num in video_ids_match)
	{
		var video_id = video_ids_match[num];
		var video = videos_json[video_id];
		list.push(video);
//		console.log(video_id)
//		console.log(video);
	}
	return list;
}


