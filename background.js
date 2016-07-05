//all tabs in variable
var global_tabs={};
//callback create object in "tabs"
chrome.tabs.onCreated.addListener(function(tab){
  global_tabs[tab.id]={url:tab.url,last_check:(new Date()).getTime(),pinned:tab.pinned};
  check_tab(tab.id,false);
});
//callback update object in "tabs"
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if(global_tabs[tab.id].url!=tab.url){
    check_tab(tab.id,false);
    global_tabs[tab.id].last_check=(new Date()).getTime();
    global_tabs[tab.id].url=tab.url;
    check_tab(tab.id,false);
  }
  if(global_tabs[tab.id].pinned!=tab.pinned){
    check_tab(tab.id,false);
    global_tabs[tab.id].last_check=(new Date()).getTime();
    global_tabs[tab.id].pinned=tab.pinned;
    check_tab(tab.id,false);
  }
});
//callback delete object in "tabs"
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
  global_tabs[tabId].last_check=(new Date()).getTime();
  check_tab(tabId,true);
  delete global_tabs[tabId];
});
//get all tab created before run extension
chrome.tabs.query({}, function(tabs){
  for(var t in tabs){
    var tab=tabs[t];
    global_tabs[tab.id]={url:tab.url,last_check:(new Date()).getTime(),pinned:tab.pinned};
    check_tab(tab.id,false);
  }
})
load();
function check_tab(tabId, isclosed){
  var tab = global_tabs[tabId];
  if(typeof tab != "object"){
    return;
  }
  if(tab.pinned){
    return;
  }
  var hostrx = ":\/\/(.*)\/";
  var host = tab.url.match(hostrx)[1];
  if(typeof blocked_sites[host] == "object"){
    if(blocked_sites[host].used>=blocked_sites[host].limit && !isclosed){
      chrome.tabs.remove(tabId);
    }
    if(blocked_sites[host].first_check == 0){
      blocked_sites[host].first_check=tab.last_check;
    }else if(blocked_sites[host].first_check>tab.last_check){
      blocked_sites[host].first_check=tab.last_check;
    }
    tab.last_check = (new Date()).getTime();
    if(blocked_sites[host].last_check == 0){
      blocked_sites[host].last_check=tab.last_check;
    }else if(blocked_sites[host].last_check<tab.last_check){
      blocked_sites[host].last_check=tab.last_check;
    }
  }
}
setInterval(function(){
  for(var t in global_tabs){
    check_tab(parseInt(t),false);
  }
  var mod = false;
  var d = new Date();
  var now = d.getTime();
  var day = now-(now%86400000);
  for(var t in blocked_sites){
    var obj = blocked_sites[t];
    if(obj.day!=day){
      obj.used = 0;
      obj.day = day;
      mod = true;
    }
    if(obj.last_check != 0 && obj.first_check !=0){
      if(obj.last_check>obj.first_check && obj.used<obj.limit){
        obj.used+=obj.last_check-obj.first_check;
        obj.first_check = now;
        console.log(t+" used "+obj.used);
        mod = true;
      }else{
        obj.last_check = 0;
        obj.first_check = 0;
        mod = true;
      }
    }
  }
  if(mod){
    save();
  }
},1000);
