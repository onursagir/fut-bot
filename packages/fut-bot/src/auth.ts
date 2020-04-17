import cheerio from 'cheerio';
import { Got, Response } from 'got';
import { getGotInstance } from './helpers';
import { authPageURL, getLoginFormValues } from './helpers/auth';

type LoginStages = 'credentials' | 'verificationMethod' | 'verificationCode'
type LoginOptions = ['EMAIL', 'SMS', 'VOICE'] | undefined

export type LoginResult = {stage: LoginStages; options?: LoginOptions }

class Auth {
  got: Got

  constructor() {
    this.got = getGotInstance('auth', true);
  }

  async* login(): AsyncGenerator<LoginResult, void, string | string[] | undefined> {
    const loginPageGet = await this.got({
      method: 'get',
      url: authPageURL.toString(),
      headers: {
        referer: 'https://www.easports.com/en/fifa/ultimate-team/web-app/',
      },
    });

    let loginPagePost: Response<string> | undefined;
    let hasLoginError = true;


    while (hasLoginError) {
      const credentials = yield ({ stage: 'credentials' });

      if (!Array.isArray) throw new Error('auth/credentails-must-be-array');

      // Satisfy TypeScript
      const [username, password] = Array.isArray(credentials) ? credentials : [];

      // eslint-disable-next-line no-await-in-loop
      loginPagePost = await this.got({
        method: 'post',
        url: loginPageGet.url,
        headers: {
          referer: loginPageGet.url,
        },
        form: getLoginFormValues(username, password),
        methodRewriting: false,
      });

      hasLoginError = cheerio('.general-error', loginPagePost.body).text().trim() !== '';
    }

    if (!loginPagePost) throw new Error('auth/no-login-post');

    // A successfull login returns some sort of weird page with a JavaScript redirect
    const redirecRegex = /var redirectUri = '(.*)';/;
    const [, redirectURL] = redirecRegex.exec(loginPagePost.body) || [];

    if (!redirectURL) throw new Error('auth/no-redirect-url');

    const redirectPageGet = await this.got({
      method: 'get',
      url: `${redirectURL}/&_eventId=end`,
      headers: {
        referer: loginPagePost.url,
      },
    });

    const needsToVerify = cheerio('title', redirectPageGet.body).text().toLowerCase() === 'login verification';

    if (needsToVerify) {
      const verificationMethod = yield ({ stage: 'verificationMethod', options: ['EMAIL', 'SMS', 'VOICE'] });

      const verificationMethodPost = await this.got({
        method: 'post',
        url: redirectPageGet.url,
        headers: {
          referer: redirectPageGet.url,
        },
        form: {
          codeType: verificationMethod,
          _eventId: 'submit',
        },
      });

      let incorrectCode = true;

      while (incorrectCode) {
        const verificationCode = yield ({ stage: 'verificationCode' });

        // eslint-disable-next-line no-await-in-loop
        const verifyPagePost = await this.got({
          method: 'post',
          url: verificationMethodPost.url,
          headers: {
            referer: verificationMethodPost.url,
          },
          methodRewriting: false,
          form: {
            oneTimeCode: verificationCode,
            _trustThisDevice: 'on',
            trustThisDevice: 'on',
            _eventId: 'submit',
          },
        });

        incorrectCode = cheerio('title', verifyPagePost.body).text().toLowerCase() === 'login verification';
      }
    }
  }
}

export default new Auth();
