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
var g_stichwort_ids = [];
var g_nav_hierarchie = -1; /// Gibt aktuell angezeigte Hierarchie Ebene an. // TODO -1 für Wurzel? // TODO Rework Zählung der Hierarchie Ebenen

//
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

function showButtons(hierarchie, display)
{
	if(typeof display === "undefined")
	{
		display = true;
	}
	console.log(hierarchie);
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

//
function manageButtons(element)
{
	console.log(element)
	console.log(g_hierarchie_pfad)
// TODO Error handling
//	if(hierarchie_level
	var nav_path = document.getElementById("nav_path");
	var nav_layer = element.parentElement;
	if(nav_layer.tagName.toLowerCase() === "span") // span block of toggle buttons
	{
             nav_layer = nav_layer.parentElement;
	}
	var nav_layers = nav_layer.parentElement;
	var hierarchie_level = g_hierarchien.indexOf(nav_layer.id) + 1; // Neue hierarchie ebene // TODO check hierarchie_level for -1
	console.log("Hierarchie level: " + hierarchie_level + " / Element Id: " + nav_layer.id + " / Button Id: " + element.id);	
	if(hierarchie_level <  g_hierarchien.length) // Hierarchien aufklappen oder Videos listen
	{
		var videos = document.getElementById("videos");
		removeAllChildren(videos); // Videos wegräumen
		var clean_nav_layer = nav_layer.previousElementSibling; // Darunterliegende Nav Layer entfernen
		var next;
		while(clean_nav_layer !== null)
		{
			next = clean_nav_layer.previousElementSibling
			console.log("Entferne Layer mit ID: " + clean_nav_layer.id);
			nav_layers.removeChild(clean_nav_layer);
			clean_nav_layer = next;
		}
		
		while(hierarchie_level <= g_hierarchie_pfad.length) // remove lower nav levels from hierarchie 
		{
			g_hierarchie_pfad.pop();
			nav_path.removeChild(nav_path.lastElementChild);
		}
		console.log("manageButtons():", g_hierarchie_pfad);
				

		var [path_url_json, pfad] = resolveJsonUrl(g_hierarchie_pfad, "auswahl");
		g_hierarchie_pfad.push(element.id);
		addNavPath(nav_path, g_hierarchien[hierarchie_level], g_hierarchie_pfad[hierarchie_level-1], path_url_json);
		var next_nav_layer = createNavLayer(nav_layers, g_hierarchien[hierarchie_level]);
		console.log(nav_layer);
		console.log(next_nav_layer);
		console.log(element.id);

		console.log(next_nav_layer.id);
		var [url_json, pfad] = resolveJsonUrl(g_hierarchie_pfad, "auswahl");
		if(hierarchie_level < (g_hierarchien.length-1))
		{
			loadLayerButtons(next_nav_layer, url_json);
		}
		else
		{
			loadToggleButtons(next_nav_layer, url_json);
		}
		
		
		if(hierarchie_level > 0) // Schadet nicht, auch bei Rückwärtsnavigation
		{
			showButtons(g_hierarchien[hierarchie_level-1], false);
		}
		showButtons(g_hierarchien[hierarchie_level]);
		g_nav_hierarchie = hierarchie_level;
		
		updatePermalink(pfad);
		g_stichwort_ids = []; // reset toggle_status
	}
	else
	{
		// Toggle buttons
		// Toggeln nur bei Toggle id
		if(element.id.endsWith("__toggle"))
		{
			var id = element.id.replace("__toggle", "");
			g_stichwort_ids = toggleListe(id, g_stichwort_ids)
			var span = element.parentElement;
			var button = span.firstElementChild;
			selectButton(button, true); // toggle Button is not bound to stichwort_ids
		}
		else
		{
			// de toggle andere
			var clean_toggle = nav_layer.lastElementChild;
			clean_toggle = clean_toggle.previousElementSibling; // ingoriere <hr>
			console.log("Cleaning " + nav_layer.id);
			while(clean_toggle !== null)
			{
				selectButton(clean_toggle.firstElementChild, false);
				clean_toggle = clean_toggle.previousElementSibling;
			}

			selectButton(element, true); // toggle Button is not bound to stichwort_ids
			g_stichwort_ids = [ element.id ];			
		}
		// loadVideos(g_hierarchie, g_toggle_status);
		loadVideos(g_hierarchie_pfad, g_stichwort_ids);
	}
}

// hierarchie : Hierachie Ebene die angezeigt werden soll.
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

function toggleListe(id, toggle_liste)
{
	if(! toggle_liste.includes(id))
	{
		toggle_liste.push(id);
	}
	console.log(toggle_liste);
	return toggle_liste;
}

function updatePermalink(pfad)
{
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
	link.text = "permalink";
}

//
function loadVideos(hierarchie, stichwort_ids)
{
	var [url_json, dummy_pfad] = resolveJsonUrl(hierarchie, "stichworter");
	fetchJson(url_json, function(status, json)
	{
		if( status === null)
		{
			var stichwort_json = json;
			var [url_json, dummy_pfad] = resolveJsonUrl(hierarchie, "videos");
			fetchJson(url_json, function(status, json)
			{
				if( status === null)
				{
					var videos_json = json;
					var video_list = makeList(stichwort_ids, videos_json, stichwort_json);
					var videos_next = createVideoElements(video_list);
					console.log("Done!");
					var videos = document.getElementById("videos");
					var videos_outer = document.getElementById("videos_outer");
					videos_outer.replaceChild(videos_next, videos);
				}
			});
		}
	});
}

//
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

//
function createVideoElements(video_list)
{
	var videos = document.createElement('div');
	videos.id = "videos";
	for(num in video_list)
	{
		var youtube_id = video_list[num]["video"];
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


//
function loadToggleButtons(parentElement, url_json)
{
	fetchJson(url_json, function(status, json)
	{
		if( status === null)
		{

			for(element in json)
			{
				var toggle_group = document.createElement("span");
				toggle_group.id = "span__" + json[element];
				toggle_group.className = "toggle_group";
				var element_button = createButton(element, json[element], "success_not_selected");
				toggle_group.appendChild(element_button);
				var toggle_button = createButton("+", json[element]+"__toggle", "success_toggle");
				toggle_group.appendChild(toggle_button);
				parentElement.appendChild(toggle_group);
			}
		}
	});
}

//
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
	});
}

