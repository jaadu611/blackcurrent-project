// import { Page } from "playwright";

// /**
//  * Automates ChatGPT to transform structural JSON into a high-level architectural manual.
//  */
// export async function automateChatGPT(
//   page: Page,
//   prompt: string,
//   onStatus?: (msg: string) => void,
// ): Promise<string> {
//   onStatus?.("Navigating to ChatGPT...");

//   const currentUrl = page.url();
//   if (!currentUrl.includes("chatgpt.com")) {
//     await page.goto("https://chatgpt.com/", {
//       waitUntil: "domcontentloaded",
//       timeout: 60000,
//     });
//     await page.waitForTimeout(3000);
//   }

//   onStatus?.("Preparing Staff-Level Engineer persona...");

//   const inputSelector = '#prompt-textarea';
//   const inputHandle = await page.waitForSelector(inputSelector, { timeout: 30000 });
//   if (!inputHandle) throw new Error("Could not find ChatGPT input box.");

//   onStatus?.("Uploading structural JSON to ChatGPT...");
//   await inputHandle.click();
//   await page.keyboard.insertText(prompt);
//   await page.waitForTimeout(500);
//   await page.keyboard.press("Enter");

//   onStatus?.("Synthesizing architectural manual...");

//   // Wait for the response to start and finish
//   // We look for the "Stop generating" button to disappear or the "Copy" button to appear on the last message
//   const startTime = Date.now();
//   let lastText = "";
//   let stableCount = 0;
//   const STABLE_POLLS_NEEDED = 3;

//   while (Date.now() - startTime < 300000) { // 5 minute timeout
//     const result = await page.evaluate(() => {
//       const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
//       if (messages.length === 0) return null;

//       const lastMessage = messages[messages.length - 1] as HTMLElement;
//       const isGenerating = !!document.querySelector('button[aria-label="Stop generating"]');

//       return {
//         text: lastMessage.innerText.trim(),
//         isGenerating
//       };
//     });

//     if (result) {
//       if (!result.isGenerating && result.text === lastText && result.text.length > 100) {
//         stableCount++;
//         if (stableCount >= STABLE_POLLS_NEEDED) {
//           try {
//             await page.bringToFront();
//             await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

//             const clickSuccess = await page.evaluate(() => {
//               const messages = Array.from(document.querySelectorAll('[data-message-author-role="assistant"]'));
//               if (messages.length > 0) {
//                 const lastMessage = messages[messages.length - 1];
//                 function findElementsDeep(selector: string, root: Document | DocumentFragment | Element = document): Element[] {
//                   let els = Array.from(root.querySelectorAll(selector));
//                   for (const el of Array.from(root.querySelectorAll('*'))) {
//                     if (el.shadowRoot) els = els.concat(findElementsDeep(selector, el.shadowRoot));
//                   }
//                   return els;
//                 }
//                 const copyBtns = findElementsDeep('button[aria-label*="Copy"]', lastMessage) as HTMLElement[];
//                 if (copyBtns.length > 0) {
//                   copyBtns[copyBtns.length - 1].click();
//                   return true;
//                 }
//               }
//               return false;
//             });

//             if (clickSuccess) {
//               await page.waitForTimeout(600); // Give UI time to push to clipboard
//               const clipboardText = await page.evaluate(async () => {
//                 try {
//                   return await navigator.clipboard.readText();
//                 } catch (e: any) {
//                   return "ERROR: " + e.message;
//                 }
//               });

//               if (clipboardText && clipboardText.startsWith("ERROR: ")) {
//                  console.warn("[ChatGPT Automator] Clipboard API failed:", clipboardText);
//               } else if (clipboardText && clipboardText.length > 50) {
//                 return clipboardText.trim();
//               }
//             }
//           } catch (err: any) {
//             console.warn("[ChatGPT Automator] Clipboard copy error, falling back to scraped text:", err.message);
//           }

//           return result.text;
//         }
//       } else {
//         stableCount = 0;
//         lastText = result.text;
//       }
//     }

//     await page.waitForTimeout(2000);
//   }

//   throw new Error("ChatGPT synthesis timed out.");
// }
