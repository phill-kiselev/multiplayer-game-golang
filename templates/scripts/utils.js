function doDownload(filename, mesh) {
    if(objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
    }
    var serializedMesh = BABYLON.SceneSerializer.SerializeMesh(mesh);
    var strMesh = JSON.stringify(serializedMesh);
    if (filename.toLowerCase().lastIndexOf(".babylon") !== filename.length - 8 || filename.length < 9) {
        filename += ".babylon";
    }
    var blob = new Blob ( [ strMesh ], { type : "octet/stream" } );
    // turn blob into an object URL; saved as a member, so can be cleaned out later
    objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    var click = document.createEvent("MouseEvents");
    click.initEvent("click", true, false);
    link.dispatchEvent(click);
}


async function build_material_ice() {
  // -----------------------------------------------------------------
  // NODE MATERIAL
  // -----------------------------------------------------------------
  var nodeMaterial = new BABYLON.NodeMaterial("node");

  // InputBlock
  var position = new BABYLON.InputBlock("position");
  position.setAsAttribute("position");

  // TransformBlock
  var WorldPos = new BABYLON.TransformBlock("WorldPos");
  WorldPos.complementZ = 0;
  WorldPos.complementW = 1;

  // InputBlock
  var World = new BABYLON.InputBlock("World");
  World.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

  // TransformBlock
  var Worldposition = new BABYLON.TransformBlock("World position");
  Worldposition.complementZ = 0;
  Worldposition.complementW = 1;

  // LightBlock
  var Lights = new BABYLON.LightBlock("Lights");

  // InputBlock
  var cameraPosition = new BABYLON.InputBlock("cameraPosition");
  cameraPosition.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);

  // InputBlock
  var Float = new BABYLON.InputBlock("Float");
  Float.value = 0.28;
  Float.min = 0;
  Float.max = 1;
  Float.isBoolean = false;
  Float.matrixMode = 0;
  Float.animationType = BABYLON.AnimatedInputBlockTypes.None;
  Float.isConstant = false;
  Float.visibleInInspector = true;

  // InputBlock
  var Float1 = new BABYLON.InputBlock("Float");
  Float1.value = 512;
  Float1.min = 0;
  Float1.max = 512;
  Float1.isBoolean = false;
  Float1.matrixMode = 0;
  Float1.animationType = BABYLON.AnimatedInputBlockTypes.None;
  Float1.isConstant = true;
  Float1.visibleInInspector = false;

  // InputBlock
  var Color = new BABYLON.InputBlock("Color3");
  Color.value = new BABYLON.Color3(0.12941176470588237, 0.27058823529411763, 0.27450980392156865);
  Color.isConstant = false;
  Color.visibleInInspector = false;

  // TextureBlock
  var Texture = new BABYLON.TextureBlock("Texture");
  Texture.texture = new BABYLON.Texture("../models/Ice_001_SPEC.jpg", null);
  Texture.texture.wrapU = 1;
  Texture.texture.wrapV = 1;
  Texture.texture.uAng = 0;
  Texture.texture.vAng = 0;
  Texture.texture.wAng = 0;
  Texture.texture.uOffset = 0;
  Texture.texture.vOffset = 0;
  Texture.texture.uScale = 1;
  Texture.texture.vScale = 1;
  Texture.convertToGammaSpace = false;

  // InputBlock
  var uv = new BABYLON.InputBlock("uv");
  uv.setAsAttribute("uv");

  // TextureBlock
  var Texture1 = new BABYLON.TextureBlock("Texture");
  Texture1.texture = new BABYLON.Texture("../models/Ice_001_COLOR.jpg", null);
  Texture1.texture.wrapU = 1;
  Texture1.texture.wrapV = 1;
  Texture1.texture.uAng = 0;
  Texture1.texture.vAng = 0;
  Texture1.texture.wAng = 0;
  Texture1.texture.uOffset = 0;
  Texture1.texture.vOffset = 0;
  Texture1.texture.uScale = 1;
  Texture1.texture.vScale = 1;
  Texture1.convertToGammaSpace = false;

  // AddBlock
  var Add = new BABYLON.AddBlock("Add");

  // InputBlock
  var Color1 = new BABYLON.InputBlock("Color3");
  Color1.value = new BABYLON.Color3(0.23137254901960785, 0.7764705882352941, 0.8549019607843137);
  Color1.isConstant = false;
  Color1.visibleInInspector = false;

  // AddBlock
  var Add1 = new BABYLON.AddBlock("Add");

  // AddBlock
  var Add2 = new BABYLON.AddBlock("Add");

  // FragmentOutputBlock
  var FragmentOutput = new BABYLON.FragmentOutputBlock("FragmentOutput");

  // TransformBlock
  var WorldPosViewProjectionTransform = new BABYLON.TransformBlock("WorldPos * ViewProjectionTransform");
  WorldPosViewProjectionTransform.complementZ = 0;
  WorldPosViewProjectionTransform.complementW = 1;

  // InputBlock
  var ViewProjection = new BABYLON.InputBlock("ViewProjection");
  ViewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);

  // VertexOutputBlock
  var VertexOutput = new BABYLON.VertexOutputBlock("VertexOutput");

  // Connections
  position.output.connectTo(WorldPos.vector);
  World.output.connectTo(WorldPos.transform);
  WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
  ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
  WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
  uv.output.connectTo(Texture1.uv);
  Texture1.rgb.connectTo(Add.left);
  Color1.output.connectTo(Add.right);
  Add.output.connectTo(Add1.left);
  WorldPos.output.connectTo(Lights.worldPosition);
  position.output.connectTo(Worldposition.vector);
  World.output.connectTo(Worldposition.transform);
  Worldposition.output.connectTo(Lights.worldNormal);
  cameraPosition.output.connectTo(Lights.cameraPosition);
  Float.output.connectTo(Lights.glossiness);
  Float1.output.connectTo(Lights.glossPower);
  Color.output.connectTo(Lights.diffuseColor);
  uv.output.connectTo(Texture.uv);
  Texture.rgb.connectTo(Lights.specularColor);
  Lights.diffuseOutput.connectTo(Add2.left);
  Lights.specularOutput.connectTo(Add2.right);
  Add2.output.connectTo(Add1.right);
  Add1.output.connectTo(FragmentOutput.rgb);

  // Output nodes
  nodeMaterial.addOutputNode(VertexOutput);
  nodeMaterial.addOutputNode(FragmentOutput);
  nodeMaterial.build();

  // --------------------------------------------------------------
  return nodeMaterial;
}

