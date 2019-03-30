varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float width;
uniform float height;

vec4 neighbor(float dx, float dy) {
    float h = 1.0/500.0;
    vec2 coord = mod(vUv + vec2(h*dx, h*dy) + 1.0, 1.0); 
    vec4 col = texture2D( tDiffuse, coord);
    return col;
}

void main() {
    vec4 col1 = neighbor(1.0,1.0);
    vec4 col2 = neighbor(-1.0, -1.0);
    vec4 col3 = neighbor(1.0, -1.0);
    vec4 col4 = neighbor(-1.0, 1.0);
    vec4 col5 = neighbor(0.0, 1.0);
    vec4 col6 = neighbor(0.0, -1.0);
    vec4 col7 = neighbor(1.0, 0.0);
    vec4 col8 = neighbor(-1.0, 0.0);

    vec4 average = 0.125*(col1 + col2 + col3 + col4 + col5 + col6 + col7 + col8);
    vec4 self = texture2D( tDiffuse, vUv);
    float alive = 0.0;

    if(average.z >= 0.25) {
        if(average.z <= 0.3125) {
            if(self.z >= 0.5) {
               alive = 1.0;
            }
        } else {
            if(average.z <= 0.4375) {
                alive = 1.0;
            }
        }
    }

    // gl_FragColor = vec4(0, average.z, average.x, 1);
    gl_FragColor = vec4(0.5-0.5*alive, 0.3 + 0.7*alive, alive, alive);
}