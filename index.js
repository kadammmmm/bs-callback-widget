!function(){"use strict";const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;let a=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new a(s,t,i)},r=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new a("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:n,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:h,getPrototypeOf:p}=Object,g=globalThis,u=g.trustedTypes,b=u?u.emptyScript:"",f=g.reactiveElementPolyfillSupport,m=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?b:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!n(t,e),y={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=y){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:a}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);a?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??y}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const t=this.properties,e=[...d(t),...h(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of s){const s=document.createElement("style"),a=t.litNonce;void 0!==a&&s.setAttribute("nonce",a),s.textContent=e.cssText,i.appendChild(s)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==a?this.removeAttribute(s):this.setAttribute(s,a),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),a="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=s;const o=a.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,a){if(void 0!==t){const o=this.constructor;if(!1===s&&(a=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??x)(a,e)||i.useDefault&&i.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:a},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==a||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[m("elementProperties")]=new Map,$[m("finalized")]=new Map,f?.({ReactiveElement:$}),(g.reactiveElementVersions??=[]).push("2.1.2");const _=globalThis,k=t=>t,w=_.trustedTypes,A=w?w.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+C,I=`<${E}>`,P=document,M=()=>P.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,O=Array.isArray,T="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,H=/>/g,R=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,B=/"/g,L=/^(?:script|style|textarea|title)$/i,j=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),W=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),V=new WeakMap,K=P.createTreeWalker(P,129);function J(t,e){if(!O(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const F=(t,e)=>{const i=t.length-1,s=[];let a,o=2===e?"<svg>":3===e?"<math>":"",r=D;for(let e=0;e<i;e++){const i=t[e];let n,l,c=-1,d=0;for(;d<i.length&&(r.lastIndex=d,l=r.exec(i),null!==l);)d=r.lastIndex,r===D?"!--"===l[1]?r=N:void 0!==l[1]?r=H:void 0!==l[2]?(L.test(l[2])&&(a=RegExp("</"+l[2],"g")),r=R):void 0!==l[3]&&(r=R):r===R?">"===l[0]?(r=a??D,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,n=l[1],r=void 0===l[3]?R:'"'===l[3]?B:z):r===B||r===z?r=R:r===N||r===H?r=D:(r=R,a=void 0);const h=r===R&&t[e+1].startsWith("/>")?" ":"";o+=r===D?i+I:c>=0?(s.push(n),i.slice(0,c)+S+i.slice(c)+C+h):i+C+(-2===c?e:h)}return[J(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Q{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let a=0,o=0;const r=t.length-1,n=this.parts,[l,c]=F(t,e);if(this.el=Q.createElement(l,i),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=K.nextNode())&&n.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(S)){const e=c[o++],i=s.getAttribute(t).split(C),r=/([.?@])?(.*)/.exec(e);n.push({type:1,index:a,name:r[2],strings:i,ctor:"."===r[1]?tt:"?"===r[1]?et:"@"===r[1]?it:G}),s.removeAttribute(t)}else t.startsWith(C)&&(n.push({type:6,index:a}),s.removeAttribute(t));if(L.test(s.tagName)){const t=s.textContent.split(C),e=t.length-1;if(e>0){s.textContent=w?w.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],M()),K.nextNode(),n.push({type:2,index:++a});s.append(t[e],M())}}}else if(8===s.nodeType)if(s.data===E)n.push({type:2,index:a});else{let t=-1;for(;-1!==(t=s.data.indexOf(C,t+1));)n.push({type:7,index:a}),t+=C.length-1}a++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function Z(t,e,i=t,s){if(e===W)return e;let a=void 0!==s?i._$Co?.[s]:i._$Cl;const o=U(e)?void 0:e._$litDirective$;return a?.constructor!==o&&(a?._$AO?.(!1),void 0===o?a=void 0:(a=new o(t),a._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=a:i._$Cl=a),void 0!==a&&(e=Z(t,a._$AS(t,e.values),a,s)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??P).importNode(e,!0);K.currentNode=s;let a=K.nextNode(),o=0,r=0,n=i[0];for(;void 0!==n;){if(o===n.index){let e;2===n.type?e=new Y(a,a.nextSibling,this,t):1===n.type?e=new n.ctor(a,n.name,n.strings,this,t):6===n.type&&(e=new st(a,this,t)),this._$AV.push(e),n=i[++r]}o!==n?.index&&(a=K.nextNode(),o++)}return K.currentNode=P,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Y{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),U(t)?t===q||null==t||""===t?(this._$AH!==q&&this._$AR(),this._$AH=q):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>O(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==q&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Q.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new X(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new Q(t)),e}k(t){O(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const a of t)s===e.length?e.push(i=new Y(this.O(M()),this.O(M()),this,this.options)):i=e[s],i._$AI(a),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class G{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,a){this.type=1,this._$AH=q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(t,e=this,i,s){const a=this.strings;let o=!1;if(void 0===a)t=Z(this,t,e,0),o=!U(t)||t!==this._$AH&&t!==W,o&&(this._$AH=t);else{const s=t;let r,n;for(t=a[0],r=0;r<a.length-1;r++)n=Z(this,s[i+r],e,r),n===W&&(n=this._$AH[r]),o||=!U(n)||n!==this._$AH[r],n===q?t=q:t!==q&&(t+=(n??"")+a[r+1]),this._$AH[r]=n}o&&!s&&this.j(t)}j(t){t===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends G{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===q?void 0:t}}class et extends G{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==q)}}class it extends G{constructor(t,e,i,s,a){super(t,e,i,s,a),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??q)===W)return;const i=this._$AH,s=t===q&&i!==q||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,a=t!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const at=_.litHtmlPolyfillSupport;at?.(Q,Y),(_.litHtmlVersions??=[]).push("3.3.2");const ot=globalThis;class rt extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let a=s._$litPart$;if(void 0===a){const t=i?.renderBefore??null;s._$litPart$=a=new Y(e.insertBefore(M(),t),t,void 0,i??{})}return a._$AI(t),a})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}rt._$litElement$=!0,rt.finalized=!0,ot.litElementHydrateSupport?.({LitElement:rt});const nt=ot.litElementPolyfillSupport;nt?.({LitElement:rt}),(ot.litElementVersions??=[]).push("4.2.2");class lt extends rt{static properties={callbacks:{type:Array},loading:{type:Boolean},error:{type:String},agentId:{type:String},agentState:{type:String},claimingId:{type:String},dialingId:{type:String},completingId:{type:String},backendUrl:{type:String,attribute:"backend-url"}};static styles=o`
    :host {
      display: block;
      font-family: 'CiscoSansTT', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #171717;
      height: 100%;
      --primary-color: #00bceb;
      --primary-hover: #0095b8;
      --success-color: #28a745;
      --warning-color: #f59e0b;
      --danger-color: #dc3545;
      --bg-color: #ffffff;
      --bg-secondary: #f8fafc;
      --border-color: #e2e8f0;
      --text-muted: #64748b;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    /* Main panel container */
    .panel-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-secondary);
    }

    /* Panel header */
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--bg-color);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      border-radius: 10px;
      color: white;
    }

    .header-icon svg {
      width: 22px;
      height: 22px;
    }

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .header-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .refresh-btn:hover {
      background: var(--bg-secondary);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .refresh-btn svg {
      width: 14px;
      height: 14px;
    }

    .refresh-btn.loading svg {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Stats bar */
    .stats-bar {
      display: flex;
      gap: 16px;
      padding: 12px 20px;
      background: var(--bg-color);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .stat-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .stat-dot.pending { background: var(--warning-color); }
    .stat-dot.claimed { background: var(--primary-color); }
    .stat-dot.dialed { background: var(--success-color); }

    .stat-count {
      font-weight: 600;
      color: #1e293b;
    }

    .stat-label {
      color: var(--text-muted);
    }

    /* Callback list */
    .callback-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Callback card */
    .callback-card {
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
      box-shadow: var(--shadow-sm);
      transition: all 0.15s ease;
    }

    .callback-card:hover {
      box-shadow: var(--shadow);
      border-color: #cbd5e1;
    }

    .callback-card.claimed {
      border-left: 4px solid var(--primary-color);
      background: #f0f9ff;
    }

    .callback-card.dialed {
      border-left: 4px solid var(--success-color);
      background: #f0fdf4;
    }

    .callback-card.claimed-by-other {
      opacity: 0.6;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .caller-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .caller-avatar {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      border-radius: 50%;
      color: white;
      flex-shrink: 0;
    }

    .caller-avatar svg {
      width: 22px;
      height: 22px;
    }

    .caller-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .caller-ani {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      letter-spacing: 0.3px;
    }

    .caller-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .meta-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: #f1f5f9;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      color: #475569;
    }

    .meta-tag.queue {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .meta-tag.time {
      background: #fef3c7;
      color: #b45309;
    }

    .meta-tag svg {
      width: 12px;
      height: 12px;
    }

    .card-status {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-status.pending {
      background: #fef3c7;
      color: #b45309;
    }

    .card-status.claimed {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .card-status.dialed {
      background: #d1fae5;
      color: #047857;
    }

    .card-status.other {
      background: #f1f5f9;
      color: #64748b;
    }

    /* Context section */
    .card-context {
      padding: 10px 12px;
      background: #f8fafc;
      border-radius: 6px;
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
      margin-bottom: 12px;
      border-left: 3px solid #e2e8f0;
    }

    .card-context-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    /* Actions section */
    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 18px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn svg {
      width: 16px;
      height: 16px;
    }

    .action-btn.primary {
      background: var(--primary-color);
      color: white;
    }

    .action-btn.primary:hover:not(:disabled) {
      background: var(--primary-hover);
    }

    .action-btn.success {
      background: var(--success-color);
      color: white;
    }

    .action-btn.success:hover:not(:disabled) {
      background: #218838;
    }

    .action-btn.secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .action-btn.secondary:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .action-btn.danger {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .action-btn.danger:hover:not(:disabled) {
      background: #fecaca;
    }

    .action-spacer {
      flex: 1;
    }

    /* Outcome section */
    .outcome-section {
      margin-top: 12px;
      padding: 12px;
      background: #f0fdf4;
      border-radius: 8px;
      border: 1px dashed #86efac;
    }

    .outcome-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .outcome-icon {
      width: 20px;
      height: 20px;
      color: var(--success-color);
    }

    .outcome-title {
      font-size: 12px;
      font-weight: 600;
      color: #047857;
    }

    .outcome-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .outcome-btn {
      padding: 8px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: white;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .outcome-btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .outcome-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .outcome-btn.connected:hover {
      border-color: #10b981;
      background: #d1fae5;
      color: #047857;
    }

    .outcome-btn.voicemail:hover {
      border-color: #f59e0b;
      background: #fef3c7;
      color: #b45309;
    }

    .outcome-btn.no-answer:hover {
      border-color: #6b7280;
      background: #f3f4f6;
      color: #374151;
    }

    .outcome-btn.wrong-number:hover {
      border-color: #ef4444;
      background: #fee2e2;
      color: #dc2626;
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      flex: 1;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      color: #cbd5e1;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 8px;
    }

    .empty-text {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 300px;
    }

    /* Error banner */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
      color: var(--danger-color);
      font-size: 13px;
      flex-shrink: 0;
    }

    .error-banner svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .error-dismiss {
      margin-left: auto;
      padding: 4px;
      background: none;
      border: none;
      color: var(--danger-color);
      cursor: pointer;
      opacity: 0.7;
    }

    .error-dismiss:hover {
      opacity: 1;
    }

    /* Scrollbar styling */
    .callback-list::-webkit-scrollbar {
      width: 8px;
    }

    .callback-list::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .callback-list::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .callback-list::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `;constructor(){super(),this.callbacks=[],this.loading=!1,this.error=null,this.agentId=null,this.agentState="Unknown",this.claimingId=null,this.dialingId=null,this.completingId=null,this.backendUrl="https://bs-callback-widget-production.up.railway.app/api",this._sdkLogger=null,this._pollInterval=null,this._desktop=null}connectedCallback(){super.connectedCallback(),this._initSDK(),this._startPolling()}disconnectedCallback(){super.disconnectedCallback(),this._stopPolling()}async _initSDK(){try{if(this._desktop="undefined"!=typeof window&&(window.wxcc?.Desktop||window.Desktop)||null,!this._desktop)return this._log("Desktop SDK not available - running outside Agent Desktop",{},"warn"),void await this._fetchCallbacks();this._sdkLogger=this._desktop.logger.createLogger("bs-callback-widget"),await this._desktop.config.init({widgetName:"bs-callback-widget",widgetProvider:"bucher-suter"});const t=this._desktop.agentStateInfo.latestData;this.agentId=t?.agentId||t?.id||null,this.agentState=t?.subStatus||t?.status||"Available",this._log("SDK initialized",{agentId:this.agentId,state:this.agentState}),this._desktop.agentStateInfo.addEventListener("updated",t=>{if(Array.isArray(t)){const e=t.find(t=>"subStatus"===t.name);e&&(this.agentState=e.value,this._log("Agent state changed",{state:this.agentState}))}}),await this._fetchCallbacks()}catch(t){this._log("SDK init failed",t,"error"),this.error="Failed to initialize SDK"}}_startPolling(){this._pollInterval=setInterval(()=>{this.loading||this._fetchCallbacks()},3e4)}_stopPolling(){this._pollInterval&&(clearInterval(this._pollInterval),this._pollInterval=null)}_log(t,e={},i="info"){const s={message:t,...e,timestamp:(new Date).toISOString()};this._sdkLogger?this._sdkLogger[i]?.(JSON.stringify(s)):console["error"===i?"error":"log"]("[CallbackWidget]",t,e)}async _fetchCallbacks(){this.loading=!0;try{const t=await fetch(`${this.backendUrl}/callbacks`,{headers:{"Content-Type":"application/json","X-Agent-Id":this.agentId||""}});if(!t.ok)throw new Error(`HTTP ${t.status}`);const e=await t.json();this.callbacks=e.callbacks||[],this._log("Fetched callbacks",{count:this.callbacks.length})}catch(t){this._log("Fetch failed",{error:t.message},"error"),this.error="Unable to load callbacks"}finally{this.loading=!1}}async _claimCallback(t){if(this.agentId){this.claimingId=t.id;try{const e=await fetch(`${this.backendUrl}/callbacks/${t.id}/claim`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({agentId:this.agentId,claimedAt:(new Date).toISOString()})});if(!e.ok){const t=await e.json();throw new Error(t.message||"Claim failed")}this._log("Claimed callback",{callbackId:t.id}),await this._fetchCallbacks()}catch(t){this._log("Claim failed",{error:t.message},"error"),this.error=t.message}finally{this.claimingId=null}}else this.error="Agent ID not available"}async _releaseCallback(t){try{if(!(await fetch(`${this.backendUrl}/callbacks/${t.id}/release`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({agentId:this.agentId})})).ok)throw new Error("Release failed");this._log("Released callback",{callbackId:t.id}),await this._fetchCallbacks()}catch(t){this._log("Release failed",{error:t.message},"error"),this.error=t.message}}async _dialCallback(t){this.dialingId=t.id;try{if(this._desktop?.dialer){const e=await this._desktop.dialer.startOutdial({data:{entryPointId:t.entryPointId||"",destination:t.ani,direction:"OUTBOUND",origin:t.ani,attributes:{callbackId:t.id,originalQueue:t.queue,abandonedAt:t.abandonedAt,context:t.context||""}}});this._log("Outdial initiated",{callbackId:t.id,result:e})}else this._log("Desktop SDK dialer not available - marking as dialed without initiating call",{},"warn");await fetch(`${this.backendUrl}/callbacks/${t.id}/dial`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({agentId:this.agentId,dialedAt:(new Date).toISOString()})}),await this._fetchCallbacks()}catch(t){this._log("Dial failed",{error:t.message},"error"),t.message?.includes("400")||t.message?.includes("403")?this.error="Outdial not permitted. Please dial manually.":this.error="Dial failed: "+t.message}finally{this.dialingId=null}}async _completeCallback(t,e){this.completingId=t.id;try{if(!(await fetch(`${this.backendUrl}/callbacks/${t.id}/complete`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({agentId:this.agentId,outcome:e,completedAt:(new Date).toISOString()})})).ok)throw new Error("Complete failed");this._log("Completed callback",{callbackId:t.id,outcome:e}),await this._fetchCallbacks()}catch(t){this._log("Complete failed",{error:t.message},"error"),this.error=t.message}finally{this.completingId=null}}_dismissError(){this.error=null}_formatTime(t){const e=new Date(t),i=new Date-e,s=Math.floor(i/6e4);if(s<1)return"Just now";if(s<60)return`${s}m ago`;const a=Math.floor(s/60);return a<24?`${a}h ago`:e.toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}_formatANI(t){const e=t?.replace(/\D/g,"")||"";return 10===e.length?`(${e.slice(0,3)}) ${e.slice(3,6)}-${e.slice(6)}`:11===e.length&&e.startsWith("1")?`+1 (${e.slice(1,4)}) ${e.slice(4,7)}-${e.slice(7)}`:t||"Unknown"}_getStats(){return{pending:this.callbacks.filter(t=>"pending"===t.status).length,claimed:this.callbacks.filter(t=>"claimed"===t.status).length,dialed:this.callbacks.filter(t=>"dialed"===t.status).length}}render(){const t=this._getStats();return j`
      <div class="panel-container">
        <div class="panel-header">
          <div class="header-left">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div>
              <div class="header-title">Abandoned Callbacks</div>
              <div class="header-subtitle">${this.callbacks.length} pending follow-ups</div>
            </div>
          </div>
          <div class="header-actions">
            <button 
              class="refresh-btn ${this.loading?"loading":""}"
              @click=${this._fetchCallbacks}
              ?disabled=${this.loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              ${this.loading?"Refreshing...":"Refresh"}
            </button>
          </div>
        </div>

        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-dot pending"></span>
            <span class="stat-count">${t.pending}</span>
            <span class="stat-label">Pending</span>
          </div>
          <div class="stat-item">
            <span class="stat-dot claimed"></span>
            <span class="stat-count">${t.claimed}</span>
            <span class="stat-label">Claimed</span>
          </div>
          <div class="stat-item">
            <span class="stat-dot dialed"></span>
            <span class="stat-count">${t.dialed}</span>
            <span class="stat-label">Dialed</span>
          </div>
        </div>

        ${this.error?j`
          <div class="error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            ${this.error}
            <button class="error-dismiss" @click=${this._dismissError}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        `:""}

        ${0===this.callbacks.length?j`
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              <path d="M15 5l4 4M19 5l-4 4" stroke-linecap="round"/>
            </svg>
            <div class="empty-title">No callbacks pending</div>
            <div class="empty-text">When customers abandon calls, they'll appear here for follow-up.</div>
          </div>
        `:j`
          <div class="callback-list">
            ${this.callbacks.map(t=>this._renderCallbackCard(t))}
          </div>
        `}
      </div>
    `}_renderCallbackCard(t){const e=t.claimedBy===this.agentId,i=t.claimedBy&&!e,s="dialed"===t.status,a=s&&e,o=this.claimingId===t.id,r=this.dialingId===t.id,n=this.completingId===t.id,l=s?"Dialed":e?"Claimed":i?"Unavailable":"Pending",c=s?"dialed":e?"claimed":i?"other":"pending";return j`
      <div class="callback-card ${a?"dialed":e?"claimed":i?"claimed-by-other":""}">
        <div class="card-header">
          <div class="caller-info">
            <div class="caller-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="caller-details">
              <div class="caller-ani">${this._formatANI(t.ani)}</div>
              <div class="caller-meta">
                <span class="meta-tag queue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  ${t.queue||"Unknown Queue"}
                </span>
                <span class="meta-tag time">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  ${this._formatTime(t.abandonedAt)}
                </span>
              </div>
            </div>
          </div>
          <span class="card-status ${c}">${l}</span>
        </div>

        ${t.context?j`
          <div class="card-context">
            <div class="card-context-label">Context</div>
            ${t.context}
          </div>
        `:""}

        ${a?j`
          <div class="outcome-section">
            <div class="outcome-header">
              <svg class="outcome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span class="outcome-title">Call completed? Select outcome:</span>
            </div>
            <div class="outcome-buttons">
              <button 
                class="outcome-btn connected"
                @click=${()=>this._completeCallback(t,"connected")}
                ?disabled=${n}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Connected
              </button>
              <button 
                class="outcome-btn voicemail"
                @click=${()=>this._completeCallback(t,"voicemail")}
                ?disabled=${n}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="5.5" cy="11.5" r="4.5"/>
                  <circle cx="18.5" cy="11.5" r="4.5"/>
                  <line x1="5.5" y1="16" x2="18.5" y2="16"/>
                </svg>
                Voicemail
              </button>
              <button 
                class="outcome-btn no-answer"
                @click=${()=>this._completeCallback(t,"no-answer")}
                ?disabled=${n}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                No Answer
              </button>
              <button 
                class="outcome-btn wrong-number"
                @click=${()=>this._completeCallback(t,"wrong-number")}
                ?disabled=${n}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Wrong #
              </button>
            </div>
          </div>
        `:""}

        <div class="card-actions">
          ${t.claimedBy?"":j`
            <button 
              class="action-btn primary"
              @click=${()=>this._claimCallback(t)}
              ?disabled=${o}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <polyline points="17 11 19 13 23 9"/>
              </svg>
              ${o?"Claiming...":"Claim"}
            </button>
          `}

          ${e&&!s?j`
            <button 
              class="action-btn success"
              @click=${()=>this._dialCallback(t)}
              ?disabled=${r}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              ${r?"Dialing...":"Dial"}
            </button>
            <div class="action-spacer"></div>
            <button 
              class="action-btn danger"
              @click=${()=>this._releaseCallback(t)}
            >
              Release
            </button>
          `:""}

          ${a?j`
            <button 
              class="action-btn secondary"
              @click=${()=>this._dialCallback(t)}
              ?disabled=${r}
              title="Retry call"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              ${r?"Dialing...":"Redial"}
            </button>
          `:""}

          ${i?j`
            <span style="color: var(--text-muted); font-size: 12px;">
              Claimed by another agent
            </span>
          `:""}
        </div>
      </div>
    `}}customElements.define("bs-callback-widget",lt)}();
//# sourceMappingURL=callback-widget.js.map
