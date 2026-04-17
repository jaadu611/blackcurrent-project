import { Page } from "playwright";
import path from "path";
import fs from "fs";

export async function automateNotebookLM(
  page: Page,
  folderPath: string,
  prompt: string,
  notebookTitle: string,
): Promise<string> {
  let url = page.url();
  if (!url.includes("notebooklm.google.com")) {
    await page.goto("https://notebooklm.google.com/", {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await page.waitForTimeout(500);
    url = page.url();
  }

  if (url.includes("/notebook/")) {
    await page.goto("https://notebooklm.google.com/", {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await page.waitForTimeout(500);
  }

  let notebookFound = false;
  const matchHandle = await page.evaluateHandle(
    ({ title }: { title: string }) => {
      const candidates = Array.from(
        document.querySelectorAll(
          "mat-card, [role='button'], a[href*='notebook'], .notebook-card, div.title, span.title",
        ),
      );
      return (
        candidates.find(
          (el) => (el as HTMLElement).innerText?.trim() === title,
        ) || null
      );
    },
    { title: notebookTitle },
  );

  const matchedElement = matchHandle.asElement();
  if (matchedElement) {
    const isLink = await matchedElement.evaluate(
      (el) => el.tagName.toLowerCase() === "a",
    );
    if (isLink) {
      const href = await matchedElement.evaluate(
        (el) => (el as HTMLAnchorElement).href,
      );
      if (href) {
        await page.goto(href, {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        });
        notebookFound = true;
      }
    }

    if (!notebookFound) {
      await matchedElement.click({ force: true });
      await page.waitForTimeout(1000);
      try {
        await page.waitForURL((u) => u.href.includes("/notebook/"), {
          timeout: 15000,
        });
      } catch (_) {}
      notebookFound = true;
    }
  }

  if (!notebookFound) {
    const createBtn = page
      .locator(
        'button.create-new-button, [aria-label*="Create new notebook"], [aria-label*="New notebook"], .create-new-action-button, div:has-text("New notebook") > mat-icon, span:has-text("New notebook")',
      )
      .first();
    await createBtn.waitFor({ state: "visible", timeout: 20000 });
    await createBtn.click({ force: true });

    await page.waitForURL((u) => u.href.includes("/notebook/"), {
      timeout: 30000,
    });
    await page.waitForTimeout(1500);

    const titleEditTrigger = page
      .locator(
        '[aria-label*="Rename notebook"], .notebook-title-edit, span:has-text("Untitled notebook"), h2:has-text("Untitled notebook")',
      )
      .first();

    if (await titleEditTrigger.isVisible().catch(() => false)) {
      await titleEditTrigger.click({ force: true });
      await page.waitForTimeout(200);
    }

    const titleInput = page
      .locator(
        'input[aria-label*="title"], input.title-input, textarea.title-input, input[value="Untitled notebook"]',
      )
      .first();

    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleInput.fill(notebookTitle);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
    }
  }

  const getSourceCount = async () => {
    return await page.evaluate(() => {
      const roots: (Element | Document | ShadowRoot)[] = [document.body];
      while (roots.length > 0) {
        const root = roots.shift()!;
        const el = (root as HTMLElement).querySelector(
          ".cover-subtitle-source-count",
        );
        if (el) return (el as HTMLElement).innerText || "";
        const walker = document.createTreeWalker(
          root as Node,
          NodeFilter.SHOW_ELEMENT,
        );
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if ((node as HTMLElement).shadowRoot)
            roots.push((node as HTMLElement).shadowRoot!);
        }
      }
      return "";
    });
  };

  const parseCount = (txt: string) => {
    const num = parseInt(txt.replace(/\D/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const initialCountRaw = await getSourceCount();
  const initialCount = parseCount(initialCountRaw);

  const allFiles = fs
    .readdirSync(folderPath)
    .map((f) => path.join(folderPath, f))
    .filter((f) => fs.statSync(f).isFile());

  if (allFiles.length > 0) {
    const uploadIconBtnSelector =
      'button.drop-zone-icon-button, button:has-text("Upload files"), [aria-label*="Upload files"]';

    const BATCH_SIZE = 100;
    const MAX_BATCH_BYTES = 1000 * 1024 * 1024;
    const batches: string[][] = [];
    let currentBatch: string[] = [];
    let currentBatchBytes = 0;

    for (const file of allFiles) {
      let fileSize = 0;
      try {
        fileSize = fs.statSync(file).size;
      } catch (_) {}
      if (
        currentBatch.length > 0 &&
        (currentBatch.length >= BATCH_SIZE ||
          currentBatchBytes + fileSize > MAX_BATCH_BYTES)
      ) {
        batches.push(currentBatch);
        currentBatch = [];
        currentBatchBytes = 0;
      }
      currentBatch.push(file);
      currentBatchBytes += fileSize;
    }
    if (currentBatch.length > 0) batches.push(currentBatch);

    for (const batch of batches) {
      if (batch.length === 0) continue;

      const uploadIconBtn = page.locator(uploadIconBtnSelector).first();
      const openModal = async () => {
        if (await uploadIconBtn.isVisible().catch(() => false)) return;
        const addSourceBtn = page
          .locator(
            '.add-source-button, [aria-label="Add source"], button:has-text("Add source")',
          )
          .first();
        if (
          await addSourceBtn.isVisible({ timeout: 10000 }).catch(() => false)
        ) {
          await addSourceBtn.click({ force: true });
          await uploadIconBtn
            .waitFor({ state: "visible", timeout: 8000 })
            .catch(() => {});
        }
      };

      await openModal();

      let fileChooserSuccess = false;
      let retries = 15;

      while (!fileChooserSuccess && retries > 0) {
        try {
          await uploadIconBtn.waitFor({ state: "visible", timeout: 5000 });
          await uploadIconBtn.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);

          const [fileChooser] = await Promise.all([
            page.waitForEvent("filechooser", { timeout: 20000 }),
            uploadIconBtn.click({ force: true, delay: 100 }),
          ]);

          await page.waitForTimeout(200);
          await fileChooser.setFiles(batch);
          fileChooserSuccess = true;
        } catch (err: any) {
          retries--;
          await page.waitForTimeout(2000);
          await openModal();
        }
      }

      if (!fileChooserSuccess) {
        break;
      }

      await page.waitForTimeout(800);
    }

    try {
      const closeBtn = page
        .locator('button[aria-label="Close"], .close-button')
        .first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click({ force: true, timeout: 3000 });
      }
    } catch {}

    const startWait = Date.now();
    const targetCount = initialCount + allFiles.length;
    let allProcessed = false;

    while (Date.now() - startWait < 120000) {
      const currentCountRaw = await getSourceCount();
      const currentCount = parseCount(currentCountRaw);

      const { nameMatchCount, isUploading } = await page.evaluate((files) => {
        let currentText = "";
        const roots: (Element | Document | ShadowRoot)[] = [document.body];
        while (roots.length > 0) {
          const root = roots.shift()!;
          currentText += " " + ((root as HTMLElement).innerText || "");
          const walker = document.createTreeWalker(
            root as Node,
            NodeFilter.SHOW_ELEMENT,
          );
          let node: Node | null;
          while ((node = walker.nextNode())) {
            if ((node as HTMLElement).shadowRoot)
              roots.push((node as HTMLElement).shadowRoot!);
          }
        }

        const found = files.filter((f: string) => {
          const parts = f.split(/[\/\\]/);
          const baseName = parts[parts.length - 1];
          const baseNoExt = baseName.replace(/\.txt$/i, "");
          const truncated =
            baseNoExt.length > 12 ? baseNoExt.substring(0, 10) : baseNoExt;
          return (
            currentText.includes(baseName) ||
            currentText.includes(baseNoExt) ||
            currentText.includes(truncated)
          );
        });

        const uploading =
          /Uploading|Processing|Pending|Scanning|Extracting|index/i.test(currentText) ||
          document.querySelectorAll(
            'mat-progress-spinner, [role="progressbar"], .progress-bar, .uploading-indicator, .processing-indicator',
          ).length > 0;

        return { nameMatchCount: found.length, isUploading: uploading };
      }, allFiles);

      allProcessed =
        currentCount >= targetCount && nameMatchCount >= allFiles.length;

      if (allProcessed && !isUploading) {
        // Double check for any hidden progress bars before breaking
        const hiddenSpinner = await page.evaluate(() => {
           let found = false;
           const roots: (Element | Document | ShadowRoot)[] = [document.body];
           while(roots.length > 0) {
             const r = roots.shift()!;
             if ((r as HTMLElement).querySelector?.('mat-progress-spinner, [role="progressbar"], .progress-bar, .uploading-indicator')) return true;
             const walker = document.createTreeWalker(r as Node, NodeFilter.SHOW_ELEMENT);
             let n; while(n = walker.nextNode()) if((n as HTMLElement).shadowRoot) roots.push((n as HTMLElement).shadowRoot!);
           }
           return false;
        });
        if (!hiddenSpinner) break;
      }
      await page.waitForTimeout(2000);
    }

    if (allProcessed) {
      await page.waitForTimeout(10000);
    }
  }

  const existingSnippets: string[] = await page.evaluate(() => {
    let found: HTMLElement[] = [];
    let roots: (Document | Element | ShadowRoot)[] = [document];
    while (roots.length > 0) {
      let root = roots.shift()!;
      const nodes = Array.from(root.querySelectorAll("*")) as HTMLElement[];
      for (const el of nodes) {
        const label = (el.getAttribute("aria-label") || "").toLowerCase();
        if (label.includes("copy") || label.includes("save") || label.includes("note")) {
          found.push(el);
        }
        if (el.shadowRoot) roots.push(el.shadowRoot);
      }
    }
    const containers = found
      .map((btn) => btn.closest(".message-content, .model-response, .response-bubble, div"))
      .filter((b): b is HTMLElement => b !== null);

    let aiFound: HTMLElement[] = [];
    roots = [document];
    while (roots.length > 0) {
      let root = roots.shift()!;
      const nodes = Array.from(root.querySelectorAll('div, .model-response, [class*="markdown"], [class*="response-text"]')) as HTMLElement[];
      for (const el of nodes) {
        // Safe class check
        const className = typeof el.className === 'string' ? el.className : (el.className as any)?.baseVal || '';
        if (className.includes("model-response") || className.includes("markdown") || className.includes("response-text")) {
          aiFound.push(el);
        }
        // Also check if it contains a copy button directly
        if (el.querySelector('button[aria-label*="Copy"], button[aria-label*="Save"]')) {
           aiFound.push(el);
        }
      }
      const allElems = Array.from(root.querySelectorAll("*")) as HTMLElement[];
      for (const el of allElems) {
        if (el.shadowRoot) roots.push(el.shadowRoot);
      }
    }
    return [...new Set([...aiFound, ...containers])].map((el) => el.innerText.trim().substring(0, 200));
  });

  const inputSelector =
    'textarea[placeholder*="Ask"], .chat-input textarea, textarea[aria-label*="Query"]';
  
  let inputFilled = false;
  for (let i = 0; i < 10; i++) {
    try {
      await page.waitForSelector(inputSelector, { timeout: 10000 });
      const input = page.locator(inputSelector).first();
      await input.click({ force: true });
      await page.waitForTimeout(200);
      await input.fill(prompt);
      await page.waitForTimeout(200);
      const val = await input.inputValue();
      if (val.length >= prompt.length * 0.9) {
        await page.keyboard.press("Enter");
        inputFilled = true;
        break;
      }
    } catch (e) {
      await page.waitForTimeout(2000);
    }
  }
  
  if (!inputFilled) {
     throw new Error("Failed to fill prompt into NotebookLM input.");
  }

  const startTime = Date.now();
  let lastSeenLength = 0;
  let stableCount = 0;
  const STABLE_POLLS_NEEDED = 2;

  while (Date.now() - startTime < 300000) {
    const candidate = await page.evaluate<{
      text: string;
      isGenerating: boolean;
    } | null, string[]>((snapshot) => {
      let allNodes: HTMLElement[] = [];
      let roots: (Document | Element | ShadowRoot)[] = [document];
      while (roots.length > 0) {
        let root = roots.shift()!;
        const nodes = Array.from(root.querySelectorAll("*")) as HTMLElement[];
        allNodes.push(...nodes);
        for (const el of nodes) {
          if (el.shadowRoot) roots.push(el.shadowRoot);
        }
      }

      const isGenerating = allNodes.some(n => {
        const label = (n.getAttribute?.('aria-label') || '').toLowerCase();
        const className = typeof n.className === 'string' ? n.className : (n.className as any)?.baseVal || '';
        return label.includes('generating') || className.includes('loading-indicator') || className.includes('generating') || className.includes('response-loading');
      });

      const actionBtns = allNodes.filter(n => {
        if (n.tagName !== 'BUTTON') return false;
        const label = (n.getAttribute?.('aria-label') || '').toLowerCase();
        return label.includes('copy') || label.includes('save') || label.includes('note');
      });

      const bubblesWithBtns = actionBtns
        .map((btn) => btn.closest(".message-content, .model-response, .response-bubble, div"))
        .filter((b): b is HTMLElement => b !== null);

      const aiContainers = allNodes.filter(n => {
        const className = typeof n.className === 'string' ? n.className : (n.className as any)?.baseVal || '';
        return className.includes('model-response') || className.includes('markdown') || className.includes('response-text');
      });

      const candidates = [...new Set([...aiContainers, ...bubblesWithBtns])];

      const newResponses = candidates.filter((el) => {
        const preview = el.innerText.trim().substring(0, 200);
        return !snapshot.includes(preview);
      });

      const doneGenerating = allNodes.some(n => {
        const className = typeof n.className === 'string' ? n.className : (n.className as any)?.baseVal || '';
        return className.includes('submit-button');
      });

      const substantive = newResponses
        .map((b) => b.innerText.trim())
        .filter((t) => t.length > 100);

      if (substantive.length > 0) {
        return { text: substantive[substantive.length - 1], isGenerating: isGenerating && !doneGenerating };
      }
      return null;
    }, existingSnippets);

    if (candidate) {
      const currentLength = candidate.text.length;
      if (currentLength === lastSeenLength && !candidate.isGenerating) {
        stableCount++;
        if (stableCount >= STABLE_POLLS_NEEDED) {
          try {
            await page.bringToFront();
            await page
              .context()
              .grantPermissions(["clipboard-read", "clipboard-write"]);

            const clickSuccess = await page.evaluate(() => {
              let allBtns: HTMLElement[] = [];
              let roots: (Document | Element | ShadowRoot)[] = [document];
              while (roots.length > 0) {
                const root = roots.shift()!;
                const nodes = Array.from(root.querySelectorAll("*")) as HTMLElement[];
                for (const el of nodes) {
                  if (el.tagName === 'BUTTON') allBtns.push(el);
                  if (el.shadowRoot) roots.push(el.shadowRoot);
                }
              }
              const copyBtns = allBtns.filter((b) => {
                const label = (b.getAttribute("aria-label") || "").toLowerCase();
                const text = b.innerText.toLowerCase();
                return label.includes("copy") || text.includes("copy_all") || text.includes("content_copy");
              });
              if (copyBtns.length > 0) {
                copyBtns[copyBtns.length - 1].click();
                return true;
              }
              return false;
            });

            if (clickSuccess) {
              await page.waitForTimeout(500);
              const clipboardText = await page.evaluate(async () => {
                try {
                  return await navigator.clipboard.readText();
                } catch (e: any) {
                  return "ERROR: " + e.message;
                }
              });

              if (clipboardText && !clipboardText.startsWith("ERROR: ") && clipboardText.length > 50) {
                return clipboardText.trim();
              }
            }
          } catch (err) {}
        }
      } else {
        stableCount = 0;
        lastSeenLength = currentLength;
      }
    }
    await page.waitForTimeout(1000);
  }

  throw new Error("Analysis timeout (5m)");
}
