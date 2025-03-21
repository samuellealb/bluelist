import { AtpAgent } from '/@/atproto/api';
import dotenv from '/@/dotenv';

const app = {
  init: () => {
    app.defineElements();
    app.bindEvents();
  },
  defineElements: () => {
    // eslint-disable-next-line no-undef
    app.actionButton = document.getElementById('action');
    // eslint-disable-next-line no-undef
    app.resultDiv = document.getElementById('result');
  },
  bindEvents: () => {
    app.actionButton.onclick = app.testLog.bind();
  },
  testLog: async () => {
    // Load environment variables
    dotenv.config();
    dotenv.config({ path: '.env.local' });

    // Create an agent
    const agent = new AtpAgent({
      service: process.env.ATP_SERVICE,
    });

    // Login
    const { data: loginData } = await agent.login({
      identifier: process.env.BSKY_IDENTIFIER,
      password: process.env.BSKY_PASSWORD,
    });

    // Get user info
    const { did, handle, email } = loginData;
    app.resultDiv.innerHTML = JSON.stringify({ did, handle, email });
    console.log({ did, handle, email });

  }
};

app.init();
