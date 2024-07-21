// ==UserScript==
// @name         Neopets Potato Counter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Conta automaticamente o número de imagens na tabela e preenche o campo de entrada no jogo Potato Counter do Neopets após aguardar 15 segundos
// @author       SeuNome
// @match        https://www.neopets.com/medieval/potatocounter.phtml
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function contarImagensNaTabela() {
        // Obtém a tabela específica usando o caminho XPath fornecido
        var tabela = document.evaluate('/html/body/div[3]/div[3]/table/tbody/tr/td[2]/table', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        // Verifica se a tabela foi encontrada
        if (tabela) {
            // Obtém todas as tags <img> dentro da tabela
            var imagens = tabela.getElementsByTagName('img');
            return imagens.length;
        } else {
            console.log("Tabela não encontrada");
            return 0;
        }
    }

    function executarContagem() {
        // Conta o número de imagens
        var numeroDeImagens = contarImagensNaTabela();

        // Obtém o campo de entrada específico
        var campoEntrada = document.evaluate('/html/body/div[3]/div[3]/table/tbody/tr/td[2]/center[2]/form/input[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        // Verifica se o campo de entrada foi encontrado e insere o resultado
        if (campoEntrada) {
            campoEntrada.value = numeroDeImagens;
        } else {
            console.log("Campo de entrada não encontrado");
        }

        // Obtém o botão específico
        var botao = document.evaluate('/html/body/div[3]/div[3]/table/tbody/tr/td[2]/center[2]/form/input[3]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        // Verifica se o botão foi encontrado e clica nele
        if (botao) {
            botao.click();
        } else {
            console.log("Botão não encontrado");
        }
    }

    // Aguarda 15 segundos antes de executar a função
    setTimeout(executarContagem, 15000);
})();
