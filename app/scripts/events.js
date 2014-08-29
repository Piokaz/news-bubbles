'use strict';
var HB = HB || {};

HB.Events = (function() {
  var Events = {}
    , storyPanel
    , chartWrapper
    , storyPanelResizer
    , offsetX
    , body
  ;

  function resizerMousedown(e) {
    if (d3.event.target.id === 'story-panel-toggle') { return false; }
    console.log('#story-panel-resizer clicked:', e);
//     console.log('resizerMousedown()');
    chartWrapper = d3.select('#chart-wrapper').style('transition', '0ms');
    storyPanel = d3.select('#story-panel').style('transition', '0ms');

    storyPanelResizer = d3.select('#story-panel-resizer').classed('active', true);

    body = d3.select('body');
    offsetX = d3.mouse(document.body)[0] - HB.splitPos;

    body.on('mousemove', resizerMousemove);
    body.on('mouseup', resizerMouseup);
    body.on('touchmove', resizerMousemove);
    body.on('touchend', resizerMouseup);
  }

  function resizerMousemove() {
    d3.event.preventDefault();
    HB.splitPos = Math.max(100, d3.mouse(document.body)[0] - offsetX);
    HB.Layout.moveSplitPos();
    HB.Chart.resize();
  }
  
  function resizerMouseup() {
    chartWrapper.style('transition', null);
    storyPanel.style('transition', null);
    storyPanelResizer.classed('active', false);

    //Snap the splitter to the right if it's less that xpx
    if (document.body.offsetWidth - HB.splitPos < 100) {
      HB.Layout.hideStoryPanel();
    }

    body.on('mousemove', null);
    body.on('mouseup', null);
    body.on('touchmove', null);
    body.on('touchend', null);
  }

  d3.select('#story-panel-resizer').on('mousedown', resizerMousedown);
  d3.select('#story-panel-resizer').on('touchstart', resizerMousedown);


  d3.select('#story-panel-toggle').on('click', function() {
    console.log('#story-panel-toggle clicked');
    d3.event.preventDefault();
//     body = d3.select('body');
    HB.Layout.toggleStoryPanel();
    return false;
  });

  $('#more-btn').on('click', function() {
    HB.Data.getNextPage(function(data) {
      HB.Chart.addStories(data);
    });
  });

  window.onresize = function() {
    HB.Layout.render();
    HB.Chart.resize();
  };

  return Events;

})();