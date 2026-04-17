// import { Page } from "playwright";
// import path from "path";
// import fs from "fs";

// const UI_JUNK_LABELS = [
//   "keep_pin",
//   "Save to note",
//   "copy_all",
//   "thumb_up",
//   "thumb_down",
//   "more_horiz",
//   "content_copy",
//   "bookmark",
//   "share",
// ];

// import { NotebookEntry, NotebookPlan } from "@/lib/types";

// export function parseNotebookPlan(raw: string): NotebookPlan {
//   let clean = raw.trim();
//   const jsonMatch = clean.match(/\{[\s\S]*\}/);
//   if (jsonMatch) {
//     clean = jsonMatch[0];
//   }

//   // Strip control characters (including literal newlines/tabs inside strings)
//   // that would otherwise break JSON.parse.
//   clean = clean.replace(/[\x00-\x1F]+/g, " ");

//   // Strip // comments that LLMs sometimes leak into their JSON output
//   clean = clean.replace(/\/\/.*$/gm, "");

//   try {
//     const obj = JSON.parse(clean);
//     return validatePlan(obj);
//   } catch (err: any) {
//     console.error("[NotebookLM Automator] Failed to parse JSON plan:", clean);
//     throw new Error(
//       `Failed to parse NotebookLM planner output: ${err.message}`,
//     );
//   }
// }

// function validatePlan(obj: unknown): NotebookPlan {
//   if (!obj || typeof obj !== "object") {
//     throw new Error("Invalid response: expected an object.");
//   }
//   const plan = obj as any;

//   if (plan.direct_answer && typeof plan.direct_answer === "string") {
//     return plan;
//   }

//   if (!Array.isArray(plan.notebooks)) {
//     throw new Error(
//       "Invalid NotebookPlan shape: expected { notebooks: [...] } or { direct_answer: '...' }",
//     );
//   }

//   if (plan.notebooks.length === 0) {
//     throw new Error("NotebookPlan has zero notebooks.");
//   }

//   return plan;
// }

// // ─── Text cleaning ────────────────────────────────────────────────────────────

// function cleanScrapedText(raw: string): string {
//   const lines = raw.split("\n");

//   let trailingQuestionStart = lines.length;
//   for (let i = lines.length - 1; i >= 0; i--) {
//     const t = lines[i].trim();
//     if (t === "" || t.endsWith("?")) {
//       trailingQuestionStart = i;
//     } else {
//       break;
//     }
//   }

//   return lines
//     .slice(0, trailingQuestionStart)
//     .filter((line) => {
//       const t = line.trim();
//       if (UI_JUNK_LABELS.includes(t)) return false;
//       if (/^[-*_]{3,}$/.test(t)) return false;
//       return true;
//     })
//     .join("\n")
//     .replace(/\n{3,}/g, "\n\n")
//     .trim();
// }

// // ─── Source deletion helper ───────────────────────────────────────────────────

// /**
//  * Attempts to delete a source from the currently open NotebookLM notebook by
//  * its display name (filename without extension, or full filename).
//  * Returns true if a deletion was performed.
//  */
// async function deleteSourceByName(
//   page: Page,
//   displayName: string,
// ): Promise<boolean> {
//   // Try multiple selector strategies to find the source card
//   const cardSelectors = [
//     `.source-card:has-text("${displayName}")`,
//     `.source-item:has-text("${displayName}")`,
//     `[data-source-title="${displayName}"]`,
//     `li:has-text("${displayName}")`,
//   ];

//   for (const sel of cardSelectors) {
//     try {
//       const card = page.locator(sel).first();
//       if (!(await card.isVisible({ timeout: 3000 }).catch(() => false))) {
//         continue;
//       }

//       // Open the source's context/more menu
//       const menuBtnSelectors = [
//         'button[aria-label*="More options"]',
//         'button[aria-label*="More"]',
//         "button.more-button",
//         "button.overflow-menu",
//         '[aria-label*="options"]',
//       ];

//       let menuOpened = false;
//       for (const menuSel of menuBtnSelectors) {
//         const menuBtn = card.locator(menuSel).first();
//         if (await menuBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
//           await menuBtn.click({ force: true });
//           await page.waitForTimeout(600);
//           menuOpened = true;
//           break;
//         }
//       }

