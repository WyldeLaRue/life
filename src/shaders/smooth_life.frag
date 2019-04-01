varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float kernel[ LEN ];
uniform float inner_kernel[ INNER_LEN ];

uniform float hx;
uniform float hy;

uniform float BIRTH_MIN;
uniform float BIRTH_MAX;
uniform float DEATH_MIN;
uniform float DEATH_MAX;
uniform float STEEPNESS_ODD;
uniform float STEEPNESS_EVEN;


vec4 neighbor(float dx, float dy) {
    // float h = 1.0/500.0;
    vec2 coord = mod(vUv + vec2(hx*dx, hy*dy) + 1.0, 1.0); 
    vec4 col = texture2D( tDiffuse, coord);
    return col;
}

vec4 computeKernel() {
    const int length = LEN;
    const int sqrt_length = SQRT_LEN;

    float weight;
    int j = 0;
    vec4 weighted_sum = vec4(0.0, 0.0, 0.0, 0.0);
    for(int i = 0;  i < length;  i++){
        int j = i - sqrt_length * (i/sqrt_length); // fancy way of taking i mod sqrt_length
        float x = float(i/sqrt_length) - float(sqrt_length/2);
        float y = float(j) - float(sqrt_length/2);
        weight = kernel[i];

        weighted_sum = weighted_sum + weight*neighbor(x,y);
    }

    return weighted_sum;
}

vec4 computeInnerKernel() {
    const int length = INNER_LEN;
    const int sqrt_length = SQRT_INNER_LEN;

    float weight;
    int j = 0;
    vec4 weighted_sum = vec4(0.0, 0.0, 0.0, 0.0);
    for(int i = 0;  i < length;  i++){
        int j = i - sqrt_length * (i/sqrt_length); // fancy way of taking i mod sqrt_length
        float x = float(i/sqrt_length) - float(sqrt_length/2);
        float y = float(j) - float(sqrt_length/2);
        weight = inner_kernel[i];
        weighted_sum = weighted_sum + weight*neighbor(x,y);
    }

    return weighted_sum;
}


float conwaysLifeCycle(float self_average, float neighbor_average) { 
    float s = self_average;
    float n = neighbor_average;
   
    float alive = 0.0;

    if(neighbor_average >= 0.1875) {             // if enough neighbors
        if(neighbor_average <= 0.3125) {         // if you have two neighbors
            if(self_average >= 0.5) {            // then live if you're alive
               alive = 1.0;
            }
        } else {                                 // Thus, you must have more than two neighbors
            if(neighbor_average <= 0.4375) {     // So if you also have fewer than 3 neighbors
                alive = 1.0;                     // Live reegardless if you're alive
            }
        }
    }

    return alive;
}

float sigma(float x, float x_0, float k) {
    float denom = 1.0 + exp(-k*(x - x_0));
    return 1.0/denom;
}

// sigma_M
float sigma_odd(float x, float a, float b) {
    float k = STEEPNESS_ODD;
    return a*sigma(x, 0.5, k) + b*(1.0-sigma(x, 0.5, k));
}

// sigma_N
float sigma_even(float x, float a, float b) {
    float k = STEEPNESS_EVEN;
    return sigma(x, a, k) * (1.0-sigma(x, b, k));
}

float sigma_life_cycle_function(float x, float y) {
    // min # neighbors to be born
    // const float b_0 = 2.8/8.0; // min # neighbors to be born
    // const float b_1 = 3.2/8.0; // max # neighbors to be born 
    // const float d_0 = 1.8/8.0; // min # neighbors to stay alive
    // const float d_1 = 3.2/8.0; // max # neighbors to stay alive

    // const float BIRTH_MIN = 0.222; // min # neighbors to be born
    // const float BIRTH_MAX = 0.273; // max # neighbors to be born 
    // const float DEATH_MIN = 0.222; // min # neighbors to stay alive
    // const float DEATH_MAX = 0.444; // max # neighbors to stay alive

    
    float u = sigma_odd(y, DEATH_MIN, BIRTH_MIN);
    float v = sigma_odd(y, DEATH_MAX, BIRTH_MAX);

    return sigma_even(x, u, v);
}


void main() {
    float inner_average = computeInnerKernel().z;
    float neighbor_average = computeKernel().z;
    float alive = sigma_life_cycle_function(neighbor_average, inner_average); 

    alive = clamp(alive, 0.0, 1.0);
    gl_FragColor = vec4(0.5-0.5*alive, 0.3 + 0.7*alive, alive, 1.0); //original colors
}

// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


//**** ColorTest
// void main() {
//     float alpha = sigma_life_cycle_function(vUv.x, vUv.y);
//     float a = clamp(alpha, 0.0, 1.0);
//     gl_FragColor = vec4(1.0 - a, 0, a, 1.0);
// }


   


