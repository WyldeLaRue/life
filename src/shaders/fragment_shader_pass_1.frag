varying vec2 vUv;
uniform float time;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233)+time)) * 43758.5453);
}
void main() {
    vec2 d = floor(20.0 * vUv);
    float t = floor(2.0 * time);
    float col = mod(d.x + d.y + t, 2.0);
    // gl_FragColor = vec4(col, col, col, 1.0);
    gl_FragColor = vec4(rand(vUv), rand(vUv), rand(vUv), 1.0);
}