//       if (!menuOpened) {
//         // Try right-clicking the card itself to get a context menu
//         await card.click({ button: "right", force: true });
//         await page.waitForTimeout(600);
//       }

//       // Click the Delete / Remove option in the menu
//       const deleteBtnSelectors = [
//         'button:has-text("Delete")',
//         '[role="menuitem"]:has-text("Delete")',
//         'button:has-text("Remove")',
//         '[role="menuitem"]:has-text("Remove")',
//       ];

//       let deleted = false;
//       for (const delSel of deleteBtnSelectors) {
//         const delBtn = page.locator(delSel).first();
//         if (await delBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
//           await delBtn.click({ force: true });
//           await page.waitForTimeout(500);

//           // Handle confirmation dialog if one appears
//           const confirmSelectors = [
//             'button:has-text("Delete")',
//             'button:has-text("Remove")',
//             'button:has-text("Confirm")',
//             '[aria-label*="confirm"]',
//           ];
//           for (const confSel of confirmSelectors) {
//             const confBtn = page.locator(confSel).last();
//             if (await confBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
//               await confBtn.click({ force: true });
//               await page.waitForTimeout(2500);
//               break;
//             }
//           }

//           deleted = true;
//           break;
//         }
//       }

//       if (deleted) {
//         return true;
//       }

//       // Close any open menu if delete wasn't found
//       await page.keyboard.press("Escape");
//       await page.waitForTimeout(300);
//     } catch (err: any) {
//       console.warn(
//         `[deleteSourceByName] Attempt with selector "${sel}" failed: ${err.message}`,
//       );
//     }
//   }

//   console.warn(
//     `[deleteSourceByName] Could not delete source: "${displayName}"`,
//   );
//   return false;
// }

// // ─── Main automator ───────────────────────────────────────────────────────────

// export async function automateNotebookLM(
//   page: Page,
//   files: string[],
//   subQuestion: string,
//   notebookTitle: string,
//   onStatus?: (msg: string, partial?: string, progress?: number) => void,
//   isFinalStep = false,
//   /**
//    * Files whose existing source in the notebook MUST be deleted and re-uploaded.
//    * Used when the content of an already-uploaded file has changed (e.g. phase2_insights.txt
//    * after a gap fill has been appended to it).
//    */
//   forceReplace?: string[],
// ): Promise<string> {
//   // ── Ensure we are on the NotebookLM homepage ─────────────────────────────
//   let url = page.url();
//   if (!url.includes("notebooklm.google.com")) {
//     onStatus?.("Navigating to NotebookLM...");
//     await page.goto("https://notebooklm.google.com/", {
//       waitUntil: "domcontentloaded",
//       timeout: 45000,
//     });
//     await page.waitForTimeout(500);
//     url = page.url();
//   }

//   if (url.includes("/notebook/")) {
//     onStatus?.("Switching to homepage...");
//     await page.goto("https://notebooklm.google.com/", {
//       waitUntil: "domcontentloaded",
//       timeout: 45000,
//     });
//     await page.waitForTimeout(500);
//   }

//   onStatus?.("Connecting to NotebookLM...");

//   const notebookNamePart = notebookTitle.split(" - ")[1] || notebookTitle;
//   let notebookFound = false;

//   // ── Try to find an existing notebook with this title ─────────────────────
//   const matchHandle = await page.evaluateHandle(
//     ({ title, namePart }) => {
//       const candidates = Array.from(
//         document.querySelectorAll(
//           "mat-card, [role='button'], a[href*='notebook'], .notebook-card, div.title, span.title",
//         ),
//       );
//       return (
//         candidates.find((el) => {
//           const text = (el as HTMLElement).innerText?.trim() || "";
//           return text === title;
//         }) || null
//       );
//     },
//     { title: notebookTitle, namePart: notebookNamePart },
//   );

//   const matchedElement = matchHandle.asElement();
//   if (matchedElement) {
//     const isLink = await matchedElement.evaluate(
//       (el) => el.tagName.toLowerCase() === "a",
//     );
//     if (isLink) {
//       const href = await matchedElement.evaluate(
//         (el) => (el as HTMLAnchorElement).href,
//       );
//       if (href) {
//         onStatus?.("Opening existing notebook...");
//         await page.goto(href, {
//           waitUntil: "domcontentloaded",
//           timeout: 20000,
//         });
//         notebookFound = true;
//       }
//     }

