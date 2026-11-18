import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const base = process.env.BASE_URL || "http://localhost:3000";
await mkdir("docs/screenshots", { recursive: true });
await mkdir("public/demo", { recursive: true });
await page.goto(base);
await page.screenshot({
  path: "docs/screenshots/home-desktop.png",
  fullPage: true,
});
await page.goto(`${base}/compare/new?demo=difference`);
for (const [index, kind] of ["EC60(E)", "EC8A"].entries()) {
  const link = page.getByRole("link", {
    name: "Download original ↗",
    exact: true,
  });
  await link.waitFor();
  const data = await link.getAttribute("href");
  await writeFile(
    `public/demo/synthetic-${index === 0 ? "ec60e" : "ec8a"}.png`,
    Buffer.from(data.split(",")[1], "base64"),
  );
  await page.getByLabel("I checked these identifiers").check();
  await page
    .getByRole("button", { name: `Confirm ${kind} & continue` })
    .click();
}
await page
  .getByRole("heading", { name: "Difference detected", exact: true })
  .waitFor();
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({
  path: "docs/screenshots/report-desktop.png",
  fullPage: true,
});
if (process.env.CAPTURE_PDF !== "false")
  await page.pdf({
    path: "docs/screenshots/synthetic-evidence-report.pdf",
    format: "A4",
    printBackground: true,
  });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/compare/new?demo=match`);
await page.getByLabel("Votes 1", { exact: true }).waitFor();
await page.screenshot({
  path: "docs/screenshots/review-mobile.png",
  fullPage: true,
});
await browser.close();
console.log(
  "Captured synthetic demo screenshots, original sample PNGs and a printed report.",
);
