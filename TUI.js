// ==UserScript==
// @name         TaskUI
// @namespace    http://tampermonkey.net/
// @version      0.1.46
// @description  TaskUI
// @author       josfrost
// @match        https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js
// @match        https://na-mc-execute.corp.amazon.com/?businessType=AMZL
// @match        https://logistics.amazon.com/internal/capacity/uploader
// @match        https://na.coworkassignment.science.last-mile.a2z.com/Scheduling/*
// @match        https://na.beta.coworkassignment.science.last-mile.a2z.com/Scheduling/*
// @match        https://na-mc-execute.corp.amazon.com/?businessType=AMZL*
// @match        https://app.chime.aws/*
// @match        https://*.app.chime.aws/*
// @match        file:///*
// @connect      *
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==
//non-colorblind specific pallette
const devDesk = "http://dev-dsk-josfrost-1d-68c2612d.us-east-1.amazon.com:1999/"
const black = "#000903";
const gray = "#75755d";
const lightWhite = "#e0eff2";
//colorblind specific pallete
const cb_Orange = "#E66100";
const cb_Skyblue = "#00a8e1";
const cb_Green = "#009E73";
const cb_darkGreen = "#117733";
const cb_Yellow = "#FFB000";
const cb_Blue = "#0072B2";
const cb_Red = "#DC3220";
const cb_Purple = "#5D3A9B";
//version
var storedVersion = GM_getValue("ver")

const version = .13;

var onReload = true;
setTimeout(function(){
 onReload = false;
},6000);

//// globals
var auditorMode = false;
let activeTasks = {};
var userBlurbs = GM_getValue("userBlurbs");
if (!userBlurbs)
{GM_setValue("userBlurbs","")
 userBlurbs={};}
else
{
  userBlurbs = JSON.parse(userBlurbs);
}
var blurbset = {};

const site = window.location.href
var configVersion;
var webhooks={};
var chimeRooms={};
var recList;
var stopReq = false;
var dataToggle=false;
var start_time;
var request_time;
var lastDataPull;
var dwellingTasks = {};
const taskUIusers = [];
var packageScore = 0;
var toggleBlurbs=false;
var getScore = GM_getValue("packageScore")
if (getScore > 0){packageScore = getScore;}
var replancheck = [];
var vertcheck = GM_getValue("vt")
var vt = 0;
if(vertcheck){vt = vertcheck;}
var today = new Date
today = today.toDateString();
var getcb = GM_getValue("cb");
var associatesWithASMView;
var replandate = GM_getValue("replandate");
var recycleCounter = 0;
setTimeout(function(){
getTUIconfig().then((e, i) => {

            var configResponse = e.response;
    configVersion = configResponse.version
    webhooks = configResponse.webhooks
    chimeRooms = configResponse.chimeRooms
    blurbset = configResponse.blurbset
    if(configResponse.blurbset && site.includes("science"))

       {
           ;addBlurbs()
    if (version != configVersion)
    {
     alert ("\nTaskUI Version does not match!\n\nTaking you to the update page!");
        window.open("https://drive.corp.amazon.com/view/josfrost@/TaskUI/TaskUI.user.js?download=true")
    }else
    {
var addVer = setTimeout(addVersion,12000)

    }
       }
                })},1000);
if(!replandate){replandate = today;}

if(Object.keys(replandate).length===0){GM_setValue("replandate",today); replandate = today}

if(today==replandate){var replancheck2 = GM_getValue("replancheck");if (replancheck2){replancheck=replancheck2;} }
var tasks=0;
const backend = "file://ant.amazon.com/dept/AMZL-CentralOps/Scheduling/TaskServer/TaskUI.html"
const TBAurl = "https://na.coworkassignment.science.last-mile.a2z.com/GetFile/"
var users=[];
var audits = "";
let auditToggle=0;
var getUsers = GM_getValue("users")
if(getUsers)
{users=getUsers;}
    if (storedVersion != version || users.indexOf("datahandler") !== -1)
    {
      GM_setValue("users","");
        GM_setValue("ver",version);
    }
var user=[];
var userLead=[];
const cycleData = [{
    name: "CYCLE_0",
    tMinus: 120,
    id: "e4ee0631-aa79-4fa9-a46d-ce5ced20214a"
},{
    name: "CYCLE_1",
    tMinus: 120,
    id: "dfc3989b-67cf-4005-ad2d-4049f56ba9e8"
},
{
    name: "CYCLE_2",
    tMinus: 120,
    id: "3a7c503c-3ff1-438d-8aaa-2216114cbda4"
},
{
    name: "AD_HOC_1",
    tMinus: 60,
    id: "34d64e17-3e72-45da-897b-036a06da6ff1"
},
{
    name: "AD_HOC_2",
    tMinus: 60,
    id: "e31a14cf-8b2e-45d7-a703-579d384ab10b"
},
{
    name: "AD_HOC_3",
    tMinus: 60,
    id: "aca147f1-6766-4559-94a6-bc664cfd1c06"
},
{
    name: "RTS_1",
    tMinus: 45,
    id: "eeb34597-2386-4aa7-92a9-3918a2160dc1"
},
{
    name: "RTS_2",
    tMinus: 45,
    id: "ce5d1e05-5d6f-4203-a867-b4eaa0554ccc"
},
{
    name: "RTS_3",
    tMinus: 45,
    id: "17344411-99c1-4530-bddc-bb950c8185b0"
},
{
    name: "FER",
    tMinus: 45,
    id: "a79ca9b1-77d1-4b2e-b5f9-9920d00ea145"
},
{
    name: "4P RELEASE",
    tMinus: 45,
    id: ""
},
{
    name: "FLEX REDUCE DEMAND",
    tMinus: 0,
    id: ""
},
{
    name: "NO SHOW",
    tMinus: 45,
    id: ""
},
{
    name: "DSP DROPPED ROUTES",
    tMinus: 45,
    id: ""
},
{
    name: "SAME_DAY",
    tMinus: 60,
    id: "8cde3688-1a61-45e2-b9ef-72482bb9668d"
},
{
    name: "AMXL_1",
    tMinus: 60,
    id: "3a1891de-86c8-461d-a4b0-f314ad7fbf0a"
},
{
    name: "AMXL_2",
    tMinus: 60,
    id: "8de949aa-9dcc-491a-8e43-09d547f0a50b"
}
]

const routingURL = "https://na.route.planning.last-mile.a2z.com/route-planning/";
const dpoURL = "https://na.dispatch.planning.last-mile.a2z.com/dispatch-planning/";
const prefURL= "https://na.coworkassignment.science.last-mile.a2z.com/PreferenceSheetViewer/"

if (site.includes("chime"))
{
    chimeButton();

}

if (site =="https://logistics.amazon.com/internal/capacity/uploader")
{
    var inputButton = document.getElementsByClassName("a-button-text a-declarative")[0]
 var inputSelect = document.getElementsByClassName("a-dropdown-prompt");
    let inputSelection;
    if (inputSelect)
    {setTimeout(function(){inputSelection = inputSelect[0]
                           inputButton.click()
                         setTimeout(function(){
                             for (var x = 6;x < 11;x++){
                                 var WGED = document.querySelector('#fileTypeDropDownId_'+x)
                                 if(WGED)
                                 {
                           WGED.click();}
                                 else
                                 {break}
                                                       } },500)
          console.log(inputSelection)},500)
    }
}


if (site.includes("https://na-mc-execute.corp.amazon.com/?businessType=AMZL"))
{
    setInterval(function(){
        var css_4x0acq = document.getElementsByClassName("css-4x0acq");

        var at = GM_getValue("activeTasks")
        if (css_4x0acq){
        for (var actask in css_4x0acq)
        {
                    var activityBar = css_4x0acq[actask].getElementsByClassName("css-n3t751");
        if (activityBar)
        {

            for (var task in activityBar)
            {
                if (activityBar[task].innerText)
                {
                    var uuidT = activityBar[task].innerText
                    if (uuidT == "CoWorkAssignmentException")
                    {
                        activityBar[task].innerText=""
                    }
                    if(uuidT.includes("CO_WORK_ASSIGNMENT_TASK_ID"))
                    {
                        var unaccepted = true;
                        uuidT = uuidT.split(' ... ')
                        for(var a in at)
                        {
                            if (at[a].split("|")[0] == uuidT[1])
                            {
                                unaccepted = false;
                                activityBar[task].innerText = at[a].split("|")[1]
                                css_4x0acq[actask].style.backgroundColor=cb_Green;
                                activityBar[task].style.fontWeight="Bold";
                            }
                        }
                        if (unaccepted == true)
                        {
                            css_4x0acq[actask].style.backgroundColor=cb_Yellow;
                            activityBar[task].style.fontWeight="Bold";
                        }

                    }

                }
            }
        }}}
    },5000)
}
    var savedLogin = GM_getValue("user");
if (site.includes("science"))
    {
        GM_setValue("data","{}")
    var getuser = getUserData();
        GM_setValue("user",getuser)
        user = getuser;
                if (users.indexOf(getuser) == -1)
        {users.push(user);}
                getAssociatesWithASMView().then((e, i) => {

            associatesWithASMView = e.response.data;
 userLead = associateHasASMView(user);
                 if (userLead == false && users.indexOf("*") == -1)
                  {users.push("*");}
                })

var verifyInstall = GM_getValue("verifyInstall")
if (verifyInstall != true)
{
    var now = new Date();
    sendMsg("VERIFY", user+" Verified "+now);
    GM_setValue("verifyInstall",true)
    alert("TaskUI Installed Successfully!");
}

    }
