import { B as G, a as K, M, O as q, F as U, S as T, U as F, V as g, W as k, H as R, N as J, C as Q, b as _, c as v, A as Z, d as $, R as ee, e as te, f as se, L as ie, g as re, h as oe, i as W, j as ae, k as ne, l as le, m as j, n as Y, o as p, p as he, P as ue, I as ce, q as fe, r as de, s as me, t as pe, u as ge, v as ve, w as L, x as be, G as A, y as we, D as z, z as N, E as O, J as xe, K as Me, Q as Te, T as ye, X as _e, Y as Ce, Z as Se, _ as X } from "./three.module.js";
function Ae(d, e = !1) {
  const s = d[0].index !== null, o = new Set(Object.keys(d[0].attributes)), t = new Set(Object.keys(d[0].morphAttributes)), i = {}, r = {}, n = d[0].morphTargetsRelative, a = new G();
  let u = 0;
  for (let l = 0; l < d.length; ++l) {
    const h = d[l];
    let f = 0;
    if (s !== (h.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const c in h.attributes) {
      if (!o.has(c))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + '. All geometries must have compatible attributes; make sure "' + c + '" attribute exists among all geometries, or in none of them.'), null;
      i[c] === void 0 && (i[c] = []), i[c].push(h.attributes[c]), f++;
    }
    if (f !== o.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ". Make sure all geometries have the same number of attributes."), null;
    if (n !== h.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const c in h.morphAttributes) {
      if (!t.has(c))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ".  .morphAttributes must be consistent throughout all geometries."), null;
      r[c] === void 0 && (r[c] = []), r[c].push(h.morphAttributes[c]);
    }
    if (e) {
      let c;
      if (s)
        c = h.index.count;
      else if (h.attributes.position !== void 0)
        c = h.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ". The geometry must have either an index or a position attribute"), null;
      a.addGroup(u, c, l), u += c;
    }
  }
  if (s) {
    let l = 0;
    const h = [];
    for (let f = 0; f < d.length; ++f) {
      const c = d[f].index;
      for (let m = 0; m < c.count; ++m)
        h.push(c.getX(m) + l);
      l += d[f].attributes.position.count;
    }
    a.setIndex(h);
  }
  for (const l in i) {
    const h = H(i[l]);
    if (!h)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + l + " attribute."), null;
    a.setAttribute(l, h);
  }
  for (const l in r) {
    const h = r[l][0].length;
    if (h === 0) break;
    a.morphAttributes = a.morphAttributes || {}, a.morphAttributes[l] = [];
    for (let f = 0; f < h; ++f) {
      const c = [];
      for (let b = 0; b < r[l].length; ++b)
        c.push(r[l][b][f]);
      const m = H(c);
      if (!m)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + l + " morphAttribute."), null;
      a.morphAttributes[l].push(m);
    }
  }
  return a;
}
function H(d) {
  let e, s, o, t = -1, i = 0;
  for (let u = 0; u < d.length; ++u) {
    const l = d[u];
    if (e === void 0 && (e = l.array.constructor), e !== l.array.constructor)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (s === void 0 && (s = l.itemSize), s !== l.itemSize)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (o === void 0 && (o = l.normalized), o !== l.normalized)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (t === -1 && (t = l.gpuType), t !== l.gpuType)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    i += l.count * s;
  }
  const r = new e(i), n = new K(r, s, o);
  let a = 0;
  for (let u = 0; u < d.length; ++u) {
    const l = d[u];
    if (l.isInterleavedBufferAttribute) {
      const h = a / s;
      for (let f = 0, c = l.count; f < c; f++)
        for (let m = 0; m < s; m++) {
          const b = l.getComponent(f, m);
          n.setComponent(f + h, m, b);
        }
    } else
      r.set(l.array, a);
    a += l.count * s;
  }
  return t !== void 0 && (n.gpuType = t), n;
}
const B = {
  name: "CopyShader",
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1 }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`
  )
};
class S {
  /**
   * Constructs a new pass.
   */
  constructor() {
    this.isPass = !0, this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1;
  }
  /**
   * Sets the size of the pass.
   *
   * @abstract
   * @param {number} width - The width to set.
   * @param {number} height - The height to set.
   */
  setSize() {
  }
  /**
   * This method holds the render logic of a pass. It must be implemented in all derived classes.
   *
   * @abstract
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
   * destination for the pass.
   * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
   * previous pass from this buffer.
   * @param {number} deltaTime - The delta time in seconds.
   * @param {boolean} maskActive - Whether masking is active or not.
   */
  render() {
    console.error("THREE.Pass: .render() must be implemented in derived pass.");
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever the pass is no longer used in your app.
   *
   * @abstract
   */
  dispose() {
  }
}
const Ee = new q(-1, 1, 1, -1, 0, 1);
class Pe extends G {
  constructor() {
    super(), this.setAttribute("position", new U([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), this.setAttribute("uv", new U([0, 2, 0, 0, 2, 0], 2));
  }
}
const ke = new Pe();
class I {
  /**
   * Constructs a new full screen quad.
   *
   * @param {?Material} material - The material to render te full screen quad with.
   */
  constructor(e) {
    this._mesh = new M(ke, e);
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever the instance is no longer used in your app.
   */
  dispose() {
    this._mesh.geometry.dispose();
  }
  /**
   * Renders the full screen quad.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   */
  render(e) {
    e.render(this._mesh, Ee);
  }
  /**
   * The quad's material.
   *
   * @type {?Material}
   */
  get material() {
    return this._mesh.material;
  }
  set material(e) {
    this._mesh.material = e;
  }
}
class Re extends S {
  /**
   * Constructs a new shader pass.
   *
   * @param {Object|ShaderMaterial} [shader] - A shader object holding vertex and fragment shader as well as
   * defines and uniforms. It's also valid to pass a custom shader material.
   * @param {string} [textureID='tDiffuse'] - The name of the texture uniform that should sample
   * the read buffer.
   */
  constructor(e, s = "tDiffuse") {
    super(), this.textureID = s, this.uniforms = null, this.material = null, e instanceof T ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = F.clone(e.uniforms), this.material = new T({
      name: e.name !== void 0 ? e.name : "unspecified",
      defines: Object.assign({}, e.defines),
      uniforms: this.uniforms,
      vertexShader: e.vertexShader,
      fragmentShader: e.fragmentShader
    })), this._fsQuad = new I(this.material);
  }
  /**
   * Performs the shader pass.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
   * destination for the pass.
   * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
   * previous pass from this buffer.
   * @param {number} deltaTime - The delta time in seconds.
   * @param {boolean} maskActive - Whether masking is active or not.
   */
  render(e, s, o) {
    this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = o.texture), this._fsQuad.material = this.material, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(s), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever the pass is no longer used in your app.
   */
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}
class V extends S {
  /**
   * Constructs a new mask pass.
   *
   * @param {Scene} scene - The 3D objects in this scene will define the mask.
   * @param {Camera} camera - The camera.
   */
  constructor(e, s) {
    super(), this.scene = e, this.camera = s, this.clear = !0, this.needsSwap = !1, this.inverse = !1;
  }
  /**
   * Performs a mask pass with the configured scene and camera.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
   * destination for the pass.
   * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
   * previous pass from this buffer.
   * @param {number} deltaTime - The delta time in seconds.
   * @param {boolean} maskActive - Whether masking is active or not.
   */
  render(e, s, o) {
    const t = e.getContext(), i = e.state;
    i.buffers.color.setMask(!1), i.buffers.depth.setMask(!1), i.buffers.color.setLocked(!0), i.buffers.depth.setLocked(!0);
    let r, n;
    this.inverse ? (r = 0, n = 1) : (r = 1, n = 0), i.buffers.stencil.setTest(!0), i.buffers.stencil.setOp(t.REPLACE, t.REPLACE, t.REPLACE), i.buffers.stencil.setFunc(t.ALWAYS, r, 4294967295), i.buffers.stencil.setClear(n), i.buffers.stencil.setLocked(!0), e.setRenderTarget(o), this.clear && e.clear(), e.render(this.scene, this.camera), e.setRenderTarget(s), this.clear && e.clear(), e.render(this.scene, this.camera), i.buffers.color.setLocked(!1), i.buffers.depth.setLocked(!1), i.buffers.color.setMask(!0), i.buffers.depth.setMask(!0), i.buffers.stencil.setLocked(!1), i.buffers.stencil.setFunc(t.EQUAL, 1, 4294967295), i.buffers.stencil.setOp(t.KEEP, t.KEEP, t.KEEP), i.buffers.stencil.setLocked(!0);
  }
}
class Be extends S {
  /**
   * Constructs a new clear mask pass.
   */
  constructor() {
    super(), this.needsSwap = !1;
  }
  /**
   * Performs the clear of the currently defined mask.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
   * destination for the pass.
   * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
   * previous pass from this buffer.
   * @param {number} deltaTime - The delta time in seconds.
   * @param {boolean} maskActive - Whether masking is active or not.
   */
  render(e) {
    e.state.buffers.stencil.setLocked(!1), e.state.buffers.stencil.setTest(!1);
  }
}
class Ue {
  /**
   * Constructs a new effect composer.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} [renderTarget] - This render target and a clone will
   * be used as the internal read and write buffers. If not given, the composer creates
   * the buffers automatically.
   */
  constructor(e, s) {
    if (this.renderer = e, this._pixelRatio = e.getPixelRatio(), s === void 0) {
      const o = e.getSize(new g());
      this._width = o.width, this._height = o.height, s = new k(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: R }), s.texture.name = "EffectComposer.rt1";
    } else
      this._width = s.width, this._height = s.height;
    this.renderTarget1 = s, this.renderTarget2 = s.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new Re(B), this.copyPass.material.blending = J, this.clock = new Q();
  }
  /**
   * Swaps the internal read/write buffers.
   */
  swapBuffers() {
    const e = this.readBuffer;
    this.readBuffer = this.writeBuffer, this.writeBuffer = e;
  }
  /**
   * Adds the given pass to the pass chain.
   *
   * @param {Pass} pass - The pass to add.
   */
  addPass(e) {
    this.passes.push(e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  /**
   * Inserts the given pass at a given index.
   *
   * @param {Pass} pass - The pass to insert.
   * @param {number} index - The index into the pass chain.
   */
  insertPass(e, s) {
    this.passes.splice(s, 0, e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  /**
   * Removes the given pass from the pass chain.
   *
   * @param {Pass} pass - The pass to remove.
   */
  removePass(e) {
    const s = this.passes.indexOf(e);
    s !== -1 && this.passes.splice(s, 1);
  }
  /**
   * Returns `true` if the pass for the given index is the last enabled pass in the pass chain.
   *
   * @param {number} passIndex - The pass index.
   * @return {boolean} Whether the pass for the given index is the last pass in the pass chain.
   */
  isLastEnabledPass(e) {
    for (let s = e + 1; s < this.passes.length; s++)
      if (this.passes[s].enabled)
        return !1;
    return !0;
  }
  /**
   * Executes all enabled post-processing passes in order to produce the final frame.
   *
   * @param {number} deltaTime - The delta time in seconds. If not given, the composer computes
   * its own time delta value.
   */
  render(e) {
    e === void 0 && (e = this.clock.getDelta());
    const s = this.renderer.getRenderTarget();
    let o = !1;
    for (let t = 0, i = this.passes.length; t < i; t++) {
      const r = this.passes[t];
      if (r.enabled !== !1) {
        if (r.renderToScreen = this.renderToScreen && this.isLastEnabledPass(t), r.render(this.renderer, this.writeBuffer, this.readBuffer, e, o), r.needsSwap) {
          if (o) {
            const n = this.renderer.getContext(), a = this.renderer.state.buffers.stencil;
            a.setFunc(n.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), a.setFunc(n.EQUAL, 1, 4294967295);
          }
          this.swapBuffers();
        }
        V !== void 0 && (r instanceof V ? o = !0 : r instanceof Be && (o = !1));
      }
    }
    this.renderer.setRenderTarget(s);
  }
  /**
   * Resets the internal state of the EffectComposer.
   *
   * @param {WebGLRenderTarget} [renderTarget] - This render target has the same purpose like
   * the one from the constructor. If set, it is used to setup the read and write buffers.
   */
  reset(e) {
    if (e === void 0) {
      const s = this.renderer.getSize(new g());
      this._pixelRatio = this.renderer.getPixelRatio(), this._width = s.width, this._height = s.height, e = this.renderTarget1.clone(), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
  }
  /**
   * Resizes the internal read and write buffers as well as all passes. Similar to {@link WebGLRenderer#setSize},
   * this method honors the current pixel ration.
   *
   * @param {number} width - The width in logical pixels.
   * @param {number} height - The height in logical pixels.
   */
  setSize(e, s) {
    this._width = e, this._height = s;
    const o = this._width * this._pixelRatio, t = this._height * this._pixelRatio;
    this.renderTarget1.setSize(o, t), this.renderTarget2.setSize(o, t);
    for (let i = 0; i < this.passes.length; i++)
      this.passes[i].setSize(o, t);
  }
  /**
   * Sets device pixel ratio. This is usually used for HiDPI device to prevent blurring output.
   * Setting the pixel ratio will automatically resize the composer.
   *
   * @param {number} pixelRatio - The pixel ratio to set.
   */
  setPixelRatio(e) {
    this._pixelRatio = e, this.setSize(this._width, this._height);
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever the composer is no longer used in your app.
   */
  dispose() {
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose();
  }
}
class Fe extends S {
  /**
   * Constructs a new render pass.
   *
   * @param {Scene} scene - The scene to render.
   * @param {Camera} camera - The camera.
   * @param {?Material} [overrideMaterial=null] - The override material. If set, this material is used
   * for all objects in the scene.
   * @param {?(number|Color|string)} [clearColor=null] - The clear color of the render pass.
   * @param {?number} [clearAlpha=null] - The clear alpha of the render pass.
   */
  constructor(e, s, o = null, t = null, i = null) {
    super(), this.scene = e, this.camera = s, this.overrideMaterial = o, this.clearColor = t, this.clearAlpha = i, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this._oldClearColor = new _();
  }
  /**
   * Performs a beauty pass with the configured scene and camera.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
   * destination for the pass.
   * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
   * previous pass from this buffer.
   * @param {number} deltaTime - The delta time in seconds.
   * @param {boolean} maskActive - Whether masking is active or not.
   */
  render(e, s, o) {
    const t = e.autoClear;
    e.autoClear = !1;
    let i, r;
    this.overrideMaterial !== null && (r = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (e.getClearColor(this._oldClearColor), e.setClearColor(this.clearColor, e.getClearAlpha())), this.clearAlpha !== null && (i = e.getClearAlpha(), e.setClearAlpha(this.clearAlpha)), this.clearDepth == !0 && e.clearDepth(), e.setRenderTarget(this.renderToScreen ? null : o), this.clear === !0 && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), e.render(this.scene, this.camera), this.clearColor !== null && e.setClearColor(this._oldClearColor), this.clearAlpha !== null && e.setClearAlpha(i), this.overrideMaterial !== null && (this.scene.overrideMaterial = r), e.autoClear = t;
  }
}
const De = {
  uniforms: {
    tDiffuse: { value: null },
    luminosityThreshold: { value: 1 },
    smoothWidth: { value: 1 },
    defaultColor: { value: new _(0) },
    defaultOpacity: { value: 0 }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`
  )
};
class C extends S {
  /**
   * Constructs a new Unreal Bloom pass.
   *
   * @param {Vector2} [resolution] - The effect's resolution.
   * @param {number} [strength=1] - The Bloom strength.
   * @param {number} radius - The Bloom radius.
   * @param {number} threshold - The luminance threshold limits which bright areas contribute to the Bloom effect.
   */
  constructor(e, s = 1, o, t) {
    super(), this.strength = s, this.radius = o, this.threshold = t, this.resolution = e !== void 0 ? new g(e.x, e.y) : new g(256, 256), this.clearColor = new _(0, 0, 0), this.needsSwap = !1, this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
    let i = Math.round(this.resolution.x / 2), r = Math.round(this.resolution.y / 2);
    this.renderTargetBright = new k(i, r, { type: R }), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = !1;
    for (let l = 0; l < this.nMips; l++) {
      const h = new k(i, r, { type: R });
      h.texture.name = "UnrealBloomPass.h" + l, h.texture.generateMipmaps = !1, this.renderTargetsHorizontal.push(h);
      const f = new k(i, r, { type: R });
      f.texture.name = "UnrealBloomPass.v" + l, f.texture.generateMipmaps = !1, this.renderTargetsVertical.push(f), i = Math.round(i / 2), r = Math.round(r / 2);
    }
    const n = De;
    this.highPassUniforms = F.clone(n.uniforms), this.highPassUniforms.luminosityThreshold.value = t, this.highPassUniforms.smoothWidth.value = 0.01, this.materialHighPassFilter = new T({
      uniforms: this.highPassUniforms,
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader
    }), this.separableBlurMaterials = [];
    const a = [3, 5, 7, 9, 11];
    i = Math.round(this.resolution.x / 2), r = Math.round(this.resolution.y / 2);
    for (let l = 0; l < this.nMips; l++)
      this.separableBlurMaterials.push(this._getSeparableBlurMaterial(a[l])), this.separableBlurMaterials[l].uniforms.invSize.value = new g(1 / i, 1 / r), i = Math.round(i / 2), r = Math.round(r / 2);
    this.compositeMaterial = this._getCompositeMaterial(this.nMips), this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture, this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture, this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture, this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture, this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture, this.compositeMaterial.uniforms.bloomStrength.value = s, this.compositeMaterial.uniforms.bloomRadius.value = 0.1;
    const u = [1, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms.bloomFactors.value = u, this.bloomTintColors = [new v(1, 1, 1), new v(1, 1, 1), new v(1, 1, 1), new v(1, 1, 1), new v(1, 1, 1)], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, this.copyUniforms = F.clone(B.uniforms), this.blendMaterial = new T({
      uniforms: this.copyUniforms,
      vertexShader: B.vertexShader,
      fragmentShader: B.fragmentShader,
      blending: Z,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    }), this._oldClearColor = new _(), this._oldClearAlpha = 1, this._basic = new $(), this._fsQuad = new I(null);
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever the pass is no longer used in your app.
   */
  dispose() {
    for (let e = 0; e < this.renderTargetsHorizontal.length; e++)
      this.renderTargetsHorizontal[e].dispose();
    for (let e = 0; e < this.renderTargetsVertical.length; e++)
      this.renderTargetsVertical[e].dispose();
    this.renderTargetBright.dispose();
    for (let e = 0; e < this.separableBlurMaterials.length; e++)
      this.separableBlurMaterials[e].dispose();
    this.compositeMaterial.dispose(), this.blendMaterial.dispose(), this._basic.dispose(), this._fsQuad.dispose();
  }
  /**
   * Sets the size of the pass.
   *
   * @param {number} width - The width to set.
   * @param {number} height - The height to set.
   */
  setSize(e, s) {
    let o = Math.round(e / 2), t = Math.round(s / 2);
    this.renderTargetBright.setSize(o, t);
    for (let i = 0; i < this.nMips; i++)
      this.renderTargetsHorizontal[i].setSize(o, t), this.renderTargetsVertical[i].setSize(o, t), this.separableBlurMaterials[i].uniforms.invSize.value = new g(1 / o, 1 / t), o = Math.round(o / 2), t = Math.round(t / 2);
  }
  /**
   * Performs the Bloom pass.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
   * destination for the pass.
   * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
   * previous pass from this buffer.
   * @param {number} deltaTime - The delta time in seconds.
   * @param {boolean} maskActive - Whether masking is active or not.
   */
  render(e, s, o, t, i) {
    e.getClearColor(this._oldClearColor), this._oldClearAlpha = e.getClearAlpha();
    const r = e.autoClear;
    e.autoClear = !1, e.setClearColor(this.clearColor, 0), i && e.state.buffers.stencil.setTest(!1), this.renderToScreen && (this._fsQuad.material = this._basic, this._basic.map = o.texture, e.setRenderTarget(null), e.clear(), this._fsQuad.render(e)), this.highPassUniforms.tDiffuse.value = o.texture, this.highPassUniforms.luminosityThreshold.value = this.threshold, this._fsQuad.material = this.materialHighPassFilter, e.setRenderTarget(this.renderTargetBright), e.clear(), this._fsQuad.render(e);
    let n = this.renderTargetBright;
    for (let a = 0; a < this.nMips; a++)
      this._fsQuad.material = this.separableBlurMaterials[a], this.separableBlurMaterials[a].uniforms.colorTexture.value = n.texture, this.separableBlurMaterials[a].uniforms.direction.value = C.BlurDirectionX, e.setRenderTarget(this.renderTargetsHorizontal[a]), e.clear(), this._fsQuad.render(e), this.separableBlurMaterials[a].uniforms.colorTexture.value = this.renderTargetsHorizontal[a].texture, this.separableBlurMaterials[a].uniforms.direction.value = C.BlurDirectionY, e.setRenderTarget(this.renderTargetsVertical[a]), e.clear(), this._fsQuad.render(e), n = this.renderTargetsVertical[a];
    this._fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, e.setRenderTarget(this.renderTargetsHorizontal[0]), e.clear(), this._fsQuad.render(e), this._fsQuad.material = this.blendMaterial, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, i && e.state.buffers.stencil.setTest(!0), this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(o), this._fsQuad.render(e)), e.setClearColor(this._oldClearColor, this._oldClearAlpha), e.autoClear = r;
  }
  // internals
  _getSeparableBlurMaterial(e) {
    const s = [];
    for (let o = 0; o < e; o++)
      s.push(0.39894 * Math.exp(-0.5 * o * o / (e * e)) / e);
    return new T({
      defines: {
        KERNEL_RADIUS: e
      },
      uniforms: {
        colorTexture: { value: null },
        invSize: { value: new g(0.5, 0.5) },
        // inverse texture size
        direction: { value: new g(0.5, 0.5) },
        gaussianCoefficients: { value: s }
        // precomputed Gaussian coefficients
      },
      vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`
    });
  }
  _getCompositeMaterial(e) {
    return new T({
      defines: {
        NUM_MIPS: e
      },
      uniforms: {
        blurTexture1: { value: null },
        blurTexture2: { value: null },
        blurTexture3: { value: null },
        blurTexture4: { value: null },
        blurTexture5: { value: null },
        bloomStrength: { value: 1 },
        bloomFactors: { value: null },
        bloomTintColors: { value: null },
        bloomRadius: { value: 0 }
      },
      vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`
    });
  }
}
C.BlurDirectionX = new g(1, 0);
C.BlurDirectionY = new g(0, 1);
const P = {
  name: "OutputShader",
  uniforms: {
    tDiffuse: { value: null },
    toneMappingExposure: { value: 1 }
  },
  vertexShader: (
    /* glsl */
    `
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`
  )
};
class Ge extends S {
  /**
   * Constructs a new output pass.
   */
  constructor() {
    super(), this.uniforms = F.clone(P.uniforms), this.material = new ee({
      name: P.name,
      uniforms: this.uniforms,
      vertexShader: P.vertexShader,
      fragmentShader: P.fragmentShader
    }), this._fsQuad = new I(this.material), this._outputColorSpace = null, this._toneMapping = null;
  }
  /**
   * Performs the output pass.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
   * destination for the pass.
   * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
   * previous pass from this buffer.
   * @param {number} deltaTime - The delta time in seconds.
   * @param {boolean} maskActive - Whether masking is active or not.
   */
  render(e, s, o) {
    this.uniforms.tDiffuse.value = o.texture, this.uniforms.toneMappingExposure.value = e.toneMappingExposure, (this._outputColorSpace !== e.outputColorSpace || this._toneMapping !== e.toneMapping) && (this._outputColorSpace = e.outputColorSpace, this._toneMapping = e.toneMapping, this.material.defines = {}, te.getTransfer(this._outputColorSpace) === se && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === ie ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === re ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === oe ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === W ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === ae ? this.material.defines.AGX_TONE_MAPPING = "" : this._toneMapping === ne ? this.material.defines.NEUTRAL_TONE_MAPPING = "" : this._toneMapping === le && (this.material.defines.CUSTOM_TONE_MAPPING = ""), this.material.needsUpdate = !0), this.renderToScreen === !0 ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(s), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever the pass is no longer used in your app.
   */
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}
class Ie extends j {
  constructor() {
    super();
    const e = new Y();
    e.deleteAttribute("uv");
    const s = new p({ side: he }), o = new p(), t = new ue(16777215, 900, 28, 2);
    t.position.set(0.418, 16.199, 0.3), this.add(t);
    const i = new M(e, s);
    i.position.set(-0.757, 13.219, 0.717), i.scale.set(31.713, 28.305, 28.591), this.add(i);
    const r = new ce(e, o, 6), n = new fe();
    n.position.set(-10.906, 2.009, 1.846), n.rotation.set(0, -0.195, 0), n.scale.set(2.328, 7.905, 4.651), n.updateMatrix(), r.setMatrixAt(0, n.matrix), n.position.set(-5.607, -0.754, -0.758), n.rotation.set(0, 0.994, 0), n.scale.set(1.97, 1.534, 3.955), n.updateMatrix(), r.setMatrixAt(1, n.matrix), n.position.set(6.167, 0.857, 7.803), n.rotation.set(0, 0.561, 0), n.scale.set(3.927, 6.285, 3.687), n.updateMatrix(), r.setMatrixAt(2, n.matrix), n.position.set(-2.017, 0.018, 6.124), n.rotation.set(0, 0.333, 0), n.scale.set(2.002, 4.566, 2.064), n.updateMatrix(), r.setMatrixAt(3, n.matrix), n.position.set(2.291, -0.756, -2.621), n.rotation.set(0, -0.286, 0), n.scale.set(1.546, 1.552, 1.496), n.updateMatrix(), r.setMatrixAt(4, n.matrix), n.position.set(-2.193, -0.369, -5.547), n.rotation.set(0, 0.516, 0), n.scale.set(3.875, 3.487, 2.986), n.updateMatrix(), r.setMatrixAt(5, n.matrix), this.add(r);
    const a = new M(e, y(50));
    a.position.set(-16.116, 14.37, 8.208), a.scale.set(0.1, 2.428, 2.739), this.add(a);
    const u = new M(e, y(50));
    u.position.set(-16.109, 18.021, -8.207), u.scale.set(0.1, 2.425, 2.751), this.add(u);
    const l = new M(e, y(17));
    l.position.set(14.904, 12.198, -1.832), l.scale.set(0.15, 4.265, 6.331), this.add(l);
    const h = new M(e, y(43));
    h.position.set(-0.462, 8.89, 14.52), h.scale.set(4.38, 5.441, 0.088), this.add(h);
    const f = new M(e, y(20));
    f.position.set(3.235, 11.486, -12.541), f.scale.set(2.5, 2, 0.1), this.add(f);
    const c = new M(e, y(100));
    c.position.set(0, 20, 0), c.scale.set(1, 0.1, 1), this.add(c);
  }
  /**
   * Frees internal resources. This method should be called
   * when the environment is no longer required.
   */
  dispose() {
    const e = /* @__PURE__ */ new Set();
    this.traverse((s) => {
      s.isMesh && (e.add(s.geometry), e.add(s.material));
    });
    for (const s of e)
      s.dispose();
  }
}
function y(d) {
  return new de({
    color: 0,
    emissive: 16777215,
    emissiveIntensity: d
  });
}
const E = X.clamp, D = X.lerp, Le = (d) => d * d * (3 - 2 * d), x = () => globalThis.scheduler?.yield?.() ?? new Promise((d) => setTimeout(d, 0));
class Ne {
  constructor(e) {
    this.canvas = e, this.mobile = innerWidth < 700, this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches, this.low = this.mobile || matchMedia("(pointer:coarse)").matches || (navigator.hardwareConcurrency || 8) < 5, this.paused = !1, this.hidden = !1, this.yaw = 0, this.targetYaw = 0, this.dragStart = null, this.lastDrag = 0, this.progress = 0, this.targetProgress = 0, this.pointer = new g(), this.smoothed = new g();
  }
  async initialize(e) {
    const s = this.canvas;
    await x(), this.renderer = new me({ canvas: s, antialias: !this.low, alpha: !0, powerPreference: "low-power" }), this.renderer.debug.checkShaderErrors = !1, this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.low ? 1.35 : 1.75)), this.renderer.setSize(innerWidth, innerHeight), this.renderer.outputColorSpace = pe, this.renderer.toneMapping = W, this.renderer.toneMappingExposure = 1.3, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = ge, this.scene = new j(), this.scene.background = new _(530471), this.scene.fog = new ve(530471, 0.035), await x();
    const o = new Ie();
    await this.renderer.compileAsync(o, new L(90, 1, 0.1, 100)), await x();
    const t = new be(this.renderer);
    this.environment = t.fromScene(o, 0.06).texture, this.scene.environment = this.environment, this.scene.environmentIntensity = 0.75, o.dispose(), t.dispose(), await x(), this.camera = new L(this.mobile ? 43 : 36, innerWidth / innerHeight, 0.1, 160), this.root = new A(), this.scene.add(this.root), this.scene.add(new we(12180991, 3688030, 2));
    const i = new z(16768947, 3.3);
    i.position.set(-8, 15, 8), i.castShadow = !0, i.shadow.mapSize.set(this.low ? 1024 : 2048, this.low ? 1024 : 2048), Object.assign(i.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 0.5, far: 60 }), i.shadow.bias = -4e-4, i.shadow.normalBias = 0.04, this.scene.add(i);
    const r = new z(10019039, 2);
    r.position.set(6, 5, -10), this.scene.add(r), this.materials = {
      stone: new p({ color: 13752264, roughness: 0.92 }),
      cream: new p({ color: 8428467, roughness: 0.45, metalness: 0.24 }),
      white: new p({ color: 12900069, roughness: 0.38, metalness: 0.3 }),
      sand: new p({ color: 13742218, roughness: 0.84 }),
      teal: new p({ color: 1669786, roughness: 0.5, metalness: 0.18 }),
      copper: new p({ color: 11562309, roughness: 0.35, metalness: 0.65 }),
      glass: new p({ color: 1654107, roughness: 0.12, metalness: 0.85 }),
      leaves: new p({ color: 5405536, roughness: 0.85, side: N }),
      light: new p({ color: 13107184, emissive: 8312302, emissiveIntensity: 1.1, roughness: 0.35 })
    }, this.box = new Y(1, 1, 1), this.cylinder = new O(1, 1, 1, 48), this.sphere = new xe(1, 16, 12), this.islands = [], this.pickables = [], this.people = [], this.bridges = [], this.rings = [];
    const n = [[-4.1, 1.1, 2.2, "help"], [2.7, 2.1, 1.9, "found"], [0.4, -3.5, 2.35, "volunteer"]];
    for (const [a, u] of n.entries())
      await x(), this.createIsland(u, a), await x(), this.batchArchitecture([this.islands[a]]);
    await x(), this.createBridges(), await x(), this.createWater(), await x(), this.low || (this.composer = new Ue(this.renderer), this.composer.addPass(new Fe(this.scene, this.camera)), this.bloom = new C(new g(innerWidth, innerHeight), 0.28, 0.45, 1.35), this.composer.addPass(this.bloom), this.composer.addPass(new Ge())), this.raycaster = new Me(), this.hit = new g(), this.clock = new Q(), this.lastFrame = 0, this.pathPosition = new v(), this.pathLook = new v(), this.look = new v(), this.camGoal = new v(), this.lookGoal = new v(), this.resize = () => {
      this.mobile = innerWidth < 700, this.camera.aspect = innerWidth / innerHeight, this.camera.fov = this.mobile ? 43 : 36, this.camera.updateProjectionMatrix(), this.renderer.setSize(innerWidth, innerHeight), this.composer?.setSize(innerWidth, innerHeight), this.updateScroll();
    }, this.updateScroll = () => {
      const a = document.getElementById("story-end");
      this.targetProgress = E(scrollY / Math.max(1, a.offsetTop - innerHeight * 0.2), 0, 1);
    }, this.onPointer = (a) => {
      if (this.dragStart) {
        const u = a.clientX - this.dragStart.x;
        Math.abs(u) > 5 && (this.targetYaw = E(this.dragStart.yaw + u * 4e-3, -0.5, 0.5), this.lastDrag = performance.now());
      }
      this.pointer.set(a.clientX / innerWidth * 2 - 1, a.clientY / innerHeight * 2 - 1), a.target === s && a.pointerType !== "touch" ? (this.hit.set(this.pointer.x, -this.pointer.y), this.raycaster.setFromCamera(this.hit, this.camera), this.hovered = this.raycaster.intersectObjects(this.pickables)[0]?.object, s.style.cursor = this.hovered ? "pointer" : "") : this.hovered = null;
    }, this.onClick = (a) => {
      if (a.target !== s || performance.now() - this.lastDrag < 350) return;
      this.hit.set(a.clientX / innerWidth * 2 - 1, -a.clientY / innerHeight * 2 + 1), this.raycaster.setFromCamera(this.hit, this.camera);
      const u = this.raycaster.intersectObjects(this.pickables);
      if (u.length) {
        const l = u[0].object.userData.action;
        document.querySelector(`[data-preview="${l}"]`)?.click(), document.getElementById("community").scrollIntoView({ behavior: this.reduced ? "instant" : "smooth" });
      }
    }, s.tabIndex = 0, s.style.touchAction = "pan-y", this.onDown = (a) => {
      a.target === s && (this.dragStart = { x: a.clientX, yaw: this.targetYaw }, s.setPointerCapture(a.pointerId));
    }, this.onUp = () => {
      this.dragStart = null;
    }, s.addEventListener("pointerdown", this.onDown), s.addEventListener("pointerup", this.onUp), s.addEventListener("pointercancel", this.onUp), s.addEventListener("keydown", (a) => {
      (a.key === "ArrowLeft" || a.key === "ArrowRight") && (a.preventDefault(), this.targetYaw = E(this.targetYaw + (a.key === "ArrowLeft" ? -0.12 : 0.12), -0.5, 0.5)), a.key === "Escape" && (this.targetYaw = 0);
    }), addEventListener("resize", this.resize), addEventListener("scroll", this.updateScroll, { passive: !0 }), addEventListener("pointermove", this.onPointer, { passive: !0 }), s.addEventListener("click", this.onClick), document.addEventListener("visibilitychange", () => {
      this.hidden = document.hidden;
    }), s.addEventListener("webglcontextlost", (a) => {
      a.preventDefault(), this.paused = !0, document.documentElement.classList.add("world-unavailable");
    }), this.updateScroll(), this.progress = this.targetProgress, this.render(0, !0, !1), await this.renderer.compileAsync(this.scene, this.camera), await x(), this.render(0, !0), e?.(), this.tick = this.tick.bind(this), this.raf = requestAnimationFrame(this.tick), window.__unityWorld = this;
  }
  mesh(e, s, o, t, i) {
    const r = new M(e, s);
    return t && r.position.set(...t), i && r.scale.set(...i), r.castShadow = !0, r.receiveShadow = !0, o.add(r), r;
  }
  block(e, s, o, t) {
    return this.mesh(this.box, s, e, o, t);
  }
  batchArchitecture(e = this.islands) {
    e.forEach((s) => {
      s.updateMatrixWorld(!0);
      const o = s.matrixWorld.clone().invert(), t = /* @__PURE__ */ new Map(), i = [];
      s.traverse((r) => {
        if (!r.isMesh || this.pickables.includes(r) || this.rings.includes(r)) return;
        const n = r.geometry.clone();
        n.applyMatrix4(new Te().multiplyMatrices(o, r.matrixWorld));
        const a = n.index ? n.toNonIndexed() : n;
        a !== n && n.dispose(), t.has(r.material) || t.set(r.material, []), t.get(r.material).push(a), i.push(r);
      }), i.forEach((r) => r.removeFromParent()), t.forEach((r, n) => {
        const a = Ae(r);
        a && this.mesh(a, n, s), r.forEach((u) => u.dispose());
      });
    });
  }
  createIsland([e, s, o, t], i) {
    const r = new A();
    r.position.set(e, 0, s), this.root.add(r), this.islands.push(r), r.userData = { base: new v(e, 0, s), name: t };
    const n = this.materials, a = this.block(r, n.stone.clone(), [0, -0.08, 0], [o * 1.8, 0.2, o * 1.7]);
    a.userData.action = t, this.pickables.push(a), this.block(r, n.cream, [0, 0.035, 0], [o * 1.72, 0.04, o * 1.62]), i === 0 && (this.apartment(r, -0.65, -0.45, 1.35, 5.8, 12, t), this.apartment(r, 0.9, 0.25, 0.95, 3.2, 6, t)), i === 1 && (this.apartment(r, -0.35, -0.3, 1.55, 7.1, 15, t), this.apartment(r, 0.85, 0.8, 0.8, 2.1, 4, t)), i === 2 && (this.apartment(r, -0.6, -0.45, 1.25, 4.7, 10, t), this.apartment(r, 0.9, -0.2, 1.05, 6, 13, t)), this.palm(r, -o * 0.67, o * 0.58, 1.15), this.palm(r, o * 0.65, -o * 0.6, 1.3), this.bench(r, 0.1, o * 0.66), this.person(r, -0.45, o * 0.62, 2461356), this.person(r, 0.75, o * 0.61, 13215083), this.block(r, n.leaves, [-o * 0.7, 0.16, -0.1], [0.18, 0.19, 1.1]);
    for (const u of [-1, 1])
      this.block(r, n.teal, [u * o * 0.7, 0.65, o * 0.66], [0.025, 1.2, 0.025]), this.block(r, n.light, [u * o * 0.7, 1.25, o * 0.66], [0.18, 0.035, 0.1]);
  }
  apartment(e, s, o, t, i, r, n) {
    const a = this.materials, u = new A();
    u.position.set(s, 0.06, o), e.add(u);
    const l = this.block(u, a.cream.clone(), [0, i / 2, 0], [t, i, t * 0.8]);
    l.userData.action = n, this.pickables.push(l), this.block(u, a.glass, [0, i / 2, t * 0.405], [t * 0.76, i * 0.93, 0.02]), this.block(u, a.glass, [t * 0.505, i / 2, 0], [0.02, i * 0.93, t * 0.62]);
    for (let h = 1; h <= r; h++) {
      const f = h * i / (r + 1);
      this.block(u, a.white, [0, f, t * 0.47], [t * 1.06, 0.065, 0.19]), this.block(u, a.white, [t * 0.54, f, 0], [0.1, 0.065, t * 0.88]);
      for (let c = 0; c < 3; c++) {
        const m = (c - 1) * t * 0.25;
        this.block(u, a.sand, [m, f - 0.17, t * 0.43], [0.025, 0.29, 0.035]), (h * 7 + c * 3 + r) % 5 === 0 && this.block(u, a.light, [m, f - 0.15, t * 0.422], [t * 0.16, 0.21, 0.018]);
      }
    }
    for (const h of [-t * 0.49, t * 0.49]) this.block(u, a.white, [h, i / 2, t * 0.44], [0.09, i, 0.1]);
    this.block(u, a.white, [0, i + 0.07, 0], [t * 1.08, 0.14, t * 0.9]), this.block(u, a.stone, [0, i + 0.22, -0.12], [t * 0.6, 0.2, t * 0.45]), this.block(u, a.glass, [0, 0.22, t * 0.42], [t * 0.4, 0.44, 0.04]), this.block(u, a.teal, [0, 0.52, t * 0.51], [t * 0.65, 0.07, 0.32]);
  }
  palm(e, s, o, t) {
    const i = this.materials;
    this.mesh(new O(0.035, 0.065, t, 7), i.sand, e, [s, t / 2 + 0.1, o]);
    for (let r = 0; r < 9; r++) {
      const n = r * Math.PI * 2 / 9, a = [], u = [], l = [];
      for (let f = 0; f <= 8; f++) {
        const c = f / 8, m = t * 0.57 * c, b = Math.sin(c * Math.PI) * t * 0.085;
        for (const w of [-1, 1])
          a.push(s + Math.cos(n) * m - Math.sin(n) * b * w, t + 0.1 + Math.sin(c * Math.PI) * 0.16 - c * c * 0.28, o + Math.sin(n) * m + Math.cos(n) * b * w), u.push(c, (w + 1) / 2);
        if (f < 8) {
          const w = f * 2;
          l.push(w, w + 1, w + 2, w + 1, w + 3, w + 2);
        }
      }
      const h = new G();
      h.setAttribute("position", new U(a, 3)), h.setAttribute("uv", new U(u, 2)), h.setIndex(l), h.computeVertexNormals(), this.mesh(h, i.leaves, e);
    }
  }
  person(e, s, o, t) {
    const i = new A();
    i.position.set(s, 0.1, o), e.add(i), this.mesh(new ye(0.055, 0.13, 3, 6), new p({ color: t, roughness: 0.8 }), i, [0, 0.16, 0]), this.mesh(this.sphere, this.materials.sand, i, [0, 0.33, 0], [0.056, 0.056, 0.056]), this.people.push({ group: i, x: s, z: o, phase: this.people.length * 1.7 });
  }
  bench(e, s, o) {
    this.block(e, this.materials.copper, [s, 0.24, o], [0.55, 0.07, 0.22]);
    for (const t of [-0.2, 0.2]) this.block(e, this.materials.teal, [s + t, 0.15, o], [0.035, 0.2, 0.17]);
  }
  tower(e) {
    const s = this.materials;
    for (let t = 0; t < 4; t++) this.mesh(this.cylinder, s.cream, e, [0, 0.12 + t * 0.09, 0], [0.8 - t * 0.1, 0.09, 0.8 - t * 0.1]);
    for (const t of [-0.2, 0.2]) {
      const i = this.block(e, s.white, [t, 1.5, 0], [0.15, 2.3, 0.25]);
      i.rotation.z = t > 0 ? -0.09 : 0.09;
    }
    const o = this.mesh(new _e(0.58, 0.085, 12, 64), s.copper, e, [0, 2.75, 0]);
    o.rotation.y = 0.3, this.rings.push(o), this.mesh(this.sphere, s.light, e, [0, 2.75, 0], [0.22, 0.22, 0.22]), this.block(e, s.teal, [0, 2.05, 0], [0.7, 0.12, 0.36]);
  }
  createBridges() {
    const e = new T({ transparent: !0, depthWrite: !1, side: N, uniforms: { uTime: { value: 0 }, uProgress: { value: 0 }, uColor: { value: new _(3581899) } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "varying vec2 vUv;uniform float uTime;uniform float uProgress;uniform vec3 uColor;void main(){float edge=1.-smoothstep(uProgress-.035,uProgress,vUv.x);float pulse=pow(max(0.,sin(vUv.x*22.-uTime*1.5)),18.);float a=(.36+pulse*.5)*edge;gl_FragColor=vec4(uColor+vec3(pulse*.3),a);}" });
    for (const [s, o] of [[0, 1], [1, 2], [2, 0]]) {
      const t = this.islands[s].position.clone(), i = this.islands[o].position.clone();
      t.y = 2.4, i.y = 3.2;
      const r = i.clone().sub(t).normalize();
      t.addScaledVector(r, 1.8), i.addScaledVector(r, -1.65);
      const n = t.clone().lerp(i, 0.5);
      n.y = 5.2;
      const a = new Ce(t, n, i), u = new Se(a, 64, 0.028, 6, !1), l = e.clone(), h = this.mesh(u, l, this.root);
      h.castShadow = !1;
      const f = [];
      this.bridges.push({ bridge: h, rails: f });
    }
  }
  createWater() {
    const e = new p({ color: 2636624, roughness: 0.96 });
    this.block(this.root, e, [0, -0.22, 0], [90, 0.14, 90]);
    const s = new p({ color: 9282485, roughness: 1 });
    for (let i = -6; i <= 6; i++) this.block(this.root, s, [i, -0.14, -0.25], [0.42, 0.012, 0.035]);
    for (let i = 0; i < 6; i++) this.block(this.root, s, [-1.5 + i * 0.16, -0.14, 2.5], [0.075, 0.012, 1.1]);
    const o = new p({ color: 2507612, roughness: 0.85 }), t = new A();
    this.root.add(t);
    for (let i = 0; i < 8; i++) {
      const r = 2.5 + i * 7 % 5 * 0.65;
      this.block(t, o, [-6 + i * 1.7, r / 2 - 0.15, -6], [1.05, r, 0.8]);
      for (let n = 1; n < r / 0.35; n++) this.block(t, s, [-6 + i * 1.7, n * 0.35, -5.59], [0.87, 0.025, 0.01]);
    }
    this.batchArchitecture([t]), this.waterMaterial = { uniforms: { uTime: { value: 0 } } };
  }
  render(e, s = !1, o = !0) {
    this.progress = D(this.progress, this.targetProgress, s || this.reduced ? 1 : 0.07);
    const t = this.progress;
    this.smoothed.lerp(this.pointer, this.reduced ? 0 : 0.035);
    const r = this.mobile ? [
      { p: 0, pos: [12, 7, 21], look: [0, 3, 0] },
      { p: 0.23, pos: [-1, 4, 9], look: [-4.7, 3.1, 1] },
      { p: 0.46, pos: [8, 4.8, 10], look: [2.5, 3.2, 2] },
      { p: 0.69, pos: [8, 20, 12], look: [0, 1, 0] },
      { p: 1, pos: [-10, 8, 20], look: [0, 2, 0] }
    ] : [
      { p: 0, pos: [11, 6.5, 17], look: [0, 2.8, 0] },
      { p: 0.23, pos: [-0.5, 3.5, 8], look: [-4.7, 2.8, 1] },
      { p: 0.46, pos: [9, 4, 9], look: [1.7, 2.5, 1] },
      { p: 0.69, pos: [2, 21, 10], look: [0, 1, 0] },
      { p: 1, pos: [-10, 7, 15], look: [0, 2.5, 0] }
    ];
    let n = 0;
    for (; n < r.length - 2 && t > r[n + 1].p; ) n++;
    const a = r[n], u = r[n + 1], l = Le(E((t - a.p) / (u.p - a.p), 0, 1));
    this.camGoal.fromArray(a.pos).lerp(this.pathPosition.fromArray(u.pos), l), this.lookGoal.fromArray(a.look).lerp(this.pathLook.fromArray(u.look), l), this.reduced || (this.camGoal.x += this.smoothed.x * 1.05, this.camGoal.y -= this.smoothed.y * 0.45), this.camera.clearViewOffset(), this.camera.position.copy(this.camGoal), this.camera.lookAt(this.lookGoal), this.yaw = D(this.yaw, this.targetYaw, this.reduced ? 1 : 0.07), this.root.rotation.y = this.yaw, this.reduced || (this.camera.position.x += Math.sin(e * 0.18) * 0.16, this.camera.position.y += Math.sin(e * 0.23) * 0.08), this.bridges.forEach(({ bridge: h, rails: f }, c) => {
      const m = E((t - 0.08 - c * 0.17) * 3, 0, 1);
      h.material.uniforms.uProgress.value = this.reduced ? 1 : m, h.material.uniforms.uTime.value = e, f.forEach((b) => {
        b.visible = m > 0.95 || this.reduced;
      });
    }), this.rings.forEach((h) => h.rotation.y = 0.3 + (this.reduced ? 0 : Math.sin(e * 0.25) * 0.16)), this.pickables.forEach((h) => {
      h.material.emissive.setHex(2852780), h.material.emissiveIntensity = D(h.material.emissiveIntensity || 0, h === this.hovered ? 0.18 : 0, 0.12);
    }), this.materials.light.emissiveIntensity = this.reduced ? 1.7 : 0.5 + t * 2.1, this.waterMaterial.uniforms.uTime.value = this.reduced ? 0 : e, o && (this.composer ? this.composer.render() : this.renderer.render(this.scene, this.camera));
  }
  tick(e) {
    if (this.raf = requestAnimationFrame(this.tick), this.hidden || this.paused) return;
    const s = this.low ? 33 : 16;
    if (e - this.lastFrame < s) return;
    const o = scrollY < document.getElementById("story-end").offsetTop, t = document.getElementById("join").getBoundingClientRect().top < innerHeight;
    !o && !t || this.reduced && Math.abs(this.progress - this.targetProgress) < 1e-4 && this.lastFrame > 0 || (this.lastFrame = e, this.render(this.clock.getElapsedTime()));
  }
  setPaused(e) {
    this.paused = e;
  }
  dispose() {
    cancelAnimationFrame(this.raf), removeEventListener("resize", this.resize), removeEventListener("scroll", this.updateScroll), removeEventListener("pointermove", this.onPointer), this.scene?.traverse((e) => {
      if (e.geometry?.dispose(), e.material)
        for (const s of [].concat(e.material)) s.dispose();
    }), this.environment?.dispose(), this.composer?.dispose(), this.renderer?.dispose();
  }
}
export {
  Ne as UnityWorld
};
