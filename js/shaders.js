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

const float PI = 3.14159265359;

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

// @return Fragment's albedo coefficient.
float acquireAlbedo()
{
    return texture2D(u_albedo, v_texcoord).r;
}

// @return Fragment's metallic coefficient.
float acquireMetallic()
{
    return texture2D(u_metallic, v_texcoord).r;
}

// @return Fragment's roughness coefficient.
float acquireRoughness()
{
    return texture2D(u_roughness, v_texcoord).r;
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


float
distributionGGX
(
    vec3 N,
    vec3 H,
    float roughness
)
{
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}

float
geometrySchlickGGX
(
    float NdotV,
    float roughness
)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}

float
geometrySmith
(
    vec3 N,
    vec3 V,
    vec3 L,
    float roughness
)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = geometrySchlickGGX(NdotV, roughness);
    float ggx1  = geometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
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

    float albedo    = acquireAlbedo();
    float metallic  = acquireMetallic();
    float roughness = acquireRoughness();

    float NDF = distributionGGX(fragN, fragH, roughness);
    float G   = geometrySmith(fragN, fragV, fragL, roughness);

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