if (site.includes("https://na.coworkassignment.science.last-mile.a2z.com/")||site.includes("https://na.beta.coworkassignment.science.last-mile.a2z.com/"))
{




    var thism = $('label[for="autorefresh"]')[0];
         var loadcheck = setInterval(() => {
            var cb = document.getElementById("ratDL");
            if (cb)
            {

                clearInterval(loadcheck);
              setTimeout(function () {

     if(cb.checked || getcb == "checked")
     {
   if(thism){
       cb.checked = true;
thism.click();}
     }
    }, 200);}}, 200)


         var playerPeccy = document.createElement("div");
playerPeccy.id="playerPeccy";
playerPeccy.style.display="none";
playerPeccy.style.width="60px";
playerPeccy.style.position = "fixed";
playerPeccy.style.margin="auto";
playerPeccy.style.bottom="50px";
playerPeccy.style.fontWeight="bold";
playerPeccy.style.fontSize="13px";
playerPeccy.style.color = "transparent";
    if (vt == 0)
    {

playerPeccy.style.right="140px";
        playerPeccy.id="140";
    }
    else
    {
       playerPeccy.style.right="250px";
        playerPeccy.id="250";
    }


playerPeccy.style.borderRadius="5px";
playerPeccy.style.zIndex="2050";
playerPeccy.style.height="80px";
playerPeccy.style.borderWidth="thin";
playerPeccy.style.borderStyle = "solid";
playerPeccy.onclick=function(){
    event.stopPropagation();
    clickTog = 1;
peccyScoreBox2.style.display = "block";
       if (visPec == 0)
       {
togglePeccy.style.color=lightWhite;

       visPec = 1;
           createPackages();
           movePackages();
       }
  setTimeout(function () {
   peccyScoreBox2.style.display = "none";
    }, 100);
}


document.body.appendChild(playerPeccy);
    document.body.addEventListener("keyup", function(e) {
          if (e.key == " " ||
      e.code == "Space" ||
      e.keyCode == 32
  ) {
    peccyScoreBox2.style.display = "block";
               setTimeout(function () {
  peccyScoreBox2.style.display = "none";
    }, 100);
    clickTog = 1;


          }
    })


var peccyPic = "https://drive.corp.amazon.com/view/josfrost@/Peccy.png?download=true";
    var peccyPicture = document.createElement("img");
    peccyPicture.src = peccyPic;
     peccyPicture.style.height = "80px";
     peccyPicture.style.width = "60px"
    peccyPicture.style.position = "absolute";
let clickedPackage = 0;
  var clickTog = 0;

    peccyPicture.style.left="0px"
    peccyPicture.style.bottom="0px";
    peccyPicture.style.cursor = "default";
    playerPeccy.appendChild(peccyPicture);

        var peccyScoreBox = document.createElement("div");

    peccyScoreBox.style.height = "25px";
    peccyScoreBox.style.width = "25px"
    peccyScoreBox.style.position = "absolute";
    peccyScoreBox.style.backgroundColor = cb_darkGreen;
    peccyScoreBox.style.color=gray;
    peccyScoreBox.style.borderRadius="5px";
    peccyScoreBox.style.left="20px"
    peccyScoreBox.style.borderWidth="thin";
    peccyScoreBox.style.borderStyle = "solid";
    peccyScoreBox.style.bottom="0px";
    peccyScoreBox.style.cursor = "default";
    playerPeccy.appendChild(peccyScoreBox);

            var peccyScoreBox2 = document.createElement("div");
    peccyScoreBox2.style.display = "none";
    peccyScoreBox2.style.height = "25px";
    peccyScoreBox2.style.width = "25px"
    peccyScoreBox2.style.position = "absolute";
    peccyScoreBox2.style.backgroundColor = "#04f200";
    peccyScoreBox2.style.color=gray;
    peccyScoreBox2.style.borderRadius="5px";
    peccyScoreBox2.style.left="20px"
    peccyScoreBox2.style.borderWidth="thin";
    peccyScoreBox2.style.borderStyle = "solid";
    peccyScoreBox2.style.bottom="0px";
    peccyScoreBox2.style.cursor = "default";
    playerPeccy.appendChild(peccyScoreBox2);


            var packageUp = document.createElement("div");
    packageUp.style.textAlign="justify";
    packageUp.innerText = "+1";
    packageUp.style.fontSize = "16px";
    packageUp.style.fontWeight = "700";
    packageUp.style.display="none";
    packageUp.style.height = "24px";
    packageUp.style.width = "24px"
    packageUp.style.position = "absolute";
    packageUp.style.color = "DodgerBlue";
    packageUp.style.borderRadius="7px";
    packageUp.style.right="-25px"
    packageUp.style.borderWidth="thin";
    packageUp.style.borderStyle = "solid";
    packageUp.style.top="0px";
    packageUp.style.cursor = "default";
    playerPeccy.appendChild(packageUp);




                 var togglePeccy = document.createElement("div");
var visPec = 0;
   togglePeccy.innerText="Start";
    var peccyPower = GM_getValue("peccyPower")
    if (peccyPower == true)
    {togglePeccy.style.display = "block";}
    else
    {togglePeccy.style.display = "none";}
togglePeccy.style.width="60px";
togglePeccy.style.position = "fixed";
togglePeccy.style.textAlign="justify";
togglePeccy.style.margin="auto";
togglePeccy.style.bottom="8px";
togglePeccy.style.fontWeight="bold";
togglePeccy.style.fontSize="13px";
togglePeccy.style.color = lightWhite;
togglePeccy.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
togglePeccy.style.right="136px";
togglePeccy.style.backgroundColor = cb_Skyblue;
togglePeccy.style.borderRadius="5px";
togglePeccy.style.zIndex="2050";
togglePeccy.style.height="20px";
togglePeccy.style.borderWidth="thin";
togglePeccy.style.borderStyle = "solid";
   togglePeccy.onclick=function(){
       if (visPec == 0)
       {

           playerPeccy.style.display="block";
togglePeccy.style.color=lightWhite;

       visPec = 1;
           createPackages();
           movePackages();
       }
       else
       {

       togglePeccy.style.color=gray;
           visPec = 0;

   }}
document.body.appendChild(togglePeccy);
    var packageTog = document.createElement("div");
    packageTog.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
    packageTog.style.position = "absolute";
    packageTog.style.left="34px"
    packageTog.style.bottom="0px";
    packageTog.style.cursor = "default";
    packageTog.color="white";
    packageTog.id = "packageTog";
    packageTog.innerText="📦";
    togglePeccy.appendChild(packageTog);


        var toggleVis = document.createElement("div");
var vistog = 0;
toggleVis.style.width="30px";
toggleVis.style.position = "fixed";
toggleVis.style.textAlign="justify";
toggleVis.style.margin="auto";
toggleVis.style.bottom="30px";
toggleVis.style.fontWeight="bold";
toggleVis.style.fontSize="18px";
toggleVis.style.color = lightWhite;
toggleVis.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
toggleVis.style.right="167px";
toggleVis.style.backgroundColor = cb_Skyblue;
toggleVis.style.borderRadius="5px";
toggleVis.style.zIndex="2050";
toggleVis.style.height="20px";
toggleVis.style.borderWidth="thin";
toggleVis.style.borderStyle = "solid";
toggleVis.onclick=function(){
       if (vistog == 0)
       {
           var tog = document.getElementById("toggleViseye");
       toggleVis.style.color=gray;
       vistog = 1;
       }
       else
       {
                      var tog = document.getElementById("toggleViseye");
       toggleVis.style.color=lightWhite;
           vistog = 0;

   }}
document.body.appendChild(toggleVis);
var toggleViseye = document.createElement("div");
    toggleViseye.style.position = "absolute";
    toggleViseye.style.left="4px"
    toggleViseye.style.cursor = "default";
    toggleViseye.style.bottom="-4px";
    toggleViseye.color="white";
    toggleViseye.id = "toggleViseye";
    toggleViseye.innerText="👁";
    toggleVis.appendChild(toggleViseye);

    var loadingBox = document.createElement("div");
    loadingBox.style.width="max-content";
loadingBox.style.position = "fixed";
loadingBox.style.top="40%";
loadingBox.style.padding="10px";
loadingBox.style.fontWeight="bold";
loadingBox.style.fontSize="15px";
loadingBox.style.color = lightWhite;
loadingBox.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903";
loadingBox.style.right="50%";
loadingBox.style.borderRadius="5px";
loadingBox.style.zIndex="2050";
loadingBox.style.height="min-content";
loadingBox.innerText="";
loadingBox.style.textAlign="center";
document.body.appendChild(loadingBox);

    var QTasks = document.createElement("div");

QTasks.style.width="max-content";
QTasks.style.position = "fixed";
QTasks.style.bottom="1px";
QTasks.style.padding="1px";
QTasks.style.fontWeight="bold";
QTasks.style.fontSize="15px";
QTasks.style.color = lightWhite;
QTasks.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
QTasks.style.left="1px";
QTasks.style.backgroundColor = cb_Skyblue;
QTasks.style.borderRadius="5px";
QTasks.style.zIndex="2050";
QTasks.style.height="min-content";
QTasks.innerText="QTotal: ";
QTasks.style.textAlign="center";
QTasks.style.borderWidth="thin";
QTasks.style.borderStyle = "solid";
document.body.appendChild(QTasks);


    var tasknoteBox = document.createElement("div");
    tasknoteBox.style.padding = "10px";
    tasknoteBox.id="tasknotes";
    tasknoteBox.style.width="max-content";
    tasknoteBox.style.position = "fixed";
        tasknoteBox.style.top="50%";
    tasknoteBox.style.right="10px";
    tasknoteBox.style.fontWeight="bold";
    tasknoteBox.style.fontSize="14px";
    tasknoteBox.style.color =lightWhite;
tasknoteBox.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
    tasknoteBox.style.backgroundColor = cb_Skyblue;
    tasknoteBox.style.borderRadius="5px";
    tasknoteBox.style.zIndex="2050";
    tasknoteBox.style.textDecoration="underline";
    tasknoteBox.style.height="min-content";
    tasknoteBox.innerText="";
    tasknoteBox.style.textAlign="center";

   tasknoteBox.onclick = function(){
   tasknoteBox.innerText="";


    }
    tasknoteBox.style.borderWidth="thin";
    tasknoteBox.style.borderStyle = "solid";
    document.body.appendChild(tasknoteBox);
     var clearFilter = document.getElementById("clearFilter");
     var auditInputBox = document.createElement("div");
    auditInputBox.id = "auditInputBox";
    var auditUUID = document.createElement("div");
    auditUUID.value="";

            var blurblist = document.createElement('div');

    blurblist.id = 'blurbBtn';

    blurblist.style.height ="27px";
      blurblist.style.position="absolute";
      blurblist.style.top="5px";
    blurblist.style.width ="250px";
    blurblist.value = 'Blurbs';
    blurblist.style.gridColumn="1/ span 3";
    blurblist.onclick = function(){event.stopPropagation();}
            blurblist.onchange=function(){
            event.stopPropagation();

          var checkblurbset = $("#Blurbs").val()

            if (blurbset[checkblurbset] && checkblurbset != "Save New Blurb" && checkblurbset != "Clear User Blurbset")
            {


                auditInput.value = blurbset[checkblurbset];
            }
                            if (userBlurbs[checkblurbset])
            {


                auditInput.value = userBlurbs[checkblurbset];
            }
                if (checkblurbset == "Save New Blurb" && auditInput.value != "")
{
    burbAddedMSG();
    var newBlurb = auditInput.value
    newBlurb = newBlurb.replace(/\r/gm,'\n');
    var newBlurbKey = newBlurb.substr(0,60)
    userBlurbs[newBlurbKey]=newBlurb
    GM_setValue("userBlurbs",JSON.stringify(userBlurbs))
        removeOptions(document.getElementById('Blurbs'));
    addBlurbs()

 }
                 if (checkblurbset == "Clear User Blurbset")
{
                clearUserBlurbs()
        }
            }


    var blurblist2 = document.createElement('button');
    blurblist2.id = "blurbList";


    var select = document.createElement("select");

    select.name = "Blurbs";
    select.id = "Blurbs"
var defaultblurb = document.createElement("option");
    defaultblurb.setAttribute("selected","selected");
    defaultblurb.value="";
    select.appendChild(defaultblurb);

    var label = document.createElement("label");
    label.innerHTML = "Blurbs: "
    label.htmlFor = "Blurbs";
  blurblist.appendChild(label).appendChild(select);

    auditInputBox.style.gridTemplateColumns="auto auto auto";
    auditInputBox.style.display="none";
    auditInputBox.style.left="10px"
    document.body.appendChild(auditInputBox);

    auditInputBox.appendChild(auditUUID);
    var auditInput2 = document.createElement("div");
    auditInputBox.style.fontWeight="bold";
    auditInput2.style.cursor="no-drop"
    auditInput2.style.color=black;
    auditInput2.style.gridColumn="1 / span 3";
    auditInput2.style.marginTop="45px";
    auditInput2.style.marginBottom="15px";
    auditInput2.style.paddingTop="5px";
    auditInput2.style.textAlign="center";
    auditInput2.style.width ="auto";
     auditInput2.style.borderStyle ="Solid";
    auditInput2.style.borderwidth ="2px";
    auditInput2.style.height ="40px";
    auditInput2.innerText="";
    auditInput2.onclick=function(){
        if (auditInput2.innerText)
{
       document.getElementById("Blurbs").selectedIndex = 0;
auditInput2.innerText=""
auditInput3.style.display="none";
auditimg.src="";
auditInput3.value=""
auditUUID.value="";
auditInputBox.style.display="none";
auditimg.style.display="none";
auditInput.value="";
}
    }
   var auditInput3 = document.createElement("div");
    auditInput3.style.fontWeight="bold";
    auditInput3.style.display="none";
    auditInput3.id = "auditInput3";
    auditInput3.style.fontSize="12px";
    auditInput3.style.color=black;
    auditInput3.style.paddingTop="5px";
    auditInput3.style.textAlign="center";
    auditInput3.style.width ="500px";
    auditInput3.style.height ="30px";
    auditInputBox.style.backgroundColor = cb_Skyblue;
    auditInputBox.style.borderRadius="5px";
    auditInputBox.style.position = "fixed";
    auditInputBox.style.paddingRight = "5px";
    auditInputBox.style.color=black;
    auditInputBox.style.borderColor= black;
    auditInputBox.style.padding = "5px";
    auditInputBox.style.marginLeft = "405px";
    auditInputBox.style.width="510px";
    auditInputBox.style.gap="5px";
    auditInputBox.style.borderWidth="thin";
    auditInputBox.style.height="max-content";
    auditInputBox.style.bottom="10px"
    auditInputBox.style.zIndex="2050";
    auditInput3.innerText="";
    var auditInput = document.createElement("textarea");
    var auditimg =  document.createElement('img');
    auditInput.onclick= function(){
        event.stopPropagation();
        var ai = document.getElementById("audinput");
         setTimeout(function () {
     ai.focus();
    }, 200);
    }
    auditInput.id="audinput";
    auditInput.style.overflow="hidden";
    auditInput.style.gridColumn="1 / span 3";
    auditimg.id="audimg";
    auditimg.setAttribute("src","");
    auditimg.style.position="absolute";
    auditimg.style.left="0";
    auditimg.style.top="5vh";
    document.body.appendChild(auditimg);

    auditInput.style.width ="500px";
    auditInput.style.height ="30px";
    auditInput.value="";
    auditInput.placeholder="Site Message";
    var audimg=document.getElementById("audimg");

    auditInputBox.appendChild(blurblist);
    auditInputBox.appendChild(auditInput2);
    auditInputBox.appendChild(auditInput);

    var auditbutton = document.createElement('input');
    auditbutton.type = 'button';
    auditbutton.id = 'auditBtn';
    auditbutton.style.gridColumn="1 / span 3";
    auditbutton.style.height ="30px";
    auditbutton.style.width ="500px";
    auditbutton.value = 'Submit';
    auditbutton.style.padding = "5px";
    auditbutton.onclick =function(){
          if(auditInput.value)
          {
              var site = auditInput2.textContent;
              site = site.substring(0,4);
              var sitemsg = auditInput.value;
              console.log(site+" "+ sitemsg);
              sendMsg(site, sitemsg);

          }
    };

    auditInputBox.appendChild(auditbutton);

    document.getElementById("auditInputBox").addEventListener("keyup", function(event) {

    if (event.keyCode == 13 && !event.shiftKey) {
                 if(auditInput.value)
          {
              var site = auditInput2.textContent.split('-');
              var sitemsg = auditInput.value;
              console.log(site+" "+ sitemsg);
              sendMsg(site[0], sitemsg);

          }
    }
                if (event.keyCode === 27) {
closeSiteMsg();

        }
});
let textarea = document.getElementById("audinput");

textarea.addEventListener("input", () => {
  textarea.style.height = calcHeight(textarea.value) + "px";

});
textarea.addEventListener('focus', (event) => {
    const end = textarea.value.length;

// ✅ Move focus to END of input field
textarea.setSelectionRange(end, end);

textarea.style.height = calcHeight(textarea.value) + "px";
    textarea.focus();
});

    auditInput.addEventListener('paste', function (evt) {
    // Get the data of clipboard

    const clipboardItems = evt.clipboardData.items;
    const items = [].slice.call(clipboardItems).filter(function (item) {
        // Filter the image items only
        return item.type.indexOf('image') !== -1;
    });
    if (items.length === 0) {
        return;
    }


    const item = items[0];
    // Get the blob of image
    const blob = item.getAsFile();

var fr = new FileReader;

fr.onloadend = function(){


    auditimg.setAttribute("src",fr.result)


     // fr.result is all data
};
fr.readAsDataURL(blob)
//auditimg.setAttribute("src",fr.readAsDataURL(blob));
});

     auditInput2.addEventListener('paste', function (evt) {
    // Get the data of clipboard
    const clipboardItems = evt.clipboardData.items;
    const items = [].slice.call(clipboardItems).filter(function (item) {
        // Filter the image items only
        return item.type.indexOf('image') !== -1;
    });
    if (items.length === 0) {
        return;
    }


    const item = items[0];
    // Get the blob of image
    const blob = item.getAsFile();

var fr = new FileReader;

fr.onloadend = function(){
    auditimg.setAttribute("src",fr.result)
};
fr.readAsDataURL(blob)
});

if (site.includes("https://na.coworkassignment.science.last-mile.a2z.com/")|| site.includes("https://na.beta.coworkassignment.science.last-mile.a2z.com/"))
{

    var userInputBox = document.createElement("div");
    userInputBox.id = "userInputBox";
    userInputBox.style.position = "fixed";
    userInputBox.style.padding = "4px";
    userInputBox.style.gap="4px";
    userInputBox.style.bottom="10px"
    userInputBox.style.zIndex="1050";
    userInputBox.style.left="80px"
    userInputBox.style.display="flex";
    document.body.appendChild(userInputBox);
    var userbutton1 = document.createElement('input');
    userbutton1.style.fontWeight="500";
    userbutton1.type = 'button';
    userbutton1.id = 'clearfilt';
    userbutton1.value = 'Clear Q-Filters';


 var ratDLbox = document.createElement("div");
    ratDLbox.style.right="380px";
    ratDLbox.style.top="0px";
     ratDLbox.style.display ="none";
    ratDLbox.style.fontSize = "14px"
    ratDLbox.style.textShadow="2px 1px 2px #000903"
    ratDLbox.style.color = lightWhite;
    ratDLbox.style.position="absolute";
    ratDLbox.style.zIndex="5500";
    ratDLbox.innerText="Auto-Disable Q-Refresh";

document.body.appendChild(ratDLbox);

     var colorSelect = document.createElement("div");
    colorSelect.style.right="550px";
    colorSelect.style.top="0px";
    colorSelect.style.fontSize = "14px"
    colorSelect.style.textShadow="2px 1px 2px #000903"
    colorSelect.style.color = lightWhite;
    colorSelect.style.position="absolute";
    colorSelect.style.zIndex="5500";
    colorSelect.innerText="My Task Border: ";

document.body.appendChild(colorSelect);
    var colorSel = document.createElement("input");
    colorSel.setAttribute("type","color");
    colorSel.id="colorSel";
    colorSel.style.zIndex="5500";
    colorSelect.appendChild(colorSel);
    var colorSelSaved = GM_getValue("colorSel")
    if (colorSel){colorSel.value = colorSelSaved}

  var ratDL = document.createElement("input");
    ratDL.setAttribute("type","checkbox");
    ratDL.id="ratDL";
    ratDL.style.width="15px";
    ratDL.style.height="15px";
    ratDL.style.zIndex="5500";
    ratDLbox.appendChild(ratDL);
    ratDL.onclick=function(){
       if (this.checked)
       {
           GM_setValue("cb","checked");
           thism.click();
       }
       else
       {
           GM_setValue("cb","unchecked");
           thism.click();
       }
   }

    var vert = document.createElement("div");


                vert.id="vert"

vert.style.textShadow="2px 1px 2px #000903"
vert.style.textAlign="center";
vert.style.position="absolute";
vert.style.color = lightWhite;
vert.style.zIndex="5500";
vert.style.width="20px";
vert.style.height="40px";
vert.style.right="300px";
vert.style.top="0";
vert.style.cursor="pointer";
vert.style.fontSize = "20px"
vert.innerText = "TaskUI⬈";
vert.onclick=function(){
    if (vt == 0)
    {

        var myDiv = document.getElementById("task-monitor");

        //fbox.style.flexDirection="column-reverse";
        GM_setValue("vt","1")
    vt = 1


myDiv.style.inset=""
myDiv.style.width = "250px";
myDiv.style.top="";
myDiv.style.bottom="50px";
playerPeccy.style.right="250px";
playerPeccy.id="250";
myDiv.style.right="40px";
        vert.innerText = "TaskUI⬋";
        create();
    }
    else
    {
        var tNotes = document.getElementById("tasknotes");
        fbox.style.inset=""
        //fbox.style.flexDirection="row-reverse";
        playerPeccy.style.right="140px";
        playerPeccy.id="140";
        GM_setValue("vt","0")
    vt = 0
    fbox.style.bottom="3px";
fbox.style.right="200px";
fbox.style.width = "50vw";
        vert.innerText = "TaskUI⬈";

    }
}
    document.body.appendChild(vert);
    var Message = document.createElement("div");


                Message.id="Message"

Message.style.textShadow="2px 1px 2px #000903"
Message.style.textAlign="center";
Message.style.position="absolute";
Message.style.color = "#bd2ffa";
Message.style.zIndex="5000";
Message.style.width="20px";
Message.style.height="30px";
Message.style.left="-20px";
Message.style.top="-5px";
Message.style.fontSize = "18px"
Message.innerText = "🗨️"
Message.onclick=function(){
event.stopPropagation();
if (auditInput2.innerText)
{
  auditInput2.innerText=""
  auditInput3.style.display="none";
            auditimg.src="";
            auditInput3.value=""
            auditUUID.value="";
            auditInputBox.style.display="none";
          auditimg.style.display="none";
          auditInput.value="";

}
   else
   {
if(userInput.value)
{
   auditInputBox.style.display="grid";
   auditimg.style.display="block";
   auditInput2.innerText=userInput.value+"- Site Message";
   userInput.value="";
   auditInput.focus();
   }else
   {
    Message.setAttribute("data-toggle", "popover");
    Message.setAttribute("data-placement", "left");
    Message.setAttribute("data-trigger", "manual");
    Message.setAttribute("data-content", "Type in A Site Name.");
    $(Message).popover();
    $(Message).popover('show');
    setTimeout(function () {
     $(Message).popover('hide');

    }, 2000);
   }}
}
    userInputBox.appendChild(Message);
    userbutton1.onclick = function(){ clearFilter.click(); }
    userInputBox.appendChild(userbutton1);
    var userInput = document.createElement("input");
    userInput.setAttribute("type", "text");
    userInput.value="";
    userInputBox.appendChild(userInput);
        var userbutton = document.createElement('input');
    userbutton.type = 'button';
    userbutton.id = 'userBtn';
    userbutton.value = 'Submit';
    userbutton.style.fontWeight="500";
      userbutton.onclick = function(){
          if(userInput.value)
          {
             var uiv = userInput.value.toUpperCase();

              if (uiv.length == 4 || uiv == "TESTING" || uiv.includes("POD"))
              {
                  //var num = /\d/;
                  if (uiv.includes("0")  ||  uiv.includes("1")  ||  uiv.includes("2")  ||  uiv.includes("3")  ||  uiv.includes("4")  ||  uiv.includes("5")  ||  uiv.includes("6")  ||  uiv.includes("7")  ||  uiv.includes("8")  ||  uiv.includes("9"))
             {
              auditInput.focus();
   auditInputBox.style.display="grid";
   auditimg.style.display="block";
   auditInput2.innerText=userInput.value.toUpperCase()+"- Site Message";
   userInput.value="";
              } else{
          var newuser = userInput.value
          newuser = newuser.toLowerCase();
    users.push(newuser);

          userInput.value="";
             createUser(users.length-1);
              GM_setValue("users",users);
          }}
              else{
          var newuser = userInput.value
          newuser = newuser.toLowerCase();
    users.push(newuser);

          userInput.value="";
              createUser(users.length-1);
              GM_setValue("users",users);
          }}
    };

    var userbutton2 = document.createElement('input');
    userbutton2.type = 'button';
    userbutton2.id = 'userBtn2';
    userbutton2.style.fontWeight="500";
    userbutton2.value = 'Clear';

      userbutton2.onclick = function(){

          users=[user];

          GM_setValue("users",users);
          const myNode = document.getElementById("userList");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }
          userlist.innerText = "TaskUI User-list: ";
          createUser(0);


    };
                var userlist = document.createElement('div');
    userlist.style.display = "grid";

    userlist.style.fontSize = "12px";
    userlist.innerText = "TaskUI User-list: ";
    userlist.style.gap = "7px";
    userlist.style.left = "10px";
    userlist.style.top = "0px";
    userlist.style.gridTemplateColumns="auto auto auto auto auto auto auto auto auto auto auto auto auto auto auto";
    userlist.style.textAlign = "center";
    userlist.style.color = lightWhite;
    userlist.id = 'userList';
    userlist.style.position = "fixed";
    document.body.appendChild(userlist);

    for (var u in users)
    {
    createUser(u);
    }
    userInputBox.appendChild(userbutton);
    userInputBox.appendChild(userbutton2);
    document.getElementById("userInputBox").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
                 if(userInput.value)
          {
                  if (userInput.value.includes("peccyspackagepickup"))
                                               {if (GM_getValue("peccyPower") != true)
                                               {GM_setValue("peccyPower",true)}else{GM_setValue("peccyPower",false)}}
              var uiv = userInput.value.toUpperCase();
              if (uiv.length == 4 || uiv == "TESTING" || uiv.includes("POD"))
              {
   if (uiv.includes("0")  ||  uiv.includes("1")  ||  uiv.includes("2")  ||  uiv.includes("3")  ||  uiv.includes("4")  ||  uiv.includes("5")  ||  uiv.includes("6")  ||  uiv.includes("7")  ||  uiv.includes("8")  ||  uiv.includes("9")|| uiv == "TESTING" || uiv.includes("POD"))
   {
   auditInput.focus();
   auditInputBox.style.display="grid";
   auditimg.style.display="block";
   auditInput2.innerText=userInput.value.toUpperCase()+"- Site Message";
   userInput.value="";
              } else{

          var newuser = userInput.value
          newuser = newuser.toLowerCase();
                  users.push(newuser);
          userInput.value="";
          createUser(users.length-1);
          GM_setValue("users",users);


          }}
              else{
          var newuser = userInput.value
          newuser = newuser.toLowerCase();
          users.push(newuser);

          userInput.value="";
          createUser(users.length-1);
          GM_setValue("users",users);
              }}
    }
});
}



