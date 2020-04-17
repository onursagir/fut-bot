import path from 'path';
import pretty from 'pretty';
import * as fsExtra from 'fs-extra';
import { CookieJar } from 'tough-cookie';
import ToughCookieFileStore from 'tough-cookie-filestore';
import got, { ExtendOptions, Got, Response } from 'got/dist/source';

const cookieFilePath = path.resolve(__dirname, '../cookies.json');

fsExtra.ensureFileSync(cookieFilePath);

export { cookieFilePath };

const cookieJar = new CookieJar(new ToughCookieFileStore(cookieFilePath));

export { cookieJar };

const getGotInstance = (key: string, debug: boolean): Got => {
  const options: ExtendOptions = {
    cookieJar,
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
    },
  };

  if (debug) {
    options.hooks = {};
    options.hooks.afterResponse = [async (response): Promise<Response<unknown>> => {
      const date = new Date();
      const stamp = `${date.getTime()}`.substr(-5, 5);
      const baseName = `${stamp}-${response.request.options.method}-res`;
      const destination = path.resolve(__dirname, `../debug/${key}/`);

      await Promise.all([
        fsExtra.outputFile(`${destination}/${baseName}-body.html`, pretty(`${response.body}`, { ocd: true })),
        fsExtra.outputFile(`${destination}/${baseName}-headers.json`, JSON.stringify(response.headers, null, 2)),
      ]);

      return response;
    }];
  }

  return got.extend(options);
};

export { getGotInstance };