////////////////////////////////////////////////////////////////////////////////////

// HELPER

// TODO JSON cache?

// Nav Path ist immer eins hintendran iaw id
function addNavPath(parentElement, hierarchie, id, url_json)
{
	console.log("addNavPath",id);
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

function createNavLayer(parentElement, id)
{
	var nav_layer = document.createElement("div");
	nav_layer.id = id;
	nav_layer.setAttribute("class", "nav_layer");
	nav_layer.style.display = "none";
	parentElement.insertBefore(nav_layer, parentElement.firstElementChild);
	
	return nav_layer;
}


//
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
////////////////////////////////////////////////////////////////////////////////////

// Garbage

//
function myFunction(id)
{
	window.confirm("Status: " + id );
	url="db/auswahl-schule.json"
	function fetchCallback (err, json) // not thread safe?
	{		
	  if (err === null) {
	    alert('Your query count: ' + json["Bundesländer"]["Bayern"]);
	  } else {
	    alert('Something went wrong: ' + err);
	  }
	}
	fetchJson(url, fetchCallback);
}

//
function toggleSuccess(element)
{
	var attr = element.getAttributeNode("class")
	if(attr.value == "success")
	{
		attr.value = "success_select";
	}
	else
	{
		attr.value = "success";
	}
}

//
function getSubElementById(parent_element, id) {
	for(child_element of parent_element.children)
	{
		if(child_element.id == id)
		{
			return child_element;
		}
	}
}