var fbox = document.createElement("div");
fbox.id="task-monitor"
fbox.style.display="flex";
fbox.style.alignItems="flex-end";
fbox.style.direction="rtl";
fbox.style.position="fixed";
fbox.style.flexDirection="row-reverse";
fbox.style.zIndex="1050";
fbox.style.bottom="3px";
fbox.style.right="200px";
fbox.style.borderColor="transparent"
fbox.style.width = "50vw";
fbox.style.height = "min-content";
fbox.style.cursor="default";
document.body.appendChild(fbox);
document.body.style.overflow = "hidden";

fbox.style.borderWidth="thin";
fbox.style.borderStyle = "dashed";


  var taskContainer = document.createElement("div");
  taskContainer.style.borderRadius = "10px";
  taskContainer.style.flexWrap="wrap-reverse"
  taskContainer.style.width = "50vw";
  taskContainer.style.height = "min-content"
  taskContainer.style.whiteSpace= "nowrap"
  taskContainer.style.display = "flex";
  taskContainer.style.gap = "2px";

  fbox.appendChild(taskContainer);


}
GM_addValueChangeListener("Audits", function(){audits=arguments[2]; });
const data = document.getElementById("data");
const newdata = document.getElementById("newdata");
const auditdata = document.getElementById("auditdata");
const auditImg= document.getElementById("audit-img");
if (site.includes("172") || site.includes("localhost") || site.includes("192"))
{
var auditchecks = document.getElementById("audits");

backendPull();
setTimeout(function(){if(document.getElementById("data").value == "" && onReload == false){GM_setValue("data",false)}},10000)
}

if (site.includes("https://na.coworkassignment.science.last-mile.a2z.com/Scheduling/Workstation"))
{

dataToggle = true;

dataHandler();
    setInterval(addQbarFuncs,1000);

}

async function recycleHandler(){
    if (dataToggle == true)
    {
        recycleCounter++;
    var now = new Date();
  var hour = now.getHours();
  var day = now.getDay();
  var minutes = now.getMinutes();

  if(hour <= 14 && recycleCounter >= 120)
  {

recycleCounter = 0;
    var recSites = []
    var d1 = new Date(Date.now()).toLocaleString().split(',')[0]
    d1 = d1.split("/");
    for(var j in d1)
    {

        if (d1[j].length<2)
        {d1[j]="0"+d1[j]}
    }
    var d3= d1[2]+"-"+d1[0]+"-"+d1[1]
    var results=[]

            var recycleData = await getQueueRecycleData();
   var obj = recycleData.response;
    var objData = obj.data;
              for( var i = 0; i < objData.length; i++) {
                 var checkData=objData[i];
                  var stat = checkData.Station;
                  var checkRec = checkData["Task Input Notes"]
                  var checkRecycles = checkRec["Recycle Active"]
                  var d2 = checkData["Creation Time"];
                  d2= d2.substring(0,10);

                   if (checkRecycles=="YES" && d3==d2 && checkData["Cycle"].includes("CYCLE"))
                   {

                       recSites.push(checkData.Station);

                      }
              }
          }

  GM_setValue("recycleSites", JSON.stringify(recSites));


   }
}

async function dataHandler(){
    if (dataToggle == true){
        recycleHandler();
     var recycledSites = GM_getValue("recycleSites");
    if (recycledSites)
    {
       recList = JSON.parse(recycledSites);
    }

    var queueData = await getQueueData()
    var obj = queueData.response;

    queueData = JSON.stringify(obj);
GM_setValue("data",queueData);
create()
     setTimeout(function () {
dataHandler();
          }, 10000);
}
}

function getQueueRecycleData() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://na.coworkassignment.science.last-mile.a2z.com/TasksDataHandler?Completion+Time%5Bfrom%5D=&Completion+Time%5Bto%5D=&Created+By=&Creation+Time%5Bfrom%5D=&Creation+Time%5Bto%5D=&Grabbed+Time%5Bfrom%5D=&Grabbed+Time%5Bto%5D=&pageIndex=1&pageSize=1000",
            responseType: "json",
            onload: (resOBJ) => {
                resolve(resOBJ)
                console.log(resOBJ.data);
            },
            onabort: httprequestError,
            onerror: httprequestError,
            ontimeout: httprequestError
        });
    })
}


function postData(data)
{
var test = {"test":"test"}
    console.log(JSON.stringify(test));
GM_xmlhttpRequest({
				method: "POST",
				url: devDesk+'send',
				data:JSON.stringify(test),
				responseType: "json",
				headers:    {
					"Content-Type": "application/json"
				},
				onload: (resOBJ) => {

                    console.log('load');
				},
				onabort: () => {},
				onerror: () => {},
				ontimeout: () => {},
			});
}

function getQueueData() {

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: devDesk+"taskui",
            responseType: "json",
            onload: (resOBJ) => {
               var now = new Date(Date.now()).toLocaleString().split(',')[0]
                resolve(resOBJ)
            },
            onabort: httprequestError,
            onerror: httprequestError,
            ontimeout: httprequestError
        });
    })
}

function toFindDuplicates(arry) {
    var theDUPES = [];
    const uniqueElements = new Set(arry);
    const filteredElements = arry.filter(item => {
        if (uniqueElements.has(item)) {
            uniqueElements.delete(item);
        } else {
            return item;
        }
    });

    return [...new Set(uniqueElements)]
}