//     if (!notebookFound) {
//       onStatus?.("Opening existing notebook...");
//       await matchedElement.click({ force: true });
//       await page.waitForTimeout(1000);
//       try {
//         await page.waitForURL((u) => u.href.includes("/notebook/"), {
//           timeout: 15000,
//         });
//       } catch (_) {}
//       notebookFound = true;
//     }
//   }

//   // ── Create new notebook if not found ─────────────────────────────────────
//   if (!notebookFound) {
//     onStatus?.("Creating new notebook...");
//     const createBtn = page
//       .locator(
//         'button.create-new-button, [aria-label*="Create new notebook"], [aria-label*="New notebook"], .create-new-action-button, div:has-text("New notebook") > mat-icon, span:has-text("New notebook")',
//       )
//       .first();
//     await createBtn.waitFor({ state: "visible", timeout: 20000 });
//     await createBtn.click({ force: true });

//     await page.waitForURL((u) => u.href.includes("/notebook/"), {
//       timeout: 30000,
//     });
//     await page.waitForTimeout(1500);

//     // Rename notebook
//     const titleEditTrigger = page
//       .locator(
//         '[aria-label*="Rename notebook"], .notebook-title-edit, span:has-text("Untitled notebook"), h2:has-text("Untitled notebook")',
//       )
//       .first();

//     if (await titleEditTrigger.isVisible().catch(() => false)) {
//       await titleEditTrigger.click({ force: true });
//       await page.waitForTimeout(200);
//     }

//     const titleInput = page
//       .locator(
//         'input[aria-label*="title"], input.title-input, textarea.title-input, input[value="Untitled notebook"]',
//       )
//       .first();

//     if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
//       await titleInput.fill(notebookTitle);
//       await page.keyboard.press("Enter");
//       await page.waitForTimeout(300);
//     }
//   }

//   // Wait for the notebook to fully load
//   await page.waitForTimeout(1000);

//   // ── Force-replace specified sources BEFORE checking what needs uploading ──
//   if (forceReplace && forceReplace.length > 0) {
//     for (const fileToReplace of forceReplace) {
//       const baseName = path.basename(fileToReplace);
//       const baseNoExt = baseName.replace(/\.txt$/i, "");

//       onStatus?.(`Removing outdated source: ${baseName}...`);

//       // Try both with and without extension as the display name may differ
//       let deleted = await deleteSourceByName(page, baseName);
//       if (!deleted) {
//         deleted = await deleteSourceByName(page, baseNoExt);
//       }

//       if (deleted) {
//         // Give the UI a moment to settle after deletion
//         await page.waitForTimeout(800);
//       } else {
//         console.warn(
//           `[automateNotebookLM] Could not delete "${baseName}" — will attempt to upload anyway (duplicate may result).`,
//         );
//       }
//     }
//   }

//   // ── Determine which files still need uploading ────────────────────────────
//   const domHTML = await page.evaluate(() => document.body.innerText || "");

//   const filesToUpload = files.filter((file) => {
//     const baseName = path.basename(file);
//     const baseNoExt = baseName.replace(/\.txt$/i, "");

//     // If this file was force-replaced, always re-upload
//     if (forceReplace?.some((f) => path.basename(f) === baseName)) {
//       return true;
//     }

//     // Otherwise skip if it already appears in the notebook UI
//     return !domHTML.includes(baseName) && !domHTML.includes(baseNoExt);
//   });

//   // ── Upload files in batches ───────────────────────────────────────────────
//   if (filesToUpload.length > 0) {
//     onStatus?.(
//       `Syncing ${filesToUpload.length} context file${filesToUpload.length !== 1 ? "s" : ""}...`,
//     );

//     const uploadIconBtnSelector =
//       'button.drop-zone-icon-button, button:has-text("Upload files"), [aria-label*="Upload files"]';

//     const BATCH_SIZE = 100;
//     const MAX_BATCH_SIZE_BYTES = 1000 * 1024 * 1024;

//     const batches: string[][] = [];
//     let currentBatch: string[] = [];
//     let currentBatchSizeBytes = 0;

