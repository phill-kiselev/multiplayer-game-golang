var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

let divFps = document.getElementById("fps");
let divPING = document.getElementById("ping");
let divCOORDS = document.getElementById("coords");


var ICE_DIST = 25;
var IS_NPC_CHECKED = false;
var health_main = 100;
var health_npc = 100;
var NPC_IS_PICKED = false;
//var GRAVITY = -5;
var _RADIUS = 0.15;
//var Xm = 3, Ym = 3;
var PINGms = 0;
// buffer for receive go-predications
var goBUF = [];


var BasicPlayer = null;
var PLAYER = new Object();
//var PLAYERS = new Map(); // Map[id] <MESH>
var PLAYERS = new Object();
//var PsMAP = new Map();   // Map[id] <[x,y]>
var NPC = new Object();
var pQueue = new Object();
pQueue.loaded = false;
pQueue.q = [];
var psRotBUF = new Set();
var psGoBUF = new Set();

//box movement variables
let xx = 0, zz = 0;
let k = 0;
let tmp = 0;
let newX = 0, newZ = 0;
let alpha = 90;
var ATTACK_BALLS = [];
var timer_attack = null;
var flag_attack = true;
var before_attack_time, now_attack_time;
var  ABi;
var _FLY_TO = {};
var ground_change = {g: null, is4: false };

const V = 0.0045;
const eps = 0.05;
let PDIST = 0;

PLAYER.PLAYER_STATE = {
    state: "stand", // stand || run || attack_repaire || attack_ready
    angle: new BABYLON.Vector2(0,1),
    _MOVE_TO: {},
    _FLY_TO: {},
};

var MESSAGE = {
  command: null,
  xxxzzz: null,
  ptype: null,
  pcoords: null,
  conlist: null,
  //planedata: new Object(),
}

function SEND_MSG(command, xxxzzz=null, ptype=null, pcoords=null, conlist=null) {
  MESSAGE.command = command;
  MESSAGE.xxxzzz = xxxzzz;
  //(planedata) ? MESSAGE.ptype = planedata.ptype : MESSAGE.ptype = "";
  //(planedata) ? MESSAGE.pcoords = Array.from(planedata.pcoords) : MESSAGE.pcoords = [1,1,1,1,1,1,1,1,1,1,1,1];
  //(planedata) ? console.log(MESSAGE) : console.log("qwe");
  MESSAGE.ptype = ptype;
  MESSAGE.pcoords = pcoords;
  if (conlist) { console.log(Object.keys(conlist)[0]); MESSAGE.conid = Object.keys(conlist)[0]; MESSAGE.conlist = conlist[Object.keys(conlist)[0]]; }
  else { MESSAGE.conid = null; MESSAGE.conlist = null; }
  //MESSAGE.conlist = conlist;
  console.log(MESSAGE);
  if (command == "$GO") { socket.send(JSON.stringify(MESSAGE)); }
  else if (command == "$PLANE") { socket.send(JSON.stringify(MESSAGE)); }
  else if (command == "$ENDPLANE") { socket.send(JSON.stringify(MESSAGE)); }
  else if (command == "$PING") { socket.send(JSON.stringify(MESSAGE)); }
  else if (command == "$READY") { socket.send(JSON.stringify(MESSAGE)); }
}