function getPrefData(URL) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: URL,
            responseType: "json",
            onload: (resOBJ) => {
                resolve(resOBJ)
            },
            onabort: httprequestError,
            onerror: httprequestError,
            ontimeout: httprequestError
        });
    })
}

    function httprequestError(rspObj)
    {
console.log(rspObj)
    }

function auditcheck()
{

    GM_setValue("Audits",auditchecks.value);

}

function create() {
updateBanner();
activeTasks = [];
    vt = GM_getValue("vt");
                             if (colorSel.value !== "#000000")
                         {GM_setValue("colorSel",colorSel.value)}

tasks = GM_getValue("tasks");

    var connectTime = GM_getValue("backcheck");

         try {

            var e = GM_getValue("data");
var rL = GM_getValue("c1r");
var checkPullTime = new Date();
             var fullData= JSON.parse(e);

             var words = fullData.data;






            if(fullData.c1Recycles)
            { recList=fullData.c1Recycles;


         }


     removeAllChildNodes(taskContainer);
             for( var i = 0; i < words.length; i++) {
                              var gb = words[i]
var showDwelling = 0;

                 var taskData=words[i];
                 var tUUID = gb["UUID"]
                 var tSTAT = gb["Station"]
                 var tCYCLE = gb["Cycle"]
                 var tUSER = gb["Grabbed By"]

              tUUID= tUUID.slice(tUUID.length-4,tUUID.length)
              activeTasks.push(tUUID+"|"+tSTAT+" : "+tCYCLE+"\nGrabbed By: "+tUSER)
                 var checkID = taskData.UUID
if (taskData["DWP Files URL"] != null && users.indexOf("dwelling") !== -1 && taskData.RoutePlans.RoutePlanInProgress == false)
                {

                 var DPOcomplete = taskData["DWP Files Time"]
                 var dwellCheck =60-(timeDiffCalc(new Date(DPOcomplete), new Date()))
                 if (dwellCheck > 4)
                 {
                 showDwelling = 1;
                }
                                     if (dwellCheck > 9)
                 {
                 var dwellTaskData = taskData.Station+"-"+taskData.Cycle+"-"+taskData["Grabbed By"]
var dwellTaskMsg = taskData.Station+" - "+taskData.Cycle+" - "+taskData["Grabbed By"]+" - "+dwellCheck+" mins";
                                          if (dwellingTasks[dwellTaskData] == "" || dwellingTasks[dwellTaskData] == undefined || dwellingTasks[dwellTaskData] == null)
                     {
                         if (taskUIusers.indexOf(taskData["Grabbed By"]) !== -1)
                             {
                                                  dwellingTasks[dwellTaskData] = dwellCheck;
                                 dwellTaskMsg = dwellTaskMsg + " TaskUI User"
                         sendMsg("DWELLING", dwellTaskMsg);
                             }
                         else
                         {
                     dwellingTasks[dwellTaskData] = dwellCheck;
                         sendMsg("DWELLING", dwellTaskMsg);
                         }
                     }
                     if (dwellingTasks[dwellTaskData] < dwellCheck)
                     {
                                                  if (taskUIusers.indexOf(taskData["Grabbed By"]) !== -1)
                             {
                                                  dwellingTasks[dwellTaskData] = dwellCheck;
                                 dwellTaskMsg = dwellTaskMsg + " TaskUI User"
                         sendMsg("DWELLING", dwellTaskMsg);
                             }
                         else
                     dwellingTasks[dwellTaskData] = dwellCheck;
                         sendMsg("DWELLING", dwellTaskMsg);
                     }



                }
             }
                 QTasks.innerText="QTotal: "+(words.length);
                 if (vistog == 0)
                 {

                 if (users.indexOf(gb["Grabbed By"]) !== -1 || users.indexOf("*") !== -1 || showDwelling == 1)
                 {



                      var today2 = new Date();
    var numOfHours = 6; // 5 or 6
    var utc = new Date();
    utc.setTime(utc.getTime() + numOfHours * 60 * 60 * 1000);
                   var cdt = utc.toLocaleString('en-US', {
    hour12: false,
  })

                      var created = taskData["Creation Time"]

                      created = created.toLocaleString('en-US', {
    hour12: false,
  })

                     var rpcheck = timeDiffCalc(new Date(cdt),new Date(created));


                 let j = (i+1);

 var task = "task"+j;
if (replancheck.indexOf(taskData.Station+"-"+taskData.Cycle) === -1)
{
    Prefs(taskData.Station,taskData.Cycle);
replancheck.push(taskData.Station+"-"+taskData.Cycle);
GM_setValue("replancheck",replancheck);}
                var taskDiv = document.createElement("div");

                taskDiv.style.fontWeight="Bold";
                    taskDiv.style.fontSize = ".8em";
                     taskDiv.style.color =lightWhite;

                taskDiv.style.position="relative";
                taskDiv.style.paddingLeft="55px";
                taskDiv.style.paddingRight="27px";
                      taskDiv.style.color =lightWhite;
taskDiv.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
                taskDiv.style.textAlign = "right";
                taskDiv.style.borderColor= black;
                     taskDiv.style.borderWidth="thin";
                taskDiv.style.borderStyle = "solid";
                taskDiv.style.cursor="default";
                taskDiv.style.borderRadius = "8px";
                taskDiv.style.backgroundColor=cb_Skyblue
                     taskDiv.className=taskData.UUID;
                                     taskDiv.id=taskData.Station+"-"+taskData.Cycle;
                taskDiv.style.zIndex="1000";
                     if (taskData.RoutePlans)
                     {
                         if (taskData.RoutePlans.TotalClusterVolume)
                         {
                          taskDiv.setAttribute("data-toggle", "popover");
   if (vt == 0 ){ taskDiv.setAttribute("data-placement", "top");}else { taskDiv.setAttribute("data-placement", "top");}
    taskDiv.setAttribute("data-trigger", "manual");
                         if (taskData["Processed Volume"] > 0)
                         {
    taskDiv.setAttribute("data-content", "Routed Vol. : "+taskData.RoutePlans.TotalClusterVolume+"   |   Processed TBA's : "+taskData["Processed Volume"]);
                         }
                         else
                         {
                             taskDiv.setAttribute("data-content", "Routed Vol. : "+taskData.RoutePlans.TotalClusterVolume);
                         }
                      $(taskDiv).popover();

                     taskDiv.onmouseover = function(){
    $(this).popover('show');
                     }
                     }
                     }
                     taskDiv.innerText=taskData.Station+"\n"+taskData.Cycle+"\n"+taskData["Grabbed By"];


                taskDiv.onclick=function(){
 event.stopPropagation();
  var key = this;
                    var prefs= this.id.split('-');
                        key=key.id.replace("-","/")
                    var keyURL = prefURL+key;

     window.open(
              keyURL, "_blank");
                }

                 if (taskData.RoutePlans){
                 var complete = taskData.RoutePlans.RoutePlanCompletedAt


                     if (taskData.RoutePlans.RoutePlanCreatedAt == null){

                 var dpocheck = timeDiffCalc(today2, new Date(complete));

                     if (dpocheck > 1) // DPO SLA
                     {


                         taskDiv.style.backgroundColor=cb_Yellow;
                     }
                         else
                         {taskDiv.style.backgroundColor=cb_Green;}
                 }
                     if(taskData.RoutePlans.ReplanCreatedAt)
                     {
                 if(taskData.RoutePlans.ReplanCreatedAt != "" && taskData.RoutePlans.RoutePlanInProgress == true)
                      {
                         taskDiv.style.backgroundColor=cb_Skyblue;}
                 }
                 if(taskData.RoutePlans.ReplanCreatedAt != "" && taskData.RoutePlans.RoutePlanInProgress ==false)
                      {
                         taskDiv.style.backgroundColor=cb_Green;}

                 if (taskData.RoutePlans.RoutePlanCreatedAt !== null && taskData.RoutePlans.RoutePlanInProgress ==true){taskDiv.style.backgroundColor=cb_Purple;}
                 }


                if (complete != "" && taskData["DWP Files URL"] != null)
                {

                 var DPOcomplete = taskData["DWP Files Time"]
                 var dwellCheck =60-(timeDiffCalc(new Date(DPOcomplete), new Date()))

                                                                          var dwellTime = document.createElement("div");

 dwellTime.innerText = dwellCheck;
 dwellTime.style.fontSize = "14px"
 dwellTime.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
 dwellTime.style.textAlign="center";
 dwellTime.style.position="absolute";
 dwellTime.style.color = lightWhite;
 dwellTime.style.zIndex="5500";
 dwellTime.style.width="20px";
 dwellTime.style.height="25px";
 dwellTime.style.left="-2px";
 dwellTime.style.top="0px";
                         taskDiv.appendChild(dwellTime);
                    if (dwellCheck >= 5)
                    {
                        taskDiv.style.backgroundColor = cb_Red;
                        taskDiv.style.borderColor=cb_Skyblue;
                    }

                    }
                     if(taskData["Processed TBA File"])
                         {
                       if(taskData.RoutePlans){
if(taskData.RoutePlans.RoutePlanInProgress==false && taskData.RoutePlans.TotalClusterVolume)
{
   var tbaVol = taskData["Processed Volume"]*.1;
    if(taskData.RoutePlans.TotalClusterVolume < (taskData["Processed Volume"]-tbaVol) ||taskData.RoutePlans.TotalClusterVolume > (taskData["Processed Volume"]+tbaVol))
    {taskDiv.style.backgroundColor=cb_Yellow
                           taskDiv.style.borderWidth="thin";
                        taskDiv.style.borderColor=black;
    }}}


                                  var TBAfile = document.createElement("div");
                          let TBAS = JSON.parse(taskData["Processed TBA File"])
 TBAfile.innerText = "📂"
 TBAfile.id=Object.values(TBAS)[0];
 TBAfile.style.fontSize = "14px"
 TBAfile.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
 TBAfile.style.textAlign="center";
 TBAfile.style.position="absolute";
 TBAfile.style.color = "#C7BF71";
 TBAfile.style.zIndex="5500";
 TBAfile.style.width="20px";
 TBAfile.style.height="25px";
 TBAfile.style.left="36px";
 TBAfile.style.top="-4px";
                             TBAfile.onmouseenter = function () {this.style.fontSize="15px";}
TBAfile.onmouseleave=function () {this.style.fontSize="14px";}

 TBAfile.onclick=function(){
 event.stopPropagation();

window.open(TBAurl+this.id,"_blank");
 }
 taskDiv.appendChild(TBAfile);




                     }
                                           if (user == taskData["Grabbed By"])
                     {
                         taskDiv.style.borderWidth="thick";
                         taskDiv.style.borderColor=colorSel.value;
                     }

                        if(typeof(taskDiv)!=undefined)
                        {
                taskContainer.appendChild(taskDiv);
                        }
                     var taskinfo = document.createElement("div");
                     taskinfo.setAttribute("class","fa fa-info-circle");
                                             taskinfo.onmouseenter = function () {this.style.fontSize="15px";}
taskinfo.onmouseleave=function () {this.style.fontSize="14px";}
                     taskinfo.style.fontSize = "14px";
                                     taskinfo.style.position="absolute";
taskinfo.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
                taskinfo.style.width="18px";
                taskinfo.style.height="20px";
                taskinfo.style.left="23px";
                taskinfo.style.bottom="0px";
                     taskinfo.style.textAlign="center";
                     var tasknotes =[];
                     Object.entries(taskData["Task Input Notes"]).forEach(([key, value]) => {
    if(value)
    {
    tasknotes.push(key + ' - ' + value); // key - value
    }
})



                     tasknotes = JSON.stringify(tasknotes);
                     taskinfo.id = tasknotes;
                      taskinfo.style.textShadow="1px 1px 3px #000903"
 taskinfo.style.color = lightWhite;


                     taskinfo.onclick=function(){
                         event.stopPropagation();
                                             var key = this.parentElement.id

                         var parseinfo = JSON.parse(this.id);
                       var checkSameTask = tasknoteBox.innerText;
if (checkSameTask.includes(key))
{tasknoteBox.innerText=""
 taskNoteMove();
}
                         else
                         {
                     for(let i = 0; i < parseinfo.length; i++){

if (i==0)
{

tasknoteBox.innerText = key+" : Task Notes\n"+parseinfo[i];
}else {
tasknoteBox.innerText = tasknoteBox.innerText+"\n"+parseinfo[i];
}

                     }
                         }


                     }

                     taskDiv.appendChild(taskinfo);
                    var recycleActive = taskData["Task Input Notes"]
                   var recycleActive2 = recycleActive["Recycle Active"]

                    if(recycleActive2==null) {recycleActive2="NO";}
                if (taskData["DWP Files URL"] != null)
                {
                    if (taskData.RoutePlans !=="")
                    {if (taskData.RoutePlansRoutePlanCompletedAt !=="" && taskData.RoutePlans.RoutePlanInProgress ==false)
                    {
                var dpo = document.createElement("div");
                dpo.style.fontSize = "14px";
                dpo.style.textShadow="1px 1px 2px #000903,1px 1px 4px #000903,1px 1px 3px #e0eff2,1px 1px 5px #e0eff2"
                dpo.style.position="absolute";
                dpo.setAttribute("class","fas fa-shipping-fast");
                dpo.style.width="18px";
                dpo.style.height="20px";
                                                dpo.onmouseenter = function () {this.style.fontSize="15px";}
dpo.onmouseleave=function () {this.style.fontSize="14px";}
                dpo.style.left="18px";
                dpo.style.top="4px";
                dpo.style.color = cb_darkGreen;
                dpo.onclick=function(){
                    event.stopPropagation();
                    var key = this.parentElement;
                        key=key.id.split('-');
                    let selected = cycleData.find(e => e.name === key[1]);
                    var todayDate = new Date().toISOString().slice(0, 10);
                var resetURL = dpoURL+key[0]+"/"+selected.id+"/"+todayDate;
                window.open(resetURL);
                }
                taskDiv.appendChild(dpo);}}}
                else
                {

                    var cycle = taskData.Cycle
                    if (cycle.includes("SCRUB")||cycle.includes("DSP")||cycle.includes("ADDONS")||cycle.includes("FLEX")||cycle.includes("NO SHOW")||cycle.includes("4P")|| cycle.includes("CONSTRAINTS"))
                    {}
                    else
                    {
                                            if (taskData.RoutePlans !=="")
                    {if (taskData.RoutePlans.RoutePlanCompletedAt !=="" && taskData.RoutePlans.RoutePlanInProgress ==false)
                    {

                    var dpocheck2 = timeDiffCalc(new Date(), new Date(complete));
                    if (isNaN(dpocheck2)){dpocheck2 = "";}
                    var dpo = document.createElement("div");
                    dpo.style.fontSize = "14px";
                    dpo.style.textShadow="1px 1px 2px #000903,1px 1px 4px #000903,1px 1px 3px #e0eff2,1px 1px 5px #e0eff2"
                    dpo.setAttribute("class","fas fa-shipping-fast");
                    dpo.style.textAlign="center";
                    dpo.style.zIndex="10000";
                    dpo.style.position="absolute";
                        dpo.onmouseenter = function () {this.style.fontSize="15px";}
dpo.onmouseleave=function () {this.style.fontSize="14px";}
                    dpo.style.color = cb_Red;
                    dpo.style.width="18px";
                    dpo.style.height="20px";
                    dpo.style.left="18px";
                    dpo.style.top="4px";
                    dpo.onclick=function(){
                        event.stopPropagation();
                        var key = this.parentElement;
                        key=key.id.split('-');
                        let selected = cycleData.find(e => e.name === key[1]);
                        var todayDate = new Date().toISOString().slice(0, 10);
                    var resetURL = dpoURL+key[0]+"/"+selected.id+"/"+todayDate;
                    window.open(resetURL, "_blank");
                    }
                       if (taskData.RoutePlans.RoutePlanInProgress == false)
                        {if (dpocheck2 > 5)
                        {
                            //dpo.style.left="17px";
                            dpo.innerHTML='<span style="color:white;"> '+dpocheck2+'</span>';}}

            taskDiv.appendChild(dpo);
                    }
                 }}}if (taskData.RoutePlans)
                        {
                 if (taskData.RoutePlans.RoutePlanInProgress == true)
{
    if (cycle.includes("SCRUB")||cycle.includes("DSP")||cycle.includes("ADDONS")||cycle.includes("FLEX")||cycle.includes("NO SHOW")||cycle.includes("4P")|| cycle.includes("CONSTRAINTS"))
                    {}
                    else
                    {
var rp = document.createElement("div");
    rp.setAttribute("class","fas fa-route");
    rp.style.textShadow="1px 1px 2px #000903,1px 1px 4px #000903,1px 1px 3px #e0eff2,1px 1px 5px #e0eff2"
    rp.style.position="absolute";
    rp.style.fontSize = "14px";
    rp.style.color=cb_Green;
    rp.style.width="2px";
    rp.style.height="0";
    rp.style.left="14px";
    rp.style.top="3px";
    rp.onmouseenter = function () {this.style.fontSize="15px";}
    rp.onmouseleave=function () {this.style.fontSize="14px";}
    rp.onclick=function(){
    event.stopPropagation();
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth();
var dt = date.getDate();

if (dt < 10) {
  dt = '0' + dt;
}
if (month < 10) {
  month = '0' + month;
}


                    var key = this.parentElement.id.split('-');
                    let selected = cycleData.find(e => e.name === key[1]);
                    var todayDate = new Date().toLocaleDateString("sv")//new Date().toISOString().slice(0, 10);

                var resetURL = routingURL+key[0]+"/"+selected.id+"/"+todayDate;
                window.open(resetURL, "_blank");
                }
taskDiv.appendChild(rp);}
}
else
{

    var cycle = taskData.Cycle;
  if (cycle.includes("SCRUB")||cycle.includes("DSP")||cycle.includes("ADDONS")||cycle.includes("FLEX")||cycle.includes("NO SHOW")||cycle.includes("4P")|| cycle.includes("CONSTRAINTS"))
                    {}
                    else
                    {

        if(taskData.RoutePlans.ReplanCreatedAt != "" && taskData.RoutePlans.RoutePlanInProgress ==false)
                      {
                         }
        else
        {
    var rp = document.createElement("div");
    rp.style.fontSize = "14px";
    rp.setAttribute("class","fas fa-route");
    rp.style.textShadow="1px 1px 2px #000903,1px 1px 4px #000903,1px 1px 3px #e0eff2,1px 1px 5px #e0eff2"
    rp.style.textAlign="center";
    rp.style.position="absolute";
    rp.style.color = cb_Yellow;
    rp.style.width="2px";
    rp.onmouseenter = function () {this.style.fontSize="15px";}
    rp.onmouseleave=function () {this.style.fontSize="14px";}
    rp.style.height="12px";
    rp.style.left="14px";
    rp.style.top="3px";
                                    if (rpcheck > 0) // DPO SLA
                     {

 rp.style.left="28px";
                     rp.style.color = cb_Yellow;
                        rp.innerText="  "+rpcheck;
                     }
rp.onclick=function(){
    event.stopPropagation();
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth()+1;
var dt = date.getDate();

if (dt < 10) {
  dt = '0' + dt;
}
if (month < 10) {
  month = '0' + month;
}


                    var key = this.parentElement.id.split('-');
                    let selected = cycleData.find(e => e.name === key[1]);
                    var todayDate = new Date().toLocaleDateString("sv")//new Date().toISOString().slice(0, 10);
                    if (key[1].includes("AD") || key[1].includes("RTS"))
                        {

                        }

                var resetURL = routingURL+key[0]+"/"+selected.id+"/"+todayDate;
                window.open(resetURL);
                }
taskDiv.appendChild(rp);
        }
    }
 }}else
        {
    var rp = document.createElement("div");
    rp.style.fontSize = "14px";
    rp.setAttribute("class","fas fa-route");
    rp.style.textShadow="1px 1px 2px #000903,1px 1px 4px #000903,1px 1px 3px #e0eff2,1px 1px 5px #e0eff2"
    rp.style.textAlign="center";
    rp.style.position="absolute";
    rp.style.color = cb_Yellow;
    rp.style.width="2px";
    rp.onmouseenter = function () {this.style.fontSize="15px";}
    rp.onmouseleave=function () {this.style.fontSize="14px";}
    rp.style.height="12px";
    rp.style.left="14px";
    rp.style.top="3px";
                                    if (rpcheck > 2) // DPO SLA
                     {

 rp.style.left="28px";
                     rp.style.color = cb_Yellow;
                        rp.innerText="  "+rpcheck;
                     }
rp.onclick=function(){
    event.stopPropagation();
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth()+1;
var dt = date.getDate();

if (dt < 10) {
  dt = '0' + dt;
}
if (month < 10) {
  month = '0' + month;
}


                    var key = this.parentElement.id.split('-');
                    let selected = cycleData.find(e => e.name === key[1]);
                    var todayDate = new Date().toLocaleDateString("sv")//new Date().toISOString().slice(0, 10);


                var resetURL = routingURL+key[0]+"/"+selected.id+"/"+todayDate;
                window.open(resetURL);
                }
taskDiv.appendChild(rp);
        }
var Audit = document.createElement("div");
var checking = taskData.UUID;
 Audit.style.fontSize = "18px"
 Audit.innerText = "🗨️"
 Audit.id="Audit"
 Audit.style.fontSize = "17px"
 Audit.style.textShadow="2px 1px 2px #000903"
 Audit.style.textAlign="center";
 Audit.style.position="absolute";
 Audit.style.color = lightWhite;
 Audit.className= recycleActive2;
 Audit.style.zIndex="5000";
 Audit.style.width="20px";
 Audit.style.height="25px";
 Audit.style.left="2px";
 Audit.style.bottom="12px";
 Audit.onmouseenter = function () {this.style.fontSize="19px";}
 Audit.onmouseleave=function () {this.style.fontSize="18px";}
 Audit.onclick=function(){
 event.stopPropagation();
     var key = this.parentElement;
     var key2 = key.className;
key=key.id;

if (auditInput2.innerText)
{
    auditInput2.innerText=""
    auditInput3.style.display="none";
    auditimg.src="";
    auditInput3.value=""
    auditUUID.value="";
    auditInputBox.style.display="none";
    auditimg.style.display="none";
    auditInput.value="";
}
     else
     {


     auditInputBox.style.display="grid";
     auditimg.style.display="block";
     auditInput2.innerText=key+"- Site Message";
         if (recycleActive2=="YES")
         {
         auditInput2.className="YES"
         }
         else
         {
              auditInput2.className="NO"
         }
     auditUUID.value=key2;
     }

     auditToggle=1;
                    var ai = document.getElementById("audinput");
                 setTimeout(function () {
     ai.focus();
    }, 200);
 }
 taskDiv.appendChild(Audit);

 var ChimeLogo = document.createElement("img");
 ChimeLogo.style.backgroundColor = "Gray"
 ChimeLogo.style.borderRadius = "50%";
 ChimeLogo.src="https://app.chime.aws/static/icons/favicon-16x16.png";
 ChimeLogo.style.position="absolute";
 ChimeLogo.style.zIndex="5000";
 ChimeLogo.style.width="16px";
 ChimeLogo.style.height="16px";
 ChimeLogo.style.left="2px";
 ChimeLogo.style.bottom="0px";
 ChimeLogo.onmouseenter = function () { this.style.width="18px";
 this.style.height="18px";}
ChimeLogo.onmouseleave=function () { this.style.width="16px";
 this.style.height="16px";}
ChimeLogo.onclick=function(){
event.stopPropagation();
var key = this.parentElement;
key=key.id.split('-')[0];
openChimeRoom(key, true);
                      }
taskDiv.appendChild(ChimeLogo);



if(taskData.Cycle.includes("CYCLE") && taskData.RoutePlansRoutePlanCompletedAt !=="" && taskData.RoutePlans.RoutePlanInProgress ==false)
{
var aaButton = document.createElement("div");
 aaButton.style.fontSize = "14px";
 aaButton.className = taskData.Station+"|"+taskData.Cycle;
 aaButton.id="aaButton";
 aaButton.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
 aaButton.style.textAlign="center";
 aaButton.style.position="absolute";
 aaButton.style.color = lightWhite;
 aaButton.onmouseenter = function () {this.style.fontSize="15px";}
 aaButton.onmouseleave=function () {this.style.fontSize="14px";}
 aaButton.style.zIndex="5000";
 aaButton.style.width="20px";
 aaButton.onclick=function(){
     event.stopPropagation();
     var splitClass = this.className.split("|");
     var c0 = "/e4ee0631-aa79-4fa9-a46d-ce5ced20214a";
     var c1 = "/dfc3989b-67cf-4005-ad2d-4049f56ba9e8";
     var c2 = "/3a7c503c-3ff1-438d-8aaa-2216114cbda4";
     if (splitClass[1].includes("0"))
     {
     window.open("https://na.assignment.planning.last-mile.a2z.com/assignment-planning/"+splitClass[0]+c0,"_blank");
     }
          if (splitClass[1].includes("1"))
     {
     window.open("https://na.assignment.planning.last-mile.a2z.com/assignment-planning/"+splitClass[0]+c1,"_blank");
     }
          if (splitClass[1].includes("2"))
     {
     window.open("https://na.assignment.planning.last-mile.a2z.com/assignment-planning/"+splitClass[0]+c2,"_blank");
     }
 }
 aaButton.style.height="25px";
 aaButton.innerText="AA";
 aaButton.style.color = cb_Yellow;
 aaButton.style.right="87px";
 aaButton.style.top="15px";
taskDiv.appendChild(aaButton);
}
if(taskData.Cycle.includes("SWA") && taskData.RoutePlansRoutePlanCompletedAt !=="" && taskData.RoutePlans.RoutePlanInProgress ==false)
{
var aaButton = document.createElement("div");
 aaButton.style.fontSize = "14px";
 aaButton.className = taskData.Station+"|"+taskData.Cycle;
 aaButton.id="aaButton";
 aaButton.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
 aaButton.style.textAlign="center";
 aaButton.style.position="absolute";
 aaButton.style.color = lightWhite;
 aaButton.onmouseenter = function () {this.style.fontSize="15px";}
 aaButton.onmouseleave=function () {this.style.fontSize="14px";}
 aaButton.style.zIndex="5000";
 aaButton.style.width="20px";
 aaButton.onclick=function(){
     event.stopPropagation();
     var splitClass = this.className.split("|");
     var swa = "/56f965bd-d940-46f4-a475-3b32c972f4ae";
     window.open("https://na.assignment.planning.last-mile.a2z.com/assignment-planning/"+splitClass[0]+swa,"_blank");

 }
 aaButton.style.height="25px";
 aaButton.innerText="AA";
 aaButton.style.color = cb_Yellow;
 aaButton.style.right="87px";
 aaButton.style.top="15px";
taskDiv.appendChild(aaButton);
}



               var RatOpen = document.createElement("div");
 RatOpen.style.fontSize = "16px"
 RatOpen.innerText = "🖰"
 RatOpen.id="RatOpen";

                     if (recycleActive2=="YES")
                     {
                     RatOpen.className="YES";}
                     else
                     {RatOpen.className="NO";}
 RatOpen.style.fontSize = "20px"
 RatOpen.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
 RatOpen.style.textAlign="center";
 RatOpen.style.position="absolute";
 RatOpen.style.color = lightWhite;
 RatOpen.style.zIndex="5000";
 RatOpen.style.width="20px";
 RatOpen.style.height="25px";
 RatOpen.style.right="3px";
 RatOpen.style.bottom="1px";
                     RatOpen.onmouseenter = function () {this.style.fontSize="21px";}
RatOpen.onmouseleave=function () {this.style.fontSize="20px";}

 RatOpen.onclick=function(){
 event.stopPropagation();
     TUIload();
var key = this.parentElement;
     var taskSite = key.id.split('-')[0];
key=key.id.split('-')[1];

var ratCycle = document.getElementById("ratWaveGroup");
var ratNav = document.getElementsByClassName("nav-link dropdown-toggle")[4];
var statCode = document.getElementById("ratStationCode");
     var pulledCycle = document.getElementById("pulledCycle")
    var pulledSite = document.getElementById("pulledStationCode");
var Ratcontainer = document.getElementById("ratMenuContainer").getElementsByClassName("input-group-prepend")[0];
     var ratsubmit = document.getElementById("run_rat")

    var RatInput = document.getElementById("main_right_panel");
     var defaultAA = RatInput.getElementsByClassName("font-weight-bold");
    var recycling = this.className

   if (key=="CYCLE_2"){ratCycle.value="CYCLE_2"}else if (key=="CYCLE_1"){ratCycle.value="CYCLE_1"}else{ratCycle.value="CYCLE_ALL"}


var intervalStop = 0;

        var AAbtnAdd = setInterval(() => {
intervalStop++;
            if (intervalStop >= 20)
            {TUIloaded(50);
                clearInterval(AAbtnAdd);}
            var pulledSite = document.getElementById("pulledStationCode");
            if(pulledSite)
            {
            if (taskSite === pulledSite.innerText)
            {

                TUIloaded(50);
                var defaultAAval = defaultAA[5].nextSibling.innerText
         if(key.includes("CYCLE"))
   {
                if (pulledSite.innerText !== ""){
                clearInterval(AAbtnAdd);
                setTimeout(function () {
   var AAbtn = document.createElement('input');
    AAbtn.style.fontWeight="500";
    AAbtn.type = 'button';
    AAbtn.id = 'AAbtn';
    AAbtn.className="btn btn-info";
    AAbtn.value = 'Copy AA Blurb';
              AAbtn.onclick=function(){AAbtnBlurb(defaultAAval);}

     RatInput.appendChild(AAbtn);
                    if (document.getElementById("reductions_table").innerText != "")
                    {
                       var recyclebtn = document.createElement('input');
    recyclebtn.style.fontWeight="500";
    recyclebtn.type = 'button';
    recyclebtn.id = 'reductionSend';
                    recyclebtn.className="btn btn-info";
    recyclebtn.value = 'Send Site Reductions';
              recyclebtn.onclick=function(){QBarReductionsToMd(pulledSite.innerText);this.remove();}

     RatInput.appendChild(recyclebtn);
                    }
                    }, 1500);}
                else{clearInterval(AAbtnAdd);}
   }else{clearInterval(AAbtnAdd);}}}}, 500);


statCode.value = taskSite;


      if (ratNav.getAttribute('aria-expanded')=="false" || ratNav.getAttribute('aria-expanded')==undefined) {

var evt = document.createEvent("MouseEvents");
evt.initEvent("click", true, true);
ratNav.dispatchEvent(evt);
          ratsubmit.click()
      }


var evt2 = document.createEvent("MouseEvents");
evt2.initEvent("click", true, true);
ratsubmit.dispatchEvent(evt2);


 }
 taskDiv.appendChild(RatOpen);

if (users.indexOf("*") !== -1){
                  var addUser = document.createElement("div");
addUser.style.display="table-cell";
addUser.style.verticalAlign= "middle";
addUser.id = "addUser";
addUser.style.textAlign="center";
addUser.style.width="20px";
addUser.style.position="absolute";
addUser.style.bottom="0px";
addUser.style.left="40px";
addUser.style.zIndex="2050";
addUser.style.height="20px";
addUser.innerText = "➕"
taskDiv.appendChild(addUser);
addUser.onclick=function(){
event.stopPropagation();
var key = this.parentElement;
var newUser=key.innerText.split('\n')[2];
users.push(newUser);
GM_setValue("users",users);
     createUser(users.length-1);}


}

               var flexOpen = document.createElement("div");
 flexOpen.style.fontSize = "18px"
 flexOpen.innerText = "🗲"
 flexOpen.style.transform="scaleX(-1)";
 flexOpen.className=taskData.Station;
 flexOpen.style.fontSize = "20px"
 flexOpen.style.textShadow="2px 1px 2px #000903"
 flexOpen.style.textAlign="center";
 flexOpen.style.position="absolute";
 flexOpen.style.color = lightWhite;
 flexOpen.style.zIndex="5000";
 flexOpen.style.width="20px";
 flexOpen.style.height="25px";
 flexOpen.style.right="1px";
 flexOpen.style.top="-5px";
 flexOpen.onmouseenter = function () {this.style.fontSize="19px";}
 flexOpen.onmouseleave=function () {this.style.fontSize="18px";}
 flexOpen.onclick=function(){
         var splitterSearchBar = document.getElementById("splitterSearchBar");
     if (splitterSearchBar)
     {

             splitterSearchBar.value = this.className;
     }
     var loadComplete = false;


     var main_workstation = document.getElementById("workstation_search_bar");
var key = this.parentElement;

var keyCycle=key.id.split('-')[1];




 event.stopPropagation();


key=key.id.split('-')[0];
var lockContainer = document.getElementById("lockContainer")
var flexNav = document.getElementById("navbarDropdownMenuScheduling");
var flexSiteInput = document.getElementById("user_input_station_code");
var flexGetButton = document.getElementById("btn_create_workstation");


     var unlock = false;
     if(lockContainer)
     {
     if(lockContainer.className == "locked")
     {
         if (confirm("Qbar locked, Press OK to change sites.") == true) {
unlock = true;
          var evt = document.createEvent("MouseEvents");
evt.initEvent("click", true, true);
lockContainer.dispatchEvent(evt);
         }
     }
         else
         {
            unlock = true;
         }
     }
     else
     {
         unlock = true;
     }
     if (unlock == true)
     {


var cb = document.getElementById("cycleSelection");






         if(!keyCycle.includes("REDUCE"))
         {
             flexSiteInput.value = key;
flexSiteInput.dispatchEvent(new Event('change'));
             cb.value = keyCycle;

             taskContainer.setAttribute("data-toggle", "popover");
    taskContainer.setAttribute("data-placement", "left");
    taskContainer.setAttribute("data-trigger", "manual");
    taskContainer.setAttribute("data-content", "Loading QBar Scheduling!");
    $(taskContainer).popover();
    $(taskContainer).popover('show');
 setTimeout(function () {
     $(taskContainer).popover('hide');;

    }, 4000);
     var evt = document.createEvent("MouseEvents");
evt.initEvent("click", true, true);
flexGetButton.dispatchEvent(evt);
     TUIload();
         }
         else
         {
             alert("Open Flex Reduce Demand Workstation from Qbar instead.");
         }
     }
     var wavePlannerTable = document.getElementById("wavePlannerTable");
var getWavePlan = setInterval (function(){var importWavePlanButton = document.getElementById("importWavePlanButton");
var routePlanTitle = document.getElementById("routePlanTitle");
                       var routedFLEX = document.getElementById("routedFLEX");
                                          if(document.getElementById("routePlanTitle"))
                                          {
                        if (routedFLEX || document.getElementById("routePlanTitle").innerText.includes("Wasn't") ||document.getElementById("routePlanTitle").innerText.includes("Plan"))
                        {
if (!document.getElementById("routePlanTitle").innerText.includes("Wasn't") && !document.getElementById("routePlanTitle").innerText.includes("is"))
{
                        importWavePlanButton.click();
}
                            clearInterval(getWavePlan);
                            TUIloaded(2000);


                        }
                                          } },200)
}
 taskDiv.appendChild(flexOpen);






                    }}

                    GM_setValue("activeTasks",activeTasks)


             }} catch (e) {
             console.log(e);
         }
        }



