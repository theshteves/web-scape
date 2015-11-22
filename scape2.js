$(document).ready(function() {

    uniforms1 = {
	time: { type: "f", value: 1.0 },
	resolution: { type: "v2", value: new THREE.Vector2() }
    };



    /* --- Global Variables --- */
    var container, stats;
    var camera, controls, scene, renderer;
    var cross;


    /* --- Main Event Loop --- */
    var clock = new THREE.Clock();
    var GEOMETRY = new THREE.SphereGeometry(8, 8, 8);
    var RENDER = new THREE.WebGLRenderer({antialias: true, autoClearFocus: false});
    init();
    animate();


    /* --- Init --- */
    function init() {
	camera = new THREE.PerspectiveCamera(60, $("#render").width() / window.innerHeight, 1, 1000);
	camera.position.x = 175;
	camera.position.y = 40;
	camera.position.z = 75;

	controls = new THREE.OrbitControls(camera, document.getElementById("render"));
	controls.addEventListener('change', render);

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.002);

	/**/

	var lavaTexture = new THREE.ImageUtils.loadTexture( './lava.jpg');
	lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
	// multiplier for distortion speed
	var baseSpeed = 0.02;
	// number of times to repeat texture in each direction
	var repeatS = repeatT = 4.0;

	// texture used to generate "randomness", distort all other textures
	var noiseTexture = new THREE.ImageUtils.loadTexture( './lava.jpg' );
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
	// magnitude of noise effect
	var noiseScale = 0.1;

	// texture to additively blend with base image texture
	var blendTexture = new THREE.ImageUtils.loadTexture( './lava.jpg' );
	blendTexture.wrapS = blendTexture.wrapT = THREE.RepeatWrapping;
	// multiplier for distortion speed
	var blendSpeed = 0.01;
	// adjust lightness/darkness of blended texture
	var blendOffset = 0.25;

	// texture to determine normal displacement
	var bumpTexture = noiseTexture;
	bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;
	// multiplier for distortion speed
	var bumpSpeed   = 0.002;
	// magnitude of normal displacement
	var bumpScale   = 5.0;

	// use "this." to create global object
	this.customUniforms = {
            baseTexture:    { type: "t", value: lavaTexture },
            baseSpeed:      { type: "f", value: baseSpeed },
            repeatS:        { type: "f", value: repeatS },
            repeatT:        { type: "f", value: repeatT },
            noiseTexture:   { type: "t", value: noiseTexture },
            noiseScale:     { type: "f", value: noiseScale },
            blendTexture:   { type: "t", value: blendTexture },
            blendSpeed:     { type: "f", value: blendSpeed },
            blendOffset:    { type: "f", value: blendOffset },
            bumpTexture:    { type: "t", value: bumpTexture },
            bumpSpeed:      { type: "f", value: bumpSpeed },
            bumpScale:      { type: "f", value: bumpScale },
            alpha:          { type: "f", value: 1.0 },
            time:           { type: "f", value: 1.0 }
	};

	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var customMaterial = new THREE.ShaderMaterial(
	    {
		uniforms: customUniforms,
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragment_shader3' ).textContent
	    }   );

	var ballGeometry = new THREE.SphereGeometry(1, 1, 1);
	var ball = new THREE.Mesh(  ballGeometry, customMaterial );
	ball.position.set(0, 0, 0);
	scene.add( ball );



	this.particleGeometry = new THREE.Geometry();
	for (var i = 0; i < 100; i++)
            particleGeometry.vertices.push( new THREE.Vector3(0,0,0) );

	var discTexture = THREE.ImageUtils.loadTexture( 'images/disc.png' );

	// properties that may vary from particle to particle.
	// these values can only be accessed in vertex shaders!
	//  (pass info to fragment shader via vColor.)
	this.attributes =
	    {
		customColor:     { type: 'c',  value: [] },
		customOffset:    { type: 'f',  value: [] },
	    };

	var particleCount = particleGeometry.vertices.length
	for( var v = 0; v < particleCount; v++ )
	{
            attributes.customColor.value[ v ] = new THREE.Color().setHSL( 1 - v / particleCount, 1.0, 0.5 );
            attributes.customOffset.value[ v ] = 6.282 * (v / particleCount); // not really used in shaders, move elsewhere
	}

	// values that are constant for all particles during a draw call
	this.uniforms =
	    {
		time:      { type: "f", value: 1.0 },
		texture:   { type: "t", value: discTexture },
	    };

	var shaderMaterial = new THREE.ShaderMaterial(
	    {
		uniforms:       uniforms,
		attributes:     attributes,
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		transparent: true, // alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5,
		// blending: THREE.AdditiveBlending, depthTest: false,
		// I guess you don't need to do a depth test if you are alpha blending
		//
	    });

	var particleCube = new THREE.ParticleSystem( particleGeometry, shaderMaterial );
	particleCube.position.set(0, 85, 0);
	particleCube.dynamic = true;
	// in order for transparency to work correctly, we need sortParticles = true.
	//  but this won't work if we calculate positions in vertex shader,
	//  so positions need to be calculated in the update function,
	//  and set in the geometry.vertices array
	particleCube.sortParticles = true;
	//scene.add( particleCube );


	var NODES = []; // { "url": [["url", "url", ...] , id] };


	function addLink(a, b) {

	    var lineGeometry = new THREE.Geometry();
	    var vertArray = lineGeometry.vertices;
	    vertArray.push( new THREE.Vector3((100-5*a)*Math.cos(a*Math.PI/4), (100-5*a)*Math.sin(a*Math.PI/4), 10*a),
			    new THREE.Vector3((100-5*b)*Math.cos(b*Math.PI/4), (100-5*b)*Math.sin(b*Math.PI/4), 10*b) );
	    lineGeometry.computeLineDistances();
	    var lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } );
	    var line = new THREE.Line( lineGeometry, lineMaterial );
	    scene.add(line);
	}



	function addNode(url, links) {

	    var n = NODES.length;
	    NODES.push([n, url, links]);
	    var material = new THREE.ShaderMaterial( {
		uniforms: uniforms1,
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById("fragment_shader3").textContent
	    });
            var mesh = new THREE.Mesh( GEOMETRY, material );
	    mesh.position.x = (100-5*n)*Math.cos(n*Math.PI/4);
	    mesh.position.y = (100-5*n)*Math.sin(n*Math.PI/4);
	    mesh.position.z = 10*n;
	    scene.add( mesh );

	    for (var j = 1; j < links.length; j++) {
		addLink(n, links[j]);//links[j]);
		//addLink(n, n + 1);//links[j]);
	    }
	}


	for (var a = 0; a < 16; a++) {

            addNode("google.com", [9, 8]);
	}

	var material = new THREE.MeshPhongMaterial({color: 0x00ff00, reflectivity: .1, emissive: 0xff0000});
	var mesh = new THREE.Mesh(GEOMETRY, material);
	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = 0;
	//mesh.rotation.x = eval(WHAT);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	//scene.add(mesh);

	light = new THREE.DirectionalLight(0x00ffff, 100);
	light.position.set(50, 100, 50);
	scene.add(light);

	light = new THREE.DirectionalLight(0x00ff00, 100);
	light.position.set(0, 50, 100);
	scene.add(light);

	light = new THREE.AmbientLight(0xffAA11);
	scene.add(light);

	renderer = RENDER;
	renderer.setClearColor(0x11051C, 1); //scene.fog.color
	renderer.setSize($("#render").width(), window.innerHeight);
	$("#canvas").replaceWith(renderer.domElement);

	$("#render").on('resize', function() {
	    camera.aspect = $("#render").width() / window.innerHeight;
	    camera.updateProjectionMatrix();

	    renderer.setSize($("#render").width(), window.innerHeight);
	    render();
	});
    }


    /* --- OnWindowResize --- */
    function onWindowResize( event ) {

	uniforms1.resolution.value.x = window.innerWidth;
	uniforms1.resolution.value.y = window.innerHeight;

	uniforms2.resolution.value.x = window.innerWidth;
	uniforms2.resolution.value.y = window.innerHeight;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

    }


    /* --- Animate --- */
    function animate() {
	render();
	requestAnimationFrame(animate);
	controls.update();
    }


    /* --- Render --- */
    function render() {

	var delta = clock.getDelta();
	uniforms1.time.value += delta * 5;
	//camera.rotateOnAxis((new THREE.Vector3(0, 1, 0)).normalize(), degInRad(1));
	/*
	  for (var i = 0; i < scene.children.length; i++) {

	  var object = scene.children[ i ];

	  object.rotation.y += delta * 0.5 * ( i % 2 ? 1 : -1 ) + i / 256;
	  object.rotation.x += delta * 0.5 * ( i % 2 ? -1 : 1 ) - i / 512;

	  }
	*/
	renderer.render( scene, camera );
    }
});
