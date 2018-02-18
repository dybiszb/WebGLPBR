const pbrVS =
    `
// =================================================
//        P B R   V E R T E X   S H A D E R
// =================================================
// @author: bdybisz
// -------------------------------------------------

attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec2 v_texcoord;
varying vec3 v_worldpos;

void main() {
    gl_Position = u_projection *
                  u_view       *
                  u_model      *
                  a_position;

    v_texcoord  = a_texcoord;
    v_worldpos  = vec3
                  (
                      u_model  *
                      a_position
                  );
}
`;

const pbrFG =
    `
// =================================================
//      P B R   F R A G M E N T   S H A D E R
// =================================================
// @author: bdybisz
// -------------------------------------------------
precision mediump float;

uniform sampler2D u_albedo;
uniform sampler2D u_metallic;
uniform sampler2D u_normal;
uniform sampler2D u_roughness;

varying vec2 v_texcoord;
varying vec3 v_worldpos;

// Returns attenuation coefficient,
// which simulates how a light source
// intensity is dimmed over a distance.
//
// @param distance - Distance between fragment
//                   position and a light source.
//                   NOTE: Must be > 0.
//
// @return <0.0; 1.0> value.
float
calculateAttenuation
(
      float distance
)
{
    return  1.0 / (distance * distance);
}

void main() {
    gl_FragColor = vec4(texture2D(u_roughness, v_texcoord).rgb, 1.0);
}
`;

const lightVS =
    `
// =================================================
//        L I G H T   V E R T E X   S H A D E R
// =================================================
// @author: bdybisz
// -------------------------------------------------

attribute vec4 a_position;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    gl_Position = u_projection *
                  u_view       *
                  u_model      *
                  a_position;
}
`;

const lightFG =
    `
// =================================================
//     L I G H T   F R A G M E N T   S H A D E R
// =================================================
// @author: bdybisz
// -------------------------------------------------
precision mediump float;

uniform vec3 u_color;

void main() {
    vec3 scaledColor = u_color / 255.0;
    gl_FragColor     = vec4
                       (
                         scaledColor,
                         1.0
                       );
}
`;
