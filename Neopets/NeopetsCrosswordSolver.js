// ==UserScript==
// @name         Neopets Crossword Solver
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Automatically fills in the Neopets crossword puzzle based on item names and corresponding answers from a JSON file on GitHub, using localStorage to maintain progress across page reloads.
// @author       Your Name
// @match        https://www.neopets.com/games/crossword/crossword.phtml
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const PROGRESS_KEY = 'neopets_crossword_progress';

    function normalizeText(text) {
        return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    }

    function getProgress() {
        const progress = localStorage.getItem(PROGRESS_KEY);
        return progress ? JSON.parse(progress) : {};
    }

    function saveProgress(progress) {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    }

    async function loadQuestionsAndAnswers() {
        try {
            const response = await fetch("https://raw.githubusercontent.com/flaviohenriquew/faerie-crossword/main/questions_answers_bank.json");
	    //OLD https://raw.githubusercontent.com/i170001/neopets_faerie-crossword/main/questions_answers_bank.json
            const questionAnswerBank = await response.json();
            console.log("Question and Answer Bank loaded:", questionAnswerBank);

            if (typeof questionAnswerBank !== 'object' || questionAnswerBank === null) {
                throw new Error("Unexpected data format");
            }

            const normalizedQuestionAnswerBank = {};
            for (const [key, value] of Object.entries(questionAnswerBank)) {
                normalizedQuestionAnswerBank[normalizeText(key)] = value;
            }
            console.log("Normalized Question and Answer Bank:", normalizedQuestionAnswerBank);

            const progress = getProgress();

            // Define the XPath selectors for the columns containing the items
            const columnSelectors = [
                '/html/body/div[3]/div[3]/table/tbody/tr/td[2]/div[2]/center/table/tbody/tr[4]/td[1]',
                '/html/body/div[3]/div[3]/table/tbody/tr/td[2]/div[2]/center/table/tbody/tr[4]/td[2]'
            ];

            const itemLinks = [];

            // Get all the items with links from both columns
            columnSelectors.forEach(selector => {
                const container = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (container) {
                    const links = container.querySelectorAll('a');
                    links.forEach(link => {
                        const linkText = link.innerText.trim();
                        if (/^\d+\.\s/.test(linkText)) {
                            const normalizedText = normalizeText(linkText.replace(/^\d+\.\s*/, ''));
                            itemLinks.push({ link, normalizedText });
                        }
                    });
                }
            });

            console.log("Item links found:", itemLinks.length);

            // Function to process each item
            async function processItem(item) {
                if (progress[item.normalizedText]) {
                    console.log("Item already processed:", item.normalizedText);
                    return;
                }

                const answer = normalizedQuestionAnswerBank[item.normalizedText];
                if (answer) {
                    console.log("Match found:", answer);
                    // Click the link
                    item.link.click();

                    // Wait for the page to reload and then fill in the answer
                    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for the page to reload

                    // Fill in the answer
                    const answerInput = document.evaluate('/html/body/div[3]/div[3]/table/tbody/tr/td[2]/div[2]/center/table/tbody/tr[3]/td/form/input[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    const submitButton = document.evaluate('/html/body/div[3]/div[3]/table/tbody/tr/td[2]/div[2]/center/table/tbody/tr[3]/td/form/input[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

                    if (answerInput && submitButton) {
                        answerInput.value = answer;
                        submitButton.click();
                        console.log("Answer submitted:", answer);

                        // Save progress
                        progress[item.normalizedText] = true;
                        saveProgress(progress);

                        // Wait for the page to reload again before processing the next item
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for the page to reload
                    } else {
                        console.log("Answer input or submit button not found for:", item.normalizedText);
                    }
                } else {
                    console.log("No match found for item:", item.normalizedText);
                }
            }

            // Process each item link sequentially
            for (const item of itemLinks) {
                await processItem(item);
            }

        } catch (error) {
            console.error("Error loading question and answer bank:", error);
        }
    }

    // Ensure the script runs after the page has fully loaded
    window.addEventListener('load', loadQuestionsAndAnswers);
})();