var socket = new WebSocket("ws://" + window.location.host + "/socket");
socket.onopen = function() {
  console.log('Connected');
  SEND_MSG("$READY");
}
socket.onmessage = function(event) {
  //console.log(event.data);
  let ar = event.data.split(" ");
  if (ar[0] == "$PONG") {
    // setTimeout(() => { PINGms = new Date().getTime(); SEND_MSG("$PING", null, {}); }, 1000);
    // divPING.innerHTML = new Date().getTime() - PINGms + " ms";
  }
  if (ar[0] == "$GO") {
    //console.log(event.data);
    let id = parseInt(ar[1]);
    // goBUF = [];
    // if (id == PLAYER.id) {
    //   PLAYER.xxx = parseFloat(ar[2]);
    //   PLAYER.zzz = parseFloat(ar[3]);
    //   //PLAYER.isGO = true;
    //   psGoBUF.push(PLAYER);
    // }
    // else {
      PLAYERS[id].xxx = parseFloat(ar[2]);
      PLAYERS[id].zzz = parseFloat(ar[3]);
      PLAYERS[id].rotY = parseFloat(ar[4]);
      psRotBUF.add(PLAYERS[id]);
    // }
  }
  else if (ar[0] == "$GENERATE") {
    console.log(event.data);
    let id = parseInt(ar[1]);
    if (id == PLAYER.id) {
      PLAYER.p.position.x = parseFloat(ar[2]);
      PLAYER.p.position.z = parseFloat(ar[3]);
    }
    else {
      PLAYERS[id].p.position.x = parseFloat(ar[2]);
      PLAYERS[id].p.position.z = parseFloat(ar[3]);
    }
  }
  else if (ar[0] == "$GOBUF") {
    // let ik = 1;
    //if (ar[1] == "-NEW") { goBUF = []; ik += 1; }
    //let id = parseInt(ar[ik]);
    //goBUF.push([parseFloat(ar[ik+1]), parseFloat(ar[ik+2])]);
  }
  else if (ar[0] == "$GOEND") {
    // Плеер id остановился
    // Сделать корректировку координат игрока, иначе ошибка накапливается!!!
    //console.log(event.data);
  }
  else if (ar[0] == "$NEWPSGO") {       // При твоем подключение загружается игрок, который сейчас движется
    console.log("Loading a player, id = ", ar[1]);
    //console.log(ar[0], ar);
    let id = parseInt(ar[1]);
    PLAYERS[id] = Object();
    PLAYERS[id].p = BasicPlayer.clone("Player"+id);
    PLAYERS[id].p.position.x = parseFloat(ar[2]);
    PLAYERS[id].p.position.z = parseFloat(ar[3]);
    PLAYERS[id].xxx = parseFloat(ar[4]);
    PLAYERS[id].zzz = parseFloat(ar[5]);
    PLAYERS[id].rotY = parseFloat(ar[6]);
    let dist = Math.sqrt(Math.pow(PLAYERS[id].xxx - PLAYERS[id].p.position.x, 2) + Math.pow(PLAYERS[id].zzz - PLAYERS[id].p.position.z, 2));
    PLAYERS[id].vx = V * (PLAYERS[id].xxx - PLAYERS[id].p.position.x) / dist;
    PLAYERS[id].vz = V * (PLAYERS[id].zzz - PLAYERS[id].p.position.z) / dist;
    //psRotBUF.add(PLAYERS[id]);
    PLAYERS[id].isGO = true;
    pQueue.q.push(id);
  }
  else if (ar[0] == "$NEWPS") {       // При твоем подключение загружается игрок из мира
    console.log("Loading a player, id = ", ar[1]);
    let id = parseInt(ar[1]);
    PLAYERS[id] = Object();
    PLAYERS[id].p = BasicPlayer.clone("Player"+ar[1]);
    PLAYERS[id].p.position.x = parseFloat(ar[2]);
    PLAYERS[id].p.position.z = parseFloat(ar[3]);
    PLAYERS[id].rotY = parseFloat(ar[4]);
    //psRotBUF.add(PLAYERS[id]);
    PLAYERS[id].isGO = false;
    pQueue.q.push(id);
  }
  else if (ar[0] == "$NEWP") {        // Подключается к игре новый игрок
    console.log("Connected new player, id = ", ar[1]);
    let id = parseInt(ar[1]);
    PLAYERS[id] = Object();
    PLAYERS[id].p = BasicPlayer.clone("Player"+ar[1]);
    PLAYERS[id].p.position.x = parseFloat(ar[2]);
    PLAYERS[id].p.position.z = parseFloat(ar[3]);
    PLAYERS[id].rotY = 0;
    PLAYERS[id].isGO = false;
    pQueue.q.push(id);
  }
  else if (ar[0] == "$ID") {
    console.log("Your ID is ", ar[1]);
    PLAYER.id = parseInt(ar[1]);
    PLAYER.p.animations = [];
    PLAYER.p.position.x = parseFloat(ar[2]);
    PLAYER.p.position.z = parseFloat(ar[3]);
    PLAYER.rotY = parseFloat(ar[4]);
    pQueue.q.push(PLAYER.id);
    PINGms = new Date().getTime();
  }
  else if (ar[0] == "$READY") {
    console.log("Server is ready connect you");
  }
};
socket.onclose = function(event) {
  console.log(event)
}
socket.onerror = function(event) {
  console.log(event)
}


function rotate_vec_delta(x, y, ang=0.01) {
    return new BABYLON.Vector2(x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang));
}

function count_angle_rotate(r1 = new BABYLON.Vector2(0,1), r2 = new BABYLON.Vector2(0,1)) {
    let cosA = (r1.x*r2.x + r1.y*r2.y) / (r1.length() * r2.length());
    //console.log("cosA: ", cosA);
    let r1_new = rotate_vec_delta(r1.x, r1.y);
    //console.log(r1_new);
    let cosA1 = (r1_new.x*r2.x + r1_new.y*r2.y) / (r1_new.length() * r2.length());
    //console.log("cosA1: ", cosA1);
    //console.log(Math.acos(cosA), Math.acos(cosA1));
    let acosA = Math.acos(Math.round(cosA * 1000000) / 1000000 );
    let acosA1 = Math.acos(Math.round(cosA1 * 1000000) / 1000000 );
    return  (acosA1 <= acosA) ? -acosA : acosA;
}

function count_angle_3D(r1 = new BABYLON.Vector3(0,1,0), r2 = new BABYLON.Vector3(0,1,0)) {
    let cosA = (r1.x*r2.x + r1.y*r2.y  + r1.z*r2.z) / (r1.length() * r2.length());
    let acosA = Math.acos(Math.round(cosA * 1000000) / 1000000 );
    return acosA;
}

