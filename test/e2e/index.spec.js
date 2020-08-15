import wd from 'wd';
import path from 'path';
import { expect } from 'chai';

import { failWithShot } from './helpers/funcs.js';

const shotDir = process.env['CIRCLE_ARTIFACTS'] || '/tmp';

const London = {
  lat: 51.50853,
  lng: -0.12574,
};

const Paris = {
  lat: 48.85341,
  lng: 2.3488,
};

const sleepBeforeStart = process.env['SAUCE_RUN'] ? 3 * 60 * 1000 : 10 * 1000;

const driverConfig = process.env['SAUCE_RUN'] ?
  { host: 'ondemand.saucelabs.com', port: 80 } :
  { host: 'localhost', port: 4723 };

let driverCaps = {
  platformName: 'Android',
  deviceName: 'Google Nexus 7C GoogleAPI Emulator',
  platformVersion: '4.4',
  newCommandTimeout: 600,
  commandTimeout: 600,
  idleTimeout: 1000,
  app: 'http://localhost:8080/e2e/GeocoderE2EApp/android/app/build/outputs/apk/app-debug.apk',
  appiumVersion: '1.5.2',
}

driverCaps = process.env['SAUCE_RUN'] ? driverCaps :
  {
    platformName: 'Android',
    deviceName: 'Android emulator',
    newCommandTimeout: 600,
    app: 'http://localhost:8080/e2e/GeocoderE2EApp/android/app/build/outputs/apk/app-debug.apk',
  };

describe ('react-native-geocoder-mrousavy', function() {
  this.timeout(60000000);

  const driver = wd.promiseChainRemote(driverConfig);
  require("./helpers/logging").configure(driver);

  before(async function() {
    console.log('Init driver');
    await driver.init(driverCaps);

    console.log('set implicit timeout');
    await driver.setImplicitWaitTimeout(10000);

    console.log('sleeping ', sleepBeforeStart);
    await driver.sleep(sleepBeforeStart);
  });

  after(async () => {
    await driver.quit();
  });

  it ('displays default view', failWithShot(driver, shotDir, async function() {
    await driver.waitForElementByXPath('//android.widget.EditText[1]', 5 * 60 * 1000); // wait for view to be initialized
    await driver.waitForElementByXPath('//android.widget.EditText[2]');
    await driver.waitForElementByXPath('//android.widget.TextView[starts-with(@text, "Geocode")]');
    await driver.waitForElementByXPath('//android.widget.TextView[starts-with(@text, "Reverse")]');
  }));

  it ('geocodes address', failWithShot(driver, shotDir, async function() {
    await driver.waitForElementByXPath('//android.widget.EditText[1]').sendKeys("London");
    await driver.waitForElementByXPath('//android.widget.TextView[starts-with(@text, "Geocode")]').click().click();

    const locality = await driver.waitForElementByXPath('//android.widget.TextView[starts-with(@text, "Locality")]', 5000).text();
    expect(locality.split(':')[1].trim().toLowerCase()).to.contain('london');

    const latlng = await driver.waitForElementByXPath('//android.widget.TextView[starts-with(@text, "LatLng")]').text();
    const [lat, lng] = latlng.split(':')[1].split(',').map(v => 1 * v.trim());

    expect(lat - London.lat).to.be.below(0.001);
    expect(lng - London.lng).to.be.below(0.001);
  }));

  it ('geocodes lat lng into address', failWithShot(driver, shotDir, async function() {
    await driver.waitForElementByXPath('//android.widget.EditText[2]').sendKeys(`${Paris.lat} ${Paris.lng}`);
    await driver.waitForElementByXPath('//android.widget.TextView[starts-with(@text, "Reverse")]').click().click();

    const locality = await driver.waitForElementByXPath('//android.widget.TextView[starts-with(@text, "Locality")]', 5000).text();
    expect(locality.split(':')[1].trim().toLowerCase()).to.contain('paris');

    const latlng = await driver.waitForElementByXPath('//android.widget.TextView[starts-with(@text, "LatLng")]').text();
    const [lat, lng] = latlng.split(':')[1].split(',').map(v => 1 * v.trim());

    expect(lat - Paris.lat).to.be.below(0.001);
    expect(lng - Paris.lng).to.be.below(0.001);
  }));

});

