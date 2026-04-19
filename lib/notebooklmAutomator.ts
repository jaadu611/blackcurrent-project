import { Page } from "playwright";
import path from "path";
import fs from "fs";

export async function automateNotebookLM(
  page: Page,
  folderPath: string,
  prompt: string,
  notebookTitle: string,
): Promise<string> {
  // Handle unexpected dialogs (e.g. "Stay or Leave" prompts)
  page.on("dialog", (dialog) => {
    console.log(`[NotebookLM] Dialog appeared: ${dialog.message()}. Dismissing...`);
    dialog.dismiss().catch(() => { });
  });

  // ── NEW: Check existing tabs first to see if "final test" is already open ──
  console.log(`[NotebookLM] Scanning existing tabs for: "${notebookTitle}"...`);
  const allPages = page.context().pages();
  let activePage = page;

  for (const p of allPages) {
    try {
      const pUrl = p.url();
      // Fast check: if it has /notebook/ it's a strong candidate
      if (pUrl.includes("/notebook/")) {
        const innerTitle = await p.evaluate(() => {
          return (document.querySelector('.notebook-title-edit, .title-text, h2') as HTMLElement)?.innerText || "";
        }).catch(() => "");

        if (innerTitle.toLowerCase().includes(notebookTitle.toLowerCase())) {
          console.log(`[NotebookLM] Found active tab for "${notebookTitle}". Using it.`);
          activePage = p;
          await activePage.bringToFront();
          break;
        }
      }
    } catch (err) { /* ignore stale pages */ }
  }

  let url = activePage.url();
  if (!url.includes("notebooklm.google.com")) {
    console.log(`[NotebookLM] No active tab found. Navigating to homepage...`);
    await activePage.goto("https://notebooklm.google.com/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await activePage.waitForTimeout(500);
    url = activePage.url();
  }

  // From here on, we use targetPage
  const targetPage = activePage;

  let notebookFound = false;

  // Quick check for the card on the homepage
  console.log(`[NotebookLM] Searching homepage for "${notebookTitle}"...`);
  const matchHandle = await targetPage.evaluateHandle(
    ({ title }: { title: string }) => {
      const cards = Array.from(document.querySelectorAll("mat-card, [role='button'], a[href*='notebook'], .notebook-card, .notebook-item"));
      const t = title.toLowerCase();
      return cards.find((el) => {
        const text = (el as HTMLElement).innerText?.toLowerCase() || "";
        return text.includes(t);
      }) || null;
    },
    { title: notebookTitle },
  );

  const matchedElement = matchHandle.asElement();
  if (matchedElement) {
    console.log(`[NotebookLM] Found notebook card. Clicking...`);
    await matchedElement.click({ force: true });
    try {
      await targetPage.waitForURL((u) => u.href.includes("/notebook/"), { timeout: 10000 });
      notebookFound = true;
    } catch (_) {
      console.warn("[NotebookLM] Clicked card but URL didn't change. Proceeding to create new.");
    }
  }

  if (!notebookFound) {
    console.log(`[NotebookLM] Notebook "${notebookTitle}" not found. Creating a NEW one...`);
    const createBtn = targetPage
      .locator(
        'button.create-new-button, [aria-label*="Create new notebook"], [aria-label*="New notebook"], .create-new-action-button',
      )
      .first();
    await createBtn.waitFor({ state: "visible", timeout: 10000 }).catch(() => { });
    await createBtn.click({ force: true }).catch(() => { });

    await targetPage.waitForURL((u) => u.href.includes("/notebook/"), { timeout: 20000 }).catch(() => { });
    await targetPage.waitForTimeout(1000);

    const titleEditTrigger = targetPage
      .locator(
        '[aria-label*="Rename notebook"], .notebook-title-edit, span:has-text("Untitled notebook"), h2:has-text("Untitled notebook")',
      )
      .first();

    if (await titleEditTrigger.isVisible().catch(() => false)) {
      await titleEditTrigger.click({ force: true });
      await targetPage.waitForTimeout(200);
    }

    const titleInput = targetPage
      .locator(
        'input[aria-label*="title"], input.title-input, textarea.title-input, input[value="Untitled notebook"]',
      )
      .first();

    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleInput.fill(notebookTitle);
      await targetPage.keyboard.press("Enter");
      await targetPage.waitForTimeout(300);
    }
  }

  const getSourceCount = async () => {
    return await targetPage.evaluate(() => {
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
      } catch (_) { }
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

      const uploadIconBtn = targetPage.locator(uploadIconBtnSelector).first();
      const openModal = async () => {
        if (await uploadIconBtn.isVisible().catch(() => false)) return;
        const addSourceBtn = targetPage
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
            .catch(() => { });
        }
      };

      await openModal();

      let fileChooserSuccess = false;
      let retries = 15;

      while (!fileChooserSuccess && retries > 0) {
        try {
          await uploadIconBtn.waitFor({ state: "visible", timeout: 5000 });
          await uploadIconBtn.scrollIntoViewIfNeeded();
          await targetPage.waitForTimeout(200);

          const [fileChooser] = await Promise.all([
            targetPage.waitForEvent("filechooser", { timeout: 20000 }),
            uploadIconBtn.click({ force: true, delay: 100 }),
          ]);

          await targetPage.waitForTimeout(200);
          await fileChooser.setFiles(batch);
          fileChooserSuccess = true;
        } catch (err: any) {
          retries--;
          await targetPage.waitForTimeout(2000);
          await openModal();
        }
      }

      if (!fileChooserSuccess) {
        break;
      }

      await targetPage.waitForTimeout(800);
    }

    try {
      const closeBtn = targetPage
        .locator('button[aria-label="Close"], .close-button')
        .first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click({ force: true, timeout: 3000 });
      }
    } catch { }

    const startWait = Date.now();
    const targetCount = initialCount + allFiles.length;
    let allProcessed = false;

    while (Date.now() - startWait < 120000) {
      const currentCountRaw = await getSourceCount();
      const currentCount = parseCount(currentCountRaw);

      const { nameMatchCount, isUploading } = await targetPage.evaluate((files) => {
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
        const hiddenSpinner = await targetPage.evaluate(() => {
          let found = false;
          const roots: (Element | Document | ShadowRoot)[] = [document.body];
          while (roots.length > 0) {
            const r = roots.shift()!;
            if ((r as HTMLElement).querySelector?.('mat-progress-spinner, [role="progressbar"], .progress-bar, .uploading-indicator')) return true;
            const walker = document.createTreeWalker(r as Node, NodeFilter.SHOW_ELEMENT);
            let n; while (n = walker.nextNode()) if ((n as HTMLElement).shadowRoot) roots.push((n as HTMLElement).shadowRoot!);
          }
          return false;
        });
        if (!hiddenSpinner) break;
      }
      await targetPage.waitForTimeout(2000);
    }

    if (allProcessed) {
      await targetPage.waitForTimeout(10000);
    }
  }

  const existingSnippets: string[] = await targetPage.evaluate(() => {
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
      await targetPage.waitForSelector(inputSelector, { timeout: 10000 });
      const input = targetPage.locator(inputSelector).first();
      await input.click({ force: true });
      await targetPage.waitForTimeout(200);
      await input.fill(prompt);
      await targetPage.waitForTimeout(200);
      const val = await input.inputValue();
      if (val.length >= prompt.length * 0.9) {
        await targetPage.keyboard.press("Enter");
        inputFilled = true;
        break;
      }
    } catch (e) {
      await targetPage.waitForTimeout(2000);
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
    const candidate = await targetPage.evaluate<{
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
            await targetPage.bringToFront();
            await targetPage
              .context()
              .grantPermissions(["clipboard-read", "clipboard-write"]);

            const clickSuccess = await targetPage.evaluate(() => {
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
              await targetPage.waitForTimeout(500);
              const clipboardText = await targetPage.evaluate(async () => {
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
          } catch (err) { }
        }
      } else {
        stableCount = 0;
        lastSeenLength = currentLength;
      }
    }
    await targetPage.waitForTimeout(1000);
  }

  throw new Error("Analysis timeout (5m)");
}
