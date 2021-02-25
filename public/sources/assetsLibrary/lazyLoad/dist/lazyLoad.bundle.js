!function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p=".",r(r.s=0)}({"./src/lazyLoad.js":function(t,e,r){!function(e,r){t.exports=r();let n=!1;e.vcv&&e.vcv.on("ready",(function(t,r,o){if(!n){n=!0;e.vcvLozad().observe()}}))}(this,(function(){"use strict";const t="undefined"!=typeof document&&document.documentMode,e=function(t){return window&&window[t]},r=["data-iesrc","data-alt","data-src","data-srcset","data-background-image","data-toggle-class"],n={rootMargin:"0px",threshold:0,enableAutoReload:!1,load:function(e){if("picture"===e.nodeName.toLowerCase()){let r=e.querySelector("img"),n=!1;null===r&&(r=document.createElement("img"),n=!0),t&&e.getAttribute("data-iesrc")&&(r.src=e.getAttribute("data-iesrc")),e.getAttribute("data-alt")&&(r.alt=e.getAttribute("data-alt")),n&&e.append(r)}if("video"===e.nodeName.toLowerCase()&&!e.getAttribute("data-src")&&e.children){const t=e.children;let r;for(let e=0;e<=t.length-1;e++)r=t[e].getAttribute("data-src"),r&&(t[e].src=r);e.load(),e.hasAttribute("autoplay")&&e.play()}e.getAttribute("data-poster")&&(e.poster=e.getAttribute("data-poster")),e.getAttribute("data-src")&&(e.src=e.getAttribute("data-src")),e.getAttribute("data-srcset")&&e.setAttribute("srcset",e.getAttribute("data-srcset"));let r=",";if(e.getAttribute("data-background-delimiter")&&(r=e.getAttribute("data-background-delimiter")),e.getAttribute("data-background-image"))e.style.backgroundImage="url('"+e.getAttribute("data-background-image").split(r).join("'),url('")+"')";else if(e.getAttribute("data-background-image-set")){const t=e.getAttribute("data-background-image-set").split(r);let n=t[0].substr(0,t[0].indexOf(" "))||t[0];n=-1===n.indexOf("url(")?"url("+n+")":n,1===t.length?e.style.backgroundImage=n:e.setAttribute("style",(e.getAttribute("style")||"")+"background-image: "+n+"; background-image: -webkit-image-set("+t+"); background-image: image-set("+t+")")}e.getAttribute("data-toggle-class")&&e.classList.toggle(e.getAttribute("data-toggle-class"))},loaded:function(){}};function o(t){t.setAttribute("data-loaded",!0)}function a(t){t.getAttribute("data-placeholder-background")&&(t.style.background=t.getAttribute("data-placeholder-background"))}const i=function(t){return"true"===t.getAttribute("data-loaded")},u=function(t,e){return function(r,n){r.forEach((function(r){(r.intersectionRatio>0||r.isIntersecting)&&(n.unobserve(r.target),i(r.target)||(console.log("onIntersection trigger load"),t(r.target),o(r.target),e(r.target)))}))}},c=function(t){return function(e){e.forEach((function(e){i(e.target)&&"attributes"===e.type&&r.indexOf(e.attributeName)>-1&&t(e.target)}))}},d=function(t){const e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document;return t instanceof Element?[t]:t instanceof NodeList?t:e.querySelectorAll(t)};return function(){const t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:".vcv-lozad",s=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},l=Object.assign({},n,s),g=l.root,b=l.rootMargin,f=l.threshold,m=l.enableAutoReload,p=l.load,v=l.loaded;let A,y;e("IntersectionObserver")&&(A=new IntersectionObserver(u(p,v),{root:g,rootMargin:b,threshold:f})),e("MutationObserver")&&m&&(y=new MutationObserver(c(p)));const h=d(t,g);for(let e=0;e<h.length;e++)a(h[e]);return{observe:function(){const e=d(t,g);for(let t=0;t<e.length;t++)i(e[t])||(A?(y&&m&&y.observe(e[t],{subtree:!0,attributes:!0,attributeFilter:r}),A.observe(e[t])):(p(e[t]),o(e[t]),v(e[t])));return!0},triggerLoad:function(t){i(t)||(p(t),o(t),v(t))},observer:A,mutationObserver:y}}}))},0:function(t,e,r){t.exports=r("./src/lazyLoad.js")}});