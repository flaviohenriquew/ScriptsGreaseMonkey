// ==UserScript==
// @name         [Neopets] Lunar Temple Solver
// @namespace    https://greasyfork.org/en/scripts/446046
// @version      0.5
// @description  It does the thing. Takes a few seconds.
// @author       Piotr Kardovsky
// @match        https://www.neopets.com/shenkuu/lunar/?show=puzzle
// @icon         https://www.neopets.com//favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Set to true to autoclick. ~2 second delay to simulate "figuring it out".
    const AUTO = true;

    window.addEventListener('load', () => {
        // Verifica se o valor "0" existe na entrada para determinar se estamos na página correta.
        if (document.querySelector('input[value="0"]') != undefined) {
            // Obtém o ângulo de Kreludor a partir do código fonte.
            let angle = parseInt(document.body.innerHTML.match(/Kreludor=(\d+)/)[1]);
            // Array com os limites dos ângulos.
            let lnt = [11, 33, 56, 78, 101, 123, 146, 168, 191, 213, 236, 258, 281, 303, 326, 348, 360];
            // Encontra o índice da fase correspondente ao ângulo.
            let idx = lnt.findIndex((i) => { return angle <= i; });
            // Ajusta o índice conforme a lógica fornecida.
            idx = idx == 16 ? 8 : idx < 8 ? idx + 8 : idx - 8;

            // Seleciona a resposta correta.
            let ans = document.querySelector(`.content input[value="${idx}"]`);
            if (AUTO === true) {
                setTimeout(() => {
                    ans.checked = true;
                    // Submete o formulário após selecionar a resposta.
                    document.querySelector('form[action="results.phtml"]').submit();
                }, 1800 + Math.random() * 600); // Delay para simular o tempo de "resolução".
            } else {
                // Destaca a resposta correta se AUTO for false.
                ans.parentNode.style.background = "#000";
            }
        }
    });
})();
