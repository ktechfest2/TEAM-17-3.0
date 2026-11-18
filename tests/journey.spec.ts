import { test, expect, type Page } from "@playwright/test";
async function confirm(page: Page, kind: string) {
  await page.getByLabel("I checked these identifiers").check();
  await page
    .getByRole("button", { name: `Confirm ${kind} & continue` })
    .click();
}
test("manual no-key flow persists source review and reports +100 on a narrow viewport", async ({
  page,
}) => {
  await page.goto("/compare/new?demo=difference");
  await expect(page.getByText("SYNTHETIC DEMO · Mock forms")).toBeVisible();
  await page.getByText("Optional AI extraction", { exact: true }).click();
  await page.getByLabel("I consent to sending").check();
  await page.getByRole("button", { name: "Suggest party counts" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("not configured");
  await page.getByLabel("Votes 2", { exact: true }).fill("-1");
  await page.getByLabel("I checked these identifiers").check();
  await page
    .getByRole("button", { name: "Confirm EC60(E) & continue" })
    .click();
  await expect(page.locator("p[role=alert]")).toContainText("whole numbers");
  await page.getByLabel("Votes 2", { exact: true }).fill("85");
  await confirm(page, "EC60(E)");
  await expect(
    page.getByRole("heading", { name: "Corresponding result sheet" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await page.reload();
  await expect(page.getByLabel("Votes 2", { exact: true })).toHaveValue("185");
  await confirm(page, "EC8A");
  await expect(
    page.getByRole("heading", { name: "Difference detected", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "+100", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Difference detected does not establish"),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /source evidence/ })).toHaveCount(
    2,
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download evidence JSON" }).click();
  expect((await download).suggestedFilename()).toMatch(/resulttrace.*json/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await page.goto("/comparisons");
  await page.getByRole("link", { name: "Open report" }).click();
  await expect(
    page.getByRole("heading", { name: "Difference detected", exact: true }),
  ).toBeVisible();
});
for (const [mode, status] of [
  ["match", "Match"],
  ["identity", "Cannot compare—identity needs review"],
  ["missing", "Insufficient evidence"],
]) {
  test(`synthetic ${mode} gives ${status}`, async ({ page }) => {
    await page.goto(`/compare/new?demo=${mode}`);
    await confirm(page, "EC60(E)");
    await confirm(page, "EC8A");
    await expect(
      page.getByRole("heading", { name: status, exact: true }),
    ).toBeVisible();
  });
}
test("draft can be edited and saved while offline in the open app", async ({
  page,
  context,
}) => {
  await page.goto("/compare/new");
  await page
    .getByLabel("Election title", { exact: true })
    .fill("Offline test election");
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await context.setOffline(true);
  await page
    .getByLabel("Election title", { exact: true })
    .fill("Offline saved edit");
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByLabel("Election title", { exact: true })).toHaveValue(
    "Offline saved edit",
  );
});
test("unsafe file contents fail gracefully and keyboard has a skip link", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.goto("/compare/new");
  await page.getByRole("button", { name: "Continue to source image" }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "fake.png",
    mimeType: "image/png",
    buffer: Buffer.from("<svg>unsafe</svg>"),
  });
  await expect(page.locator("p[role=alert]")).toContainText(
    "contents do not match",
  );
});
