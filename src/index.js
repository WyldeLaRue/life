import _ from 'lodash';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

import vertexShaderSource from './shaders/vertexShader.vert';
import fragment_shader_screen from './shaders/fragment_shader_screen.frag';
import fragment_shader_copy from './shaders/fragment_shader_copy.frag';
import fragment_shader_pass_1 from './shaders/fragment_shader_pass_1.frag';
// import fragment_shader_pass_1 from './shaders/glider.frag';


//** Declare Global Variables
var container;
var cameraRTT, camera, sceneRTT, sceneScreen, scene, renderer, zmesh1, zmesh2;
var mouseX = 0, mouseY = 0;
var innerWidth = window.innerWidth;
var innerHeight = window.innerHeight;

var innerWidth = 500;
var innerHeight = 500;

var windowHalfX = innerWidth / 2;
var windowHalfY = innerHeight / 2;
var rtTexture, material, quad;
var delta = 0.0010;

var texture3, material3, scene3;
var texture4, material4, scene4;
var controls;
init();
animate();

function init() {
    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 30, innerWidth / innerHeight, 1, 10000 );
    camera.position.z = 100;
    cameraRTT = new THREE.OrthographicCamera( innerWidth / - 2, innerWidth / 2, innerHeight / 2, innerHeight / - 2, - 10000, 10000 );
    cameraRTT.position.z = 100;
    //
    scene = new THREE.Scene();
    sceneRTT = new THREE.Scene();
    sceneScreen = new THREE.Scene();
    scene3 = new THREE.Scene();
    scene4 = new THREE.Scene();
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 ).normalize();
    sceneRTT.add( light );
    // scene.add(light);

    light = new THREE.DirectionalLight( 0xffaaaa, 1.5 );
    light.position.set( 0, 0, - 1 ).normalize();
    sceneRTT.add( light );

    scene.add(light);


    var ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);


    texture3 = new THREE.WebGLRenderTarget( innerWidth, innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    texture4 = new THREE.WebGLRenderTarget( innerWidth, innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );

    rtTexture = new THREE.WebGLRenderTarget( innerWidth, innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    material = new THREE.ShaderMaterial( {
        uniforms: { time: { value: 0.0 } },
        vertexShader: vertexShaderSource,
        fragmentShader: fragment_shader_pass_1,
    } );
    var materialScreen = new THREE.ShaderMaterial( {
        uniforms: { tDiffuse: { value: rtTexture.texture, width: innerWidth, height: innerHeight } },
        vertexShader: vertexShaderSource,
        fragmentShader: fragment_shader_copy,
        depthWrite: false
    } );
    var material3 = new THREE.ShaderMaterial( {
        uniforms: { tDiffuse: { value: texture3.texture, width: innerWidth, height: innerHeight } },
        vertexShader: vertexShaderSource,
        fragmentShader: fragment_shader_copy,
        depthWrite: false
    } );
    var material4 = new THREE.ShaderMaterial( {
        uniforms: { tDiffuse: { value: texture4.texture, width: innerWidth, height: innerHeight } },
        vertexShader: vertexShaderSource,
        fragmentShader: fragment_shader_screen,
        depthWrite: false
    } );

    var plane = new THREE.PlaneBufferGeometry( innerWidth, innerHeight );
    quad = new THREE.Mesh( plane, material );
    quad.position.z = - 100;
    sceneRTT.add( quad );

    quad = new THREE.Mesh( plane, materialScreen );
    quad.position.z = - 100;
    sceneScreen.add( quad );



    quad = new THREE.Mesh( plane, material3 );
    quad.position.z = - 100;
    scene3.add( quad );

    quad = new THREE.Mesh( plane, material4 );
    quad.position.z = - 100;
    scene4.add( quad );




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
    console.log(window.devicePixelRatio)
    renderer.setSize( innerWidth, innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // document.addEventListener( 'mousemove', onDocumentMouseMove, false );


    //** Render from fragment_shader_pass_1 onto texture3
    renderer.setRenderTarget( texture3 );
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

    //**  Render from texture3 onto texture4 using fragment_shader_screen
    renderer.setRenderTarget( texture4 );
    renderer.clear();
    renderer.render( scene3, cameraRTT );

    //** Render from texture4 onto texture3 using fragment_shader_screen
    renderer.setRenderTarget( texture3 );
    renderer.clear();
    renderer.render( scene4, cameraRTT );

    //** Render from texture3 onto rtTexture using {I'm not sure}
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