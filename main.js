function updateInboxList(from = null){
	var inbox = wifiSmsList();
	if (inbox.length > 0) {
		app._data.inbox = inbox;
		if (from == 'delete') {
			Swal.fire('Deleted','Message succefully deleted!','success')
		}
	}
}
function inboxRead(id){
	var inbox  = app._data.inbox;
	var item = [];
	if (inbox.length > 0) {
		for (var i = 0; i < inbox.length; i++) {
			if (inbox[i].id != null && inbox[i].id == id) {
				item = inbox[i];
			}
		}
		if (item.id != null) {
			if (item.read == false) {
				wifiSmsRead(item.id,updateInboxList);
			}
			app._data.inboxSmsRead.data = item;
			app._data.inboxSmsRead.visible = true;
		}
	}
}
function inboxSmsDelete(id){
	Swal.fire({
	    title: 'Are you sure?',
	    text: "You won't be able to revert this!",
	    icon: 'warning',
	    showCancelButton: true,
	    confirmButtonColor: '#3085d6',
	    cancelButtonColor: '#d33',
	    confirmButtonText: 'Yes, delete it!'
	 }).then((result) => {
	    if (result.value) {
	    	wifiSmsDelete(id,updateInboxList('delete'));
			app._data.inboxSmsRead.data = [];
			app._data.inboxSmsRead.visible = false;
	    }
	 });
	
}
function inboxSmsSend(){
	app._data.loading = true;
	var to = app._data.cmto;
	var msg = document.getElementById('cmmsg').value;
	if (to.length >= 3 && msg.length > 0) {
		wifiSmsSend(to,msg,function(res){
			var resXML = strToXml(res);
			var resObj = xmlToJson(resXML);
			if (resObj.response != null && resObj.response['#text'] == 'OK') {
				Swal.fire('SENT','Message sent successfuly','success')
				app._data.page = 'inbox';
			} else {
				Swal.fire('FAILED','Message not sent','error')
			}
		})
	} else {
		Swal.fire('INVALID','The message you are trying to send is invalid','error');
	}
	app._data.loading = false;
}
function inboxSmsSendReply(sender){
	app._data.loading = true;
	var to = sender;
	var msg = document.getElementById('rmmsg').value;
	if (to.length >= 3 && msg.length > 0) {
		wifiSmsSend(to,msg,function(res){
			var resXML = strToXml(res);
			var resObj = xmlToJson(resXML);
			if (resObj.response != null && resObj.response['#text'] == 'OK') {
				Swal.fire('SENT','Message sent successfuly','success')
				app._data.page = 'inbox';
				app._data.inboxSmsRead.reply = false;
				app._data.inboxSmsRead.visible = false;
				app._data.inboxSmsRead.data = [];
				app._data.loading = false;
			} else {
				Swal.fire('FAILED','Message not sent','error')
			}
		})
	} else {
		Swal.fire('INVALID','The message you are trying to send is invalid','error');
	}
	app._data.loading = false;
}
function updateWifiStatus(){
	wifiPStatus(function(res){
		var resXML = strToXml(res);
		var resObj = xmlToJson(resXML);
		if (resObj.response != null) {
			app._data.status.signal = `${(resObj.response.SignalIcon['#text'] ?? 0)} out of ${(resObj.response.maxsignal['#text'] ?? 0)}`;app._data.status.wlan_users = `${(resObj.response.CurrentWifiUser['#text'] ?? 0)} out of ${(resObj.response.TotalWifiUser['#text'] ?? 0)}`; 
			app._data.status.wan_ip = (resObj.response.WanIPAddress['#text'] ?? "");
			app._data.status.prim_dns = (resObj.response.PrimaryDns['#text'] ?? "");
			app._data.status.my_number = (resObj.response.msisdn['#text'] ?? "");
			app._data.status.battery = (resObj.response.BatteryPercent['#text'] ?? "0");
			
		}
	});
	wifiPTraffic(function(res){
		var resXML = strToXml(res);
		var resObj = xmlToJson(resXML);
		if (resObj.response != null) {
			app._data.status.traffic_cup = (resObj.response.CurrentUpload['#text'] ?? 0);
			app._data.status.traffic_cdl = (resObj.response.CurrentDownload['#text'] ?? 0);
			app._data.status.traffic_tup = (resObj.response.TotalUpload['#text'] ?? 0);
			app._data.status.traffic_tdl = (resObj.response.TotalDownload['#text'] ?? 0);
			app._data.status.traffic_tim = (resObj.response.CurrentConnectTime['#text'] ?? 0);
		}
	});
	wifiPSmsCount(function(res){
		var resXML = strToXml(res);
		var resObj = xmlToJson(resXML);
		if (resObj.response != null) {
			app._data.status.inbox = `${(resObj.response.LocalUnread['#text'] ?? 0)}/${(resObj.response.LocalInbox['#text'] ?? 0)}`;
			app._data.status.unread = (resObj.response.LocalUnread['#text'] ?? 0);
		}
	});
	wifiPAPI("http://192.168.8.1/api/wlan/basic-settings",function(res){
		var resXML = strToXml(res);
		var resObj = xmlToJson(resXML);
		if (resObj.response != null) {
			app._data.status.ssid = (resObj.response.WifiSsid['#text'] ?? "");
		}
	})
	wifiPAPI("http://192.168.8.1/api/net/current-plmn",function(res){
		var resXML = strToXml(res);
		var resObj = xmlToJson(resXML);
		if (resObj.response != null) {
			app._data.status.network = (resObj.response.FullName['#text'] ?? "");
		}
	})
}