//     for (const file of filesToUpload) {
//       let fileSize = 0;
//       try {
//         fileSize = fs.statSync(file).size;
//       } catch (_) {}

//       if (
//         currentBatch.length > 0 &&
//         (currentBatch.length >= BATCH_SIZE ||
//           currentBatchSizeBytes + fileSize > MAX_BATCH_SIZE_BYTES)
//       ) {
//         batches.push(currentBatch);
//         currentBatch = [];
//         currentBatchSizeBytes = 0;
//       }
//       currentBatch.push(file);
//       currentBatchSizeBytes += fileSize;
//     }
//     if (currentBatch.length > 0) batches.push(currentBatch);

//     let uploadedCount = 0;

//     for (const batch of batches) {
//       if (batch.length === 0) continue;

//       // Ensure the upload modal / panel is open
//       const uploadIconBtn = page.locator(uploadIconBtnSelector).first();
//       const isModalOpen = await uploadIconBtn.isVisible().catch(() => false);
//       if (!isModalOpen) {
//         const addSourceBtn = page
//           .locator(
//             '.add-source-button, [aria-label="Add source"], button:has-text("Add source")',
//           )
//           .first();
//         if (
//           await addSourceBtn.isVisible({ timeout: 10000 }).catch(() => false)
//         ) {
//           await addSourceBtn.click({ force: true });
//           await page.waitForTimeout(800);
//         }
//       }

//       let fileChooserSuccess = false;
//       let retries = 15;

//       while (!fileChooserSuccess && retries > 0) {
//         try {
//           await uploadIconBtn.waitFor({ state: "visible", timeout: 5000 });
//           await uploadIconBtn.scrollIntoViewIfNeeded();
//           await page.waitForTimeout(200);

//           const [fileChooser] = await Promise.all([
//             page.waitForEvent("filechooser", { timeout: 20000 }),
//             uploadIconBtn.click({ force: true, delay: 100 }),
//           ]);

//           await page.waitForTimeout(200);

//           try {
//             await fileChooser.setFiles(batch);
//             fileChooserSuccess = true;
//           } catch (err: any) {
//             if (err.message.includes("transfer files larger than 50Mb")) {
//               try {
//                 const client = await page.context().newCDPSession(page);
//                 const { root } = await client.send("DOM.getDocument");
//                 const { nodeId } = await client.send("DOM.querySelector", {
//                   nodeId: root.nodeId,
//                   selector: 'input[type="file"]',
//                 });
//                 if (nodeId) {
//                   await client.send("DOM.setFileInputFiles", {
//                     files: batch,
//                     nodeId,
//                   });
//                   fileChooserSuccess = true;
//                 } else {
//                   throw new Error(
//                     "Could not find file input element via native CDP.",
//                   );
//                 }
//               } catch (cdpErr: any) {
//                 console.error(`Native CDP bypass failed: ${cdpErr.message}`);
//                 throw err;
//               }
//             } else {
//               throw err;
//             }
//           }
//         } catch (err: any) {
//           retries--;
//           await page.waitForTimeout(2000);
//           console.warn(
//             `fileChooser attempt failed: ${err.message}. Retrying... (${retries} left)`,
//           );
//           const stillVisible = await uploadIconBtn
//             .isVisible()
//             .catch(() => false);
//           if (!stillVisible) {
//             const addSourceBtn = page
//               .locator(
//                 '.add-source-button, [aria-label="Add source"], button:has-text("Add source")',
//               )
//               .first();
//             if (await addSourceBtn.isVisible().catch(() => false)) {
//               await addSourceBtn.click({ force: true });
//               await page.waitForTimeout(1500);
//             }
//           }
//         }
//       }

//       if (!fileChooserSuccess) {
//         console.warn("Unable to trigger file upload dialog. Proceeding...");
//         break;
//       }

//       uploadedCount += batch.length;
//       onStatus?.(
//         `Ingesting files... (${uploadedCount}/${filesToUpload.length})`,
//         undefined,
//         Math.round((uploadedCount / filesToUpload.length) * 100),
//       );
//       await page.waitForTimeout(800);
//     }

