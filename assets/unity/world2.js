import { B as D, a as Y, M as x, O as X, F as B, S as M, U, V as g, W as P, H as k, N as K, C as H, b as _, c as v, A as q, d as J, R as Z, e as $, f as ee, L as te, g as se, h as ie, i as V, j as re, k as oe, l as ae, m as Q, n as W, o as p, p as ne, P as le, I as he, q as ue, r as ce, s as fe, t as de, u as me, v as pe, w as ge, x as ve, G as S, y as be, D as I, z as L, E as N, J as xe, K as we, Q as Me, T as Te, X as _e, Y as ye, Z as Ce, _ as j } from "./three.module.js";
function Se(d, e = !1) {
  const i = d[0].index !== null, o = new Set(Object.keys(d[0].attributes)), s = new Set(Object.keys(d[0].morphAttributes)), t = {}, r = {}, n = d[0].morphTargetsRelative, a = new D();
  let h = 0;
  for (let l = 0; l < d.length; ++l) {
    const u = d[l];
    let f = 0;
    if (i !== (u.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const c in u.attributes) {
      if (!o.has(c))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + '. All geometries must have compatible attributes; make sure "' + c + '" attribute exists among all geometries, or in none of them.'), null;
      t[c] === void 0 && (t[c] = []), t[c].push(u.attributes[c]), f++;
    }
    if (f !== o.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ". Make sure all geometries have the same number of attributes."), null;
    if (n !== u.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const c in u.morphAttributes) {
      if (!s.has(c))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ".  .morphAttributes must be consistent throughout all geometries."), null;
      r[c] === void 0 && (r[c] = []), r[c].push(u.morphAttributes[c]);
    }
    if (e) {
      let c;
      if (i)
        c = u.index.count;
      else if (u.attributes.position !== void 0)
        c = u.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + l + ". The geometry must have either an index or a position attribute"), null;
      a.addGroup(h, c, l), h += c;
    }
  }
  if (i) {
    let l = 0;
    const u = [];
    for (let f = 0; f < d.length; ++f) {
      const c = d[f].index;
      for (let m = 0; m < c.count; ++m)
        u.push(c.getX(m) + l);
      l += d[f].attributes.position.count;
    }
    a.setIndex(u);
  }
  for (const l in t) {
    const u = z(t[l]);
    if (!u)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + l + " attribute."), null;
    a.setAttribute(l, u);
  }
  for (const l in r) {
    const u = r[l][0].length;
    if (u === 0) break;
    a.morphAttributes = a.morphAttributes || {}, a.morphAttributes[l] = [];
    for (let f = 0; f < u; ++f) {
      const c = [];
      for (let w = 0; w < r[l].length; ++w)
        c.push(r[l][w][f]);
      const m = z(c);
      if (!m)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + l + " morphAttribute."), null;
      a.morphAttributes[l].push(m);
    }
  }
  return a;
}
function z(d) {
  let e, i, o, s = -1, t = 0;
  for (let h = 0; h < d.length; ++h) {
    const l = d[h];
    if (e === void 0 && (e = l.array.constructor), e !== l.array.constructor)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (i === void 0 && (i = l.itemSize), i !== l.itemSize)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (o === void 0 && (o = l.normalized), o !== l.normalized)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (s === -1 && (s = l.gpuType), s !== l.gpuType)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    t += l.count * i;
  }
  const r = new e(t), n = new Y(r, i, o);
  let a = 0;
  for (let h = 0; h < d.length; ++h) {
    const l = d[h];
    if (l.isInterleavedBufferAttribute) {
      const u = a / i;
      for (let f = 0, c = l.count; f < c; f++)
        for (let m = 0; m < i; m++) {
          const w = l.getComponent(f, m);
          n.setComponent(f + u, m, w);
        }
    } else
      r.set(l.array, a);
    a += l.count * i;
  }
  return s !== void 0 && (n.gpuType = s), n;
}
const R = {
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
class C {
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
const Ee = new X(-1, 1, 1, -1, 0, 1);
class Ae extends D {
  constructor() {
    super(), this.setAttribute("position", new B([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), this.setAttribute("uv", new B([0, 2, 0, 0, 2, 0], 2));
  }
}
const Pe = new Ae();
class G {
  /**
   * Constructs a new full screen quad.
   *
   * @param {?Material} material - The material to render te full screen quad with.
   */
  constructor(e) {
    this._mesh = new x(Pe, e);
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
class ke extends C {
  /**
   * Constructs a new shader pass.
   *
   * @param {Object|ShaderMaterial} [shader] - A shader object holding vertex and fragment shader as well as
   * defines and uniforms. It's also valid to pass a custom shader material.
   * @param {string} [textureID='tDiffuse'] - The name of the texture uniform that should sample
   * the read buffer.
   */
  constructor(e, i = "tDiffuse") {
    super(), this.textureID = i, this.uniforms = null, this.material = null, e instanceof M ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = U.clone(e.uniforms), this.material = new M({
      name: e.name !== void 0 ? e.name : "unspecified",
      defines: Object.assign({}, e.defines),
      uniforms: this.uniforms,
      vertexShader: e.vertexShader,
      fragmentShader: e.fragmentShader
    })), this._fsQuad = new G(this.material);
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
  render(e, i, o) {
    this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = o.texture), this._fsQuad.material = this.material, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(i), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever the pass is no longer used in your app.
   */
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}
class O extends C {
  /**
   * Constructs a new mask pass.
   *
   * @param {Scene} scene - The 3D objects in this scene will define the mask.
   * @param {Camera} camera - The camera.
   */
  constructor(e, i) {
    super(), this.scene = e, this.camera = i, this.clear = !0, this.needsSwap = !1, this.inverse = !1;
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
  render(e, i, o) {
    const s = e.getContext(), t = e.state;
    t.buffers.color.setMask(!1), t.buffers.depth.setMask(!1), t.buffers.color.setLocked(!0), t.buffers.depth.setLocked(!0);
    let r, n;
    this.inverse ? (r = 0, n = 1) : (r = 1, n = 0), t.buffers.stencil.setTest(!0), t.buffers.stencil.setOp(s.REPLACE, s.REPLACE, s.REPLACE), t.buffers.stencil.setFunc(s.ALWAYS, r, 4294967295), t.buffers.stencil.setClear(n), t.buffers.stencil.setLocked(!0), e.setRenderTarget(o), this.clear && e.clear(), e.render(this.scene, this.camera), e.setRenderTarget(i), this.clear && e.clear(), e.render(this.scene, this.camera), t.buffers.color.setLocked(!1), t.buffers.depth.setLocked(!1), t.buffers.color.setMask(!0), t.buffers.depth.setMask(!0), t.buffers.stencil.setLocked(!1), t.buffers.stencil.setFunc(s.EQUAL, 1, 4294967295), t.buffers.stencil.setOp(s.KEEP, s.KEEP, s.KEEP), t.buffers.stencil.setLocked(!0);
  }
}
class Re extends C {
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
class Be {
  /**
   * Constructs a new effect composer.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} [renderTarget] - This render target and a clone will
   * be used as the internal read and write buffers. If not given, the composer creates
   * the buffers automatically.
   */
  constructor(e, i) {
    if (this.renderer = e, this._pixelRatio = e.getPixelRatio(), i === void 0) {
      const o = e.getSize(new g());
      this._width = o.width, this._height = o.height, i = new P(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: k }), i.texture.name = "EffectComposer.rt1";
    } else
      this._width = i.width, this._height = i.height;
    this.renderTarget1 = i, this.renderTarget2 = i.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new ke(R), this.copyPass.material.blending = K, this.clock = new H();
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
  insertPass(e, i) {
    this.passes.splice(i, 0, e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  /**
   * Removes the given pass from the pass chain.
   *
   * @param {Pass} pass - The pass to remove.
   */
  removePass(e) {
    const i = this.passes.indexOf(e);
    i !== -1 && this.passes.splice(i, 1);
  }
  /**
   * Returns `true` if the pass for the given index is the last enabled pass in the pass chain.
   *
   * @param {number} passIndex - The pass index.
   * @return {boolean} Whether the pass for the given index is the last pass in the pass chain.
   */
  isLastEnabledPass(e) {
    for (let i = e + 1; i < this.passes.length; i++)
      if (this.passes[i].enabled)
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
    const i = this.renderer.getRenderTarget();
    let o = !1;
    for (let s = 0, t = this.passes.length; s < t; s++) {
      const r = this.passes[s];
      if (r.enabled !== !1) {
        if (r.renderToScreen = this.renderToScreen && this.isLastEnabledPass(s), r.render(this.renderer, this.writeBuffer, this.readBuffer, e, o), r.needsSwap) {
          if (o) {
            const n = this.renderer.getContext(), a = this.renderer.state.buffers.stencil;
            a.setFunc(n.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), a.setFunc(n.EQUAL, 1, 4294967295);
          }
          this.swapBuffers();
        }
        O !== void 0 && (r instanceof O ? o = !0 : r instanceof Re && (o = !1));
      }
    }
    this.renderer.setRenderTarget(i);
  }
  /**
   * Resets the internal state of the EffectComposer.
   *
   * @param {WebGLRenderTarget} [renderTarget] - This render target has the same purpose like
   * the one from the constructor. If set, it is used to setup the read and write buffers.
   */
  reset(e) {
    if (e === void 0) {
      const i = this.renderer.getSize(new g());
      this._pixelRatio = this.renderer.getPixelRatio(), this._width = i.width, this._height = i.height, e = this.renderTarget1.clone(), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
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
  setSize(e, i) {
    this._width = e, this._height = i;
    const o = this._width * this._pixelRatio, s = this._height * this._pixelRatio;
    this.renderTarget1.setSize(o, s), this.renderTarget2.setSize(o, s);
    for (let t = 0; t < this.passes.length; t++)
      this.passes[t].setSize(o, s);
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
class Ue extends C {
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
  constructor(e, i, o = null, s = null, t = null) {
    super(), this.scene = e, this.camera = i, this.overrideMaterial = o, this.clearColor = s, this.clearAlpha = t, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this._oldClearColor = new _();
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
  render(e, i, o) {
    const s = e.autoClear;
    e.autoClear = !1;
    let t, r;
    this.overrideMaterial !== null && (r = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (e.getClearColor(this._oldClearColor), e.setClearColor(this.clearColor, e.getClearAlpha())), this.clearAlpha !== null && (t = e.getClearAlpha(), e.setClearAlpha(this.clearAlpha)), this.clearDepth == !0 && e.clearDepth(), e.setRenderTarget(this.renderToScreen ? null : o), this.clear === !0 && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), e.render(this.scene, this.camera), this.clearColor !== null && e.setClearColor(this._oldClearColor), this.clearAlpha !== null && e.setClearAlpha(t), this.overrideMaterial !== null && (this.scene.overrideMaterial = r), e.autoClear = s;
  }
}
const Fe = {
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
class y extends C {
  /**
   * Constructs a new Unreal Bloom pass.
   *
   * @param {Vector2} [resolution] - The effect's resolution.
   * @param {number} [strength=1] - The Bloom strength.
   * @param {number} radius - The Bloom radius.
   * @param {number} threshold - The luminance threshold limits which bright areas contribute to the Bloom effect.
   */
  constructor(e, i = 1, o, s) {
    super(), this.strength = i, this.radius = o, this.threshold = s, this.resolution = e !== void 0 ? new g(e.x, e.y) : new g(256, 256), this.clearColor = new _(0, 0, 0), this.needsSwap = !1, this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
    let t = Math.round(this.resolution.x / 2), r = Math.round(this.resolution.y / 2);
    this.renderTargetBright = new P(t, r, { type: k }), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = !1;
    for (let l = 0; l < this.nMips; l++) {
      const u = new P(t, r, { type: k });
      u.texture.name = "UnrealBloomPass.h" + l, u.texture.generateMipmaps = !1, this.renderTargetsHorizontal.push(u);
      const f = new P(t, r, { type: k });
      f.texture.name = "UnrealBloomPass.v" + l, f.texture.generateMipmaps = !1, this.renderTargetsVertical.push(f), t = Math.round(t / 2), r = Math.round(r / 2);
    }
    const n = Fe;
    this.highPassUniforms = U.clone(n.uniforms), this.highPassUniforms.luminosityThreshold.value = s, this.highPassUniforms.smoothWidth.value = 0.01, this.materialHighPassFilter = new M({
      uniforms: this.highPassUniforms,
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader
    }), this.separableBlurMaterials = [];
    const a = [3, 5, 7, 9, 11];
    t = Math.round(this.resolution.x / 2), r = Math.round(this.resolution.y / 2);
    for (let l = 0; l < this.nMips; l++)
      this.separableBlurMaterials.push(this._getSeparableBlurMaterial(a[l])), this.separableBlurMaterials[l].uniforms.invSize.value = new g(1 / t, 1 / r), t = Math.round(t / 2), r = Math.round(r / 2);
    this.compositeMaterial = this._getCompositeMaterial(this.nMips), this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture, this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture, this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture, this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture, this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture, this.compositeMaterial.uniforms.bloomStrength.value = i, this.compositeMaterial.uniforms.bloomRadius.value = 0.1;
    const h = [1, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms.bloomFactors.value = h, this.bloomTintColors = [new v(1, 1, 1), new v(1, 1, 1), new v(1, 1, 1), new v(1, 1, 1), new v(1, 1, 1)], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, this.copyUniforms = U.clone(R.uniforms), this.blendMaterial = new M({
      uniforms: this.copyUniforms,
      vertexShader: R.vertexShader,
      fragmentShader: R.fragmentShader,
      blending: q,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    }), this._oldClearColor = new _(), this._oldClearAlpha = 1, this._basic = new J(), this._fsQuad = new G(null);
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
  setSize(e, i) {
    let o = Math.round(e / 2), s = Math.round(i / 2);
    this.renderTargetBright.setSize(o, s);
    for (let t = 0; t < this.nMips; t++)
      this.renderTargetsHorizontal[t].setSize(o, s), this.renderTargetsVertical[t].setSize(o, s), this.separableBlurMaterials[t].uniforms.invSize.value = new g(1 / o, 1 / s), o = Math.round(o / 2), s = Math.round(s / 2);
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
  render(e, i, o, s, t) {
    e.getClearColor(this._oldClearColor), this._oldClearAlpha = e.getClearAlpha();
    const r = e.autoClear;
    e.autoClear = !1, e.setClearColor(this.clearColor, 0), t && e.state.buffers.stencil.setTest(!1), this.renderToScreen && (this._fsQuad.material = this._basic, this._basic.map = o.texture, e.setRenderTarget(null), e.clear(), this._fsQuad.render(e)), this.highPassUniforms.tDiffuse.value = o.texture, this.highPassUniforms.luminosityThreshold.value = this.threshold, this._fsQuad.material = this.materialHighPassFilter, e.setRenderTarget(this.renderTargetBright), e.clear(), this._fsQuad.render(e);
    let n = this.renderTargetBright;
    for (let a = 0; a < this.nMips; a++)
      this._fsQuad.material = this.separableBlurMaterials[a], this.separableBlurMaterials[a].uniforms.colorTexture.value = n.texture, this.separableBlurMaterials[a].uniforms.direction.value = y.BlurDirectionX, e.setRenderTarget(this.renderTargetsHorizontal[a]), e.clear(), this._fsQuad.render(e), this.separableBlurMaterials[a].uniforms.colorTexture.value = this.renderTargetsHorizontal[a].texture, this.separableBlurMaterials[a].uniforms.direction.value = y.BlurDirectionY, e.setRenderTarget(this.renderTargetsVertical[a]), e.clear(), this._fsQuad.render(e), n = this.renderTargetsVertical[a];
    this._fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, e.setRenderTarget(this.renderTargetsHorizontal[0]), e.clear(), this._fsQuad.render(e), this._fsQuad.material = this.blendMaterial, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, t && e.state.buffers.stencil.setTest(!0), this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(o), this._fsQuad.render(e)), e.setClearColor(this._oldClearColor, this._oldClearAlpha), e.autoClear = r;
  }
  // internals
  _getSeparableBlurMaterial(e) {
    const i = [];
    for (let o = 0; o < e; o++)
      i.push(0.39894 * Math.exp(-0.5 * o * o / (e * e)) / e);
    return new M({
      defines: {
        KERNEL_RADIUS: e
      },
      uniforms: {
        colorTexture: { value: null },
        invSize: { value: new g(0.5, 0.5) },
        // inverse texture size
        direction: { value: new g(0.5, 0.5) },
        gaussianCoefficients: { value: i }
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
    return new M({
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
y.BlurDirectionX = new g(1, 0);
y.BlurDirectionY = new g(0, 1);
const A = {
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
class De extends C {
  /**
   * Constructs a new output pass.
   */
  constructor() {
    super(), this.uniforms = U.clone(A.uniforms), this.material = new Z({
      name: A.name,
      uniforms: this.uniforms,
      vertexShader: A.vertexShader,
      fragmentShader: A.fragmentShader
    }), this._fsQuad = new G(this.material), this._outputColorSpace = null, this._toneMapping = null;
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
  render(e, i, o) {
    this.uniforms.tDiffuse.value = o.texture, this.uniforms.toneMappingExposure.value = e.toneMappingExposure, (this._outputColorSpace !== e.outputColorSpace || this._toneMapping !== e.toneMapping) && (this._outputColorSpace = e.outputColorSpace, this._toneMapping = e.toneMapping, this.material.defines = {}, $.getTransfer(this._outputColorSpace) === ee && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === te ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === se ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === ie ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === V ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === re ? this.material.defines.AGX_TONE_MAPPING = "" : this._toneMapping === oe ? this.material.defines.NEUTRAL_TONE_MAPPING = "" : this._toneMapping === ae && (this.material.defines.CUSTOM_TONE_MAPPING = ""), this.material.needsUpdate = !0), this.renderToScreen === !0 ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(i), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever the pass is no longer used in your app.
   */
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}
class Ge extends Q {
  constructor() {
    super();
    const e = new W();
    e.deleteAttribute("uv");
    const i = new p({ side: ne }), o = new p(), s = new le(16777215, 900, 28, 2);
    s.position.set(0.418, 16.199, 0.3), this.add(s);
    const t = new x(e, i);
    t.position.set(-0.757, 13.219, 0.717), t.scale.set(31.713, 28.305, 28.591), this.add(t);
    const r = new he(e, o, 6), n = new ue();
    n.position.set(-10.906, 2.009, 1.846), n.rotation.set(0, -0.195, 0), n.scale.set(2.328, 7.905, 4.651), n.updateMatrix(), r.setMatrixAt(0, n.matrix), n.position.set(-5.607, -0.754, -0.758), n.rotation.set(0, 0.994, 0), n.scale.set(1.97, 1.534, 3.955), n.updateMatrix(), r.setMatrixAt(1, n.matrix), n.position.set(6.167, 0.857, 7.803), n.rotation.set(0, 0.561, 0), n.scale.set(3.927, 6.285, 3.687), n.updateMatrix(), r.setMatrixAt(2, n.matrix), n.position.set(-2.017, 0.018, 6.124), n.rotation.set(0, 0.333, 0), n.scale.set(2.002, 4.566, 2.064), n.updateMatrix(), r.setMatrixAt(3, n.matrix), n.position.set(2.291, -0.756, -2.621), n.rotation.set(0, -0.286, 0), n.scale.set(1.546, 1.552, 1.496), n.updateMatrix(), r.setMatrixAt(4, n.matrix), n.position.set(-2.193, -0.369, -5.547), n.rotation.set(0, 0.516, 0), n.scale.set(3.875, 3.487, 2.986), n.updateMatrix(), r.setMatrixAt(5, n.matrix), this.add(r);
    const a = new x(e, T(50));
    a.position.set(-16.116, 14.37, 8.208), a.scale.set(0.1, 2.428, 2.739), this.add(a);
    const h = new x(e, T(50));
    h.position.set(-16.109, 18.021, -8.207), h.scale.set(0.1, 2.425, 2.751), this.add(h);
    const l = new x(e, T(17));
    l.position.set(14.904, 12.198, -1.832), l.scale.set(0.15, 4.265, 6.331), this.add(l);
    const u = new x(e, T(43));
    u.position.set(-0.462, 8.89, 14.52), u.scale.set(4.38, 5.441, 0.088), this.add(u);
    const f = new x(e, T(20));
    f.position.set(3.235, 11.486, -12.541), f.scale.set(2.5, 2, 0.1), this.add(f);
    const c = new x(e, T(100));
    c.position.set(0, 20, 0), c.scale.set(1, 0.1, 1), this.add(c);
  }
  /**
   * Frees internal resources. This method should be called
   * when the environment is no longer required.
   */
  dispose() {
    const e = /* @__PURE__ */ new Set();
    this.traverse((i) => {
      i.isMesh && (e.add(i.geometry), e.add(i.material));
    });
    for (const i of e)
      i.dispose();
  }
}
function T(d) {
  return new ce({
    color: 0,
    emissive: 16777215,
    emissiveIntensity: d
  });
}
const E = j.clamp, F = j.lerp, Ie = (d) => d * d * (3 - 2 * d);
class Ne {
  constructor(e, i) {
    this.canvas = e, this.mobile = innerWidth < 700, this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches, this.low = this.mobile || matchMedia("(pointer:coarse)").matches || (navigator.hardwareConcurrency || 8) < 5, this.paused = !1, this.hidden = !1, this.yaw = 0, this.targetYaw = 0, this.dragStart = null, this.lastDrag = 0, this.progress = 0, this.targetProgress = 0, this.pointer = new g(), this.smoothed = new g(), this.renderer = new fe({ canvas: e, antialias: !this.low, alpha: !0, powerPreference: "low-power" }), this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.low ? 1.35 : 1.75)), this.renderer.setSize(innerWidth, innerHeight), this.renderer.outputColorSpace = de, this.renderer.toneMapping = V, this.renderer.toneMappingExposure = 1.3, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = me, this.scene = new Q(), this.scene.background = new _(530471), this.scene.fog = new pe(530471, 0.035);
    const o = new ge(this.renderer), s = new Ge();
    this.environment = o.fromScene(s, 0.06).texture, this.scene.environment = this.environment, this.scene.environmentIntensity = 0.75, s.dispose(), o.dispose(), this.camera = new ve(this.mobile ? 43 : 36, innerWidth / innerHeight, 0.1, 160), this.root = new S(), this.scene.add(this.root), this.scene.add(new be(12180991, 3688030, 2));
    const t = new I(16768947, 3.3);
    t.position.set(-8, 15, 8), t.castShadow = !0, t.shadow.mapSize.set(this.low ? 1024 : 2048, this.low ? 1024 : 2048), Object.assign(t.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 0.5, far: 60 }), t.shadow.bias = -4e-4, t.shadow.normalBias = 0.04, this.scene.add(t);
    const r = new I(10019039, 2);
    r.position.set(6, 5, -10), this.scene.add(r), this.materials = {
      stone: new p({ color: 13752264, roughness: 0.92 }),
      cream: new p({ color: 8428467, roughness: 0.45, metalness: 0.24 }),
      white: new p({ color: 12900069, roughness: 0.38, metalness: 0.3 }),
      sand: new p({ color: 13742218, roughness: 0.84 }),
      teal: new p({ color: 1669786, roughness: 0.5, metalness: 0.18 }),
      copper: new p({ color: 11562309, roughness: 0.35, metalness: 0.65 }),
      glass: new p({ color: 1654107, roughness: 0.12, metalness: 0.85 }),
      leaves: new p({ color: 5405536, roughness: 0.85, side: L }),
      light: new p({ color: 13107184, emissive: 8312302, emissiveIntensity: 1.1, roughness: 0.35 })
    }, this.box = new W(1, 1, 1), this.cylinder = new N(1, 1, 1, 48), this.sphere = new xe(1, 16, 12), this.islands = [], this.pickables = [], this.people = [], this.bridges = [], this.rings = [], [[-4.1, 1.1, 2.2, "help"], [2.7, 2.1, 1.9, "found"], [0.4, -3.5, 2.35, "volunteer"]].forEach((a, h) => this.createIsland(a, h)), this.batchArchitecture(), this.createBridges(), this.createWater(), this.low || (this.composer = new Be(this.renderer), this.composer.addPass(new Ue(this.scene, this.camera)), this.bloom = new y(new g(innerWidth, innerHeight), 0.28, 0.45, 1.35), this.composer.addPass(this.bloom), this.composer.addPass(new De())), this.raycaster = new we(), this.hit = new g(), this.clock = new H(), this.lastFrame = 0, this.look = new v(), this.camGoal = new v(), this.lookGoal = new v(), this.resize = () => {
      this.mobile = innerWidth < 700, this.camera.aspect = innerWidth / innerHeight, this.camera.fov = this.mobile ? 43 : 36, this.camera.updateProjectionMatrix(), this.renderer.setSize(innerWidth, innerHeight), this.composer?.setSize(innerWidth, innerHeight), this.updateScroll();
    }, this.updateScroll = () => {
      const a = document.getElementById("story-end");
      this.targetProgress = E(scrollY / Math.max(1, a.offsetTop - innerHeight * 0.2), 0, 1);
    }, this.onPointer = (a) => {
      if (this.dragStart) {
        const h = a.clientX - this.dragStart.x;
        Math.abs(h) > 5 && (this.targetYaw = E(this.dragStart.yaw + h * 4e-3, -0.5, 0.5), this.lastDrag = performance.now());
      }
      this.pointer.set(a.clientX / innerWidth * 2 - 1, a.clientY / innerHeight * 2 - 1), a.target === e && a.pointerType !== "touch" ? (this.hit.set(this.pointer.x, -this.pointer.y), this.raycaster.setFromCamera(this.hit, this.camera), this.hovered = this.raycaster.intersectObjects(this.pickables)[0]?.object, e.style.cursor = this.hovered ? "pointer" : "") : this.hovered = null;
    }, this.onClick = (a) => {
      if (a.target !== e || performance.now() - this.lastDrag < 350) return;
      this.hit.set(a.clientX / innerWidth * 2 - 1, -a.clientY / innerHeight * 2 + 1), this.raycaster.setFromCamera(this.hit, this.camera);
      const h = this.raycaster.intersectObjects(this.pickables);
      if (h.length) {
        const l = h[0].object.userData.action;
        document.querySelector(`[data-preview="${l}"]`)?.click(), document.getElementById("community").scrollIntoView({ behavior: this.reduced ? "instant" : "smooth" });
      }
    }, e.tabIndex = 0, e.style.touchAction = "pan-y", this.onDown = (a) => {
      a.target === e && (this.dragStart = { x: a.clientX, yaw: this.targetYaw }, e.setPointerCapture(a.pointerId));
    }, this.onUp = () => {
      this.dragStart = null;
    }, e.addEventListener("pointerdown", this.onDown), e.addEventListener("pointerup", this.onUp), e.addEventListener("pointercancel", this.onUp), e.addEventListener("keydown", (a) => {
      (a.key === "ArrowLeft" || a.key === "ArrowRight") && (a.preventDefault(), this.targetYaw = E(this.targetYaw + (a.key === "ArrowLeft" ? -0.12 : 0.12), -0.5, 0.5)), a.key === "Escape" && (this.targetYaw = 0);
    }), addEventListener("resize", this.resize), addEventListener("scroll", this.updateScroll, { passive: !0 }), addEventListener("pointermove", this.onPointer, { passive: !0 }), e.addEventListener("click", this.onClick), document.addEventListener("visibilitychange", () => {
      this.hidden = document.hidden;
    }), e.addEventListener("webglcontextlost", (a) => {
      a.preventDefault(), this.paused = !0, document.documentElement.classList.add("world-unavailable");
    }), this.updateScroll(), this.progress = this.targetProgress, this.render(0, !0), i?.(), this.tick = this.tick.bind(this), this.raf = requestAnimationFrame(this.tick), window.__unityWorld = this;
  }
  mesh(e, i, o, s, t) {
    const r = new x(e, i);
    return s && r.position.set(...s), t && r.scale.set(...t), r.castShadow = !0, r.receiveShadow = !0, o.add(r), r;
  }
  block(e, i, o, s) {
    return this.mesh(this.box, i, e, o, s);
  }
  batchArchitecture() {
    this.islands.forEach((e) => {
      e.updateMatrixWorld(!0);
      const i = e.matrixWorld.clone().invert(), o = /* @__PURE__ */ new Map(), s = [];
      e.traverse((t) => {
        if (!t.isMesh || this.pickables.includes(t) || this.rings.includes(t)) return;
        const r = t.geometry.clone();
        r.applyMatrix4(new Me().multiplyMatrices(i, t.matrixWorld));
        const n = r.index ? r.toNonIndexed() : r;
        n !== r && r.dispose(), o.has(t.material) || o.set(t.material, []), o.get(t.material).push(n), s.push(t);
      }), s.forEach((t) => t.removeFromParent()), o.forEach((t, r) => {
        const n = Se(t);
        n && this.mesh(n, r, e), t.forEach((a) => a.dispose());
      });
    });
  }
  createIsland([e, i, o, s], t) {
    const r = new S();
    r.position.set(e, 0, i), this.root.add(r), this.islands.push(r), r.userData = { base: new v(e, 0, i), name: s };
    const n = this.materials, a = this.block(r, n.stone.clone(), [0, -0.08, 0], [o * 1.8, 0.2, o * 1.7]);
    a.userData.action = s, this.pickables.push(a), this.block(r, n.cream, [0, 0.035, 0], [o * 1.72, 0.04, o * 1.62]), t === 0 && (this.apartment(r, -0.65, -0.45, 1.35, 5.8, 12, s), this.apartment(r, 0.9, 0.25, 0.95, 3.2, 6, s)), t === 1 && (this.apartment(r, -0.35, -0.3, 1.55, 7.1, 15, s), this.apartment(r, 0.85, 0.8, 0.8, 2.1, 4, s)), t === 2 && (this.apartment(r, -0.6, -0.45, 1.25, 4.7, 10, s), this.apartment(r, 0.9, -0.2, 1.05, 6, 13, s)), this.palm(r, -o * 0.67, o * 0.58, 1.15), this.palm(r, o * 0.65, -o * 0.6, 1.3), this.bench(r, 0.1, o * 0.66), this.person(r, -0.45, o * 0.62, 2461356), this.person(r, 0.75, o * 0.61, 13215083), this.block(r, n.leaves, [-o * 0.7, 0.16, -0.1], [0.18, 0.19, 1.1]);
    for (const h of [-1, 1])
      this.block(r, n.teal, [h * o * 0.7, 0.65, o * 0.66], [0.025, 1.2, 0.025]), this.block(r, n.light, [h * o * 0.7, 1.25, o * 0.66], [0.18, 0.035, 0.1]);
  }
  apartment(e, i, o, s, t, r, n) {
    const a = this.materials, h = new S();
    h.position.set(i, 0.06, o), e.add(h);
    const l = this.block(h, a.cream.clone(), [0, t / 2, 0], [s, t, s * 0.8]);
    l.userData.action = n, this.pickables.push(l), this.block(h, a.glass, [0, t / 2, s * 0.405], [s * 0.76, t * 0.93, 0.02]), this.block(h, a.glass, [s * 0.505, t / 2, 0], [0.02, t * 0.93, s * 0.62]);
    for (let u = 1; u <= r; u++) {
      const f = u * t / (r + 1);
      this.block(h, a.white, [0, f, s * 0.47], [s * 1.06, 0.065, 0.19]), this.block(h, a.white, [s * 0.54, f, 0], [0.1, 0.065, s * 0.88]);
      for (let c = 0; c < 3; c++) {
        const m = (c - 1) * s * 0.25;
        this.block(h, a.sand, [m, f - 0.17, s * 0.43], [0.025, 0.29, 0.035]), (u * 7 + c * 3 + r) % 5 === 0 && this.block(h, a.light, [m, f - 0.15, s * 0.422], [s * 0.16, 0.21, 0.018]);
      }
    }
    for (const u of [-s * 0.49, s * 0.49]) this.block(h, a.white, [u, t / 2, s * 0.44], [0.09, t, 0.1]);
    this.block(h, a.white, [0, t + 0.07, 0], [s * 1.08, 0.14, s * 0.9]), this.block(h, a.stone, [0, t + 0.22, -0.12], [s * 0.6, 0.2, s * 0.45]), this.block(h, a.glass, [0, 0.22, s * 0.42], [s * 0.4, 0.44, 0.04]), this.block(h, a.teal, [0, 0.52, s * 0.51], [s * 0.65, 0.07, 0.32]);
  }
  palm(e, i, o, s) {
    const t = this.materials;
    this.mesh(new N(0.035, 0.065, s, 7), t.sand, e, [i, s / 2 + 0.1, o]);
    for (let r = 0; r < 9; r++) {
      const n = r * Math.PI * 2 / 9, a = [], h = [], l = [];
      for (let f = 0; f <= 8; f++) {
        const c = f / 8, m = s * 0.57 * c, w = Math.sin(c * Math.PI) * s * 0.085;
        for (const b of [-1, 1])
          a.push(i + Math.cos(n) * m - Math.sin(n) * w * b, s + 0.1 + Math.sin(c * Math.PI) * 0.16 - c * c * 0.28, o + Math.sin(n) * m + Math.cos(n) * w * b), h.push(c, (b + 1) / 2);
        if (f < 8) {
          const b = f * 2;
          l.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
        }
      }
      const u = new D();
      u.setAttribute("position", new B(a, 3)), u.setAttribute("uv", new B(h, 2)), u.setIndex(l), u.computeVertexNormals(), this.mesh(u, t.leaves, e);
    }
  }
  person(e, i, o, s) {
    const t = new S();
    t.position.set(i, 0.1, o), e.add(t), this.mesh(new Te(0.055, 0.13, 3, 6), new p({ color: s, roughness: 0.8 }), t, [0, 0.16, 0]), this.mesh(this.sphere, this.materials.sand, t, [0, 0.33, 0], [0.056, 0.056, 0.056]), this.people.push({ group: t, x: i, z: o, phase: this.people.length * 1.7 });
  }
  bench(e, i, o) {
    this.block(e, this.materials.copper, [i, 0.24, o], [0.55, 0.07, 0.22]);
    for (const s of [-0.2, 0.2]) this.block(e, this.materials.teal, [i + s, 0.15, o], [0.035, 0.2, 0.17]);
  }
  tower(e) {
    const i = this.materials;
    for (let s = 0; s < 4; s++) this.mesh(this.cylinder, i.cream, e, [0, 0.12 + s * 0.09, 0], [0.8 - s * 0.1, 0.09, 0.8 - s * 0.1]);
    for (const s of [-0.2, 0.2]) {
      const t = this.block(e, i.white, [s, 1.5, 0], [0.15, 2.3, 0.25]);
      t.rotation.z = s > 0 ? -0.09 : 0.09;
    }
    const o = this.mesh(new _e(0.58, 0.085, 12, 64), i.copper, e, [0, 2.75, 0]);
    o.rotation.y = 0.3, this.rings.push(o), this.mesh(this.sphere, i.light, e, [0, 2.75, 0], [0.22, 0.22, 0.22]), this.block(e, i.teal, [0, 2.05, 0], [0.7, 0.12, 0.36]);
  }
  createBridges() {
    const e = new M({ transparent: !0, depthWrite: !1, side: L, uniforms: { uTime: { value: 0 }, uProgress: { value: 0 }, uColor: { value: new _(3581899) } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "varying vec2 vUv;uniform float uTime;uniform float uProgress;uniform vec3 uColor;void main(){float edge=1.-smoothstep(uProgress-.035,uProgress,vUv.x);float pulse=pow(max(0.,sin(vUv.x*22.-uTime*1.5)),18.);float a=(.36+pulse*.5)*edge;gl_FragColor=vec4(uColor+vec3(pulse*.3),a);}" });
    for (const [i, o] of [[0, 1], [1, 2], [2, 0]]) {
      const s = this.islands[i].position.clone(), t = this.islands[o].position.clone();
      s.y = 2.4, t.y = 3.2;
      const r = t.clone().sub(s).normalize();
      s.addScaledVector(r, 1.8), t.addScaledVector(r, -1.65);
      const n = s.clone().lerp(t, 0.5);
      n.y = 5.2;
      const a = new ye(s, n, t), h = new Ce(a, 64, 0.028, 6, !1), l = e.clone(), u = this.mesh(h, l, this.root);
      u.castShadow = !1;
      const f = [];
      this.bridges.push({ bridge: u, rails: f });
    }
  }
  createWater() {
    const e = new p({ color: 2636624, roughness: 0.96 });
    this.block(this.root, e, [0, -0.22, 0], [90, 0.14, 90]);
    const i = new p({ color: 9282485, roughness: 1 });
    for (let t = -6; t <= 6; t++) this.block(this.root, i, [t, -0.14, -0.25], [0.42, 0.012, 0.035]);
    for (let t = 0; t < 6; t++) this.block(this.root, i, [-1.5 + t * 0.16, -0.14, 2.5], [0.075, 0.012, 1.1]);
    const o = new p({ color: 2507612, roughness: 0.85 }), s = new S();
    this.root.add(s);
    for (let t = 0; t < 8; t++) {
      const r = 2.5 + t * 7 % 5 * 0.65;
      this.block(s, o, [-6 + t * 1.7, r / 2 - 0.15, -6], [1.05, r, 0.8]);
      for (let n = 1; n < r / 0.35; n++) this.block(s, i, [-6 + t * 1.7, n * 0.35, -5.59], [0.87, 0.025, 0.01]);
    }
    this.islands.push(s), this.batchArchitecture(), this.islands.pop(), this.waterMaterial = { uniforms: { uTime: { value: 0 } } };
  }
  render(e, i = !1) {
    this.progress = F(this.progress, this.targetProgress, i || this.reduced ? 1 : 0.07);
    const o = this.progress;
    this.smoothed.lerp(this.pointer, this.reduced ? 0 : 0.035);
    const t = this.mobile ? [
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
    let r = 0;
    for (; r < t.length - 2 && o > t[r + 1].p; ) r++;
    const n = t[r], a = t[r + 1], h = Ie(E((o - n.p) / (a.p - n.p), 0, 1));
    this.camGoal.fromArray(n.pos).lerp(new v(...a.pos), h), this.lookGoal.fromArray(n.look).lerp(new v(...a.look), h), this.reduced || (this.camGoal.x += this.smoothed.x * 1.05, this.camGoal.y -= this.smoothed.y * 0.45), this.camera.clearViewOffset(), this.camera.position.copy(this.camGoal), this.camera.lookAt(this.lookGoal), this.yaw = F(this.yaw, this.targetYaw, this.reduced ? 1 : 0.07), this.root.rotation.y = this.yaw, this.reduced || (this.camera.position.x += Math.sin(e * 0.18) * 0.16, this.camera.position.y += Math.sin(e * 0.23) * 0.08), this.bridges.forEach(({ bridge: l, rails: u }, f) => {
      const c = E((o - 0.08 - f * 0.17) * 3, 0, 1);
      l.material.uniforms.uProgress.value = this.reduced ? 1 : c, l.material.uniforms.uTime.value = e, u.forEach((m) => {
        m.visible = c > 0.95 || this.reduced;
      });
    }), this.rings.forEach((l) => l.rotation.y = 0.3 + (this.reduced ? 0 : Math.sin(e * 0.25) * 0.16)), this.pickables.forEach((l) => {
      l.material.emissive.setHex(2852780), l.material.emissiveIntensity = F(l.material.emissiveIntensity || 0, l === this.hovered ? 0.18 : 0, 0.12);
    }), this.materials.light.emissiveIntensity = this.reduced ? 1.7 : 0.5 + o * 2.1, this.waterMaterial.uniforms.uTime.value = this.reduced ? 0 : e, this.composer ? this.composer.render() : this.renderer.render(this.scene, this.camera);
  }
  tick(e) {
    if (this.raf = requestAnimationFrame(this.tick), this.hidden || this.paused) return;
    const i = this.low ? 33 : 16;
    if (e - this.lastFrame < i) return;
    const o = scrollY < document.getElementById("story-end").offsetTop, s = document.getElementById("join").getBoundingClientRect().top < innerHeight;
    !o && !s || this.reduced && Math.abs(this.progress - this.targetProgress) < 1e-4 && this.lastFrame > 0 || (this.lastFrame = e, this.render(this.clock.getElapsedTime()));
  }
  setPaused(e) {
    this.paused = e;
  }
  dispose() {
    cancelAnimationFrame(this.raf), removeEventListener("resize", this.resize), removeEventListener("scroll", this.updateScroll), removeEventListener("pointermove", this.onPointer), this.scene.traverse((e) => {
      if (e.geometry?.dispose(), e.material)
        for (const i of [].concat(e.material)) i.dispose();
    }), this.composer?.dispose(), this.renderer.dispose();
  }
}
export {
  Ne as UnityWorld
};
