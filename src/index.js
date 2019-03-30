import _ from 'lodash';
import './css/index.css';

import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

import vertexShaderSource from './shaders/vertexShader.vert';
// import rules_fragment_shader from './shaders/fragment_shader_screen.frag';
import rules_fragment_shader_preprocess from './shaders/smooth_life.frag';
import fragment_shader_copy from './shaders/fragment_shader_copy.frag';
import initial_condition_fragment_shader from './shaders/fragment_shader_pass_1.frag';
// import fragment_shader_pass_1 from './shaders/glider.frag';

import { generate_circle_kernel, generate_outer_circle_kernel } from './math_utils.js';
import { pretty_print_array_as_matrix } from './math_utils.js';


//** Declare Global Variables
var container;
var cameraRTT, camera, sceneRTT, sceneScreen, scene, renderer, zmesh1, zmesh2;
var innerWidth = window.innerWidth;
var innerHeight = window.innerHeight;

var innerWidth = 500;
var innerHeight = 500;

var windowHalfX = innerWidth / 2;
var windowHalfY = innerHeight / 2;
var rtTexture, material, quad;
var delta = 0.0010;

var lifeTexturePrimary, lifeMaterialHelper,  scene3;
var lifeTextureSecondary, lifeMaterialPrimary, scene4;
var controls;



// var kernel = [
//     1.0, 1.0, 1.0, 
//     1.0, 0.0, 1.0, 
//     1.0, 1.0, 1.0 
// ];


// I'll save this one as interesting. Lives a long time with our random initial configuration.
// var kernel = [
//     0.0, 1.0, 1.0, 1.0, 0.0,
//     0.0, 0.0, 0.0, 0.0, 0.0,
//     0.0, 1.0, 0.0, 1.0, 0.0,
//     0.0, 0.0, 0.0, 0.0, 0.0,
//     0.0, 1.0, 1.0, 1.0, 0.0
// ];




// var kernel = [
//     0.0, 0.0, 0.0, 0.0, 0.0,
//     0.0, 1.0, 1.0, 1.0, 0.0,
//     0.0, 0.0, 0.0, 0.0, 0.0,
//     0.0, 2.0, 1.0, 2.0, 0.0,
//     0.0, 0.0, 0.0, 0.0, 0.0
// ];

// var inner_kernel = [
//     0.0, 0.0, 0.0, 0.0, 0.0,
//     0.0, 0.0, 0.0, 0.0, 0.0,
//     0.0, 0.0, 1.0, 0.0, 0.0,
//     0.0, 0.0, 0.0, 0.0, 0.0,
//     0.0, 0.0, 0.0, 0.0, 0.0
// ];


var kernel = [
    1.0, 1.0, 1.0, 
    1.0, 0.0, 1.0, 
    1.0, 1.0, 1.0 
];


// var kernel = generate_outer_kernel(3,1);

var inner_kernel = [1.0];


var print_string = "Outer Kernel:\n" + pretty_print_array_as_matrix(kernel) + '\n\n'; 
print_string += 'Inner Kernel:\n' + pretty_print_array_as_matrix(inner_kernel);
console.log(print_string);

// This is hacky, but it's the only reasonable way to do it
var total_weight = kernel.reduce( (total,x) => total + x ); 
var normalized_kernel = kernel.map( x => x/total_weight)
var defines = "#define LEN " + kernel.length + "\n" + "#define SQRT_LEN " + Math.sqrt(kernel.length) + "\n";
var inner_kernel_total_weight = inner_kernel.reduce( (total,x) => total + x ); 
var normalized_inner_kernel = inner_kernel.map( x => x/inner_kernel_total_weight);
var inner_defines = "#define INNER_LEN " + inner_kernel.length + "\n" + "#define SQRT_INNER_LEN " + Math.sqrt(inner_kernel.length) + "\n";
var rules_fragment_shader = defines + inner_defines + rules_fragment_shader_preprocess;

init();
animate();