function timeDiffCalc(dateFuture, dateNow) {

    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;

    let difference = '';

    difference += (minutes === 0) ? `${minutes}` : `${minutes}`;

    return difference;
  }
function calcHeight(value) {
   auditInput.style.height='24px'
  let newHeight = auditInput.scrollHeight + 12;
  return newHeight;
}




function getUserData() {
    let id = document.getElementsByClassName("navbar-nav ml-auto")[0]?.children[0]?.children[0]?.getAttribute('href')?.replace("https://phonetool.amazon.com/users/", "");

return id;

}
function getAudits()
{
    var getaudits = document.getElementbyId("Messages");

    var children = getaudits.children;
for (var i = 0; i < children.length; i++) {
  var thisAudit = children[i];
    audits.push(thisAudit);

}
}

function getAudit(){
          GM_getValue("audit-req-msg");
    GM_getValue("audit-req-img");
    auditInput3.innerText = GM_getValue("audit-req-msg");
    auditimg.src = GM_getValue("audit-req-img");
}


function removeAllChildNodes(parent) {
    while (parent.firstChild) {
         $(parent.firstChild).popover('hide');
        parent.removeChild(parent.firstChild);
    }
}
function removeAllChildNodes2(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function sendMsg(site, msg)

{

site = site.toUpperCase();
    var siteWebhook = webhooks[site]
    var content = {"Content":msg};
    var testhook = "https://hooks.chime.aws/incomingwebhooks/0abdb2c1-9172-47d2-a9ee-fc1c0755285f?token=UmNpd01xSGF8MXwtMS1ZbHFwLXJ2aTIwdTJ2ajdOcE8tTnVSN3J1c0JNTS1CUjdPSUpjMklB"
  GM_xmlhttpRequest({
  method: "POST",
  url: siteWebhook,//testhook,
  data: JSON.stringify(content),
  headers: {
   'Content-Type': 'application/json'
  },
      onerror: function(response) {
     console.log(response);
          chimerror(response)
  },
  onload: function(response) {
     chimeSent();
  }

});

}

function chimerror(rspObj)
{
auditInputBox.setAttribute("data-toggle", "popover");
    auditInputBox.setAttribute("data-placement", "top");
    auditInputBox.setAttribute("data-trigger", "manual");
    auditInputBox.setAttribute("data-content", "Chime Message Failed, Please try again or send manually");
    $(auditInputBox).popover();
    $(auditInputBox).popover('show');
 setTimeout(function () {
     $(auditInputBox).popover('hide');;

    }, 10000);
}
function burbAddedMSG()
{
auditInputBox.setAttribute("data-toggle", "popover");
    auditInputBox.setAttribute("data-placement", "top");
    auditInputBox.setAttribute("data-trigger", "manual");
    auditInputBox.setAttribute("data-content", "User Blurb Saved To Blurb List!");
    $(auditInputBox).popover();
    $(auditInputBox).popover('show');
 setTimeout(function () {
     $(auditInputBox).popover('hide');;

    }, 6000);
}

function planToMd(myTab) {

       let pasteText = document.createElement("pasteText");
       const newContent = document.createTextNode("test");
      pasteText.appendChild(newContent);
      newContent.innerHTML = "";

   var innerDiv = document.getElementById("cycleTableContainer")
   if (innerDiv)
   {
       innerDiv = innerDiv.getElementsByClassName("table table-sm table-bordered")[0];
        // LOOP THROUGH EACH ROW OF THE TABLE.
       for (var i = 0; i < innerDiv.rows.length; i++) {

            // GET THE CELLS COLLECTION OF THE CURRENT ROW.
           var objCells = innerDiv.rows.item(i).cells;
           if (i == 1) {
               for (var s = 0; s < objCells.length; s++)
               {
               if (s == objCells.length-1) {
                   newContent.innerHTML = newContent.innerHTML + ' ---|\n'; // ADD HEADER BREAK
               }
               else
                   {
                   newContent.innerHTML = newContent.innerHTML + ' ---| '; // ADD HEADER SPACE
               }
               }
               for (var j = 0; j < objCells.length; j++) {
                   if (j==0){
                           newContent.innerHTML = newContent.innerHTML + objCells.item(j).innerHTML;}
                  // FIRST CELL IN ROW
             else
             { newContent.innerHTML = newContent.innerHTML + ' | ' + objCells.item(j).innerHTML}; // ADD BORDERS
            }
            newContent.innerHTML = newContent.innerHTML + ' |\n'; // ADD A BREAK.
       }
            else {
           for (var d = 0; d < objCells.length; d++) {
             if (d==0){
                 newContent.innerHTML = newContent.innerHTML + objCells.item(d).innerHTML;} // FIRST CELL IN ROW
             else
             { newContent.innerHTML = newContent.innerHTML + ' | ' + objCells.item(d).innerHTML; // ADD BORDERS
             }

           }
                newContent.innerHTML = newContent.innerHTML + ' |\n'; // ADD A BREAK.
            }
    }
    newContent.innerHTML = "/md **Flex Plan:"+auditInput.value+"**\n\n" + newContent.innerHTML;
        var noemoji = newContent.innerHTML;
        let subemoji = noemoji.replace(/[)]/g, '`)`');
        let subemoji2 = subemoji.replace(/[(]/g, '`(`');
        let subemoji3 = subemoji2.replace(/[:]/g, '`:`');
   var auditInput3 = document.getElementById("auditinput")

    auditInput.value=subemoji3;
    auditInput.style.height = calcHeight(auditInput.value) + "px";
   }
    else
    {
        auditInputBox.setAttribute("data-toggle", "popover");
    auditInputBox.setAttribute("data-placement", "top");
    auditInputBox.setAttribute("data-trigger", "manual");
    auditInputBox.setAttribute("data-content", "No QBar Flex Table Found");
    $(auditInputBox).popover();
    $(auditInputBox).popover('show');
 setTimeout(function () {
     $(auditInputBox).popover('hide');;
    }, 3000);
    }
}





function sendFlexDemand(innerDiv,thisSite) {
if (users.indexOf("testinguser") !== -1){thisSite = "TESTING";}
       let pasteText = document.createElement("pasteText");
       const newContent = document.createTextNode("test");
      pasteText.appendChild(newContent);
      newContent.innerHTML = "";
var waveTimeRow = "rt-wt-";
var waveTimes= ["Total"];
for (var k = 0; k<8; k++)
{
var waveTimeRowVar = waveTimeRow+k;
   var waveTime = document.getElementById(waveTimeRowVar)
   if (waveTime){var waveTimeVal = waveTime.value; if (waveTimeVal !==""){if (!waveTimeVal.includes(':')){var waveTimeVal1 = waveTimeVal.substring(0,2); var waveTimeVal2 = waveTimeVal.substring(2,4); waveTimeVal = waveTimeVal1+":"+waveTimeVal2 }waveTimes.push(waveTimeVal)}}
}

   if (innerDiv)
   {
       var boldLine = false;

        // LOOP THROUGH EACH ROW OF THE TABLE.
       for (var i = 0; i < innerDiv.rows.length; i++) {

            // GET THE CELLS COLLECTION OF THE CURRENT ROW.
           var objCells = innerDiv.rows.item(i).cells;
           if (i == 1) {
               for (var s = 0; s < objCells.length; s++)
               {
               if (s == objCells.length-1) {
                   newContent.innerHTML = newContent.innerHTML + ' ---|\n'; // ADD HEADER BREAK
               }
               else
                   {
                   newContent.innerHTML = newContent.innerHTML + ' ---| '; // ADD HEADER SPACE
               }
               }
               for (var j = 0; j < objCells.length; j++) {

                   if (j==0){
                      var firstVal = objCells.item(j).innerText;
                      //if(firstVal){var firstValColonless = firstVal.replace(':','');}
                      if (waveTimes.indexOf(firstVal) == -1)// && waveTimes.indexOf(firstValColonless) == -1)
                      {newContent.innerHTML = newContent.innerHTML + firstVal;boldLine = false}else{newContent.innerHTML = newContent.innerHTML + "**"+ firstVal + "**";boldLine = true}}
                  // FIRST CELL IN ROW
             else
             { if (boldLine == false){newContent.innerHTML = newContent.innerHTML + ' | ' + objCells.item(j).innerHTML}else{if(objCells.item(j).innerText !== ""){newContent.innerHTML = newContent.innerHTML + ' | **' + objCells.item(j).innerHTML+"**"}else{newContent.innerHTML = newContent.innerHTML + ' | ' + objCells.item(j).innerHTML}};} // ADD BORDERS
            }
            newContent.innerHTML = newContent.innerHTML + ' |\n'; // ADD A BREAK.
               boldLine = false;
       }
            else {
           for (var d = 0; d < objCells.length; d++) {
             if (d==0){var firstVal2 = objCells.item(d).innerText;

                       //if (firstVal2) {var firstVal2Colonless = firstVal.replace(':','');}
                      if (waveTimes.indexOf(firstVal2) == -1)// && waveTimes.indexOf(firstVal2Colonless) == -1)
                      {newContent.innerHTML = newContent.innerHTML + firstVal2;boldLine = false}else{newContent.innerHTML = newContent.innerHTML + "**"+ firstVal2 + "**";boldLine = true}
                } // FIRST CELL IN ROW
             else
             { if (boldLine == false){newContent.innerHTML = newContent.innerHTML + ' | ' + objCells.item(d).innerHTML}else{if(objCells.item(d).innerText !== ""){newContent.innerHTML = newContent.innerHTML + ' | **' + objCells.item(d).innerHTML+"**"}else{newContent.innerHTML = newContent.innerHTML + ' | ' + objCells.item(d).innerHTML}}; // ADD BORDERS
             }

           }
                newContent.innerHTML = newContent.innerHTML + ' |\n'; // ADD A BREAK.
                boldLine = false;
            }
    }
   if(auditInput.value==""){newContent.innerHTML = "/md ### Flex Plan:"+auditInput.value+"\n" + newContent.innerHTML;}
        var noemoji = newContent.innerHTML;
        let subemoji = noemoji.replace(/[)]/g, '`)`');
        let subemoji2 = subemoji.replace(/[(]/g, '`(`');
        let subemoji3 = subemoji2.replace(/[:]/g, '`:`');
   var auditInput3 = document.getElementById("auditinput")
        auditInputBox.style.display="grid";

     auditInput2.innerText=thisSite+"- Site Message";

    if(auditInput.value==""){auditInput.value=subemoji3;}else{auditInput.value=auditInput.value+"\n\n"+subemoji3;}
    auditInput.style.height = calcHeight(auditInput.value) + "px";
   }
    else
    {
        auditInputBox.setAttribute("data-toggle", "popover");
    auditInputBox.setAttribute("data-placement", "top");
    auditInputBox.setAttribute("data-trigger", "manual");
    auditInputBox.setAttribute("data-content", "No QBar Flex Table Found");
    $(auditInputBox).popover();
    $(auditInputBox).popover('show');
 setTimeout(function () {
     $(auditInputBox).popover('hide');;
    }, 3000);
    }
}


function splitterBreakdown(thisSite) {

       let pasteText = document.createElement("pasteText");
       const newContent = document.createTextNode("test");
      pasteText.appendChild(newContent);
      newContent.innerHTML = "";
var innerDiv = document.getElementById("flexSplitterTable")



   if (innerDiv)
   {

        // LOOP THROUGH EACH ROW OF THE TABLE.
       for (var i = 0; i < innerDiv.rows.length; i++) {

            // GET THE CELLS COLLECTION OF THE CURRENT ROW.
           var objCells = innerDiv.rows.item(i).cells;
           if (i == 1) {
               for (var s = 0; s < objCells.length; s++)
               {
               if (s == objCells.length-1) {
                   newContent.innerHTML = newContent.innerHTML + ' ---|\n'; // ADD HEADER BREAK
               }
               else
                   {
                   newContent.innerHTML = newContent.innerHTML + ' ---| '; // ADD HEADER SPACE
               }
               }
               for (var j = 0; j < objCells.length; j++) {
                   if (j==0){
                           newContent.innerHTML = newContent.innerHTML + objCells.item(j).innerHTML;}
                  // FIRST CELL IN ROW
             else
             { newContent.innerHTML = newContent.innerHTML + ' | ' + objCells.item(j).innerHTML}; // ADD BORDERS
            }
            newContent.innerHTML = newContent.innerHTML + ' |\n'; // ADD A BREAK.
       }
            else {
           for (var d = 0; d < objCells.length; d++) {
             if (d==0){
                 newContent.innerHTML = newContent.innerHTML + objCells.item(d).innerHTML;} // FIRST CELL IN ROW
             else
             { newContent.innerHTML = newContent.innerHTML + ' | ' + objCells.item(d).innerHTML; // ADD BORDERS
             }

           }
                newContent.innerHTML = newContent.innerHTML + ' |\n'; // ADD A BREAK.
            }
    }
   if(auditInput.value==""){newContent.innerHTML = "/md **DSP Split to Flex:**\n\n" + newContent.innerHTML;}
        var noemoji = newContent.innerHTML;
        let subemoji = noemoji.replace(/[)]/g, '`)`');
        let subemoji2 = subemoji.replace(/[(]/g, '`(`');
        let subemoji3 = subemoji2.replace(/[:]/g, '`:`');
   var auditInput3 = document.getElementById("auditinput")
        auditInputBox.style.display="grid";

     auditInput2.innerText=thisSite+"- Site Message";

    if(auditInput.value==""){auditInput.value=subemoji3;}else{auditInput.value=auditInput.value+"\n**DSP Split to Flex:**\n\n"+subemoji3;}
    auditInput.style.height = calcHeight(auditInput.value) + "px";
   }
    else
    {
        auditInputBox.setAttribute("data-toggle", "popover");
    auditInputBox.setAttribute("data-placement", "top");
    auditInputBox.setAttribute("data-trigger", "manual");
    auditInputBox.setAttribute("data-content", "No QBar Flex Table Found");
    $(auditInputBox).popover();
    $(auditInputBox).popover('show');
 setTimeout(function () {
     $(auditInputBox).popover('hide');;
    }, 3000);
    }
}


function OnInput() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
}




