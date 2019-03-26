
import _ from 'lodash';

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
    light = new THREE.DirectionalLight( 0xffaaaa, 1.5 );
    light.position.set( 0, 0, - 1 ).normalize();
    sceneRTT.add( light );


    texture3 = new THREE.WebGLRenderTarget( innerWidth, innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    texture4 = new THREE.WebGLRenderTarget( innerWidth, innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );

    rtTexture = new THREE.WebGLRenderTarget( innerWidth, innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    material = new THREE.ShaderMaterial( {
        uniforms: { time: { value: 0.0 } },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragment_shader_pass_1' ).textContent
    } );
    var materialScreen = new THREE.ShaderMaterial( {
        uniforms: { tDiffuse: { value: rtTexture.texture, width: innerWidth, height: innerHeight } },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragment_shader_copy' ).textContent,
        depthWrite: false
    } );
    var material3 = new THREE.ShaderMaterial( {
        uniforms: { tDiffuse: { value: texture3.texture, width: innerWidth, height: innerHeight } },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragment_shader_screen' ).textContent,
        depthWrite: false
    } );
    var material4 = new THREE.ShaderMaterial( {
        uniforms: { tDiffuse: { value: texture4.texture, width: innerWidth, height: innerHeight } },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragment_shader_screen' ).textContent,
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




    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    console.log(window.devicePixelRatio)
    renderer.setSize( innerWidth, innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    renderer.setRenderTarget( texture3 );
    renderer.clear();
    renderer.render( sceneRTT, cameraRTT );
}

function animate() {
    requestAnimationFrame( animate );
    render();
}
function render() {
    var time = Date.now() * 0.0015;
    material.uniforms[ "time" ].value = (material.uniforms[ "time" ].value + delta) % 1;
    // Render first scene into texture
    renderer.setRenderTarget( texture4 );
    renderer.clear();
    renderer.render( scene3, cameraRTT );

    renderer.setRenderTarget( texture3 );
    renderer.clear();
    renderer.render( scene4, cameraRTT );

    renderer.setRenderTarget( rtTexture );
    renderer.clear();
    renderer.render( scene3, cameraRTT );

    // Render full screen quad with generated texture
    renderer.setRenderTarget( null );
    renderer.clear();
    renderer.render( sceneScreen, cameraRTT );




    // Render second scene to screen
    // (using first scene as regular texture)
    renderer.render( scene, camera );
}
