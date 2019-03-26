varying vec2 vUv;
uniform float time;

float rand(vec2 co){
    return fract(sin(dot(co.xy + time, vec2(12.9898,78.233))) * 43758.5453);
}


float if_point(float x, float y) {
    vec2 check = vec2(x,y);
    float same = 0.0;
    float dim = 500.0;
    if(vUv.x*dim <= x) {
        if (vUv.x*dim > x - 1.0) {
            if(vUv.y*dim <= y) {
                if (vUv.y*dim > y - 1.0) {
                    same = 1.0;
                }
            };
        }
    }
    return same;
}   

void main() {
    float fill = 0.0;
    vec2 dim = vec2(500.0, 500.0); // This will fail if canvas is not 500x500

    fill = fill + if_point(250.0,250.0);    
    fill = fill + if_point(250.0,249.0);    
    fill = fill + if_point(250.0,248.0);    
    fill = fill + if_point(249.0,248.0);
    fill = fill + if_point(248.0,249.0);
    // float col = rand(vUv);
    // gl_FragColor = vec4(col, col, col, 1.0);
    gl_FragColor = vec4(fill, fill, fill, 1.0);
}