var showAxis = function(size, pos = new BABYLON.Vector3(0,0,0)) {
  var makeTextPlane = function(text, color, size) {
      var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
      var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
      plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
      plane.material.backFaceCulling = false;
      plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
  };

  const x0 = pos.x, y0 = pos.y, z0 = pos.z;
  var axisX = BABYLON.Mesh.CreateLines("axisX", [
    new BABYLON.Vector3(0+x0, 0+y0, 0+z0), new BABYLON.Vector3(size+x0, 0+y0, 0+z0),
    new BABYLON.Vector3(size * 0.95+x0, 0.05 * size+y0, 0+z0),
    new BABYLON.Vector3(size+x0, 0+y0, 0+z0), new BABYLON.Vector3(size * 0.95+x0, -0.05 * size+y0, 0+z0)
    ], scene);
  axisX.color = new BABYLON.Color3(1, 0, 0);
  var xChar = makeTextPlane("X", "red", size / 10);
  xChar.position = new BABYLON.Vector3(0.9 * size+x0, -0.05 * size+y0, 0+z0);
  var axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3(0+x0, 0+y0, 0+z0), new BABYLON.Vector3(0+x0, size+y0, 0+z0),
      new BABYLON.Vector3( -0.05 * size+x0, size * 0.95+y0, 0+z0),
      new BABYLON.Vector3(0+x0, size+y0, 0+z0), new BABYLON.Vector3( 0.05 * size+x0, size * 0.95+y0, 0+z0)
      ], scene);
  axisY.color = new BABYLON.Color3(0, 1, 0);
  var yChar = makeTextPlane("Y", "green", size / 10);
  yChar.position = new BABYLON.Vector3(0+x0, 0.9 * size+y0, -0.05 * size+z0);
  var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3(0+x0, 0+y0, 0+z0), new BABYLON.Vector3(0+x0, 0+y0, size+z0),
      new BABYLON.Vector3( 0+x0 , -0.05 * size+y0, size * 0.95+z0),
      new BABYLON.Vector3(0+x0, 0+y0, size+z0), new BABYLON.Vector3( 0+x0, 0.05 * size+y0, size * 0.95+z0)
      ], scene);
  axisZ.color = new BABYLON.Color3(0, 0, 1);
  var zChar = makeTextPlane("Z", "blue", size / 10);
  zChar.position = new BABYLON.Vector3(0+x0, 0.05 * size+y0, 0.9 * size+z0);
};

var showLocalAxis = function(size, pos = new BABYLON.Vector3(0,0,0)) {
  var makeTextPlane = function(text, color, size) {
      var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
      var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
      plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
      plane.material.backFaceCulling = false;
      plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
  };

  const x0 = pos.x, y0 = pos.y, z0 = pos.z;
  size = -size;
  var axisX = BABYLON.Mesh.CreateLines("axisX", [
    new BABYLON.Vector3(0+x0, 0+y0, 0+z0), new BABYLON.Vector3(size+x0, 0+y0, 0+z0),
    new BABYLON.Vector3(size * 0.95+x0, 0.05 * size+y0, 0+z0),
    new BABYLON.Vector3(size+x0, 0+y0, 0+z0), new BABYLON.Vector3(size * 0.95+x0, -0.05 * size+y0, 0+z0)
    ], scene);
  axisX.color = new BABYLON.Color3(1, 0, 0);
  //var xChar = makeTextPlane("X", "red", size / 10);
  //xChar.position = new BABYLON.Vector3(0.9 * size+x0, 0.05 * size+y0, 0+z0);
  var axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3(0+x0, 0+y0, 0+z0), new BABYLON.Vector3(0+x0, -size+y0, 0+z0),
      new BABYLON.Vector3( -0.05 * size+x0, -size * 0.95+y0, 0+z0),
      new BABYLON.Vector3(0+x0, -size+y0, 0+z0), new BABYLON.Vector3( 0.05 * size+x0, -size * 0.95+y0, 0+z0)
      ], scene);
  axisY.color = new BABYLON.Color3(0, 1, 0);
  //var yChar = makeTextPlane("Y", "green", size / 10);
  //yChar.position = new BABYLON.Vector3(0+x0, -0.9 * size+y0, -0.05 * size+z0);
  var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3(0+x0, 0+y0, 0+z0), new BABYLON.Vector3(0+x0, 0+y0, size+z0),
      new BABYLON.Vector3( 0+x0 , -0.05 * size+y0, size * 0.95+z0),
      new BABYLON.Vector3(0+x0, 0+y0, size+z0), new BABYLON.Vector3( 0+x0, 0.05 * size+y0, size * 0.95+z0)
      ], scene);
  axisZ.color = new BABYLON.Color3(0, 0, 1);
  //var zChar = makeTextPlane("Z", "blue", size / 10);
  //zChar.position = new BABYLON.Vector3(0+x0, -0.05 * size+y0, 0.9 * size+z0);

  axisX.parent = PLAYER.p;
  axisY.parent = PLAYER.p;
  axisZ.parent = PLAYER.p;
};

// BABYLON.SceneLoader.ImportMesh("", "models/", "HUB_babylon.babylon", scene, function (newMeshes, particleSystems, skeletons)  {
//     let HUB = newMeshes[5];
//     NPC.position = new BABYLON.Vector3(-3, 0.35, -3);
// });



// -------------------------------------------
// +++++++++++ MAGE PERSON +++++++++++++++++++
// -------------------------------------------

var MAGE = Object();
var MAGE_LOADED = false;

function mage_texture(scene) {
  var magemat = new BABYLON.StandardMaterial("qwewqe", scene);
  magemat.ambientTexture = new BABYLON.Texture("../models/MagesTexture.png", scene);
  return magemat;
}