function AAbtnBlurb(AA)
{
    var QbarStation = document.getElementById("pulledStationCode").innerText;
 var ratTable = document.getElementById("main_page_table")
var flexRow = false;
 var AAbtnID = document.getElementById("AAbtn");

   if (ratTable)
   {

       var flexNum = false;
if (AA.includes("MANUAL"))
    {AA = "*MANUAL TIMES*"}
else
{AA = "*DEFAULT TIMES*"}
        // LOOP THROUGH EACH ROW OF THE TABLE.
       for (var i = 0; i < ratTable.rows.length; i++) {

            // GET THE CELLS COLLECTION OF THE CURRENT ROW.
           var objCells = ratTable.rows.item(i).cells;
               for (var s = 0; s < objCells.length; s++)
               {
                   if (objCells[s].innerText == "Flex"){flexRow = true;ratTable.rows.item(i).style.borderColor = "black";ratTable.rows.item(i).style.fontWeight = "Bold";ratTable.rows.item(i).style.borderStyle = "solid";}
                   if (s == objCells.length-1 && flexRow == true){

                       flexRow = false;
flexNum = objCells.item(s).innerText;

}

               }
       }
   var AAblurb;
   if (flexNum != false)
   {
     AAblurb ="/md "+ QbarStation+" AA "+flexNum+" Flex - " + AA;
   }
       else
       {AAblurb ="/md "+ QbarStation+" AA 0 Flex - " + AA;}
    copyTextToClipboard(AAblurb);
                       flexRow = false;
    AAbtnID.setAttribute("data-toggle", "popover");
    AAbtnID.setAttribute("data-placement", "right");
    AAbtnID.setAttribute("data-trigger", "manual");
    AAbtnID.setAttribute("data-content", "AA Blurb Copied");
    $(AAbtnID).popover();
    $(AAbtnID).popover('show');
 setTimeout(function () {
     $(AAbtnID).popover('hide');;
    }, 3000);
   }
}


