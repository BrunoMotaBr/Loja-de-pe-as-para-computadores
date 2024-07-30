const itensPorPagina = 12;
let paginaAtual = 1;
let filtroAtual = '';
let pecasDeComputador = [];
let carrinhoItens = [];

async function carregarPecas() {
    try {
        const response = await fetch('pecas.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar o arquivo JSON');
        }
        pecasDeComputador = await response.json();
        mostrartiposFiltro(pecasDeComputador);
        exibirPecas(pecasDeComputador);
    } catch (error) {
        console.error('Erro:', error);
    }
}

function trocaClasse() {
    const carrinho = document.getElementById("carrinho");
    const botaoPricipal = document.getElementById("botao-pricipal");
    if (carrinho.classList.contains("carrinhoAtivo")) {
        carrinho.classList.remove("carrinhoAtivo");
        botaoPricipal.textContent = "<";
        botaoPricipal.style.right = "0";
    } else {
        botaoPricipal.style.transition = "1s ease-out;";
        botaoPricipal.style.right = "300px";
        botaoPricipal.textContent = ">";
        carrinho.classList.add("carrinhoAtivo");
    }
}

function mostrartiposFiltro(pecas) {
    const tiposFiltro = [...new Set(pecas.map(peca => peca.Tipo))];
    const tipos = document.getElementById('tipos');
    tipos.innerHTML = '<button onclick="filtrarPorTipo(\'\')">Todos</button>';
    tiposFiltro.forEach(tipo => {
        tipos.innerHTML += `<button onclick="filtrarPorTipo('${tipo}')">${tipo}</button>`;
    });
}

function filtrarPorTipo(tipo) {
    filtroAtual = tipo;
    paginaAtual = 1;
    exibirPecas(pecasDeComputador);
}

function exibirPecas(pecas) {
    const filteredPecas = pecas.filter(peca => filtroAtual === '' || peca.Tipo === filtroAtual);
    const totalPages = Math.ceil(filteredPecas.length / itensPorPagina);
    const paginatedPecas = filteredPecas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

    const produtos = document.getElementById('produtos');
    produtos.innerHTML = '';

    paginatedPecas.forEach(peca => {
        produtos.innerHTML += `
            <div class="card">
                <img src="${peca.Imagem}" alt="${peca.Nome}">
                <div>
                    <h2>${peca.Nome}</h2>
                    <p>Marca: ${peca.Marca}</p>
                    <p>Tipo: ${peca.Tipo}</p>
                    <p>Preço: R$${peca.Preco.toFixed(2)}</p>
                    <p>Descrição: ${peca.Descricao}</p>
                </div>
                <div>
                    <button class="botoes-card" onclick="adicionarAoCarrinho(${peca.Id})">Adicionar ao carrinho 🛒</button>
                </div>
            </div>
        `;
    });

    const paginacaoContainer = document.getElementById('paginacaoContainer');
    paginacaoContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginacaoContainer.innerHTML += `<button class="botao-paginacao" onclick="irParaPagina(${i})">${i}</button>`;
    }
}

function adicionarAoCarrinho(id) {
    const pecaSelecionada = pecasDeComputador.find(peca => peca.Id == id);
    let itemCarrinho = document.querySelector(`.card-carrinho[data-id="${pecaSelecionada.Id}"]`);

    if (itemCarrinho) {
        let quantidade = itemCarrinho.querySelector(".quantidade");
        quantidade.textContent = parseInt(quantidade.textContent) + 1;
    } else {
        const carrinho = document.getElementById('carrinho');
        carrinho.innerHTML += `
            <div class="card-carrinho" data-id="${pecaSelecionada.Id}">
                <p class="quantidade">1</p>
                <img src="${pecaSelecionada.Imagem}" alt="${pecaSelecionada.Nome}">
                <div>
                    <h2>${pecaSelecionada.Nome}</h2>
                    <p>Marca: ${pecaSelecionada.Marca}</p>
                    <p>Tipo: ${pecaSelecionada.Tipo}</p>
                    <p class="preco">Preço: R$${pecaSelecionada.Preco.toFixed(2)}</p>
                </div>
                <button onclick="removerDoCarrinho(${pecaSelecionada.Id})">X</button>
            </div>
        `;
    }

    carrinhoItens.push({ ...pecaSelecionada });
    atualizarTotal(pecaSelecionada.Preco);
}

function atualizarTotal(preco, operacao = 'adicionar') {
    let totalElement = document.getElementById("total");
    let totalAtual = parseFloat(totalElement.textContent);

    if (operacao === 'adicionar') {
        totalElement.textContent = (totalAtual + preco).toFixed(2);
    } else if (operacao === 'remover') {
        totalElement.textContent = (totalAtual - preco).toFixed(2);
    }
}

function removerDoCarrinho(id) {
    let itemCarrinho = document.querySelector(`.card-carrinho[data-id="${id}"]`);
    if (itemCarrinho) {
        let quantidadeElement = itemCarrinho.querySelector(".quantidade");
        let precoUnitario = parseFloat(itemCarrinho.querySelector(".preco").textContent.replace('Preço: R$', ''));
        let quantidadeAtual = parseInt(quantidadeElement.textContent);

        if (quantidadeAtual > 1) {
            quantidadeElement.textContent = quantidadeAtual - 1;
            atualizarTotal(precoUnitario, 'remover');
        } else {
            itemCarrinho.remove();
            atualizarTotal(precoUnitario, 'remover');
        }

        const index = carrinhoItens.findIndex(item => item.Id == id);
        if (index > -1) {
            if (carrinhoItens[index].quantidade > 1) {
                carrinhoItens[index].quantidade -= 1;
            } else {
                carrinhoItens.splice(index, 1);
            }
        }
    }
}



function finalizarCompra() {
    let totalElement = document.getElementById("total");
    let novaJanela = window.open("", "Itens do Carrinho", "width=600,height=400");
    novaJanela.document.write(`<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="style.css"><title>Carrinho Finalizar-compra</title></head><body><header class="cabecalho"><img src="logo.png" alt="Logo site"></header><main class="finalizar-compra"><h3 style="margin: 1em auto" id="total">Total: R$ ${totalElement.textContent}</h3><ul>`);

    carrinhoItens.forEach(item => {
        novaJanela.document.write(`<li class="card-finalizar"><img src="${item.Imagem}">${item.Nome} - Marca: ${item.Marca}, Tipo: ${item.Tipo}, Preço: R$${item.Preco.toFixed(2)}</li>`);
    });

    novaJanela.document.write("</ul><button class='botao-chamativo' onclick='fim()'>Ir para pagamento</button></main></body><script src='main.js'></script></html>");
}

function fim(){
    let totalElement = document.getElementById("total");
    alert("Realize o pagamento!!!!\n Valor: "+ totalElement.textContent)
}

function irParaPagina(page) {
    paginaAtual = page;
    exibirPecas(pecasDeComputador);
}

window.onload = carregarPecas;