function LoadMage(scene, pQueue) {
  BABYLON.SceneLoader.ImportMesh("", "../models/", "Mages_1to4_babylon.babylon", scene, function (newMeshes, particleSystems, skeletons) {

       newMeshes[0].dispose();
       newMeshes[1].dispose();
       newMeshes[2].dispose();
       //newMeshes[3].dispose();
       newMeshes[4].dispose();
       //newMeshes[5].dispose();
       newMeshes[6].dispose();
       newMeshes[7].dispose();

       MAGE.p = newMeshes[5];
       MAGE.p.position = new BABYLON.Vector3(0, -10, 0);
       //MAGE.p.material = magemat;

       MAGE.staff = newMeshes[3];
       //MAGE.staff.parent = MAGE.p;
       //staff.material = magemat;

       MAGE.p.isVisible = false;
       MAGE.staff.isVisible = false;

       // MAGE.p.checkCollisions = true;
       // MAGE.p.ellipsoid = new BABYLON.Vector3(0.1, .1, 0.1);
       // MAGE.p.applyGravity = true;

       // let y = count_angle_rotate();
       // _STATE_PLAYER.angle.x = 0;
       // _STATE_PLAYER.angle.y = 1;
       // PLAYER.p.rotation.y += y;

       MAGE.FEATS = Object();
       MAGE.FEATS.skeleton = skeletons[0];

       // ROBOT
       MAGE.FEATS.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
       MAGE.FEATS.skeleton.animationPropertiesOverride.enableBlending = true;
       MAGE.FEATS.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
       MAGE.FEATS.skeleton.animationPropertiesOverride.loopMode = 1;

       // MAGE.FEATS.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
       // MAGE.FEATS.skeleton.animationPropertiesOverride.enableBlending = true;
       // MAGE.FEATS.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
       // MAGE.FEATS.skeleton.animationPropertiesOverride.loopMode = 1;
       // Death_back Death_forward Fly Hit1 Hit2 Idle Spell_item Taking_damage Walk Walk_End Walk_start
       MAGE.FEATS.animations = Object();
       MAGE.FEATS.animations.Death_forward = MAGE.FEATS.skeleton.getAnimationRange("Death_forward");
       MAGE.FEATS.animations.Death_back = MAGE.FEATS.skeleton.getAnimationRange("Death_back");
       MAGE.FEATS.animations.Fly = MAGE.FEATS.skeleton.getAnimationRange("Fly");
       MAGE.FEATS.animations.Hit1 = MAGE.FEATS.skeleton.getAnimationRange("Hit1");
       MAGE.FEATS.animations.Hit2 = MAGE.FEATS.skeleton.getAnimationRange("Hit2");
       MAGE.FEATS.animations.Idle = MAGE.FEATS.skeleton.getAnimationRange("Idle");
       MAGE.FEATS.animations.Spell_item = MAGE.FEATS.skeleton.getAnimationRange("Spell_item");
       MAGE.FEATS.animations.Taking_damage = MAGE.FEATS.skeleton.getAnimationRange("Taking_damage");
       MAGE.FEATS.animations.Walk = MAGE.FEATS.skeleton.getAnimationRange("Walk");
       MAGE.FEATS.animations.Walk_start = MAGE.FEATS.skeleton.getAnimationRange("Walk_start");
       MAGE.FEATS.animations.Walk_End = MAGE.FEATS.skeleton.getAnimationRange("Walk_End");
       /////////////scene.beginAnimation(MAGE.FEATS.skeleton, MAGE.FEATS.animations.Idle.from, MAGE.FEATS.animations.Idle.to, true);


       // var healthBarMaterial = new BABYLON.StandardMaterial("hb1mat", scene);
       // healthBarMaterial.diffuseColor = BABYLON.Color3.Red();
       // healthBarMaterial.backFaceCulling = false;
       //
       // var healthBarMaterial1 = new BABYLON.StandardMaterial("hb11mat", scene);
       // healthBarMaterial1.diffuseColor = BABYLON.Color3.Green();
       // healthBarMaterial1.backFaceCulling = false;
       //
       // var healthBarContainerMaterial = new BABYLON.StandardMaterial("hb2mat", scene);
       // healthBarContainerMaterial.diffuseColor = BABYLON.Color3.Blue();
       // healthBarContainerMaterial.backFaceCulling = false;
       //
       // MAGE.FEATS.dynamicTexture1 = new BABYLON.DynamicTexture("dt1", 512, scene, true);
       // MAGE.FEATS.dynamicTexture1.hasAlpha = true;
       //
       // var healthBarTextMaterial = new BABYLON.StandardMaterial("hb3mat", scene);
       // healthBarTextMaterial.diffuseTexture = MAGE.FEATS.dynamicTexture1;
       // healthBarTextMaterial.backFaceCulling = false;
       // healthBarTextMaterial.diffuseColor = BABYLON.Color3.Green();
       //
       // MAGE.FEATS.healthBarContainer = BABYLON.MeshBuilder.CreatePlane("hb2", { width: 3.2, height: .5, subdivisions: 4 }, scene);
       // var healthBar = BABYLON.MeshBuilder.CreatePlane("hb1", {width:3.2, height:.5, subdivisions:4}, scene);
       // MAGE.FEATS.healthBarG = BABYLON.MeshBuilder.CreatePlane("hb1G", {width:3.2, height:.5, subdivisions:4, updatable:true }, scene);
       // MAGE.FEATS.healthBarContainer.isPickable = false;
       // healthBar.isPickable = false;
       // MAGE.FEATS.healthBarG.isPickable = false;
       //
       // var healthBarText = BABYLON.MeshBuilder.CreatePlane("hb3", { width: 2, height: 2, subdivisions: 4 }, scene);
       // healthBarText.material = healthBarMaterial;
       // healthBarText.isPickable = false;
       //
       // MAGE.FEATS.healthBarContainer.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
       //
       // healthBar.renderingGroupId = 1;
       // MAGE.FEATS.healthBarG.renderingGroupId = 1;
       // healthBarText.renderingGroupId = 1;
       // MAGE.FEATS.healthBarContainer.renderingGroupId = 1;
       //
       // healthBar.position = new BABYLON.Vector3(0, 0, -.01);			// Move in front of container slightly.  Without this there is flickering.
       // MAGE.FEATS.healthBarG.position = new BABYLON.Vector3(0, 0, -.01);
       // MAGE.FEATS.healthBarContainer.position = new BABYLON.Vector3(0, 4, -3);     // Position above PLAYER.p.
       // healthBarText.position = new BABYLON.Vector3(2.3, -.4, 0);
       //
       // healthBar.parent = MAGE.FEATS.healthBarContainer;
       // MAGE.FEATS.healthBarG.parent = MAGE.FEATS.healthBarContainer;
       // MAGE.FEATS.healthBarContainer.parent = MAGE.p;
       // healthBarText.parent = MAGE.FEATS.healthBarContainer;
       //
       // healthBar.material = healthBarMaterial;
       // MAGE.FEATS.healthBarG.material = healthBarMaterial1;
       // MAGE.FEATS.healthBarContainer.material = healthBarContainerMaterial;
       // healthBarText.material = healthBarTextMaterial;
       //
       // MAGE.FEATS.textureContext1 = MAGE.FEATS.dynamicTexture1.getContext();
       // var size = MAGE.FEATS.dynamicTexture1.getSize();
       // var text = "100%";
       //
       // MAGE.FEATS.textureContext1.clearRect(0, 0, size.width, size.height);
       //
       // MAGE.FEATS.textureContext1.font = "bold 120px Calibri";
       // var textSize = MAGE.FEATS.textureContext1.measureText(text);
       // MAGE.FEATS.textureContext1.fillStyle = "white";
       // MAGE.FEATS.textureContext1.fillText(text,(size.width - textSize.width) / 2,(size.height - 120) / 2);
       //
       // MAGE.FEATS.dynamicTexture1.update();
       //
       // MAGE.FEATS.healthBarContainer.isVisible = false;

       pQueue.loaded = true;
       //socket.send("$READY");

     });
}


   ///////////////////////////////////////////////////////
   /////////////////////////////////////////////////////
   //////////////////////////////////////////////////

   var ICE_CAST = Object();
   var ICEBALLS = [];
   var ICE_PARTICLES = null;

   $.getJSON("../models/IceSmoke.json", function(data) {
       ICE_PARTICLES = data.systems[0];
   });

   function LoadIceCrystal(scene) {
     BABYLON.SceneLoader.ImportMesh("", "../models/", "Crystal_babylon.babylon", scene, function (newMeshes, particleSystems, skeletons) {

         ICE_CAST.ice_main = newMeshes[0];
         ICE_CAST.ice_little = newMeshes[1];
         ICE_CAST.ice_main.isVisible = false;
         ICE_CAST.ice_little.setEnabled(false);
         ICE_CAST.ice_main.scaling = new BABYLON.Vector3(0.2,0.2,0.2);
         //ICE_CAST.ice_main.position = new BABYLON.Vector3(x, y, z); !!!!!!!!!!!!!!!!!!
         //ICE_CAST.ice_little.position = new BABYLON.Vector3(0, 2.2, 2);
         //ICE_CAST.ice_little.setParent(ICE_CAST.ice_main);
         //ICE_CAST.ice_little.material = nodeMaterial;

         //ICE_CAST.ice_main.material = nodeMaterial;
         //ICE_CAST.ice_main.rotation.y = angle; !!!!!!!!!!!!!!!!!!!!!!!!!!!!

         ICE_CAST.ice_tools = new BABYLON.ParticleSystem.Parse(ICE_PARTICLES, scene, '');


         let meshEmitter = new BABYLON.MeshParticleEmitter(ICE_CAST.ice_main);
         meshEmitter.useMeshNormalsForDirection = false;
         meshEmitter.direction1 = new BABYLON.Vector3(0.5, 0, -1);
         meshEmitter.direction2 = new BABYLON.Vector3(-0.5, 0, -1);

         ICE_CAST.ice_tools.particleEmitterType = meshEmitter;
         ICE_CAST.ice_tools.emitter = ICE_CAST.ice_main;
         //ICEBALLS.push({mesh1: ICE_CAST.ice_main, partsys: t, _fly_to: Object.assign({}, _FLY_TO), _fly_from: Object.assign({}, _FLY_FROM), isShot: false});
         // !!!!!!!!!!
         ICE_CAST.ice_tools.start();

     });
   }

   // pylons (obstacles)
   // var pyl_mat = new BABYLON.StandardMaterial("pyl_mat", scene);
   // pyl_mat.diffuseColor = new BABYLON.Color3(0.8, 0.9, 0.3);
   // obj=BABYLON.MeshBuilder.CreateCylinder('qwe',{diameterTop: 2,diameterBottom: 2,height: 0.9,tessellation: 16},scene );
   // obj.position = new BABYLON.Vector3(Xm,0,Ym);
   // obj.checkCollisions=true;
   // obj.material=pyl_mat;
   // var size = obj.getBoundingInfo().boundingBox.extendSize;

   // var animationBox1 = new BABYLON.Animation("myAnimation1", "scaling.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
   // var animationBox2 = new BABYLON.Animation("myAnimation2", "position.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
   // var keys1 = [];
   //   keys1.push({
   //     frame: 0,
   //     value: 0
   //   });
   //   keys1.push({
   //     frame: 20,
   //     value: 1
   //   });
   // var keys2 = [];
   //   keys2.push({
   //     frame: 0,
   //     value: 0
   //   });
   //   keys2.push({
   //     frame: 20,
   //     value: 1
   //   });
   //
   //
   // async function npc_death() {
   //   let anim = scene.beginAnimation(NPCFEATS.skeletonNPC, NPCFEATS.animations.Death_back.from, NPCFEATS.animations.Death_back.to, false);
   //   await anim.waitAsync();
   //   NPC.dispose();
   // }
   // var greyBar = null;
   //
   // function ice_cast_fuck() {
   //
   //   let h = 3.2;
   //
   //   let width123 = NPCFEATS.healthBarG.scaling.x * h;
   //   health_npc = Math.round(((width123-0.9) / h) * 100);
   //
   //   var gbmat = new BABYLON.StandardMaterial("hb2mat", scene);
   //   gbmat.diffuseColor = BABYLON.Color3.FromHexString("#ADD8E6");
   //   gbmat.backFaceCulling = false;
   //
   //   if (greyBar) greyBar.dispose();
   //
   //   let W = (health_npc <= 0) ? NPCFEATS.healthBarG.scaling.x * h : 0.8;
   //   greyBar = BABYLON.MeshBuilder.CreatePlane("hb1234", {width:W, height:.5, subdivisions:4}, scene);
   //   greyBar.isPickable = false;
   //
   //   greyBar.renderingGroupId = 1;
   //   greyBar.position = new BABYLON.Vector3(1.6 + 2 * NPCFEATS.healthBarG.position.x - 0.4, 0, -.01);			// Move in front of container slightly.  Without this there is flickering.
   //   greyBar.parent = NPCFEATS.healthBarContainer;
   //   greyBar.material = gbmat;
   //
   //   keys1[0].value = greyBar.scaling.x;
   //   keys1[1].value = 0;
   //   keys2[0].value = greyBar.position.x;
   //   keys2[1].value = greyBar.position.x - 0.4;
   //
   //   animationBox1.setKeys(keys1);
   //   animationBox2.setKeys(keys2);
   //   greyBar.animations = [];
   //   greyBar.animations.push(animationBox1);
   //   greyBar.animations.push(animationBox2);
   //
   //   scene.beginAnimation(greyBar, 0, 20, false);
   //
   //   NPCFEATS.healthBarG.position.x -= 0.4;
   //   NPCFEATS.healthBarG.scaling.x = (width123-0.8) / h;
   //   var size = NPCFEATS.dynamicTexture1.getSize();
   //   let HP = (health_npc <= 0) ? 0 : health_npc;
   //   var text = HP + "%";
   //   NPCFEATS.textureContext1.clearRect(0, 0, size.width, size.height);
   //   NPCFEATS.textureContext1.font = "bold 120px Calibri";
   //   var textSize = NPCFEATS.textureContext1.measureText(text);
   //   NPCFEATS.textureContext1.fillStyle = "white";
   //   NPCFEATS.textureContext1.fillText(text,(size.width - textSize.width) / 2,(size.height - 120) / 2);
   //   NPCFEATS.dynamicTexture1.update();
   //
   //   if (health_npc <= 0) npc_death();
   // }

   //if (PLAYER.p) {
       // if (NPC_STATE.state != "stand") {
       //
       //     NPC_STATE._MOVE_TO.cos = Math.abs(NPC.position.x - xx) / Math.sqrt(Math.pow(NPC.position.z - zz,2)+Math.pow(NPC.position.x - xx,2));
       //     NPC_STATE._MOVE_TO.sin = Math.abs(NPC.position.z - zz) / Math.sqrt(Math.pow(NPC.position.z - zz,2)+Math.pow(NPC.position.x - xx,2));
       //     NPC_STATE._MOVE_TO.direction = new BABYLON.Vector2((xx - NPC.position.x >=0)?1:-1, (zz - NPC.position.z >=0)?1:-1);
       //
       //     dist = Math.sqrt(Math.pow(NPC.position.x - xx, 2) + Math.pow(NPC.position.z - zz, 2));
       //
       //     newX = NPC_STATE._MOVE_TO.direction.x * NPC_STATE._MOVE_TO.cos * V * 0.5;
       //     newZ = NPC_STATE._MOVE_TO.direction.y * NPC_STATE._MOVE_TO.sin * V * 0.5;
       //     var forward = new BABYLON.Vector3(newX, -0.01, newZ);
       //     // if(meshFound.distance > 0.55){
       //     //    forward.y = -0.05;
       //     // }
       //     // if(meshFound.distance > 1){
       //     //    forward.y = -0.8;
       //     // }
       //     NPC.moveWithCollisions(forward);
       //
       //     if (dist < eps) {
       //         NPC_STATE.state = "stand";
       //         scene.beginAnimation(NPCFEATS.skeletonNPC, NPCFEATS.animations.Idle.from, NPCFEATS.animations.Idle.to, true);
       //     }
       //
       // }

       // if (_STATE_ATTACK.is_attack_ready) {
       //     dist = Math.sqrt(Math.pow(PLAYER_STATE._MOVE_TO.x - xx, 2) + Math.pow(PLAYER_STATE._MOVE_TO.z - zz, 2));
       //     if (dist < 9) {
       //         PLAYER_STATE._MOVE_TO.isquest = false;
       //         if (flag_attack) { before_attack_time = Date.now(); flag_attack = false; }
       //         else {
       //             now_attack_time = Date.now();
       //             if (now_attack_time - before_attack_time > 700) {
       //                 r1 = new BABYLON.Vector2(0,1);
       //                 r2 = new BABYLON.Vector2(PLAYER_STATE._FLY_TO.x - xx, PLAYER_STATE._FLY_TO.z - zz);
       //                 let angle = count_angle_rotate(r1, r2);
       //
       //                 let _FLY_FROM = {};
       //                 //console.log(xx, NPCFEATS.staff.position.x);
       //                 _FLY_FROM.x = xx + _STATE_PLAYER.angle.x;
       //                 _FLY_FROM.z = zz + _STATE_PLAYER.angle.y;
       //                 PLAYER_STATE._FLY_TO.cos = Math.abs(PLAYER_STATE._FLY_TO.x - xx) / Math.sqrt(Math.pow(PLAYER_STATE._FLY_TO.z - zz,2)+Math.pow(PLAYER_STATE._FLY_TO.x - xx,2));
       //                 PLAYER_STATE._FLY_TO.sin = Math.abs(PLAYER_STATE._FLY_TO.z - zz) / Math.sqrt(Math.pow(PLAYER_STATE._FLY_TO.z - zz,2)+Math.pow(PLAYER_STATE._FLY_TO.x - xx,2));
       //                 PLAYER_STATE._FLY_TO.direction = new BABYLON.Vector2((PLAYER_STATE._FLY_TO.x - xx >=0)?1:-1, (PLAYER_STATE._FLY_TO.z - zz >=0)?1:-1);
       //
       //                 create_ice_ball(xx+_STATE_PLAYER.angle.x*2, zz+_STATE_PLAYER.angle.y*2, 1.5, angle, PLAYER_STATE._FLY_TO, _FLY_FROM);
       //                 flag_attack = true;
       //                 _STATE_ATTACK.is_attack_repaire = false;
       //                 _STATE_ATTACK.is_attack_ready = false;
       //
       //                 // var cast_up = BABYLON.Mesh.CreateLines("cast", [
       //                 //      new BABYLON.Vector3(_FLY_FROM.x-0.35, 0, _FLY_FROM.z-0.35), new BABYLON.Vector3(_FLY_TO.x-0.35, 0, _FLY_TO.z-0.35)
       //                 //  ], scene, true);
       //                 // cast_up.color = new BABYLON.Color3(0, 1, 0);
       //                 // var cast_up = BABYLON.Mesh.CreateLines("cast", [
       //                 //      new BABYLON.Vector3(_FLY_FROM.x+0.35, 0, _FLY_FROM.z+0.35), new BABYLON.Vector3(_FLY_TO.x+0.35, 0, _FLY_TO.z+0.35)
       //                 //  ], scene, true);
       //                 // cast_up.color = new BABYLON.Color3(0, 1, 0);
       //
       //             }
       //         }
       //     }
       //     else flag_attack = true;
       // }
       // else flag_attack = true;

       // for (let index = ICEBALLS.length - 1; index >= 0; index -= 1) {
       //     let cast = ICEBALLS[index];
       //     newX = cast._fly_to.direction.x * V * cast._fly_to.cos;
       //     newZ = cast._fly_to.direction.y * V * cast._fly_to.sin;
       //
       //     cast.mesh1.position.x += newX;
       //     cast.mesh1.position.z += newZ;
       //     if (cast.mesh1.intersectsMesh(NPC)&&!cast.isShot) { cast.isShot = true; ice_cast_fuck(); }
       //     let dist = Math.sqrt(Math.pow(cast._fly_from.x - cast.mesh1.position.x, 2) + Math.pow(cast._fly_from.z - cast.mesh1.position.z, 2));
       //     if (dist > 10) { cast.partsys.stop(); cast.mesh1.dispose(); ICEBALLS.splice(index, 1); }
       // }


           //if (PLAYER_STATE._MOVE_TO.isquest) {

               // var rayPick = new BABYLON.Ray(PLAYER.p.position, new BABYLON.Vector3(0, -1, 0));
               // var meshFound = scene.pickWithRay(rayPick, function (item) {
               //     if (ground_change.g != item) {ground_change.g = item; ground_change.is4 = true; }
               //     return grounds.includes(item);
               // });

               // let DIST_WITH_NPC = Math.sqrt(Math.pow(NPC.position.x - xx, 2) + Math.pow(NPC.position.z - zz, 2));
               // if ((DIST_WITH_NPC <= 5)&&(NPC_STATE.state == "stand")) {
               //     NPC_STATE.state = "run_follow";
               //     scene.beginAnimation(NPCFEATS.skeletonNPC, NPCFEATS.animations.Walk.from, NPCFEATS.animations.Walk.to, true);
               // }


               // if (ground_change.is4) {
               //     PLAYER_STATE._MOVE_TO.cos = Math.abs(PLAYER_STATE._MOVE_TO.x - xx) / Math.sqrt(Math.pow(PLAYER_STATE._MOVE_TO.z - zz,2)+Math.pow(PLAYER_STATE._MOVE_TO.x - xx,2));
               //     PLAYER_STATE._MOVE_TO.sin = Math.abs(PLAYER_STATE._MOVE_TO.z - zz) / Math.sqrt(Math.pow(PLAYER_STATE._MOVE_TO.z - zz,2)+Math.pow(PLAYER_STATE._MOVE_TO.x - xx,2));
               //     PLAYER_STATE._MOVE_TO.direction = new BABYLON.Vector2((PLAYER_STATE._MOVE_TO.x - xx >=0)?1:-1, (PLAYER_STATE._MOVE_TO.z - zz >=0)?1:-1);
               // }

               //dist = Math.sqrt(Math.pow(PLAYER_STATE._MOVE_TO.x - xx, 2) + Math.pow(PLAYER_STATE._MOVE_TO.z - zz, 2));

               //console.log(PLAYER_STATE._MOVE_TO.direction.x, Math.round(PLAYER_STATE._MOVE_TO.cos * 100) / 100,
               //            PLAYER_STATE._MOVE_TO.direction.y, Math.round(PLAYER_STATE._MOVE_TO.sin * 100) / 100, V);

               //for (let [id, coords] of PsMAP) {
               // (async () => {
               //   for (let [id, coords] of PsMAP) {
               //     await funcTMP(id, coords);
               //   }
               // })();

               //}
               // if ((dist < eps)&&(PLAYER_STATE._MOVE_TO.isquest)) {
               //     //console.log(PLAYER.p.position);
               //     PLAYER_STATE._MOVE_TO.isquest = false;
               //     scene.beginAnimation(PLAYERFEATS.skeletonNPC, PLAYERFEATS.animations.Idle.from, PLAYERFEATS.animations.Idle.to, true);
               // }


               //socket.onmessage = function(event) {
               //if (BUF_GO.length != 0) {
                   //alert(`[message] Данные получены с сервера: ${event.data}`);
                   //console.log(BUF_GO[BUF_GO.length - 1]);

                   //newX = BUF_GO[BUF_GO.length - 1][0];
                   //newZ = BUF_GO[BUF_GO.length - 1][1];
                   //let ar = event.data.split(" ");
                   //newX = parseFloat(ar[0]);
                   //newZ = parseFloat(ar[1]);
                   //newX = PLAYER_STATE._MOVE_TO.direction.x * PLAYER_STATE._MOVE_TO.cos * V;
                   //newZ = PLAYER_STATE._MOVE_TO.direction.y * PLAYER_STATE._MOVE_TO.sin * V;
                   //var forward = new BABYLON.Vector3(newX, -0.01, newZ);
                   //if(meshFound.distance > 0.55){
                   //    forward.y = -0.05;
                   //}
                   //if(meshFound.distance > 1){
                   //    forward.y = -0.8;
                   //}
                   //PLAYER.p.moveWithCollisions(forward);
                   //PLAYER.p.position.x = newX;
                   //PLAYER.p.position.z = newZ;

               //     newX = BUF_GO[BUF_GO.length - 1][2];
               //     newZ = BUF_GO[BUF_GO.length - 1][3];
               //     BUF_GO.length = 0;
               //     player1.position.x = newX;
               //     player1.position.z = newZ;
               //
               //     if ((dist < eps)&&(PLAYER_STATE._MOVE_TO.isquest)) {
               //         //console.log(player.position);
               //         PLAYER_STATE._MOVE_TO.isquest = false;
               //         scene.beginAnimation(PLAYERFEATS.skeletonNPC, PLAYERFEATS.animations.Idle.from, PLAYERFEATS.animations.Idle.to, true);
               //     }
               // }

           //}
       //}
       // scene.onKeyboardObservable.add((kbInfo) => {
       //     switch (kbInfo.type) {
       //         case BABYLON.KeyboardEventTypes.KEYDOWN:
       //             console.log("KEY DOWN: ", kbInfo.event.keyCode);
       //             break;
       //         case BABYLON.KeyboardEventTypes.KEYUP:
       //             console.log("KEY UP: ", kbInfo.event.keyCode);
       //             break;
       //     }
       // });


   //
   //
   //      BABYLON.SceneLoader.ImportMesh("", "../models/", "Mages_1to4_babylon.babylon", scene, function (newMeshes, particleSystems, skeletons) {
   //
   //          var magemat = new BABYLON.StandardMaterial("qwewqe", scene);
   //          magemat.ambientTexture = new BABYLON.Texture("../models/MagesTexture.png", scene);
   //
   //          //PLAYER.p.dispose() ;
   //          PLAYER.p = newMeshes[4];
   //          PLAYER.p.position = new BABYLON.Vector3(0, 0.35, 0);
   //          PLAYER.p.material = magemat;
   //
   //          let p = newMeshes[2];
   //          p.parent = PLAYER.p;
   //          p.material = magemat;
   //
   //          // PLAYER.p.checkCollisions = true;
   //          // PLAYER.p.ellipsoid = new BABYLON.Vector3(0.5, .5, 0.5);
   //          // PLAYER.p.applyGravity = true;
   //
   //          camera.lockedTarget = PLAYER.p;
   //          PLAYER.p.isPickable = false;
   //          //var size = PLAYER.p.getBoundingInfo().boundingBox.extendSize;
   //          let y = count_angle_rotate();
   //          _STATE_PLAYER.angle.x = 0;
   //          _STATE_PLAYER.angle.y = 1;
   //          PLAYER.p.rotation.y += y;
   //
   //          newMeshes[0].dispose();
   //          newMeshes[1].dispose();
   //          //newMeshes[2].dispose();
   //          newMeshes[3].dispose();
   //          //newMeshes[4].dispose();
   //          newMeshes[5].dispose();
   //          newMeshes[6].dispose();
   //          newMeshes[7].dispose();
   //
   //          PLAYERFEATS.skeletonNPC = skeletons[0];
   //          // ROBOT
   //          PLAYERFEATS.skeletonNPC.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
   //          PLAYERFEATS.skeletonNPC.animationPropertiesOverride.enableBlending = true;
   //          PLAYERFEATS.skeletonNPC.animationPropertiesOverride.blendingSpeed = 0.05;
   //          PLAYERFEATS.skeletonNPC.animationPropertiesOverride.loopMode = 1;
   //
   //          PLAYERFEATS.skeletonNPC.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
   //          PLAYERFEATS.skeletonNPC.animationPropertiesOverride.enableBlending = true;
   //          PLAYERFEATS.skeletonNPC.animationPropertiesOverride.blendingSpeed = 0.05;
   //          PLAYERFEATS.skeletonNPC.animationPropertiesOverride.loopMode = 1;
   //          // Death_back Death_forward Fly Hit1 Hit2 Idle Spell_item Taking_damage Walk Walk_End Walk_start
   //          PLAYERFEATS.animations.Death_back = PLAYERFEATS.skeletonNPC.getAnimationRange("Death_back");
   //          PLAYERFEATS.animations.Death_forward = PLAYERFEATS.skeletonNPC.getAnimationRange("Death_forward");
   //          PLAYERFEATS.animations.Fly = PLAYERFEATS.skeletonNPC.getAnimationRange("Fly");
   //          PLAYERFEATS.animations.Hit1 = PLAYERFEATS.skeletonNPC.getAnimationRange("Hit1");
   //          PLAYERFEATS.animations.Hit2 = PLAYERFEATS.skeletonNPC.getAnimationRange("Hit2");
   //          PLAYERFEATS.animations.Idle = PLAYERFEATS.skeletonNPC.getAnimationRange("Idle");
   //          PLAYERFEATS.animations.Spell_item = PLAYERFEATS.skeletonNPC.getAnimationRange("Spell_item");
   //          PLAYERFEATS.animations.Taking_damage = PLAYERFEATS.skeletonNPC.getAnimationRange("Taking_damage");
   //          PLAYERFEATS.animations.Walk = PLAYERFEATS.skeletonNPC.getAnimationRange("Walk");
   //          PLAYERFEATS.animations.Walk_start = PLAYERFEATS.skeletonNPC.getAnimationRange("Walk_start");
   //          PLAYERFEATS.animations.Walk_End = PLAYERFEATS.skeletonNPC.getAnimationRange("Walk_End");
   //          scene.beginAnimation(PLAYERFEATS.skeletonNPC, PLAYERFEATS.animations.Idle.from, PLAYERFEATS.animations.Idle.to, true);
   //
   //
   //          var healthBarMaterial = new BABYLON.StandardMaterial("hb1mat", scene);
   //          healthBarMaterial.diffuseColor = BABYLON.Color3.Red();
   //          healthBarMaterial.backFaceCulling = false;
   //
   //          var healthBarMaterial1 = new BABYLON.StandardMaterial("hb11mat", scene);
   //          healthBarMaterial1.diffuseColor = BABYLON.Color3.Green();
   //          healthBarMaterial1.backFaceCulling = false;
   //
   //          var healthBarContainerMaterial = new BABYLON.StandardMaterial("hb2mat", scene);
   //          healthBarContainerMaterial.diffuseColor = BABYLON.Color3.Blue();
   //          healthBarContainerMaterial.backFaceCulling = false;
   //
   //          PLAYERFEATS.dynamicTexture1 = new BABYLON.DynamicTexture("dt1", 512, scene, true);
   //          PLAYERFEATS.dynamicTexture1.hasAlpha = true;
   //
   //          var healthBarTextMaterial = new BABYLON.StandardMaterial("hb3mat", scene);
   //          healthBarTextMaterial.diffuseTexture = PLAYERFEATS.dynamicTexture1;
   //          healthBarTextMaterial.backFaceCulling = false;
   //          healthBarTextMaterial.diffuseColor = BABYLON.Color3.Green();
   //
   //          PLAYERFEATS.healthBarContainer = BABYLON.MeshBuilder.CreatePlane("hb2", { width: 3.2, height: .5, subdivisions: 4 }, scene);
   //          var healthBar = BABYLON.MeshBuilder.CreatePlane("hb1", {width:3.2, height:.5, subdivisions:4}, scene);
   //          PLAYERFEATS.healthBarG = BABYLON.MeshBuilder.CreatePlane("hb1G", {width:3.2, height:.5, subdivisions:4, updatable:true }, scene);
   //          PLAYERFEATS.healthBarContainer.isPickable = false;
   //          healthBar.isPickable = false;
   //          PLAYERFEATS.healthBarG.isPickable = false;
   //
   //          var healthBarText = BABYLON.MeshBuilder.CreatePlane("hb3", { width: 2, height: 2, subdivisions: 4 }, scene);
   //          healthBarText.material = healthBarMaterial;
   //          healthBarText.isPickable = false;
   //
   //          PLAYERFEATS.healthBarContainer.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
   //
   //          healthBar.renderingGroupId = 1;
   //          PLAYERFEATS.healthBarG.renderingGroupId = 1;
   //          healthBarText.renderingGroupId = 1;
   //          PLAYERFEATS.healthBarContainer.renderingGroupId = 1;
   //
   //          healthBar.position = new BABYLON.Vector3(0, 0, -.01);			// Move in front of container slightly.  Without this there is flickering.
   //          PLAYERFEATS.healthBarG.position = new BABYLON.Vector3(0, 0, -.01);
   //          PLAYERFEATS.healthBarContainer.position = new BABYLON.Vector3(0, 4, -3);     // Position above PLAYER.p.
   //          healthBarText.position = new BABYLON.Vector3(2.3, -.4, 0);
   //
   //          healthBar.parent = PLAYERFEATS.healthBarContainer;
   //          PLAYERFEATS.healthBarG.parent = PLAYERFEATS.healthBarContainer;
   //          PLAYERFEATS.healthBarContainer.parent = PLAYER.p;
   //          healthBarText.parent = PLAYERFEATS.healthBarContainer;
   //
   //          healthBar.material = healthBarMaterial;
   //          PLAYERFEATS.healthBarG.material = healthBarMaterial1;
   //          PLAYERFEATS.healthBarContainer.material = healthBarContainerMaterial;
   //          healthBarText.material = healthBarTextMaterial;
   //
   //          PLAYERFEATS.textureContext1 = PLAYERFEATS.dynamicTexture1.getContext();
   //          var size = PLAYERFEATS.dynamicTexture1.getSize();
   //          var text = health_npc + "%";
   //
   //          PLAYERFEATS.textureContext1.clearRect(0, 0, size.width, size.height);
   //
   //          PLAYERFEATS.textureContext1.font = "bold 120px Calibri";
   //          var textSize = PLAYERFEATS.textureContext1.measureText(text);
   //          PLAYERFEATS.textureContext1.fillStyle = "white";
   //          PLAYERFEATS.textureContext1.fillText(text,(size.width - textSize.width) / 2,(size.height - 120) / 2);
   //
   //          PLAYERFEATS.dynamicTexture1.update();
   //
   //      });

   // Watch for browser/canvas resize events
   //window.addEventListener("resize", function () {
   //        engine.resize();
   //});


   //function addDragAndDropFunctionality(ground, camera, scene) {
   //    var startingPoint;
   //    var currentMesh;
   //
   //	console.log(scene);
   //
   ////    var getGroundPosition = function () {
   ////        // Use a predicate to get position on the ground
   ////        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
   ////        if (pickinfo.hit) {
   ////			console.log("hit");
   ////            return pickinfo.pickedPoint;
   ////        }
   ////
   ////        return null;
   ////    }
   //
   //    var onPointerDown = function (evt) {
   //        if (evt.button !== 0) {
   //            return;
   //        }
   //
   //        // check if we are under a mesh
   //        var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
   //        if (pickInfo.hit) {
   //            currentMesh = pickInfo.pickedMesh;
   //            //startingPoint = getGroundPosition(evt);
   //
   //            if (startingPoint) { // we need to disconnect camera from canvas
   //                setTimeout(function () {
   //                    camera.detachControl(canvas);
   //                }, 0);
   //            }
   //        }
   //    };
   //
   //    var onPointerUp = function () {
   //        if (startingPoint) {
   //            camera.attachControl(canvas, true);
   //            startingPoint = null;
   //        }
   //    };
   //
   ////    var onPointerMove = function (evt) {
   ////        if (!startingPoint) {
   ////            return;
   ////        }
   ////
   ////        //var current = getGroundPosition(evt);
   ////
   ////        if (!current) {
   ////            return;
   ////        }
   ////
   ////        var diff = current.subtract(startingPoint);
   ////        currentMesh.position.addInPlace(diff);
   ////
   ////        startingPoint = current;
   ////
   ////    };
   //
   //    canvas.addEventListener("pointerdown", onPointerDown, false);
   //    canvas.addEventListener("pointerup", onPointerUp, false);
   //    //canvas.addEventListener("pointermove", onPointerMove, false);
   //
   //    scene.onDispose = function () {
   //        canvas.removeEventListener("pointerdown", onPointerDown);
   //        canvas.removeEventListener("pointerup", onPointerUp);
   //        //canvas.removeEventListener("pointermove", onPointerMove);
   //    };
   //
   //}
