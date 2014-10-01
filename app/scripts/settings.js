'use strict';
var NB = NB || {};

NB.Settings = (function() {

  var Settings = {}
    , settings
    , settingsEl
  ;

  function retrieveLocalSettings() {
    if (localStorage.settings) {
      var localSettings = JSON.parse(localStorage.settings);

      if (localSettings.clickAction) { settings.clickAction(localSettings.clickAction); }
      if (localSettings.rightClickAction) { settings.rightClickAction(localSettings.rightClickAction); }
      if (localSettings.source) {
        //TODO replace this logic with versioning the localstorage
        if (localSettings.source === 'rd') { localSettings.source = 'rdt'; }
        if (localSettings.source === 'hn') { localSettings.source = 'hxn'; }
        settings.source(localSettings.source);
      }
      if (localSettings.hitLimit) { settings.hitLimit(+localSettings.hitLimit); }
      if (localSettings.rdtMinScore) { settings.rdtMinScore(+localSettings.rdtMinScore); }
      if (localSettings.hxnMinScore) { settings.hxnMinScore(+localSettings.hxnMinScore); }

    }
  }

  function init() {
    d3.select('#open-settings-btn').on('click', Settings.openSettings);
    d3.select('#save-settings-btn').on('click', Settings.saveSettings);
    d3.select('#cancel-settings-btn').on('click', Settings.cancelSettings);

    //Init a settings objects with some defaults.
    settings = {
      clickAction: ko.observable('storyPanel'), //storyPanel | storyTooltip
      rightClickAction: ko.observable('toggleRead'), // toggleRead | nothing
      source: ko.observable('rdt'), // rdt | hxn
      hitLimit: ko.observable(100),
      rdtMinScore: ko.observable(500),
      hxnMinScore: ko.observable(5),
      favMinScore: ko.observable(0),
      //TODO this will need to be universal so that favourites will be coloured correctly.
      hxnCategoryColors: ko.observableArray([
        {category: 'Ask HN', color: '#e74c3c'},
        {category: 'Show HN', color: '#16a085'},
        {category: 'Everything else', color: '#2980b9'}
      ]),
      rdtCategoryColors: ko.observableArray([
        {category: 'AskReddit', color: '#2980b9'},
        {category: 'funny', color: '#2ecc71'},
        {category: 'pics', color: '#f39c12'},
        {category: 'aww', color: '#8e44ad'},
        {category: 'videos', color: '#e74c3c'},
        {category: 'Everything else', color: '#7f8c8d'}
      ])
    };

    settingsEl = d3.select('#settings-wrapper');

    ko.applyBindings(settings, settingsEl.node(0));

    retrieveLocalSettings(); //Override the defaults if they were in local storage.

  }

  function closeSettings() {
//     settingsEl.fadeOut(100);
    settingsEl
      .transition().duration(500)
      .style('opacity', 0)
      .transition()
      .style('display', 'none');
  }

  function saveSettings(silent) {
    if (!silent) {
      NB.Data.emit('updateSettings', {settings: ko.toJS(settings)});
    }
    
    //The settings ko object is bound so nothing needs to be updated there
//     var maxHitLimit = Math.min(500, settings.hitLimit());
    var tmp = NB.Utils.constrain(1, settings.hitLimit(), 500);
    settings.hitLimit(tmp);

    var tmp = Math.max(0, settings.rdtMinScore());
    settings.rdtMinScore(tmp);

    var tmp = Math.max(0, settings.hxnMinScore());
    settings.hxnMinScore(tmp);




    var localSettings = {
      clickAction: settings.clickAction(),
      rightClickAction: settings.rightClickAction(),
      source: settings.source(),
      hitLimit: settings.hitLimit(),
      rdtMinScore: settings.rdtMinScore(),
      hxnMinScore: settings.hxnMinScore()
    };

    var previousSettings = {};

    if (localStorage.settings) {
      previousSettings = JSON.parse(localStorage.settings);
    }

    if (settings.hitLimit() !== previousSettings.hitLimit) {
      NB.Chart.reset();
      NB.Data.getData();
    }

    var src = settings.source();
    var koScore = settings[src + 'MinScore'];
    if (koScore && koScore() !== previousSettings[src + 'MinScore']) {
      NB.Chart.reset();
      NB.Data.getData();
    }
    //TODO if hxn or rdt limits changed...

    localStorage.settings = JSON.stringify(localSettings);
    closeSettings();
  }

  function setAll(settings) {
//     console.log('gonna save settings:', settings);
    var keys = Object.keys(settings);
    keys.forEach(function(setting) {
//       console.log('Setting', setting, 'to', settings[setting]);
      Settings.setSetting(setting, settings[setting], true);
    });
  }


  /*  ---------------  */
  /*  --  Exports  --  */
  /*  ---------------  */

  Settings.openSettings = function() {
//     settingsEl.fadeIn(500);
    settingsEl
      .style('display', 'block')
      .transition().duration(100)
      .style('opacity', 1);
  };

  Settings.saveSettings = function() {
    saveSettings();
  };

  Settings.cancelSettings = function() {
    //since the settings object is bound to the radio buttons, it may have changed.
    //so reset it to what's in localStorage
    retrieveLocalSettings();
    closeSettings();
  };

  Settings.getSetting = function(setting) {
    if (!settings[setting]) {
      console.log(setting + ' is not a setting.');
      return;
    }
    return settings[setting]();
  };

  Settings.setAll = setAll; //used when settings are loaded from user account

  Settings.setSetting = function(setting, value, silent) {
    //TODO, if this took an object, then I could use Object.keys and merge this with setAll.
    if (!settings[setting]) { //TODO test for "typeof function"
      console.log(setting + ' is not something that can be set.');
      return;
    }
    settings[setting](value);
    saveSettings(silent);
  };
  Settings.getColor = function(source, category) {
    if (!settings[source + 'CategoryColors']) {
      console.log('There are no colours for this source');
      return;
    }
    var arr = settings[source + 'CategoryColors']();
    var defaultColor;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].category === category) {
        return arr[i].color;
      }
      if (arr[i].category === 'Everything else') {
        defaultColor = arr[i].color;
      }
    }
    return defaultColor;
  };


  init();
  return Settings;

})();