//     onStatus?.("Processing uploaded sources...");
//     const closeBtn = page
//       .locator('button[aria-label="Close"], .close-button')
//       .first();
//     if (await closeBtn.isVisible().catch(() => false)) {
//       await closeBtn.click({ force: true });
//     }
//     // Dynamic wait for all files to be processed
//     const startWait = Date.now();
//     let allProcessed = false;

//     onStatus?.("Waiting for UI to render uploaded sources...");
//     while (Date.now() - startWait < 40000) {
//       // Max 90 seconds wait
//       const { presentFiles, isUploading } = await page.evaluate((allFiles) => {
//         function getAllText(root = document.body) {
//           let text = root.innerText || "";
//           const walker = document.createTreeWalker(
//             root,
//             NodeFilter.SHOW_ELEMENT,
//           );
//           let node;
//           while ((node = walker.nextNode())) {
//             if ((node as HTMLElement).shadowRoot) {
//               text += " " + getAllText((node as HTMLElement).shadowRoot as any);
//             }
//           }
//           return text;
//         }

//         const currentText = getAllText();
//         const found = allFiles.filter((f) => {
//           const parts = f.split(/[\/\\]/);
//           const baseName = parts[parts.length - 1];
//           const baseNoExt = baseName.replace(/\.txt$/i, "");

//           // Truncation check: matches first 10 chars or full name
//           const truncated =
//             baseNoExt.length > 12 ? baseNoExt.substring(0, 10) : baseNoExt;

//           return (
//             currentText.includes(baseName) ||
//             currentText.includes(baseNoExt) ||
//             currentText.includes(truncated)
//           );
//         });

//         const uploading =
//           currentText.includes("Uploading") ||
//           document.querySelectorAll(
//             'mat-progress-spinner, [role="progressbar"]',
//           ).length > 0;

//         return { presentFiles: found.length, isUploading: uploading };
//       }, files);

//       allProcessed = presentFiles === files.length;

//       // If most files are present and uploading spinner is gone, or after 15s if all files are finally in DOM
//       if (allProcessed && (!isUploading || Date.now() - startWait > 15000)) {
//         break;
//       }
//       await page.waitForTimeout(1000);
//     }

//     if (!allProcessed) {
//       console.warn(
//         `[NotebookLM Automator] Timed out waiting for all files. Found ${allProcessed} of ${files.length}. Proceeding anyway.`,
//       );
//     } else {
//       await page.waitForTimeout(1500);
//     }
//   }

//   // ── Ask the sub-question ──────────────────────────────────────────────────
//   onStatus?.("Dispatching sub-question...");

//   const existingResponseSnapshotSnippet: string[] = await page.evaluate(`
//     (() => {
//       function findDeep(selector, root = document) {
//         let els = Array.from(root.querySelectorAll(selector));
//         for (const el of root.querySelectorAll("*")) {
//           if (el.shadowRoot) els = els.concat(findDeep(selector, el.shadowRoot));
//         }
//         return els;
//       }
//       const actionButtons = findDeep('button[aria-label*="Copy"], button[aria-label*="Save"], button[aria-label*="note"]');
//       const containers = actionButtons
//         .map((btn) => btn.closest(".message-content, .model-response, .response-bubble, div"))
//         .filter(Boolean);
//       const aiContainers = findDeep('div:has(> button[aria-label*="Copy"]), div:has(> button[aria-label*="Save"]), .model-response, [class*="markdown"], [class*="response-text"]');
//       const all = [...new Set([...aiContainers, ...containers])];
//       return all.map((el) => el.innerText.trim().substring(0, 200));
//     })()
//   `);

//   const inputSelector =
//     'textarea[placeholder*="Ask"], .chat-input textarea, textarea[aria-label*="Query"]';
//   await page.waitForSelector(inputSelector, { timeout: 30000 });
//   await page.fill(inputSelector, subQuestion);
//   await page.keyboard.press("Enter");

//   onStatus?.("Waiting for AI to respond...");
//   const startTime = Date.now();
//   let lastSeenLength = 0;
//   let stableCount = 0;
//   const STABLE_POLLS_NEEDED = 2;

//   while (Date.now() - startTime < 300000) {
//     const candidate = await page.evaluate<{
//       text: string;
//       isGenerating: boolean;
//     } | null>(`
//       ((snapshot) => {
//         function findElementsDeep(selector, root = document) {
//           let elements = Array.from(root.querySelectorAll(selector));
//           for (const el of root.querySelectorAll("*")) {
//             if (el.shadowRoot) {
//               elements = elements.concat(findElementsDeep(selector, el.shadowRoot));
//             }
//           }
//           return elements;
//         }