/******* Add the create scene function ******/
var createScene = function () {

    // Create the scene space
    var scene = new BABYLON.Scene(engine);
    //scene.collisionsEnabled=true;
    //scene.gravity = new BABYLON.Vector3(0, GRAVITY, 0);

    LoadMage(scene, pQueue);
    //LoadIceCrystal(scene);

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 5, 15, new BABYLON.Vector3(0,0,1), scene);
    camera.attachControl(canvas, true);
    //scene.activeCamera.panningSensibility = 800;
    camera.checkCollisions=false;
    //camera.inputs.clear();
    //camera.applyGravity = true;
    //scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    //camera.applyGravity = true;
    //camera.ellipsoid = new BABYLON.Vector3(0.2, 0.2, 0.2);

    BasicPlayer = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.3}, scene);
    BasicPlayer.position.y = 0.3;
    PLAYER.p = BasicPlayer.clone("Player");
    PLAYER.isGO = false;
    //PLAYER.p.rotation.y += Math.PI;
    camera.lockedTarget = PLAYER.p;
    PLAYER.p.isPickable = false;

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(5, 1, -1), scene);

    const highlight = new BABYLON.HighlightLayer('highlight', scene);

    // function generate_ground([NAME, MATERIAL, SIZE, POSITION, ROTATION]) {
    //   let groundX = BABYLON.MeshBuilder.CreateGround("ground", {height: SIZE.x, width: SIZE.y, subdivisions: 4}, scene);
    //   groundX.rotation.z = ROTATION;
    //   groundX.material = MATERIAL;
    //   groundX.position = POSITION;
    //   groundX.checkCollisions = true;
    // }
    //
    // var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  	// groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.5);
    // var gsizes = {
    //                 0: ["ground", groundMat, new BABYLON.Vector2(14*4, 19*4), new BABYLON.Vector3(-28, 0, -20), null ],
    //                 1: ["groundU", groundMat, new BABYLON.Vector2(7, 18), new BABYLON.Vector3(18, 2.5, -3.5), Math.PI / 10 ],
    //                 2: ["groundD", groundMat, new BABYLON.Vector2(7, 16), new BABYLON.Vector3(17.5, -2.5, 3.5), - Math.PI / 10 ],
    //                 3: ["groundM", groundMat, new BABYLON.Vector2(14, 18), new BABYLON.Vector3(32, -5, 0), null ],
    //                 4: ["groundP", groundMat, new BABYLON.Vector2(14, 18), new BABYLON.Vector3(32, 5, 0), null ]
    // }
    // var ground = generate_ground(gsizes[0]);
    // var ground_ups = generate_ground(gsizes[1]);
    // var ground_down = generate_ground(gsizes[2]);
    // var ground_minus1 = generate_ground(gsizes[3]);
    // var ground_plus1 = generate_ground(gsizes[4]);
    // var grounds = [ground, ground_ups, ground_down, ground_plus1, ground_minus1];

    var XX = 147, YY = -17.6, ZZ = 117; // 146 116

    MESHNAMES = [
      "PLANE",
      "incPLANE",
      "colPLANE",
      "GeneratePLANE"
    ]
    IMPORTEDMESHS = null;

    BABYLON.SceneLoader.ImportMesh("", "models/", "HUB_05_arena_quadratic_NEW_WEY_babylon.babylon", scene, function (newMeshes, particleSystems, skeletons)  {
        // let HUB0 = newMeshes[0];
        //newMeshes[3].isVisible = false;
        //newMeshes[5].isVisible = false;
        //newMeshes[6].updateFacetData();
        //var XS = PICKEDMESH.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        // SEND_MSG("$PLANE", BUFFER_PLANE.pcoords);

        IMPORTEDMESHS = newMeshes;

        // for (M of newMeshes) {
        //   let tmp = M.name.split(".")[0];
        //   let tmpcoords = M.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        //   console.log(COUNT_PLANE(tmpcoords));
        //   SEND_MSG("$PLANE", null, tmp, tmpcoords);
        // }
        //SEND_MSG("$PING", null, {});
        //console.log(newMeshes);
        //console.log(newMeshes[6].facetNb);
        //console.log(newMeshes[6].getFacetPosition(0));
        //console.log(newMeshes[6].getFacetPosition(0));
        // console.log(newMeshes[3].facetNb);
        // var qqq = newMeshes[3].getFacetNormal(0).normalize();
        // console.log(qqq);
        // console.log(count_angle_3D(qqq) * 180 / Math.PI);
        // console.log(newMeshes[3].asArray());
        //PLAYER.p.position = HUB.position;
        //HUB.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
        //HUB.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
        //HUB.position = new BABYLON.Vector3(0, 0, 0);
    });

    showAxis(5, new BABYLON.Vector3(0,0,0));          //(152, -17.6, 107));

    var nodeMaterial = build_material_ice();


    var rayline = BABYLON.Mesh.CreateLines("cast", [
          new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)
      ], scene, true);
    rayline.color = new BABYLON.Color3(0, 1, 0);


    function create_ice_ball(x, z, y=2, angle, _FLY_TO, _FLY_FROM) {
        let ice1 = ICE_CAST.clone();
        ice1.isVisible = true;
        ice1.ice_main.position = new BABYLON.Vector3(x, y, z);
        ice1.ice_main.rotation.y = angle;
        ICEBALLS.push({mesh1: ice1.ice_main, partsys: ice1.ice_tools, _fly_to: Object.assign({}, _FLY_TO), _fly_from: Object.assign({}, _FLY_FROM), isShot: false});
    }


    var impMat = new BABYLON.StandardMaterial("impMat", scene);
    impMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    var impact = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0, diameterX: _RADIUS*2, diameterY: 0.01, diameterZ: _RADIUS*2, updatable: true}, scene);
    impact.material = impMat;

    var spoint = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0, diameterX: _RADIUS*2, diameterY: 0.01, diameterZ: _RADIUS*2, updatable: true}, scene);
    var cast_up = BABYLON.Mesh.CreateLines("cast", [
            new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)
      ], scene, true);
    cast_up.color = new BABYLON.Color3(0, 1, 0);



    // Реализовать дискретное по времени отправление данных на сервере
    // // и такое же дискретное отправление комманд с клиента
    // Другое: интерполяция, я внастоящем, вижу мир в прошлом (~100мс)


    // async function CountNewStates() {
    //   if (PLAYER.isGO) {
    //     //console.log(PLAYER.p.position.x, PLAYER.p.position.z);
    //     if (PDIST > eps) {
    //       //console.log(PLAYER.p.position.x, PLAYER.p.position.z);
    //       PLAYER.p.position.x += PLAYER.PLAYER_STATE._MOVE_TO.cos ;
    //       PLAYER.p.position.z += PLAYER.PLAYER_STATE._MOVE_TO.sin ;
    //       //console.log(PLAYER.p.position.x, PLAYER.p.position.z);
    //       PDIST = Math.sqrt(Math.pow(PLAYER.PLAYER_STATE._MOVE_TO.x - PLAYER.p.position.x, 2) + Math.pow(PLAYER.PLAYER_STATE._MOVE_TO.z - PLAYER.p.position.z, 2));
    //     }
    //     else {
    //       PLAYER.isGO = false;
    //       //console.log(PLAYER.p.position.x, PLAYER.p.position.z);
    //     }
    //   }
    //   // else {
    //   //   if (PLAYER.PLAYER_STATE._MOVE_TO.isquest) {
    //   //       PLAYER.PLAYER_STATE._MOVE_TO.isquest = false;
    //   //       //scene.beginAnimation(PLAYERFEATS.skeletonNPC, PLAYERFEATS.animations.Idle.from, PLAYERFEATS.animations.Idle.to, true);
    //   //   }
    //   // }
    //   for (PP in PLAYERS) {
    //     //console.log(PP, PP.isGO);
    //     if (!PLAYERS[PP].isGO) continue;
    //     PLAYERS[PP].p.position.x += PLAYERS[PP].cos ;
    //     PLAYERS[PP].p.position.z += PLAYERS[PP].sin ;
    //     //console.log(PLAYERS[PP].p.position.x, PLAYERS[PP].p.position.z);
    //   }
    // }
    //
    // setInterval(CountNewStates, 5);

    function set_coords_gui() {
      divCOORDS.innerHTML = Math.round(PLAYER.p.position.x * 1000) / 1000 + "  " + Math.round(PLAYER.p.position.z * 1000) / 1000;
    }

    setInterval(set_coords_gui, 500);

    function setMageModel(id) {
      if (id == PLAYER.id) {
        //console.log(MAGE.p.skeleton.getAnimationRange("Walk"));
        xx = PLAYER.p.position.x;
        zz = PLAYER.p.position.z;
        let Y = PLAYER.rotY;
        PLAYER.p = MAGE.p.clone();
        PLAYER.staff = MAGE.staff.clone();
        PLAYER.staff.parent = PLAYER.p;
        PLAYER.p.isVisible = true;
        PLAYER.staff.isVisible = true;
        PLAYER.p.position = new BABYLON.Vector3(XX, YY, ZZ);
        PLAYER.p.isPickable = false;
        //PLAYER.staff = MAGE.staff.clone();
        //PLAYER.staff.isVisible = true;
        //PLAYER.FEATS.healthBarContainer.isVisible = true;
        // let r2 = new BABYLON.Vector2(1 - PLAYER.p.position.x, 2 - PLAYER.p.position.z);
        // let G = count_angle_rotate(new BABYLON.Vector2(0,-1), r2);
        // console.log(G);
        //PLAYER.p.rotation.y += Math.PI;
        PLAYER.p.rotation.y = Y;
        camera.lockedTarget = PLAYER.p;
        PLAYER.p.skeleton = MAGE.p.skeleton.clone("qwe");
        PLAYER.p.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        PLAYER.p.skeleton.animationPropertiesOverride.enableBlending = true;
        PLAYER.p.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        PLAYER.p.skeleton.animationPropertiesOverride.loopMode = 1;
        PLAYER.staff.skeleton = MAGE.staff.skeleton.clone("qwe1");
        PLAYER.staff.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        PLAYER.staff.skeleton.animationPropertiesOverride.enableBlending = true;
        PLAYER.staff.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        PLAYER.staff.skeleton.animationPropertiesOverride.loopMode = 1;
        if (PLAYER.isGO) {
          scene.beginAnimation(PLAYER.p.skeleton, MAGE.FEATS.animations.Walk.from, MAGE.FEATS.animations.Walk.to, true);
          scene.beginAnimation(PLAYER.staff.skeleton, MAGE.FEATS.animations.Walk.from, MAGE.FEATS.animations.Walk.to, true);
        }
        else {
          scene.beginAnimation(PLAYER.p.skeleton, MAGE.FEATS.animations.Idle.from, MAGE.FEATS.animations.Idle.to, true);
          scene.beginAnimation(PLAYER.staff.skeleton, MAGE.FEATS.animations.Idle.from, MAGE.FEATS.animations.Idle.to, true);
        }
      }
      else {
        xx = PLAYERS[id].p.position.x;
        zz = PLAYERS[id].p.position.z;
        let Y = PLAYERS[id].rotY;
        PLAYERS[id].p = MAGE.p.clone();
        PLAYERS[id].staff = MAGE.staff.clone();
        PLAYERS[id].staff.parent = PLAYERS[id].p;
        PLAYERS[id].p.isVisible = true;
        PLAYERS[id].staff.isVisible = true;
        PLAYERS[id].p.position = new BABYLON.Vector3(XX, YY, ZZ);
        PLAYERS[id].p.isPickable = false;
        //PLAYERS[id].staff = MAGE.staff.clone();
        //PLAYERS[id].staff.isVisible = true;
        //PP.FEATS.healthBarContainer.isVisible = true;
        //PLAYER.p.rotation.y += Math.PI;
        PLAYERS[id].p.rotation.y += Y;
        PLAYERS[id].p.skeleton = MAGE.p.skeleton.clone("qwe");
        PLAYERS[id].p.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        PLAYERS[id].p.skeleton.animationPropertiesOverride.enableBlending = true;
        PLAYERS[id].p.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        PLAYERS[id].p.skeleton.animationPropertiesOverride.loopMode = 1;
        PLAYERS[id].staff.skeleton = MAGE.staff.skeleton.clone("qwe1");
        PLAYERS[id].staff.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        PLAYERS[id].staff.skeleton.animationPropertiesOverride.enableBlending = true;
        PLAYERS[id].staff.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        PLAYERS[id].staff.skeleton.animationPropertiesOverride.loopMode = 1;
        if (PLAYERS[id].isGO) {
          scene.beginAnimation(PLAYERS[id].p.skeleton, MAGE.FEATS.animations.Walk.from, MAGE.FEATS.animations.Walk.to, true);
          scene.beginAnimation(PLAYERS[id].staff.skeleton, MAGE.FEATS.animations.Walk.from, MAGE.FEATS.animations.Walk.to, true);
        }
        else {
          scene.beginAnimation(PLAYERS[id].p.skeleton, MAGE.FEATS.animations.Idle.from, MAGE.FEATS.animations.Idle.to, true);
          scene.beginAnimation(PLAYERS[id].staff.skeleton, MAGE.FEATS.animations.Idle.from, MAGE.FEATS.animations.Idle.to, true);
        }
      }
    }

    var animationBoxR = new BABYLON.Animation("myAnimation1", "rotation.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keysR = [];
    keysR.push({ frame: 0, value: 0 });
    keysR.push({ frame: 4, value: 1 });

    async function rotate_pp(pp) {
        psRotBUF.delete(pp);
        //r1 = PLAYER.PLAYER_STATE.angle;
        //r2 = new BABYLON.Vector2(pickResult.pickedPoint.x - PLAYER.p.position.x, pickResult.pickedPoint.z - PLAYER.p.position.z);
        //y = count_angle_rotate(r1, r2) ;
        let Y = pp.rotY;
        //PLAYER.PLAYER_STATE.angle.x = r2.x / Math.sqrt(r2.x*r2.x + r2.y*r2.y);
        //PLAYER.PLAYER_STATE.angle.y = r2.y / Math.sqrt(r2.x*r2.x + r2.y*r2.y);
        keysR[0].value = pp.p.rotation.y;
        keysR[1].value = Y;

        animationBoxR.setKeys(keysR);
        pp.p.animations = [];
        pp.p.animations.push(animationBoxR);

        let anim = scene.beginDirectAnimation(pp.p, [animationBoxR], 0, 4, false);

        await anim.waitAsync();

        if (!pp.isGO) {
          scene.beginAnimation(pp.p.skeleton, MAGE.FEATS.animations.Walk.from, MAGE.FEATS.animations.Walk.to, true);
          scene.beginAnimation(pp.staff.skeleton, MAGE.FEATS.animations.Walk.from, MAGE.FEATS.animations.Walk.to, true);
          pp.isGO = true;
        }
        psGoBUF.add(pp);
    }


    let tt0 = new Date().getTime();
    let tt1 = null;

    scene.registerBeforeRender(function () {

      tt1 = new Date().getTime();
      if (pQueue.loaded) {
        for (pp of psRotBUF) {
          if (pp.rotY > 0.001) rotate_pp(pp);
          let dist = Math.sqrt(Math.pow(pp.xxx - pp.p.position.x, 2) + Math.pow(pp.zzz - pp.p.position.z, 2));
          pp.vx = V * (pp.xxx - pp.p.position.x) / dist;
          pp.vz = V * (pp.zzz - pp.p.position.z) / dist;
          pp.Tpred = new Date().getTime() + dist / V;
        }
        for (pp of psGoBUF) {
          pp.p.position.x += pp.vx * (tt1-tt0);
          pp.p.position.z += pp.vz * (tt1-tt0);
          if (tt1 >= pp.Tpred) {
            pp.isGO = false;
            scene.beginAnimation(pp.p.skeleton, MAGE.FEATS.animations.Idle.from, MAGE.FEATS.animations.Idle.to, true);
            scene.beginAnimation(pp.staff.skeleton, MAGE.FEATS.animations.Idle.from, MAGE.FEATS.animations.Idle.to, true);
            psGoBUF.delete(pp);
          }
        }
        if (pQueue.q.length > 0) {
          setMageModel(pQueue.q.shift());
        }
      }

      // if (psGoBUF.length > 0) {
      //   go_player_discr(psGoBUF.shift());
      // }
      //
      // if (psGoEndBUF.length > 0) {
      //   //psGoEndBUF.shift().ANIMGO.stop();
      // }

      divFps.innerHTML = engine.getFps().toFixed() + " fps";

      tt0 = new Date().getTime();

    });

    canvas.addEventListener("keydown", e=>{
        if((e.key === "q") || (e.key === "Q") || (e.key === "й")) {
            _STATE_ATTACK.is_attack_repaire = true;
            canvas.addEventListener("mousemove", apply_iceball_direction);
        }
    });


    function apply_iceball_direction(ev) {
        const result = scene.pick(scene.pointerX, scene.pointerY);
        cast_up = BABYLON.Mesh.CreateLines("cast", [
            new BABYLON.Vector3(PLAYER.p.position.x, 0, PLAYER.p.position.z), new BABYLON.Vector3(result.pickedPoint.x, 0, result.pickedPoint.z)
        ], null, null, cast_up);
    }

    async function rotate_player() {
        //console.log(PLAYER.p.position.x, PLAYER.p.position.z); НЕОБХОДИМА КОРРЕКТИРОВКА
        r1 = PLAYER.PLAYER_STATE.angle;
        r2 = new BABYLON.Vector2(PLAYER.xxx - PLAYER.p.position.x, PLAYER.zzz - PLAYER.p.position.z);
        r2.x /= Math.sqrt(r2.x*r2.x + r2.y*r2.y);
        r2.y /= Math.sqrt(r2.x*r2.x + r2.y*r2.y);
        y = count_angle_rotate(r1, r2) ;
        PLAYER.PLAYER_STATE.angle.x = r2.x; // Обязательно ли нормировать
        PLAYER.PLAYER_STATE.angle.y = r2.y; // Проверить !!!
        keysR[0].value = PLAYER.p.rotation.y;
        keysR[1].value = PLAYER.p.rotation.y + y;

        //console.log(y, y*180/Math.PI);
        //console.log();

        animationBoxR.setKeys(keysR);
        PLAYER.p.animations = [];
        PLAYER.p.animations.push(animationBoxR);

        let anim = scene.beginDirectAnimation(PLAYER.p, [animationBoxR], 0, 4, false);
        await anim.waitAsync();
        PLAYER.PLAYER_STATE._MOVE_TO.isquest = true; //: _STATE_ATTACK.is_attack_ready = true;
        if (!PLAYER.isGO) {
          scene.beginAnimation(PLAYER.p.skeleton, MAGE.FEATS.animations.Walk.from, MAGE.FEATS.animations.Walk.to, true);
          scene.beginAnimation(PLAYER.staff.skeleton, MAGE.FEATS.animations.Walk.from, MAGE.FEATS.animations.Walk.to, true);
          PLAYER.isGO = true;
        }
    }


        // returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
        function intersects(x1, x2, x3, x4) {
          var a = x1[0], b = x1[2], c = x2[0], d = x2[2], p = x3[0], q = x3[2], r = x4[0], s = x4[2];
          var det, gamma, lambda;
          det = (c - a) * (s - q) - (r - p) * (d - b);
          if (det === 0) {
            return false;
          } else {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
          }
        };
        function qweqwe(XZs) {
          var fgg = false;
          for (let i=0; i<=XZs.length-2; i++) {
            for (let j=i+1; j<=XZs.length-1; j++) {
                if (j != XZs.length-1) fgg = intersects(XZs[i], XZs[i+1], XZs[j], XZs[j+1]);
                else fgg = intersects(XZs[i], XZs[i+1], XZs[j], XZs[0]);
                if (fgg) return false;
            }
            //if (i != XZs.length()-1) KBs.push([(XZs[i+1][1]-XZs[i][1])/(XZs[i+1][0]-XZs[i][0]), XZs[i+1][1]-XZs[i+1][0]*(XZs[i+1][1]-XZs[i][1])/(XZs[i+1][0]-XZs[i][0])]);
            //else KBs.push([(XZs[i][1]-XZs[i][1])/(XZs[0][0]-XZs[i][0]), XZs[0][1]-XZs[0][0]*(XZs[0][1]-XZs[i][1])/(XZs[0][0]-XZs[i][0])]);
          }
          return true;
        }
        function COUNT_PLANE(XS) {
          var XYZs = [];
          var XYZs1 = [];
          for (i of [0,1,2,3]) {
            XYZs1.push([XS[i*3], XS[i*3+1], XS[i*3+2]]);
          }
          var XYZs2 = [];
          for (i of [0,2,1,3]) {
            XYZs2.push([XS[i*3], XS[i*3+1], XS[i*3+2]]);
          }
          var XYZs3 = [];
          for (i of [0,1,3,2]) {
            XYZs3.push([XS[i*3], XS[i*3+1], XS[i*3+2]]);
          }

          var tmp = qweqwe(XYZs1);
          if (!tmp) {
            tmp = qweqwe(XYZs2);
            if (!tmp) {
              tmp = qweqwe(XYZs3);
              if (!tmp) console.log(tmp);
              else XYZs = XYZs3;
            }
            else XYZs = XYZs2;
          }
          else XYZs = XYZs1;

          let Mo = XYZs[3];
          let V = [XYZs[1][0]-XYZs[0][0], XYZs[1][1]-XYZs[0][1], XYZs[1][2]-XYZs[0][2]];
          let W = [XYZs[2][0]-XYZs[1][0], XYZs[2][1]-XYZs[1][1], XYZs[2][2]-XYZs[1][2]];
          let det1 = V[1]*W[2]-V[2]*W[1];
          let det2 = V[0]*W[2]-V[2]*W[0];
          let det3 = V[0]*W[1]-V[1]*W[0];
          let coefs = [det1, -det2, det3, - det1*Mo[0] + det2*Mo[1] - det3*Mo[2]];

          let outobj = new Object();
          outobj.pcoords = XYZs;
          outobj.pcoefs = coefs;
          return outobj;
        }

        var LASTCLICK = { x: 0, y: 0 };
        PICKEDMESH = null;
        BUFFER_PLANE = {
          pcoords: null,
          pcoefs: null
        };

        scene.onPointerDown = function (evt, pickResult) {

          //console.log(evt.clientX, evt.clientY);

          const result = scene.pick(scene.pointerX, scene.pointerY);
          let pickedMesh;
          //highlight.removeMesh(NPC);

            // if the click hits the ground object, we change the impact position
            if (pickResult.hit) {

                // if (_STATE_ATTACK.is_attack_repaire) {
                //     rotate_player(pickResult, doing="attack");
                //     setTimeout(async () => {
                //         _STATE_ATTACK.is_attack_ready = true;
                //         _STATE_ATTACK.is_attack_repaire = false;
                //         let anim = scene.beginAnimation(PLAYERFEATS.skeletonNPC, PLAYERFEATS.animations.Hit1.from, PLAYERFEATS.animations.Hit1.to, false, 0.8);
                //         anim.onAnimationEnd = () => {
                //              if (!PLAYER_STATE._MOVE_TO.isquest) scene.beginAnimation(PLAYERFEATS.skeletonNPC, PLAYERFEATS.animations.Idle.from, PLAYERFEATS.animations.Idle.to, true);
                //         }
                //     }, 100);
                //     canvas.removeEventListener("mousemove", apply_iceball_direction);
                //
                //     cast_up = BABYLON.Mesh.CreateLines("cast", [
                //         new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)
                //     ], null, null, cast_up);
                //     PLAYER_STATE._FLY_TO.x = pickResult.pickedPoint.x;
                //     PLAYER_STATE._FLY_TO.z = pickResult.pickedPoint.z;
                // }
                //
                // else {
                //
                //     _STATE_ATTACK.is_attack_repaire = false;
                //     _STATE_ATTACK.is_attack_ready = false;
                //
                //     if (result.pickedMesh == NPC) {
                //         // Then highlight the hit mesh
                //         highlight.addMesh(result.pickedMesh, BABYLON.Color3.White());
                //         pickedMesh = result.pickedMesh;
                //         NPC_IS_PICKED = true;
                //     }
                //     else { NPC_IS_PICKED = false; }
                //

                    impact.position.x = Math.round(pickResult.pickedPoint.x * 1000) / 1000;
                    impact.position.z = Math.round(pickResult.pickedPoint.z * 1000) / 1000;
                    impact.position.y = pickResult.pickedPoint.y;
                    PICKEDMESH = pickResult.pickedMesh;
                    PLAYER.p.position.x = Math.round(PLAYER.p.position.x * 1000) / 1000;
                    PLAYER.p.position.z = Math.round(PLAYER.p.position.z * 1000) / 1000;
                    PLAYER.xxx = Math.round(pickResult.pickedPoint.x * 1000) / 1000;
                    PLAYER.zzz = Math.round(pickResult.pickedPoint.z * 1000) / 1000;
                    //console.log(count_angle_3D(pickResult.getNormal(true)) * 180 / Math.PI ) ;
                    //console.log(pickResult.pickedMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind));
                    //let msg = "$GO " + (Math.round(pickResult.pickedPoint.x * 1000) / 1000).toString() + ' ' + (Math.round(pickResult.pickedPoint.z * 1000) / 1000);
                    //socket.send(msg);
                    //let msg = new Object();
                    //msg.command = "$GO";
                    //msg.xxxzzz = [PLAYER.xxx, PLAYER.zzz];
                    SEND_MSG("$GO", [PLAYER.xxx, PLAYER.zzz]);

                    if ((LASTCLICK.x != evt.clientX) && (LASTCLICK.y != evt.clientY)) {
                      rotate_player();
                    }
                    // if (!_MOVE_TO.isquest) scene.beginAnimation(PLAYERFEATS.skeletonNPC, PLAYERFEATS.animations.Walk.from, PLAYERFEATS.animations.Walk.to, true);

                    xx = PLAYER.p.position.x;
                    zz = PLAYER.p.position.z;
                    PDIST = Math.sqrt(Math.pow(PLAYER.xxx - PLAYER.p.position.x, 2) + Math.pow(PLAYER.zzz - PLAYER.p.position.z, 2));
                    PLAYER.vx = V * (PLAYER.xxx - xx) / PDIST;
                    PLAYER.vz = V * (PLAYER.zzz - zz) / PDIST;
                    let deltaT = PDIST / V;
                    PLAYER.Tpred = new Date().getTime() + deltaT;
                    //console.log(new Date().getTime(), new Date().getTime() + deltaT);
                    //console.log(psGoBUF);
                    tt0 = new Date().getTime();
                    psGoBUF.add(PLAYER);
            }
        };


        // UI
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var UiPanel = new BABYLON.GUI.StackPanel();
        UiPanel.isVertical = false;
        UiPanel.left = "150px";
        UiPanel.top = "200px";
        UiPanel.height = "70px";
        UiPanel.fontSize = "14px";
        UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(UiPanel);
        // ..
        var button = BABYLON.GUI.Button.CreateSimpleButton("but1", "Ice Ball");
        //button.paddingTop = "10px";
        button.paddingRight = "10px";
        //button.left = "400px";
        button.width = "70px";
        button.height = "70px";
        //button.color = "white";
        //button.background = "green";
        //button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.onPointerDownObservable.add(()=> {
            _STATE_ATTACK.is_attack_repaire = true;
            canvas.addEventListener("mousemove", apply_iceball_direction);
        });
        UiPanel.addControl(button);
        // ..
        var button1 = BABYLON.GUI.Button.CreateSimpleButton("but2", "Fire Ball");
        //button1.paddingTop = "10px";
        button1.paddingRight = "10px";
        //button.left = "400px";
        button1.width = "70px";
        button1.height = "70px";
        //button1.color = "white";
        //button1.background = "green";
        //button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        button1.onPointerDownObservable.add(()=> {
            //if (walkRange) scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
        });
        UiPanel.addControl(button1);
        // ..
        var button3 = BABYLON.GUI.Button.CreateSimpleButton("but2", "Send plane data");
        //button1.paddingTop = "10px";
        button3.paddingRight = "10px";
        //button.left = "400px";
        button3.width = "150px";
        button3.height = "70px";
        //button1.color = "white";
        //button1.background = "green";
        //button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        button3.onPointerDownObservable.add(()=> {
          //console.log(IMPORTEDMESHS);
          for (M of IMPORTEDMESHS) {
            if (M.name == "colPLANE") M.name = "colPLANE.1";
            let tmp = M.name.split(".");
            let tmp1 = null;
            let tmpstr = tmp[0][0]+tmp[1];
            let conlist = new Object();
            conlist[tmpstr] = [];
            for (MM of IMPORTEDMESHS) {
              if (M != MM) {
                tmp1 = MM.name.split(".");
                //tmpstr = tmp1[0][0]+tmp1[1];
                //console.log(Object.values(conlist)[0]);
                if (M.intersectsMesh(MM)) conlist[tmpstr].push(tmp1[0][0]+tmp1[1]);
              }
            }
            let tmpcoords = M.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            //console.log(COUNT_PLANE(tmpcoords));
            SEND_MSG("$PLANE", null, tmp[0], tmpcoords, conlist);
          }
          SEND_MSG("$ENDPLANE");
        });
        UiPanel.addControl(button3);

        // var button4 = BABYLON.GUI.Button.CreateSimpleButton("but2", "Send plane data");
        // //button1.paddingTop = "10px";
        // button4.paddingRight = "10px";
        // //button.left = "400px";
        // button4.width = "150px";
        // button4.height = "70px";
        // //button1.color = "white";
        // //button1.background = "green";
        // //button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        // button4.onPointerDownObservable.add(()=> {
        //   //SEND_MSG("$ENDPLANE");
        // });
        // UiPanel.addControl(button4);

        //addDragAndDropFunctionality(ground, camera, scene);

    return scene;
}
/******* End of the create scene function ******/

var scene = createScene(); //Call the createScene function



// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
        scene.render();
});