function reductionsToMd() {
var QbarStation = document.getElementById("pulledStationCode").innerText;
       var thiscycle = document.getElementById("pulledCycle");
    let reduxMD = "/md @present\n\n**"+thiscycle.innerText+" Reductions:**\n"
   var redux = document.getElementById("reductions_table")
   if (redux)
   {
       for (var i = 0; i < redux.rows.length; i++) {
           var objCells = redux.rows.item(i).innerText
           if (objCells)
           {
               if (i == 0)
               {
           reduxMD+=objCells
               }
               else
               {
                reduxMD+="\n"+objCells
               }
           }

    }


    auditInput.value=reduxMD;
    auditInput.style.height = calcHeight(auditInput.value) + "px";

               var ai = document.getElementById("audinput");
                 setTimeout(function () {
     ai.focus();
    }, 200);

   }}

function QBarReductionsToMd(cycle) {
var QbarStation = document.getElementById("pulledStationCode").innerText;
       var thiscycle = auditInput2.innerText.split('-');
    let reduxMD = "/md @present\n\n**"+cycle+" Reductions:**\n"
   var redux = document.getElementById("reductions_table")
   if (redux.innerText)
   {
       for (var i = 0; i < redux.rows.length; i++) {

           var objCells = redux.rows.item(i).innerText
           if (objCells)
           {
               if (i == 0)
               {
           reduxMD+=objCells
               }
               else
               {
                reduxMD+="\n"+objCells
               }
           }

    }
 sendMsg(QbarStation, reduxMD);
   }else{alert("No Reductions!");}}





function chimeSent(){
auditInputBox.setAttribute("data-toggle", "popover");
    auditInputBox.setAttribute("data-placement", "top");
    auditInputBox.setAttribute("data-trigger", "manual");
    auditInputBox.setAttribute("data-content", "S:------> Chime Message Sent!");
    $(auditInputBox).popover();
    $(auditInputBox).popover('show');
    closeSiteMsg();
 setTimeout(function () {
     $(auditInputBox).popover('hide');;

    }, 5000);
}








function closeSiteMsg()
{
        document.getElementById("Blurbs").selectedIndex = 0;

              auditInput3.style.display="none";
              auditimg.src="";
              auditInput3.value=""
              auditUUID.value="";
    auditInputBox.style.display="none";
             auditimg.style.display="none";
            auditInput.value="";
auditToggle=0;

}

function MC_check()

         {
             tasks=0;
             var assignments = document.getElementsByClassName("css-n3t751");
if(assignments)
{
          for (var i = 0; i < assignments.length; i++) {
              if (assignments[i].innerText.includes("CO_WORK_ASSIGNMENT_TASK_ID"))
              {
                  tasks+=1;


          }}
         }

         GM_setValue("tasks",tasks);
              setTimeout(function () {
      MC_check();

    }, 2000);

         }


function doubleTask(msg)
{


    var content = {"Content":"@present"+msg};
    var testhook = "https://hooks.chime.aws/incomingwebhooks/0abdb2c1-9172-47d2-a9ee-fc1c0755285f?token=UmNpd01xSGF8MXwtMS1ZbHFwLXJ2aTIwdTJ2ajdOcE8tTnVSN3J1c0JNTS1CUjdPSUpjMklB"
  GM_xmlhttpRequest({
  method: "POST",
  url: testhook,//siteWebhook,//testhook,
  data: JSON.stringify(content),
  headers: {
   'Content-Type': 'application/json'
  },
      onerror: chimerror,
  onload: function(response) {

  }

});

}

function backendPull()
{
     var aTime = new Date().toLocaleString();

GM_setValue("backcheck",aTime)
    GM_addValueChangeListener("newdata", function() { newdata.value=arguments[2]; newdata.click();
                                                    GM_getValue("Audit");
                                                    GM_getValue("audit-img");});
    GM_addValueChangeListener("Audit", function() {auditdata.value=arguments[2];
                                                   var evt = document.createEvent("MouseEvents");
evt.initEvent("click", true, true);
auditdata.dispatchEvent(evt);});
GM_addValueChangeListener("audit-img", function() {auditImg.value=arguments[2]; var evt = document.createEvent("MouseEvents");
evt.initEvent("click", true, true);
auditImg.dispatchEvent(evt)});
GM_addValueChangeListener("audit-request", function() {var evt = document.createEvent("MouseEvents");
evt.initEvent("click", true, true);
auditchecks.dispatchEvent(evt);
                                                var auditReq = document.getElementById(arguments[2]);
                                                           GM_setValue("audit-req-msg",auditReq.innerText);
                                                           GM_setValue("audit-req-img",auditReq.className);
                                                          });

        data.addEventListener('change', (event) => {
        let dataNew = data.value;
        GM_setValue("data",dataNew);

        });
    newdata.addEventListener('click', (event) => {
        let dataNew = newdata.value;
        data.value = dataNew;
        GM_setValue("data",dataNew);
        data.click();
        });
     setTimeout(function () {
     location.reload();

    }, 300000);
}

     function convertToMinutes(timeString) {
    var hms = timeString.split(':');
    return Math.ceil(parseInt(hms[2])/60) + parseInt(hms[1]) + parseInt(hms[0])*60
}

