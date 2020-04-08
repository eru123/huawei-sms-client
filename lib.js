function nwc(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function strToXml(str){
	parser = new DOMParser();
	xmlDoc = parser.parseFromString(str,"text/xml");
	return xmlDoc;
}
function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}
		// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
}
function se(str){
	return btoa(str);
}
function sd(str){
	return atob(str);
}
function wifiGAPI(url,callback){
	var settings = {
		"async": false,
		"crossDomain": true,
		"url": url,
		"method": "GET"
	}
	$.ajax(settings).done(callback);
}
function wifiPAPI(url,callback){
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": url,
		"method": "GET"
	}
	$.ajax(settings).done(callback);
}
function wifiLogin(user,pass,callback){
	var password = btoa(pass);
	var data = `<?xml version: "1.0" encoding="UTF-8"?><request><Username>${user}</Username><Password>${password}</Password></request>`;
	var settings = {
		"async": false,
		"crossDomain": true,
		"url": "http://192.168.8.1/api/user/login",
		"method": "POST",
		"headers": {
	    	"content-type": "text/xml",
	    	"cache-control": "no-cache"
		},
		"data": data
	}
	$.ajax(settings).done(callback);
}
function wifiPStatus(callback){
	var url = "http://192.168.8.1/api/monitoring/status";
	wifiPAPI(url,callback);
}
function wifiPTraffic(callback){
	var url = "http://192.168.8.1/api/monitoring/traffic-statistics";
	wifiGAPI(url,callback);
}
function wifiPTraffic(callback){
	var url = "http://192.168.8.1/api/monitoring/traffic-statistics";
	wifiPAPI(url,callback);
}
function wifiLoginState(){
	var url = "http://192.168.8.1/api/user/state-login";
	var is_login = false;
	wifiGAPI(url,function(res){
		resXML = strToXml(res);
		resObj = xmlToJson(resXML);
		if (resObj.response != null) {
			if (resObj.response.State['#text'] != null 
				&& resObj.response.State['#text'] == "0"
				&& resObj.response.Username['#text'] != null 
				&& resObj.response.Username['#text'].length > 0) {
				is_login = true;
			}
		}
	})
	return is_login;
}
function wifiLogout(callback){
	var url = "http://192.168.8.1/api/user/logout";
	var data = `<?xml version: "1.0" encoding="UTF-8"?><request><Logout>1</Logout></request>`;
	var settings = {
		"async": false,
		"crossDomain": true,
		"url": url,
		"method": "POST",
		"headers": {
	    	"content-type": "text/xml",
	    	"cache-control": "no-cache"
		},
		"data": data
	}
	$.ajax(settings).done(callback);
}
function wifiSmsCount(callback){
	url = "http://192.168.8.1/api/sms/sms-count";
	wifiGAPI(url,callback);
}
function wifiPSmsCount(callback){
	url = "http://192.168.8.1/api/sms/sms-count";
	wifiPAPI(url,callback);
}
function wifiSmsList(){
	var result = [];
	var sms_inbox_count = 0;
	var retrieved_sms = 0;
	var current_page = 1;
	var url = "http://192.168.8.1/api/sms/sms-list";
	
	
	wifiSmsCount(function(resc){
		var rescXML = strToXml(resc);
		var rescObj = xmlToJson(rescXML);
		if (rescObj.response != null) {
			if (rescObj.response.LocalInbox['#text'] != null) {
				sms_inbox_count = rescObj.response.LocalInbox['#text'] ?? 0;
			}
		}
	})
	while(current_page <= Math.ceil((sms_inbox_count/20)+1)){
		var data = `<?xml version: "1.0" encoding="UTF-8"?><request><PageIndex>${current_page}</PageIndex><ReadCount>20</ReadCount><BoxType>1</BoxType><SortType>0</SortType><Ascending>0</Ascending><UnreadPreferred>0</UnreadPreferred></request>`;
		var settings = {
			"async": false,
			"crossDomain": true,
			"url": url,
			"method": "POST",
			"headers": {
		    	"content-type": "text/xml",
		    	"cache-control": "no-cache"
			},
			"data": data
		}
		$.ajax(settings).done(function(res){
			var resXML = strToXml(res);
			var resObj = xmlToJson(resXML);
			if (resObj.response != null) {
				retrieved_sms += (resObj.response.Count['#text'] ?? 0);
				var msg = resObj.response.Messages.Message ?? null;
				if (msg != null && msg.length > 0) {
					for (var i = 0; i < msg.length; i++) {
						if (msg[i] != null) {
							nr = [];
							cm = msg[i];
							nr.id = cm.Index['#text'] ?? "";
							nr.sender = cm.Phone['#text'] ?? "";
							nr.content = cm.Content['#text'] ?? "";
							nr.date = cm.Date['#text'] ?? "";
							nr.read = cm.Smstat['#text'] == 1 ? true : false;
							result.push(nr);
						}
					}
				}
			} else {
				console.error(`Failed to retrieved sms page ${current_page}`)
			}
		});
		current_page++;
	}
	return result
}
function wifiSmsDelete(id,callback = null){
	var url = "http://192.168.8.1/api/sms/delete-sms";
	var data = `<?xml version: "1.0" encoding="UTF-8"?><request><Index>${id}</Index></request>`;
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": url,
		"method": "POST",
		"headers": {
	    	"content-type": "text/xml",
	    	"cache-control": "no-cache"
		},
		"data": data
	}
	$.ajax(settings).done(callback);
}
function wifiSmsRead(id,callback = null){
	var url = "http://192.168.8.1/api/sms/set-read";
	var data = `<?xml version="1.0" encoding="UTF-8"?><request><Index>${id}</Index></request>`;
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": url,
		"method": "POST",
		"headers": {
	    	"content-type": "text/xml",
	    	"cache-control": "no-cache"
		},
		"data": data
	}
	$.ajax(settings).done(callback);
}
function wifiSmsSend(to,message,callback = null){
	var url = "http://192.168.8.1/api/sms/send-sms";
	var now = new Date("yyyy-MM-dd hh:mm:ss");
	var data = `<?xml version="1.0" encoding="UTF-8"?><request><Index>-1</Index><Phones><Phone>${to}</Phone></Phones><Sca></Sca><Content>${message}</Content><Length>${message.length}</Length><Reserved>1</Reserved><Date>${now}</Date></request>`;
	var settings = {
		"async": false,
		"crossDomain": true,
		"url": url,
		"method": "POST",
		"headers": {
	    	"content-type": "text/xml",
	    	"cache-control": "no-cache"
		},
		"data": data
	}
	$.ajax(settings).done(callback);
}