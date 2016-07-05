blocked_sites = {};
load();
function calcTime(a){
  var ms = a%1000;//"ms"
  a-=ms;
  var s = (a/1000)%60;//"s"
  a-=s*1000;
  var min = (a/60000)%60;//"min"
  a-=min*60000;
  var h = a/3600000;//"h"
  if(h==0 && min==0 && s==0 && ms==0){
    return "0ms";
  }
  return (h>0?h+"h ":"")+(min>0?min+"min ":"")+(s>0?s+"s ":"")+(ms>0?ms+"ms":"");
}
function StrToTime(a){
  return a*1000;
}
window.onload = codeStart;
function codeStart(){
  document.getElementById("addbutton").onclick=function(e){
    add_new(document.getElementById("addhost").value);
    document.getElementById("addhost").value="";
  }
}
function save(){
  chrome.runtime.sendMessage({method: "save", blocked_sites: blocked_sites}, function(response) {
    if(response.e!="ok"){
      alert("save error, please retry");
    }
  });
}
function load(){
  chrome.runtime.sendMessage({method: "load"}, function(response) {
    if(response.e=="ok"){
      blocked_sites=response.blocked_sites;
      var node = document.getElementById("list");
      if(node != null){
        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }
      }
      for(var t in blocked_sites){
        show_tab(t);
      }
    }else{
      alert("load error, please retry");
    }
  });
}
function get_this(e){
  var host = e.parentElement.parentElement.getElementsByTagName("td")[0].childNodes[0].nodeValue;
  var num = parseInt(e.value);
  blocked_sites[host].limit=num*1000;
  e.value = num;
  save();
}
function delete_this(e){
  var host = e.parentElement.parentElement.getElementsByTagName("td")[0].childNodes[0].nodeValue;
  delete blocked_sites[host];
  save();
  load();
}
function add_new(e){
  if(e.length > 0){
    blocked_sites[e]=new blocked_site(0,0,0);
    save();
    load();
  }
}
function show_tab(t){
  var div=document.createElement("tr");
  var domain = document.createElement("td");
  domain.appendChild(document.createTextNode(t));
  div.appendChild(domain);
  var used = document.createElement("td");
  used.appendChild(document.createTextNode(calcTime(blocked_sites[t].used)));
  div.appendChild(used);
  var tlimit = document.createElement("td");
  var limit = document.createElement("input");
  limit.value=blocked_sites[t].limit/1000;
  limit.onchange=function(e){
    get_this(e.target);
  };
  limit.onkeyup=function(e){
    get_this(e.target);
  };
  tlimit.appendChild(limit);
  div.appendChild(tlimit);
  var options = document.createElement("td");
  var button_del = document.createElement("input");
  button_del.type="button";
  button_del.value="Delete";
  button_del.onclick=function(e){
    delete_this(e.target);
  };
  options.appendChild(button_del);
  div.appendChild(options);

  var main = document.getElementById("list");
  if(main != null){
    main.appendChild(div);
  }
}