//         const isGenerating = findElementsDeep('.loading-indicator, [aria-label*="Generating"], .generating, .response-loading').length > 0;

//         const actionButtons = findElementsDeep('button[aria-label*="Copy"], button[aria-label*="Save"], button[aria-label*="note"]');
//         const bubblesWithButtons = actionButtons
//           .map((btn) => btn.closest(".message-content, .model-response, .response-bubble, div"))
//           .filter((b) => b !== null);

//         const aiResponseContainers = findElementsDeep('div:has(> button[aria-label*="Copy"]), div:has(> button[aria-label*="Save"]), .model-response, [class*="markdown"], [class*="response-text"]');

//         const candidates = [...new Set([...aiResponseContainers, ...bubblesWithButtons])];

//         const newResponses = candidates.filter((el) => {
//           const preview = el.innerText.trim().substring(0, 200);
//           return !snapshot.includes(preview);
//         });

//         const substantive = newResponses
//           .map((b) => b.innerText.trim())
//           .filter((t) => t.length > 100);

//         if (substantive.length > 0) {
//           return { text: substantive[substantive.length - 1], isGenerating };
//         }
//         return null;
//       })(${JSON.stringify(existingResponseSnapshotSnippet)})
//     `);

//     if (candidate) {
//       const rawText = candidate.text;

//       if (isFinalStep) {
//         onStatus?.("Generating...", rawText);
//       } else {
//         onStatus?.("Synthesizing response...");
//       }

//       const currentLength = rawText.length;
//       if (currentLength === lastSeenLength && !candidate.isGenerating) {
//         stableCount++;
//         if (stableCount >= STABLE_POLLS_NEEDED) {
//           try {
//             await page.bringToFront();
//             await page
//               .context()
//               .grantPermissions(["clipboard-read", "clipboard-write"]);
//             const clickSuccess = await page.evaluate(() => {
//               function findElementsDeep(
//                 selector: string,
//                 root: Document | DocumentFragment | Element = document,
//               ): Element[] {
//                 let els = Array.from(root.querySelectorAll(selector));
//                 for (const el of Array.from(root.querySelectorAll("*"))) {
//                   if (el.shadowRoot)
//                     els = els.concat(findElementsDeep(selector, el.shadowRoot));
//                 }
//                 return els;
//               }
//               const potentialBtns = findElementsDeep("button") as HTMLElement[];
//               const btns = potentialBtns.filter((b) => {
//                 const label = (
//                   b.getAttribute("aria-label") || ""
//                 ).toLowerCase();
//                 const text = b.innerText.toLowerCase();
//                 return (
//                   label.includes("copy") ||
//                   text.includes("copy_all") ||
//                   text.includes("content_copy")
//                 );
//               });
//               if (btns.length > 0) {
//                 // Click the last copy button found, representing the latest response
//                 btns[btns.length - 1].click();
//                 return true;
//               }
//               return false;
//             });

//             if (clickSuccess) {
//               await page.waitForTimeout(300); // Give UI time to push to clipboard
//               const clipboardText = await page.evaluate(async () => {
//                 try {
//                   return await navigator.clipboard.readText();
//                 } catch (e: any) {
//                   return "ERROR: " + e.message;
//                 }
//               });

//               if (clipboardText && clipboardText.startsWith("ERROR: ")) {
//                 console.warn(
//                   "[NotebookLM Automator] Clipboard API failed:",
//                   clipboardText,
//                 );
//               } else if (clipboardText && clipboardText.length > 50) {
//                 return clipboardText.trim();
//               }
//             }
//           } catch (err: any) {
//             console.warn(
//               "[NotebookLM Automator] Clipboard copy error, falling back to scraped text:",
//               err.message,
//             );
//           }

//           return cleanScrapedText(rawText);
//         }
//       } else {
//         stableCount = 0;
//         lastSeenLength = currentLength;
//       }
//     }

//     await page.waitForTimeout(500);
//   }

//   throw new Error("Analysis timeout (5m)");
// }
