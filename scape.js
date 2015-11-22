$(document).ready(function() {

    /*
    var myImage = new Image();
    myImage.src = "/Users/kneiser/Desktop/code/bring-it/lava.jpg";
    THREE.ImageUtils.crossOrigin = '';
    var mapOverlay = THREE.ImageUtils.loadTexture("/Users/kneiser/Desktop/code/bring-it/lava.jpg");
    */
    lightShaderData = {
	"vertex":[

	],
	"frag": [

	]
    }

    window.shaders = {}

    function NewOrb(radius, segments, rings){
	newOrb = new Orb();
	return newOrb.init(radius, segments, rings);
    }

    function Orb(){
	this.type = "orb";
    }

    Orb.prototype.init = function(radius, segments, rings){
	var self = this;
	self.waterTexture = new THREE.ImageUtils.loadTexture("/Users/kneiser/Desktop/code/bring-it/lava.jpg");
	self.waterTexture.wrapS = self.waterTexture.wrapT = THREE.RepeatWrapping;
	self.noiseTexture = new THREE.ImageUtils.loadTexture("/Users/kneiser/Desktop/code/bring-it/lava.jpg");
	var bumpTexture = self.noiseTexture;
	bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;

	//self.uniforms = {
	//    baseTexture:    { type: "t", value: self.waterTexture },
	//    baseSpeed:      { type: "f", value: .15 },
	//    noiseTexture:   { type: "t", value: self.noiseTexture },
	//    noiseScale:     { type: "f", value: 20 },
	//    alpha:          { type: "f", value: 1 },
	//    time:           { type: "f", value: 1.0 }
	//};
	var repeatS = repeatT = 4.0;
	self.uniforms = {
	    baseTexture:    { type: "t", value: self.waterTexture },
	    baseSpeed:      { type: "f", value: .2 },
	    repeatS:        { type: "f", value: repeatS },
	    repeatT:        { type: "f", value: repeatT },
	    noiseTexture:   { type: "t", value: self.noiseTexture },
	    noiseScale:     { type: "f", value: .5 },
	    blendTexture:   { type: "t", value: self.waterTexture },
	    blendSpeed:     { type: "f", value: .01 },
	    blendOffset:    { type: "f", value: .25 },
	    bumpTexture:    { type: "t", value: bumpTexture },
	    bumpSpeed:      { type: "f", value: 1.15 },
	    bumpScale:      { type: "f", value: 140.0 },
	    alpha:          { type: "f", value: 1.0 },
	    time:           { type: "f", value: 1.0 }
	};

	self._updateMaterial();
	//self.geom = new THREE.PlaneGeometry(radius, radius);
	self.geom = new THREE.SphereGeometry(radius, segments, rings);
	self.mesh = new THREE.Mesh(self.geom, self.material);
	$(document).on("animation", function(e, clock){
	    self.OnAnimation(e, clock);
	});
	return self;
    }

    Orb.prototype.OnAnimation = function(e, clock){
	var self = this;
	var newTime = self.uniforms.time.value + clock.getDelta() * 5;
	self.uniforms.time.value = newTime;
	//console.log(self.uniforms.time.value);
    }

    Orb.prototype._updateMaterial = function(){
	var self = this;
	self.material = new THREE.ShaderMaterial({
	    uniforms:self.uniforms,
	    fragmentShader : $("#fragmentShader").text(),
	    vertexShader : $("#vertexShader").text()
	});
	self.material.side = THREE.DoubleSide;
	//self.material.transparent = true;
    }

    /* ------------------------------------------------------------------------------- */


    // set the scene size
    var clock = new THREE.Clock();
    window.time = 0;
    var WIDTH = $(document).width(),
	HEIGHT = $(document).height();

    // set some camera attributes
    var VIEW_ANGLE = 45,
	ASPECT = WIDTH / HEIGHT,
	NEAR = 0.1,
	FAR = 10000;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#container');

    // create a WebGL renderer, camera
    // and a scene
    var renderer = new THREE.WebGLRenderer();
    var camera =
	new THREE.PerspectiveCamera(
	    VIEW_ANGLE,
	    ASPECT,
	    NEAR,
	    FAR);

    var scene = new THREE.Scene();

    // add the camera to the scene
    scene.add(camera);

    // the camera starts at 0,0,0
    // so pull it back
    camera.position.y = 10;
    camera.rotation.set(.03, 0, 0);
    camera.position.z = 300;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    $container.append(renderer.domElement);


    var radius = 50,
	segments = 32,
	rings = 16;

    var orb = NewOrb(radius, segments, rings);

    // create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!

    // add the sphere to the scene
    scene.add(orb.mesh);

    // create a point light
    var pointLight =
	new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);

    // draw!
    renderer.render(scene, camera);
    function onAnim(){
	var delta = clock.getDelta();
	renderer.render(scene, camera);
	$(document).trigger("animation", [clock]);
    }

    window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
	    window.webkitRequestAnimationFrame ||
	    window.mozRequestAnimationFrame    ||
	    function( callback ){
		window.setTimeout(callback, 1000 / 30);
	    };
    })();


    // usage:
    // instead of setInterval(render, 16) ....

    (function animloop(){
	requestAnimFrame(animloop)
	onAnim();
    })();
    // place the rAF *before* the render() to assure as close to
    // 60fps with the setTimeout fallback.

});
