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

void main() {
    gl_Position = u_projection *
                  u_view       *
                  u_model      *
                  a_position;

    v_texcoord  = a_texcoord;
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

uniform vec3 u_color;

uniform sampler2D u_albedo;
uniform sampler2D u_metallic;
uniform sampler2D u_normal;
uniform sampler2D u_roughness;

varying vec2 v_texcoord;

void main() {
    gl_FragColor = vec4(texture2D(u_roughness, v_texcoord).rgb, 1.0);
}
`;