function init() {

    // Get our canvas
    container = document.createElement('div');
    document.body.appendChild(container);

    // First we setup our final screen
    camera = new THREE.PerspectiveCamera( 30, innerWidth / innerHeight, 1, 10000 );
    camera.position.z = 100;
    scene = new THREE.Scene();

    var light = new THREE.DirectionalLight( 0xffaaaa, 1.5 );
    light.position.set( 0, 0, - 1 ).normalize();
    scene.add(light);

    var ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);


    // Now we set up our RTT screen
    cameraRTT = new THREE.OrthographicCamera( innerWidth / - 2, innerWidth / 2, innerHeight / 2, innerHeight / - 2, - 10000, 10000 );
    cameraRTT.position.z = 100;
    sceneRTT = new THREE.Scene();

    var light = new THREE.DirectionalLight( 0xffffff ); // I don't really know why 
    light.position.set( 0, 0, 1 ).normalize();          // we're adding these lights.
    sceneRTT.add( light );

    var light = new THREE.DirectionalLight( 0xffaaaa, 1.5 );
    light.position.set( 0, 0, - 1 ).normalize();
    sceneRTT.add( light );

    // Now we set up extra scenes that we need for rendering/copying textures.
    sceneScreen = new THREE.Scene();
    scene3 = new THREE.Scene();
    scene4 = new THREE.Scene();

    // We declare the textures
    lifeTexturePrimary = new THREE.WebGLRenderTarget( innerWidth, innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    lifeTextureSecondary = new THREE.WebGLRenderTarget( innerWidth, innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    rtTexture = new THREE.WebGLRenderTarget( innerWidth, innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );

    // Now the materials.
    material = new THREE.ShaderMaterial( {
        uniforms: { time: { value: Math.random() } },
        vertexShader: vertexShaderSource,
        fragmentShader: initial_condition_fragment_shader,
    } );
    var materialScreen = new THREE.ShaderMaterial( {
        uniforms: { tDiffuse: { value: rtTexture.texture } },
        vertexShader: vertexShaderSource,
        fragmentShader: fragment_shader_copy,
        depthWrite: false
    } );
    var lifeMaterialHelper = new THREE.ShaderMaterial( {
        uniforms: { tDiffuse: { value: lifeTexturePrimary.texture }},
        vertexShader: vertexShaderSource,
        fragmentShader: fragment_shader_copy,
        depthWrite: false
    } );
    var lifeMaterialPrimary = new THREE.ShaderMaterial( {
        uniforms: { 
            tDiffuse: { value: lifeTextureSecondary.texture }, 
            kernel: { value: normalized_kernel },
            inner_kernel: { value: normalized_inner_kernel }
        },    
        vertexShader: vertexShaderSource,
        fragmentShader: rules_fragment_shader,
        depthWrite: false
    } );


    // These are going to play the role of the background 'wallpaper'.
    var plane = new THREE.PlaneBufferGeometry( innerWidth, innerHeight );
    quad = new THREE.Mesh( plane, material );
    quad.position.z = - 100;
    sceneRTT.add( quad );

    quad = new THREE.Mesh( plane, materialScreen );
    quad.position.z = - 100;
    sceneScreen.add( quad );

    quad = new THREE.Mesh( plane, lifeMaterialHelper );
    quad.position.z = - 100;
    scene3.add( quad );

    quad = new THREE.Mesh( plane, lifeMaterialPrimary );
    quad.position.z = - 100;
    scene4.add( quad );


    //** This handles the extra spheres.
    var n = 1;
    // var geometry = new THREE.PlaneBufferGeometry( innerWidth, innerHeight );
    // var geometry = new THREE.SphereBufferGeometry( 10, 64, 32 );
    // var geometry = new THREE.TorusKnotBufferGeometry( 10, 2, 64, 64 );
    var geometry = new THREE.TorusBufferGeometry( 10, 3, 64, 100 );
    var material2 = new THREE.MeshLambertMaterial({ color: 0xffffff, map: rtTexture.texture});
    for ( var j = 0; j < n; j ++ ) {
        for ( var i = 0; i < n; i ++ ) {
            var mesh = new THREE.Mesh( geometry, material2 );
            mesh.position.x = ( i - ( n - 1 ) / 2 ) * 20;
            mesh.position.y = ( j - ( n - 1 ) / 2 ) * 20;
            mesh.position.z = 0;
            mesh.rotation.y = - Math.PI / 2;
            scene.add( mesh );
        }
    }


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( innerWidth, innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    //** Render from fragment_shader_pass_1 onto lifeTexturePrimary
    renderer.setRenderTarget( lifeTexturePrimary );
    renderer.clear();
    renderer.render( sceneRTT, cameraRTT );
}

function animate() {
    requestAnimationFrame( animate );
    render();
}
function render() {
    // renderSphere();
    var time = Date.now() * 0.0015;
    material.uniforms[ "time" ].value = (material.uniforms[ "time" ].value + delta) % 1;
    controls.update();

    //**  Render from lifeTexturePrimary onto lifeTextureSecondary using rules_fragment_shader
    renderer.setRenderTarget( lifeTextureSecondary );
    renderer.clear();
    renderer.render( scene3, cameraRTT );

    //** Render from lifeTextureSecondary onto lifeTexturePrimary using rules_fragment_shader
    renderer.setRenderTarget( lifeTexturePrimary );
    renderer.clear();
    renderer.render( scene4, cameraRTT );

    //** Render from lifeTexturePrimary onto rtTexture using {I'm not sure}
    renderer.setRenderTarget( rtTexture );
    renderer.clear();
    renderer.render( scene3, cameraRTT );

    //** Render onto wallpaper behind objects
    renderer.setRenderTarget( null );
    renderer.clear();
    renderer.render( sceneScreen, cameraRTT );

    //** Clear rendering onto background.
    //** for some reason if we omit the previous block instead of rendering
    //** and then clearing it, we get self-rendering errors.
    // renderer.clear();    // <-- uncommenting this line disables the background

    // Render objects in front of background with same texture
    renderer.render( scene, camera );
}