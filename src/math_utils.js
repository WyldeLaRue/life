import _ from 'lodash';

function area_circle_square_intersection(r, x_0, y_0) {
    var circle = x => Math.sqrt(r**2 - x**2);
    var left_endpoint = circle(x_0); 
    var right_endpoint = circle(x_0 + 1);
    var area = 1;

    // Both Above
    if (y_0 + 1 <= right_endpoint) {
        area = 1;
    }

    // Both Inside
    var circleIntegral = x => 0.5 * (x*Math.sqrt(r**2 - x**2) + (r**2)*Math.atan( x/Math.sqrt(r**2 - x**2) ) );
    if ( (y_0 + 1 >= left_endpoint) && (y_0 + 1 > right_endpoint) && (y_0 <= left_endpoint) && (y_0 <= right_endpoint) ) {
        var overcounted_area = Math.abs(circleIntegral(x_0) - circleIntegral(x_0 + 1));
        area = overcounted_area - y_0;

        // console.log("Both Inside")
    }

    // Both Below
    if (y_0 > left_endpoint) { 
        area = 0;

        // console.log("Both Below");
    }

    // Left Above, Right inside

    if ( (y_0 + 1 < left_endpoint) && (y_0 + 1 > right_endpoint) && (y_0 < right_endpoint) ){
        var intersection = Math.sqrt(r**2 - (y_0 + 1)**2);
        var overcounted_area = Math.abs(circleIntegral(x_0 + 1) - circleIntegral(intersection)) + (intersection - x_0)*(y_0 + 1);
        area = overcounted_area - y_0;

        // console.log("Left Above, Right inside");
    } 



    //Left inside, right below
    if ( (y_0 < left_endpoint) && (y_0 + 1 > left_endpoint) && (y_0 > right_endpoint) ) {
        var intersection = Math.sqrt(r**2 - (y_0)**2);
        var overcounted_area = Math.abs(circleIntegral(x_0) - circleIntegral(intersection));
        area = overcounted_area - y_0*(intersection - x_0); 

        // console.log("Left inside, right below");
    }

    // Left above, right below
    if ( (y_0 + 1 <= left_endpoint) && (y_0 > right_endpoint) ) {
        var top_intersection = Math.sqrt(r**2 - (y_0 + 1)**2);
        var bottom_intersection = Math.sqrt(r**2 - (y_0)**2);

        var left_area = (y_0 + 1)*(top_intersection - x_0);
        var middle_area = (circleIntegral(bottom_intersection) - circleIntegral(top_intersection));
        var right_area = 0;

        area = left_area + middle_area - y_0*(bottom_intersection - x_0);

        // console.log("Left above, right below");
    }
    return area;
}

export function generate_circle_kernel(dimension) {
    if (dimension == 1) {
        return [1.0];
    }

    var dim = dimension;
    var radius = 0.5*dim; 

    var kernel = new Array(dim**2);
    kernel.fill("default");
    var center_index = (dim**2 -1)/2;
    kernel[center_index] = 1.0;
    for (var i = 1;  i < (dim + 1)/2;  i++) {
        for (var j = 0; j <= i; j++) {
            var y = i - 0.5;
            var x = j - 0.5;
            var area = area_circle_square_intersection(radius, x, y);
            kernel[center_index + i + j*dim] = area;
            kernel[center_index + i - j*dim]= area; 
            kernel[center_index - i + j*dim] = area; 
            kernel[center_index - i - j*dim] = area;
            kernel[center_index + j + i*dim] = area;
            kernel[center_index + j - i*dim]= area; 
            kernel[center_index - j + i*dim] = area; 
            kernel[center_index - j - i*dim] = area;
        }
    }
    return kernel;
}


// @@ Matrices must be odd-dim and square.
// Subtracts M2 from M1
function matrix_difference(M1, M2) {
    if (M1.length % 2 != 0 || M2.length % 2 != 0) {
        console.log("only takes odd length matrices");
        return 
    }
    if (Math.sqrt(M1.length) % 1 != 0 || Math.sqrt(M2.length) % 1 != 0) {
        console.log("need square matrices");
        return
    }
    if (M1.length < M2.length) {
       console.log("M2 must be smaller");
       return
    }

    var dim1 = Math.sqrt(M1.length); 
    var dim2 = Math.sqrt(M2.length);
    var offset = (dim1 - dim2)/2;
    for (var i = 0; i < dim2; i++) {
        for (var j = 0; j < dim2; j++) {
            var index1 = i + d + dim1*(j + d);
            var index2 = i + dim2*j;
            M1[index1] = M1[index1] - M2[index2];
        }
    }

    return M1



}

export function generate_outer_circle_kernel(total_dim, inner_dim) {
    var total_kernel =  generate_circle_kernel(total_dim); 
    var inner_kernel = generate_circle_kernel(inner_dim); 
    var d = (total_dim - inner_dim)/2;
    for (var i = 0; i < inner_dim; i++) {
        for (var j = 0; j < inner_dim; j++) {
            var index = i + d + total_dim*(j + d);
            var inner_index = i + inner_dim*j;
            total_kernel[index] = total_kernel[index] - inner_kernel[inner_index];
        }
    }

    return total_kernel;
}

export function pretty_print_array_as_matrix(array) {
    var dim = Math.sqrt(array.length);
    var s = '';
    for (var i = 0; i < dim; i++) {
        var temp = '';
        for (var j=0; j < dim; j++) {
            temp = temp + array[i*dim + j].toFixed(3) + ' ';
        }
        s = s + temp + '\n';
    }
    return s;
}




function generate_sigmoid_kernel(kernel_radius) {

}
