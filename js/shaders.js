const pbrVS =
    `
// =================================================
//        P B R   V E R T E X   S H A D E R
// =================================================
// @author: bdybisz
// -------------------------------------------------
attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec2 v_texcoord;
varying vec3 v_worldpos;
varying vec3 v_normal;

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
    v_normal = a_normal;
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

uniform mat4 u_lightModel;
uniform vec3 u_lightColor;
uniform vec3 u_camerapos;

varying vec2 v_texcoord;
varying vec3 v_worldpos;
varying vec3 v_normal;

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

// Using provided light model matrix,
// the method retrieves light position.
//
// @return vec3; point light position.
vec3
calculateLightPosition()
{
    return vec3(
        u_lightModel *
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

// @param albedo   Albedo coefficient of
//                 current fragment.
// @param metallic Metallic coefficient of
//                 current fragment.
//
// @return Surface reflection at zero
//         incidence.
vec3
calculateF0
(
    float albedo,
    float metallic
)
{
    // For dielectric materials an average
    // value is 0.04, so if the material gets
    // more and more metallic, we interpolate
    // between it and the fragment's albedo.
    // For fully metallic material,
    // F0 is just an albedo.
    vec3 F0 = vec3(0.04);
    F0[0] = mix(F0[0], albedo, metallic);
    F0[1] = mix(F0[1], albedo, metallic);
    F0[2] = mix(F0[2], albedo, metallic);
    return F0;
}

// Schlick's approximation of Fresnel
// equation.
// @param cosTheta Lambertian coefficient
//                 based on dot product of
//                 fragment's normal and
//                 incoming light ray.
// @param F0       Surface reflection
//                 at zero incidence.
//
// @return The ratio of light that gets
//         reflected on a surface.
vec3 fresnelSchlick
(
    float cosTheta,
    vec3 F0
)
{
    return F0 + (1.0 - F0) *
           pow(1.0 - cosTheta, 5.0);
}

void main() {
    vec3 lPos  = calculateLightPosition();
    vec3 fragN = normalize(v_normal);
    vec3 fragV = normalize(u_camerapos - v_worldpos);
    vec3 fragL = normalize(lPos - v_worldpos);
    vec3 fragH = normalize(lPos + fragV);

    float distance = length(v_worldpos - lPos);
    float atten    = calculateAttenuation(distance);
    vec3  radiance = atten * u_lightColor;

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
