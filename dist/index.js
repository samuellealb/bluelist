(function() {
  'use strict';

  const app = {
    init: () => {
      app.defineElements();
      app.bindEvents();
      app.testLog('on app start');
    },
    defineElements: () => {
      // eslint-disable-next-line no-undef
      app.actionButton = document.getElementById('action');
      // eslint-disable-next-line no-undef
      app.resultDiv = document.getElementById('result');
    },
    bindEvents: () => {
      app.actionButton.onclick = app.testLog.bind(null, 'on button click');
    },
    testLog: (method) => {
      console.log(`testing log by ${method}`);
    }
  };

  app.init();
}());