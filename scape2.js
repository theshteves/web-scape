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
    var RENDER = new THREE.WebGLRenderer({antialias: true, autoClearFocus: false});
    var GEOMETRY = new THREE.SphereGeometry(8, 8, 8);
    init();
    animate();


    /* --- Init --- */
    function init() {
	camera = new THREE.PerspectiveCamera(60, $("#render").width() / window.innerHeight, 1, 1000);
	camera.position.x = 25;
	camera.position.y = 50;
	camera.position.z = 400;

	controls = new THREE.OrbitControls(camera, document.getElementById("render"));
	controls.addEventListener('change', render);

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.002);

	var params = [
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ],
	    [ 'fragment_shader3', uniforms1 ]
	];

	
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
    var bumpScale   = 3.0;
    
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
        
    var ballGeometry = new THREE.SphereGeometry(8, 8, 8);
    var ball = new THREE.Mesh(  ballGeometry, customMaterial );
    ball.position.set(0, 65, 160);
    scene.add( ball );

    for (var i = 0; i < params.length; i++) {

	    var material = new THREE.ShaderMaterial( {

		uniforms: params[ i ][ 1 ],
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById( params[ i ][ 0 ] ).textContent

	    });

	    var mesh = new THREE.Mesh( GEOMETRY, material );
	    mesh.position.x = 40*Math.cos(i*Math.PI/4);
	    mesh.position.y = 40*Math.sin(i*Math.PI/4);
	    mesh.position.z = 10*i;
	    scene.add( mesh );

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
