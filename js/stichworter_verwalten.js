

var g_jsons = {}

function pageLoaded()
{
	var url = new URL(window.location.href);
	var ref_parameter = url.searchParams.get("ref")
	if(ref_parameter !== null)
	{
		var base_path = "db" + ref_parameter;
		var url_json = base_path + "/stichworter.json";
		console.log(ref_parameter);
		fetchJson(url_json, function(status, stichwörter_json)
		{
			if( status === null)
			{
				loadStichwörterJson(stichwörter_json, base_path);
			}
		});
	}
}

function loadStichwörterJson(stichwörter_json, base_path)
{
	g_jsons["stichwörter"] = stichwörter_json;
	var url_json = base_path + "/videos.json";
	fetchJson(url_json, function(status, stichwörter_json)
	{
		if( status === null)
		{
			loadVideosJson(stichwörter_json, base_path);
		}
	});
}

function loadVideosJson(videos_json, base_path)
{
	g_jsons["videos"] = videos_json;
	var url_json = base_path + "/auswahl.json";
	fetchJson(url_json, function(status, auswahl_json)
	{
		if( status === null)
		{
			loadAuswahlJson(auswahl_json, base_path);
		}
	});
}

function loadAuswahlJson(auswahl_json, base_path)
{
	g_jsons["auswahl"] = auswahl_json;
	var auswahl = auswahl_json;
	var stichwörter = g_jsons["stichwörter"];
	var videos =  g_jsons["videos"];
	for(id in stichwörter)
	{
		console.log(id)
		findStichwort(id, auswahl);
	}

	var tabelle_div = document.getElementById("tabelle");
	var tabelle = document.createElement("table");
	var kopf = document.createElement("tr");
	kopf.id = "kopf";
	var td = document.createElement("td");
	kopf.appendChild(td);
	var new_button = document.createElement("button");
	var text = document.createTextNode("Neues Stichwort");
	new_button.setAttribute("onclick", "newSpalte(this.parentElement)");
	new_button.appendChild(text);
	new_button.className = "warning";
	td.appendChild(new_button);

	for(id in stichwörter)
	{
		var th = createTh(id, findStichwort(id, auswahl));
		kopf.appendChild(th);
	}
	tabelle.appendChild(kopf.cloneNode(true));
	var reihen = 0;
	for(id in videos)
	{
		var youtube_id = videos[id]["video"];
		var reihe = fillReihe(id, youtube_id, stichwörter);
		tabelle.appendChild(reihe);
		reihen += 1;
		if((reihen % 5) == 0)
		{
			tabelle.appendChild(kopf.cloneNode(true));
		}
	}
	tabelle_div.appendChild(tabelle);	
}

function fillReihe(uuid, youtube_id, stichwörter)
{
	var reihe = document.createElement("tr");
	var uuid_th = document.createElement("th");
	uuid_th.id = uuid;
	// uuid_th.appendChild(document.createTextNode(uuid));
	var video_div = createYoutubeElement(youtube_id);
	uuid_th.appendChild(video_div);
	reihe.appendChild(uuid_th);

	for(id in stichwörter)
	{
		var td = document.createElement("td");
		td.id = id;
		td.align = "center";
		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		if(stichwörter[id].includes(uuid))
		{
			checkbox.checked = true;
		}
		td.appendChild(checkbox);
		reihe.appendChild(td);
	}
	return reihe;
}


function findStichwort(short, auswahl)
{
	for (id in auswahl)
	{
		if(auswahl[id] === short)
		{
			console.log(id);
			return id;
		}
	}
}

function newSpalte(td)
{
	var tr = td.parentElement;
	var table = tr.parentElement;

	var stichwort = window.prompt("Neues Stichwort:", "Stichwort");
	var stichwort_id = window.prompt("Kürzel für Stichwort \"" + stichwort + "\":", "stw");
	auswahl = g_jsons["auswahl"];
	auswahl[stichwort] = stichwort_id;

	for (var i = 0, tr; tr = table.rows[i]; i++)
	{
		if(tr.id === "kopf")
		{
			var new_th = createTh(stichwort_id, stichwort);
			tr.appendChild(new_th);
		}
		else
		{
			var new_td = document.createElement("td");
			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			new_td.align = "center";
			new_td.appendChild(checkbox);
			new_td.id = stichwort_id;
			tr.appendChild(new_td);
		}
	}	
}

function deleteSpalte(td)
{
	var id = td.id;
	var tr = td.parentElement;
	var table = tr.parentElement;
 
	for (var i = 0, row; row = table.rows[i]; i++)
	{
		for(var j = 1, cell; cell = row.cells[j]; j++)
		{
			if(id === cell.id)
			{
				console.log(cell.id);
				row.deleteCell(j);
			}
		}
	}
}

function createTh(id, stichwort)
{
	var th = document.createElement("th");
	th.id = id;
	var text = stichwort;	
	th.appendChild(document.createTextNode(text));
	var br = document.createElement("br");
	th.appendChild(br);
	var delete_button = document.createElement("button");
	var text = document.createTextNode("Löschen");
	delete_button.setAttribute("onclick", "deleteSpalte(this.parentElement)");
	delete_button.appendChild(text);
	delete_button.className = "danger";
	th.appendChild(delete_button);
	return th;
}

function saveAuswahlAs()
{
	var auswahl = g_jsons["auswahl"];
	download("auswahl.json", JSON.stringify(auswahl, null, '    '));
}

function saveStichworterAs()
{
	var tabelle_div = document.getElementById("tabelle");
	var tabelle = tabelle_div.firstElementChild;


	// Init
	var stichworter = {};
	var kopf = tabelle.rows[0];
	for(var i = 1, cell; cell = kopf.cells[i]; i++)
	{
		stichworter[cell.id] = [];
	}

	// Set
	for(var i = 1, row; row = tabelle.rows[i]; i++)
	{
		if(row.id !== "kopf")
		{
			var uuid = row.cells[0].id;

			for(var j = 1, cell; cell = row.cells[j]; j++)
			{
				var checkbox = cell.firstElementChild;
				if(checkbox.checked === true)
				{
					stichworter[cell.id].push(uuid);
				}
			}
		}
	}
	download("stichworter.json", JSON.stringify(stichworter, null, '    '));
}


function _____nix()
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




function createYoutubeElement(youtube_id)
{
	var youtube_element =  document.createElement('div');
	var youtube_iframe = "<iframe src=\"";
	youtube_iframe += "https://www.youtube-nocookie.com/embed/" + youtube_id + "?rel=0\"";
	youtube_iframe += "frameborder=\"0\" allow=\"autoplay; encrypted-media\" allowfullscreen></iframe>";
	youtube_element.innerHTML = youtube_iframe;
	// youtube_element = youtube_element.firstChild;
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





