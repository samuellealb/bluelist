import { reactive } from 'vue';
import { AtpAgent } from '@atproto/api';

export const state = reactive({
  formInfo: '',
  loginError: '',
  did: '',
  agent: new AtpAgent({
    service: 'https://bsky.social',
  }),
  isLoggedIn: false,
  displayData: '',
  usersJSON: '',
  listsJSON: '',
});

export function checkLoginSession(): void {
  const storedData = localStorage.getItem('loginData');
  if (storedData) {
    try {
      const { loginData } = JSON.parse(storedData);
      state.formInfo = `Logged in as ${loginData.handle} with DID ${loginData.did}`;
      state.did = loginData.did;
      state.isLoggedIn = true;

      state.agent = new AtpAgent({
        service: 'https://bsky.social',
      });

      state.agent.api.setHeader(
        'Authorization',
        `Bearer ${loginData.accessJwt}`
      );
    } catch (error) {
      console.error('Failed to parse session data:', error);
      localStorage.removeItem('loginData');
    }
  }
}

export async function loginUser(
  identifier: string,
  password: string
): Promise<void> {
  state.loginError = '';
  if (!state.agent) {
    state.formInfo = 'Agent not created';
    return;
  }

  try {
    if (!identifier.includes('@')) {
      state.loginError =
        'Please use your email address to login, not your handle';
      return;
    }

    const { data: loginData, success } = await state.agent.login({
      identifier,
      password,
    });

    if (success) {
      const { did: userDid, handle } = loginData;
      state.formInfo = `Logged in as ${handle} with DID ${userDid}`;
      state.did = userDid;
      state.isLoggedIn = true;

      localStorage.setItem('loginData', JSON.stringify({ loginData }));
    } else {
      state.formInfo = 'Login Failed';
    }
  } catch (error) {
    if ((error as Error).message.includes('Rate Limit Exceeded')) {
      state.loginError =
        'Login failed: Rate limit exceeded. Please use your email address to login.';
    } else {
      state.loginError = `Login failed: ${(error as Error).message}`;
    }
    console.error('Login error:', error);
  }
}
