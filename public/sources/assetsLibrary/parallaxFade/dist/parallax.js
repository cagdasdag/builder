/* global vcv */
/* global vceAssetsParallaxFade */
vcv.on('ready', function (action, id) {
  if (action !== 'merge') {
    var selector = '[data-vce-assets-parallax-fade]';
    selector = id ? '[data-vcv-element="' + id + '"] ' + selector : selector;
    vceAssetsParallaxFade(selector);
  }
});