function getStationPrefSheet(stationCode) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://na.coworkassignment.science.last-mile.a2z.com/PreferenceSheetsDataHandler?Station=" + stationCode + "&pageSize=1&pageIndex=1",
            responseType: "json",
            onload: (resOBJ) => {
                resolve(resOBJ)
            },
            onabort: httprequestError,
            onerror: httprequestError,
            ontimeout: httprequestError
        });
    })
}


async function Prefs(siteName,cyleName)
{
    var prefData2 = await getStationPrefSheet(siteName);
   var sheet = prefData2.response.data[0]
   var sheets = JSON.parse(sheet['Preference Sheet']);
  for(var attribute in sheets)
   {
       var attr = sheets[attribute];



             if(cyleName.includes("Adhoc") && attr.Attribute.includes("Standardization ") && attr.Content.toUpperCase()==="YES")
   {
    tasknoteBox.innerText=siteName+"\n"+attr.Attribute+"\n"+attr.Content;}

      if(attr.Attribute.includes(cyleName) && attr.Attribute.includes("Replan") && attr.Content.toUpperCase()==="YES")
   {
    tasknoteBox.innerText=siteName+"\n"+attr.Attribute+"\n"+attr.Content;}}
}


function download_file(content, fileName, mimeType) {
    var a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';

    if (navigator.msSaveBlob) { // IE10
        navigator.msSaveBlob(new Blob([content], {
            type: mimeType
        }), fileName);
    } else if (URL && 'download' in a) { //html5 A[download]
        a.href = URL.createObjectURL(new Blob([content], {
            type: mimeType
        }));
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
    }
}

function openChimeRoom(key,tab)
{

    var chimeRoomUrls = chimeRooms;

    if (chimeRoomUrls[key]){
        if (tab == true)
        {
        window.open(
              chimeRoomUrls[key], "_blank");
        }
        else
            {
        window.open(
              chimeRoomUrls[key], "_self");
        }
    }
    else
    {alert("Sorry! Site Room URL not found.");}
}

function createUser(u) {

    var eachUser = document.createElement('div');
         eachUser.style.cursor = "default";
        //eachUser.style.backgroundColor = "#a972c4";
    eachUser.style.paddingLeft = "5px";
    eachUser.style.textAlign = "center";
    eachUser.style.color = lightWhite;
    eachUser.innerText = users[u];
        eachUser.id = users[u];
    eachUser.onclick = function() {const index = users.indexOf(this.innerText);

if (index > -1) {
  users.splice(index, 1); // 2nd parameter means remove one item only
}GM_setValue("users",users)
                                  this.remove();};
    userlist.appendChild(eachUser);
}

function createPackages()
{
    if (visPec == 1)
    {
        var packageMaker = document.createElement("div");
    packageMaker.className = "package";
    packageMaker.style.textShadow="2px 1px 2px #000903,2px 1px 4px #000903"
    packageMaker.style.position = "fixed";
    packageMaker.style.right="0"
    packageMaker.style.width="25px"
    packageMaker.style.height="25px"
    packageMaker.style.zIndex="9999"
    packageMaker.style.bottom="50px";
    packageMaker.style.cursor = "default";
    packageMaker.id = "0";
packageMaker.innerText="📦";
    document.body.appendChild(packageMaker);
      var nextPackage = randomIntFromInterval(200, 1000)
        setTimeout(function () {
     createPackages();
    }, nextPackage);
}
}
function movePackages()
{
packageScore = GM_getValue("packageScore")
    if (visPec == 1)
    {
 if (playerPeccy.id == "140"){ var posA = 145; var posB = 165;  var posC = 180;} else { var posA = 255; var posB = 275; var posC = 290;}
    var packages = document.getElementsByClassName("package");
        if (packages){
    for( var i = 0; i < packages.length; i++)
    {
       var pos = Number(packages[i].id)+1
       packages[i].style.right = pos+"px";
        packages[i].id = pos;
        if (pos > posC) {packages[i].remove()}
        if (clickTog == 1 && pos > posA && pos < posB) {packages[i].remove();
            packageScore = Number(packageScore)+1;
            GM_setValue("packageScore",packageScore);
            togglePeccy.innerText=packageScore+" 📦";
                                                     packageUp.style.display="block";
                                                               setTimeout(function () {
     packageUp.style.display="none";
    }, 500);}

    }clickTog = 0;}
          setTimeout(function () {
     movePackages();
    }, 10);

    }
}

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "Mover")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "Mover").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}



function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {}, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}



function associateHasASMView(login) {
    let found = associatesWithASMView.filter(e => e.Username === login);

    if (found.length > 0) {
        return true;

    }

    return false;
}


function getAssociatesWithASMView() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://na.coworkassignment.science.last-mile.a2z.com/UsersDataHandler?Username=&User%20Type=ASM&Team=AMZL&pageIndex=1&pageSize=500",
            responseType: "json",
            onload: (resOBJ) => {
                resolve(resOBJ)
            },
            onabort: () => {},
            onerror: () => {},
            ontimeout: () => {},
        });
    })
}
function getTUIconfig() {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: devDesk+"config",
            responseType: "json",
            onload: (resOBJ) => {
                resolve(resOBJ)
            },
            onabort: () => {},
            onerror: () => {},
            ontimeout: () => {},
        });
    })
}
function TUIload()
{
     var loadingPeccy = "https://drive.corp.amazon.com/view/josfrost@/TaskUI/TUIloading.png";
             var tuiLoading = document.createElement("img");
     tuiLoading.src = loadingPeccy;
     tuiLoading.style.zIndex="9999";
     tuiLoading.className="tuiLoading";
     tuiLoading.style.width = "400px";
     tuiLoading.style.height - "400px";
     loadingBox.appendChild(tuiLoading);

const peccySpinning = [
  { transform: 'rotate(0)' },
    { transform: 'rotate(360deg)' }
];

const peccyTiming = {
  duration: 3000,
  iterations: Infinity,
}
 var TUILOAD = tuiLoading.animate(peccySpinning, peccyTiming);
}

function TUIloaded(ms)
{
                             setTimeout(function(){var TL = document.getElementsByClassName("tuiLoading");
                                                  for (var TS in TL)
                                                  {
                                                      if (TS <= TL.length-1)
                                                  {if(TL[TS]){TL[TS].remove();}}}},ms)
}

function addBlurbs()
{
     for (var key in blurbset)
    {
        addSingleBlurb(key)
    }
         for (var keys in userBlurbs)
    {
        addSingleBlurb(keys)
    }
}

function addSingleBlurb(key){
         var options = document.createElement("option");
        options.value = key;
        options.text = key.charAt(0).toUpperCase() + key.slice(1);
        select.appendChild(options);
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadUserBlurbs(){
    var blurbTXT="User Blurb List";
for (var keys in userBlurbs)
{
    if(userBlurbs[keys] != undefined)
    {
    blurbTXT=blurbTXT+"\n"+userBlurbs[keys];
    }
}

download("userBlurbset.txt",blurbTXT);
}

function clearUserBlurbs()
{
 if (confirm("This will Delete all your saved Blurbs,\nPress OK to continue.") == true) {
 if (confirm("Press OK to download your User Blurbs to a text file.") == true) {
    downloadUserBlurbs()
    removeOptions(document.getElementById('Blurbs'));
    userBlurbs = {};
    GM_setValue("userBlurbs","");
    addBlurbs()
             }
             else{
    removeOptions(document.getElementById('Blurbs'));
    userBlurbs = {};
    GM_setValue("userBlurbs","");
    addBlurbs()
             }
             }

}

function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}
function chimeButton ()
{
        setTimeout(function(){

            var blurbContainer = document.createElement('div');
            blurbContainer.fontSize = "12px"
            blurbContainer.id="blurbContainer"
blurbContainer.style.borderRadius = "5px";
blurbContainer.style.textAlign = "center";
blurbContainer.style.cursor = "default";
blurbContainer.style.padding= "2px";
blurbContainer.style.width="max-content";
blurbContainer.style.fontWeight="500";
blurbContainer.style.height="min-content";
blurbContainer.style.backgroundColor=cb_Skyblue;
            blurbContainer.style.display="flex";
             blurbContainer.style.flexDirection="row";
blurbContainer.style.zIndex="999999";
blurbContainer.style.position = "fixed";
blurbContainer.style.left = "290px";
blurbContainer.style.bottom = "60px";
  blurbContainer.style.gap="7px";
blurbContainer.innerText = "Site Blurbs";
blurbContainer.style.borderStyle = "solid";
          blurbContainer.onmouseenter =addSites;
            blurbContainer.onmouseleave =addSites;
blurbContainer.style.borderColor = cb_Blue;
document.body.appendChild(blurbContainer);
    var searchInput = document.getElementsByClassName("Input")[0];
    var searchSites = document.createElement('div');
        searchSites.style.borderRadius = "5px";
        searchSites.style.textAlign = "center";
        searchSites.style.cursor = "default";
        searchSites.style.padding= "4px";
        searchSites.style.width="max-content";
        searchSites.style.height="min-content";
        searchSites.style.backgroundColor=cb_Skyblue;
        searchSites.style.zIndex="999999";
        searchSites.style.position = "fixed";
        searchSites.style.right = "0";
        searchSites.style.top = "0";
        searchSites.innerText = "TaskUI Sites";
        searchSites.style.borderStyle = "solid";
        searchSites.style.borderColor = cb_Blue;
    document.body.appendChild(searchSites);
    searchSites.onmouseenter = function () {
users = GM_getValue("users");

            var e = GM_getValue("data");
             var words= JSON.parse(e);
    var gb = words.data
   for(var task = 0;task<gb.length-1;task++)
   {
       var gbT = gb[task];
if (users.indexOf(gbT["Grabbed By"]) !== -1)
{
    var searchSite = document.createElement('div');
     searchSite.style.textAlign = "center";

    searchSite.innerText = gbT.Station+ " - " +gbT["Grabbed By"];

    searchSite.onmouseenter = function(){this.style.backgroundColor = cb_Green;}
    searchSite.onmouseleave = function(){this.style.backgroundColor = cb_Skyblue;}
    searchSite.onclick = function(){
        var siteRoom = this.innerText;
        siteRoom = siteRoom.split(" - ");
        openChimeRoom(siteRoom[0], false)

    }
    searchSites.appendChild(searchSite)
}

      }
    }


        searchSites.onmouseleave = function () {
    while (searchSites.firstChild) {
        searchSites.removeChild(searchSites.firstChild);
    }
            searchSites.innerText = "TaskUI Sites";
        }

    }, 2500)
}


function addQbarFuncs()
{
        var splitterTable = document.getElementById("flexSplitterTableContainer");
     if (splitterTable) {splitterTable.onclick = function(){var thisSite = document.getElementById("scheduleStationCode").innerText;splitterBreakdown(thisSite);}}



                         var cyclCont = document.getElementById("cycleTableContainer")

   if (cyclCont)
   {
       var cyclContTables = cyclCont.getElementsByClassName("table table-sm table-bordered");

       var thisSite = document.getElementById("scheduleStationCode").innerText

             for( var i = 0; i < cyclContTables.length; i++) {
             cyclContTables[i].onclick = function(){sendFlexDemand(this, thisSite, users);}}}
}

function updateBanner(){
    var updateBannerDiv = document.getElementById("updateBanner")
    if (updateBannerDiv){
if(updateBannerDiv.style.display != "none"){updateBannerDiv.style.display = "none"}}
}

function addHours(numOfHours, date) {
  date = new Date(date);
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

  return date;
}

function addSites(){
    if(toggleBlurbs==false){
        toggleBlurbs=true;
    users = GM_getValue("users");
var blurbContainerDiv = document.getElementById("blurbContainer");

            var e = GM_getValue("data");

             var words= JSON.parse(e);
    var gb = words.data

   for(var task = 0;task<gb.length-1;task++)
   {
       var gbT = gb[task];

if (users.indexOf(gbT["Grabbed By"]) !== -1)
{

 var blurbsArr = ["Checking","GTR","GTG","GTP","GTG","COPY","AA"]
    var blurbSite = document.createElement('div');
    blurbSite.style.display = "flex";
    blurbSite.className = gbT.Station
    blurbSite.style.flexDirection = "column-reverse";
    blurbSite.style.textAlign = "center";
    blurbSite.innerText = gbT.Station;


        for (var z in blurbsArr)
        {
        var blurbItem = document.createElement('div');
            blurbItem.style.borderBottom = "dashed black 2px";
        blurbItem.innerText = blurbsArr[z];
            blurbItem.className=blurbsArr[z];
                blurbItem.onmouseenter = function(){this.style.backgroundColor = cb_Green;}
    blurbItem.onmouseleave = function(){this.style.backgroundColor = cb_Skyblue;}
        blurbItem.onclick = function(){
            event.stopPropagation();
 var msgInput = document.getElementsByClassName("ProseMirror")
var blurbSiteclass = this.parentElement.className
   var blurbclass = this.className
if(msgInput)
{

    if (blurbclass == "Checking")
    {msgInput[0].innerText = blurbclass+" "+blurbSiteclass;}
    else
    {
            msgInput[0].innerText = blurbSiteclass+" "+blurbclass;
    }
    msgInput[0].focus();
}
closeBlurbs();

        }
        blurbSite.appendChild(blurbItem);
        }
 blurbContainerDiv.appendChild(blurbSite);
    }

   }}
        else
        {
            closeBlurbs();
        }
}


function closeBlurbs(){

    toggleBlurbs=false;
                var blurbContainerDiv = document.getElementById("blurbContainer");
            removeAllChildNodes2(blurbContainerDiv);
            blurbContainerDiv.innerText = "Site Blurbs";}


function addVersion(){
    if(!document.getElementById("taskUIver"))
    {
    var aboutHeaderBar = document.getElementById("aboutHeaderBar");
       var innerContainer = aboutHeaderBar.getElementsByTagName("tbody");
        var taskUIver = document.createElement('tr');

        innerContainer[0].appendChild(taskUIver);
    taskUIver.id = "taskUIver";
                var taskUIverH = document.createElement('td');
        taskUIverH.innerText = "TaskUI:";
        taskUIver.appendChild(taskUIverH);
                var taskUIverD = document.createElement('td');
        taskUIverD.innerText = version;

        taskUIver.appendChild(taskUIverD);
}}
