
export const runtime = 'nodejs';

import { chromium } from 'playwright';
import fs from 'node:fs';  
 

export async function renderEmailToPng(mjml: string) {
  
    // use package to convert mjml to html 
    let html: string;
    try {
        const { default: mjml2html } = await import('mjml'); 
        const result = mjml2html(mjml);
        html = result.html;
    } catch (error) {
        console.error('[renderEmailToPng] Failed to import/use mjml', error);
        throw error;
    }
    // console.log("[renderEmailToPng] launching browser");
            
    const browser = await chromium.launch({headless: true}); // set headless: true by default
    // console.log("[renderEmailToPng] browser launched");
    const page = await browser.newPage({
        viewport: { width: 600, height: 2000} // tweak as needed
    });

    console.log("[renderEmailToPng] page", page);
    // Inject a base URL so root-relative assets like /uploads/* resolve correctly
    const baseHref = '<base href="http://localhost:3000/">';
    if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, (match) => `${match}${baseHref}`);
    } else if (/<html[^>]*>/i.test(html)) {
        html = html.replace(/<html[^>]*>/i, (match) => `${match}<head>${baseHref}</head>`);
    } else {
        html = `${baseHref}${html}`;
    }

    // Load your email markup directly (no network flakiness)
    await page.setContent(html, { waitUntil: 'networkidle' });
    console.log("[renderEmailToPng] page set content");

    // Ensure fonts are loaded before capture
    await page.evaluate(() => (document as any).fonts?.ready);
    console.log("[renderEmailToPng] page fonts ready");

    // Ensure body is visible before capturing
    await page.waitForSelector('body', { state: 'visible' });
    
    // Try to screenshot a specific container if present; otherwise fallback to full page
    const email = page.locator('#email');
    const emailCount = await email.count();
    console.log("[renderEmailToPng] email count", emailCount);
    let buffer: Buffer;
    if (emailCount > 0) {
        buffer = await email.first().screenshot({ type: 'png', timeout: 5000 });
    } else {
        buffer = await page.screenshot({ type: 'png', fullPage: true });
    }

    console.log("[renderEmailToPng] buffer", buffer);
    await browser.close();

    // If you want base64 for an LLM multipart upload:
    const b64 = buffer.toString('base64');
    fs.writeFileSync('email.png', buffer);

    // save html to file
    console.log('[renderEmailToPng] saved file');

    return { buffer, base64: b64 };
}