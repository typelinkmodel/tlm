import { test, expect } from "./fixtures";

test.describe("Home Page", () => {
  test('should display "Hello World"', async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Hello World" }),
    ).toBeVisible();
  });

  test("should have correct page title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("http://localhost:3000/");
  });
});
