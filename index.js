const chromium = require('chrome-aws-lambda');

exports.handler = async (event, context, callback) => {
  let result = null; 
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();

    
    // Configure the viewport and dimensions of the chart
    await page.setViewport({ width: 800, height: 600 });

    // Set up a Highcharts chart configuration
    const chartConfig = `
      Highcharts.chart('container', {
        title: {
          text: 'Sample Chart'
        },
        series: [{
          type: 'line',
          data: [1, 3, 2, 4, 5]
        }]
      });
    `;

    // Inject chart configuration and Highcharts library into the page
    await page.setContent(`
      <html>
        <head>
          <script src="https://code.highcharts.com/highcharts.js"></script>
        </head>
        <body>
          <div id="container"></div>
          <script>${chartConfig}</script>
        </body>
      </html>
    `);

    await page.waitForTimeout(2000);

    const screenshotBuffer = await page.screenshot({ type: 'jpeg' });

    // Convert the JPG image buffer to a base64 string
    const jpgBase64 = screenshotBuffer.toString('base64');
    result = jpgBase64;

  } catch (error) {
    return callback(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return callback(null, result);
};