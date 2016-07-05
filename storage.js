blocked_sites = {};
function load(){
  chrome.storage.sync.get("sites", function (obj) {
    var p = JSON.parse(obj.sites);
    for(var t in p){
      blocked_sites[t]=new blocked_site(p[t].limit, p[t].used, p[t].day);
    }
    for(var t in global_tabs){
      check_tab(parseInt(t),false);
    }
});
}
function save(){
  var tmp_blocked_sites = {};
  for(var t in blocked_sites){
    var obj = blocked_sites[t];
    tmp_blocked_sites[t] = {limit:obj.limit,used:obj.used,day:obj.day};
  }
  chrome.storage.sync.set({'sites': JSON.stringify(tmp_blocked_sites)});
}
//sync with options
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "load"){
      sendResponse({e:"ok",blocked_sites:blocked_sites});
    }else if(request.method == "save"){
      blocked_sites=request.blocked_sites;
      save();
      sendResponse({e:"ok"});
    }else{
      sendResponse({}); // snub them.
    }
});
