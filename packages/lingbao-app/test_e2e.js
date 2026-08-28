
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SHOTS = 'C:/kaifa_teacher/ai-study/lingbao-app/test_screenshots';
const ISSUES = [];

function logIssue(severity, where, what, fix) {
  const item = { severity, where, what, fix, ts: new Date().toISOString() };
  ISSUES.push(item);
  console.log('[' + severity + '] ' + where + ': ' + what + (fix ? ' (fix: ' + fix + ')' : ''));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 13 size
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('PAGE ERROR: ' + err.message));

  // === Step 1: Splash ===
  console.log('\n=== Step 1: Splash ===');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: SHOTS + '/01_splash.png', fullPage: true });
  
  // Check title rendered
  const titleVisible = await page.locator('.title').isVisible().catch(() => false);
  if (!titleVisible) logIssue('P1', 'Splash', 'Title "灵宝 AI 伴学" not visible');
  
  const startBtn = await page.locator('.start-btn').isVisible().catch(() => false);
  if (!startBtn) logIssue('P1', 'Splash', 'Start button not visible');
  else console.log('✓ start button visible');
  
  const petVisible = await page.locator('.pet-sprite img').first().isVisible().catch(() => false);
  if (!petVisible) logIssue('P0', 'Splash', 'Pet sprite not visible');
  else console.log('✓ pet sprite visible');
  
  const speechBubble = await page.locator('.speech-bubble').isVisible().catch(() => false);
  console.log('  speech bubble visible:', speechBubble);
  
  // Console errors
  if (consoleErrors.length) {
    logIssue('P1', 'Splash', 'console errors: ' + JSON.stringify(consoleErrors));
    consoleErrors.length = 0;
  }

  // === Step 2: Click start ===
  console.log('\n=== Step 2: Start -> Child Select ===');
  await page.locator('.start-btn').click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SHOTS + '/02_child_select_empty.png', fullPage: true });
  
  const emptyHint = await page.locator('.empty').isVisible().catch(() => false);
  console.log('  empty hint visible:', emptyHint);

  // === Step 3: Create child ===
  console.log('\n=== Step 3: Create child ===');
  await page.locator('.add-btn').click();
  await page.waitForTimeout(500);
  await page.locator('input[placeholder*="孩子"]').fill('小明');
  await page.locator('select.input').selectOption('3');
  await page.locator('.form-actions .btn-primary').click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: SHOTS + '/03_after_create_child.png', fullPage: true });
  
  // Should navigate to diagnosis
  const url1 = page.url();
  console.log('  url after create:', url1);
  if (!url1.includes('/diagnosis')) logIssue('P1', 'CreateChild', 'Should navigate to /diagnosis, got ' + url1);
  
  // Check diagnosis page
  const progressBar = await page.locator('.progress-bar').isVisible().catch(() => false);
  console.log('  progress bar visible:', progressBar);
  const questionCard = await page.locator('.question-card').isVisible().catch(() => false);
  if (!questionCard) logIssue('P0', 'Diagnosis', 'Question card not visible');
  else console.log('✓ question card visible');
  
  // Pet mini
  const petMini = await page.locator('.pet-mini').isVisible().catch(() => false);
  console.log('  pet mini visible:', petMini);
  
  if (consoleErrors.length) {
    logIssue('P1', 'Diagnosis load', 'console errors: ' + JSON.stringify(consoleErrors));
    consoleErrors.length = 0;
  }

  // === Step 4: Answer 5 questions ===
  console.log('\n=== Step 4: Answer 5 questions ===');
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(800);
    await page.screenshot({ path: SHOTS + '/04_q' + (i+1) + '.png', fullPage: true });
    const submitBtn = await page.locator('.submit-btn').isVisible().catch(() => false);
    if (!submitBtn) { logIssue('P0', 'Q'+(i+1), 'submit button not visible'); break; }
    // Pick option A (always wrong for variety)
    await page.locator('.opt-btn').first().click();
    await page.waitForTimeout(300);
    const btnText = await page.locator('.submit-btn').textContent();
    console.log('  q' + (i+1) + ' btn text: ' + btnText);
    await page.locator('.submit-btn').click();
    await page.waitForTimeout(800);
  }
  
  // After last question, should show plan
  await page.waitForTimeout(3000);
  await page.screenshot({ path: SHOTS + '/05_after_diagnosis.png', fullPage: true });
  const url2 = page.url();
  console.log('  url after diagnosis:', url2);
  if (!url2.includes('/home')) logIssue('P1', 'AfterDiagnosis', 'Should navigate to /home, got ' + url2);

  // === Step 5: Home page ===
  console.log('\n=== Step 5: Home page ===');
  const homePet = await page.locator('.pet-section .pet-sprite img').isVisible().catch(() => false);
  console.log('  home pet visible:', homePet);
  const taskList = await page.locator('.task-card').count();
  console.log('  task count:', taskList);
  if (taskList < 1) logIssue('P1', 'Home', 'No task cards rendered');
  
  const nav = await page.locator('.bottom-nav').isVisible().catch(() => false);
  console.log('  bottom nav visible:', nav);

  // === Step 6: Click first task (explain) ===
  if (taskList > 0) {
    console.log('\n=== Step 6: Click explain task ===');
    await page.locator('.task-card').first().click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: SHOTS + '/06_explain.png', fullPage: true });
    const explainLoaded = await page.locator('.content-card .script').isVisible().catch(() => false);
    console.log('  explain script visible:', explainLoaded);
    if (!explainLoaded) logIssue('P1', 'Explain', 'Script not loaded');
    const startBtn = await page.locator('.start-btn').isVisible().catch(() => false);
    console.log('  start practice btn visible:', startBtn);
  }

  // === Step 7: Back to home, then practice ===
  console.log('\n=== Step 7: Back -> Practice ===');
  await page.locator('.back').first().click();
  await page.waitForTimeout(1500);
  // Find practice task (type != explain)
  const practiceTask = await page.locator('.task-card[data-type="practice"], .task-card:nth-child(2)').count();
  console.log('  practice task count:', practiceTask);
  if (practiceTask > 0) {
    await page.locator('.task-card').nth(1).click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: SHOTS + '/07_practice.png', fullPage: true });
    const q1 = await page.locator('.q-text').isVisible().catch(() => false);
    console.log('  practice q1 visible:', q1);
  }

  // === Step 8: Try switching child ===
  console.log('\n=== Step 8: Back to home -> Switch child ===');
  await page.goto('http://localhost:5173/home');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SHOTS + '/08_home_again.png', fullPage: true });
  
  // Try parent view
  await page.goto('http://localhost:5173/parent');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SHOTS + '/09_parent.png', fullPage: true });
  const stats = await page.locator('.stat-card').count();
  console.log('  stat cards:', stats);

  // Settings
  await page.goto('http://localhost:5173/settings');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SHOTS + '/10_settings.png', fullPage: true });

  // Final issues dump
  fs.writeFileSync('C:/kaifa_teacher/ai-study/lingbao-app/test_screenshots/ISSUES.json', JSON.stringify(ISSUES, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log('Total issues found: ' + ISSUES.length);
  for (const i of ISSUES) console.log(' - ' + i.severity + ' ' + i.where + ': ' + i.what);
  
  await browser.close();
})().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
