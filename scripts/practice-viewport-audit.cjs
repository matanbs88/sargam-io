// Local-only regression check. Supply Playwright and browser paths explicitly.
// This standalone CommonJS runner accepts an absolute, externally bundled package.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH});
  try {
    for (const [width,height] of [[390,844],[844,390],[1366,768],[1920,1080]]) {
      const page = await browser.newPage({viewport:{width,height}});
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto('http://127.0.0.1:3001/');
      await page.getByRole('button',{name:'Open practice demo',exact:false}).click();
      for (const instrument of ['Piano','Harmonium','Bansuri']) {
        await page.getByRole('button',{name:instrument,exact:true}).click();
        const dimensions = await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
        if (dimensions.scrollWidth > width + 1) throw new Error(`${instrument} page overflow at ${width}`);
        await page.getByRole('button',{name:'Cinema',exact:true}).click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        const play = dialog.getByRole('button',{name:'Play',exact:true});
        const box = await play.boundingBox();
        if (!box || box.y < 0 || box.y+box.height > height) throw new Error(`${instrument} Cinema transport outside ${width}x${height}`);
        await page.keyboard.press('Escape');
        await page.getByRole('button',{name:'Cinema',exact:true}).evaluate(e => {if (document.activeElement !== e) throw new Error('Focus not restored');});
      }
      if(errors.length) throw new Error(errors.join('\n'));
      console.log(`PASS ${width}x${height}: all instruments, page width, Cinema transport, Escape/focus, no page errors`);
      await page.close();
    }
    const page = await browser.newPage({viewport:{width:1366,height:768}});
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route(/\.(mp3|wav|ogg)(\?.*)?$/, async route => {
      await gate;
      await route.abort().catch(()=>{});
    });
    await page.goto('http://127.0.0.1:3001/');
    await page.getByRole('button',{name:'Open practice demo',exact:false}).click();
    await page.getByRole('button',{name:'Piano',exact:true}).click();
    const soundOff = page.getByRole('button',{name:'Sound off',exact:true});
    if (await soundOff.count()) await soundOff.click();
    await page.getByRole('button',{name:'Play playback',exact:true}).click();
    await page.getByRole('button',{name:'Cancel loading',exact:true}).click();
    release();
    await page.getByRole('button',{name:'Play playback',exact:true}).waitFor();
    const position = await page.getByRole('slider',{name:'Playback position'}).inputValue();
    if (position !== '0') throw new Error(`Cancelled loading moved time: ${position}`);
    console.log('PASS controlled sample-loading cancellation: paused at zero');
    await page.close();
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
