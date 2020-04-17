const authPageURL = new URL('/connect/auth', 'https://accounts.ea.com');

authPageURL.searchParams.set('prompt', 'login');
authPageURL.searchParams.set('accessToken', 'null');
authPageURL.searchParams.set('client_id', 'FIFA-20-WEBCLIENT');
authPageURL.searchParams.set('response_type', 'token');
authPageURL.searchParams.set('display', 'web2/login');
authPageURL.searchParams.set('locale', 'en_EN');
authPageURL.searchParams.set('redirect_uri', 'https://www.easports.com/en/fifa/ultimate-team/web-app/auth.html');
authPageURL.searchParams.set('release_type', 'prod');
authPageURL.searchParams.set('scope', 'basic.identity offline signin basic.entitlement basic.persona');

export { authPageURL };

const getLoginFormValues = (email: string, password: string): Record<string, any> => ({
  email,
  password,
  pn_text: '', // eslint-disable-line @typescript-eslint/camelcase
  passwordForPhone: '',
  country: 'EN',
  phoneNumber: '',
  _rememberMe: 'on',
  rememberMe: 'on',
  _eventId: 'submit',
  gCaptchaResponse: '',
  thirdPartyCaptchaResponse: '',
  isPhoneNumberLogin: false,
  isIncompletePhone: '',
});

export { getLoginFormValues };
