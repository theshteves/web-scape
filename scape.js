$(document).ready(function() {


    /* --- Global Variables --- */
    var container, stats;
    var camera, controls, scene, renderer;
    var cross;


    /* --- Main Event Loop --- */
    var RENDER = new THREE.WebGLRenderer({antialias: true, autoClearFocus: false});
    var GEOMETRY = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    init();
    animate();


    /* --- Init --- */
    function init() {
	camera = new THREE.PerspectiveCamera(60, $("#canvas").width() / window.innerHeight, 1, 1000);

	controls = new THREE.OrbitControls(camera, document.getElementById("canvas"));
	controls.addEventListener('change', render);

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.002);

	var material = new THREE.MeshPhongMaterial({color: 0x00ff00, reflectivity: .1, emissive: 0xff0000});
	var mesh = new THREE.Mesh(GEOMETRY, material);
	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = 0;
	//mesh.rotation.x = eval(WHAT);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	scene.add( mesh );

	light = new THREE.AmbientLight(0xffAA11);
	scene.add(light);

	renderer = RENDER;
	renderer.setClearColor(0xffffff, 1); //scene.fog.color
	renderer.setSize($("#render").width(), window.innerHeight);
	$("#canvas").replaceWith(renderer.domElement);

	$("#render").on('resize', function() {
	    camera.aspect = $("#canvas").width() / window.innerHeight;
	    camera.updateProjectionMatrix();

	    renderer.setSize($("#canvas").width(), window.innerHeight);
	    render();
	});
    }


    /* --- Animate --- */
    function animate() {
	requestAnimationFrame(animate);
	controls.update();
    }


    /* --- Render --- */
    function render() {
	renderer.render(scene, camera);
    }
});
