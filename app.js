let ui_model = (function() {
    let DOMStrings = {
        inputMovimento: '#tipoMovimento',
        inputDescricao: '#descricao',
        inputValor: '#valor',
        btnSalvar: '#btnSalvar',
        tblRenda: '#tabelaRenda',
        tblDespesa: '#tabelaDespesa',
        lblTotal: '#total',
        lblTotalRenda: '#totalRenda',
        lblTotalDespesa: '#totalDespesa',
        lblPorDespesa: '#porDespesa',
        secTables: '#tableSection' 
    }

    return {
        pegaValores : function() {
            return {
                tipoMovimento : document.querySelector(DOMStrings.inputMovimento).value,
                descricao : document.querySelector(DOMStrings.inputDescricao).value,
                valor : parseFloat(document.querySelector(DOMStrings.inputValor).value)
            }
        },
        adicionarItemNaTabela: function(item, tMovimento){
            //1. Criar o HTML da linha
            let linha = document.createElement("tr");
            let colunaDescricao = document.createElement("td");
            let colunaValor = document.createElement("td");
            let colunaExcluir = document.createElement("td");
            let btnExcluir = document.createElement("button");

            //2. Atribuir os valores
            //2.1 Colocar os valores nas colunas
            colunaDescricao.textContent = item.descricao;
            colunaValor.textContent = item.valor;

            //2.2 Atribuir os valores de classe e X no botão
            btnExcluir.classList.add("btn")            
            btnExcluir.classList.add("btn-sm");
            btnExcluir.classList.add("btn-danger");
            btnExcluir.textContent = "X"

            //Fazer uma gambiarra para mostrar mais um conceito
            colunaExcluir.id = tMovimento + "-" + item.id

            //3. Incluir essa linha no DOM Principal (tabela)
            linha.appendChild(colunaDescricao);
            linha.appendChild(colunaValor);
            linha.appendChild(colunaExcluir);
            colunaExcluir.appendChild(btnExcluir);

            //4. Qual é a tabela que vamos usar
            let tabela;
            if(tMovimento === 'renda') {
                tabela = document.querySelector(DOMStrings.tblRenda)
            } else {
                tabela = document.querySelector(DOMStrings.tblDespesa)
            }

            //5. incluir a linha na tabela
            tabela.appendChild(linha)
        },

        limpaOsDados: function(){
            let campos = document.querySelectorAll(DOMStrings.inputDescricao + ',' + DOMStrings.inputValor);
            camposArray = Array.prototype.slice.call(campos);

            camposArray.forEach(function(current, index, array){
                current.value = ""
            })
            this.descricaoFocus();
        },

        atualizaTotais: function(dados) {
            document.querySelector(DOMStrings.lblTotal).textContent = dados.total;
            document.querySelector(DOMStrings.lblTotalRenda).textContent = dados.totalRenda;
            document.querySelector(DOMStrings.lblTotalDespesa).textContent = dados.totalRenda;
            document.querySelector(DOMStrings.lblPorDespesa).textContent = dados.porDespesa;
        },

        removeTabela: function(elem) {
            elem.remove();
        },

        descricaoFocus: function(){
            document.querySelector(DOMStrings.inputDescricao).focus();
        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    }

})() //Os ultimos parenteses são para executar a função (IIFE - Immediately Invoked Function Expression);

data_model = (function(){
    let Despesa = function(id, descricao, valor) {
        this.id = id
        this.descricao = descricao
        this.valor = valor;
    };

    let Renda = function(id, descricao, valor) {
        this.id = id
        this.descricao = descricao
        this.valor = valor;
    };

    let calculaTotal = function(tMovimento){
        let soma = 0;
        dados.items[tMovimento].forEach(function(current){
            soma+= current.valor
        })
        dados.totais[tMovimento] = soma;
    }


    let dados = {
        items: {             //Guardar cada item em seu tipo de movimento
            despesa: [],    //array de items de despesa
            renda: [],       //array de items de renda
        },
        totais: {
            despesa: 0,
            renda: 0,
        },
        total: 0,
        porDespesa: 0,
    };

    return {
        adicionarItem: function(tMovimento, descricao, valor) {

            //Regra dp ID: pegar o ultimo elemento e adicionar 1
            let id = 0;
            let tamanhoArray = dados.items[tMovimento].length;
            if(tamanhoArray > 0) {
                id = dados.items[tMovimento][tamanhoArray - 1].id + 1;  //retorna o ultimo id do array somado a 1
            }

            let novoItem;
            switch(tMovimento) {
                case 'renda':
                    novoItem = new Renda(id, descricao, valor);
                    break;
                case 'despesa':
                    novoItem = new Despesa(id, descricao, valor);
                    break;
            };

            dados.items[tMovimento].push(novoItem);
            return novoItem;
        },

        calculaTotais: function(){
            //1. Calcula os totais de despesa e renda
            calculaTotal('despesa');
            calculaTotal('renda');
            //2. Calcula o total geral (renda - despesa)
            dados.total = dados.totais['renda'] - dados.totais['despesa'];
            //3. Calcula a % do total de despesas
            if(dados.totais['renda'] > 0) {
                dados.porDespesa = Math.round(dados.totais['despesa']/dados.totais['renda']*100);
            } else {
                dados.porDespesa = -1;
            }

        },

        getTotais: function() {
            return {
                total: dados.total,
                totalDespesa: dados.totais['despesa'],
                porDespesa: dados.porDespesa,
                totalRenda: dados.totais['renda']
            }
        },

        funcaoparatestar: function() {
            console.log(dados)
        },

        removerItem : function(iD, tMovimento) {
            let indexItem = dados.items[tMovimento].length 
            for (let i=0; i < indexItem; i++) {
                let idTemp = dados.items[tMovimento][i].id
                if (idTemp == iD) {
                    dados.items[tMovimento].splice(i)
                    break
                }
            }
        }

    }
})();

controller = function(ui, data) {
    let adicionarItem = function(){
        //1.Pegar os valores dos inputs
        let input = ui.pegaValores()
        //console.log(input)
        if(input.descricao !== "" && !isNaN(input.valor) && input.valor > 0) {
            //2.Adicionar o item na nossa estrutura de dados
            let novoItem = data.adicionarItem(input.tipoMovimento, input.descricao, input.valor)
            //3.Adicionar na nossa UI (tabela) a entrada
            ui.adicionarItemNaTabela(novoItem, input.tipoMovimento)
            //3.1 Limpa os dados
            ui.limpaOsDados();
            //4.0 Calcular o novo budget totalo
            atualizaTotais();

        } else {
            alert("Você devd preencher os campos de descrição e valor (valor númerico e positivo)")
        }
    };

    let atualizaTotais = function () {
        //4.Calcular o novo budget total
        data.calculaTotais();
        //4.1 Pega os valores
        let dadosTotais = data.getTotais();
        //5.Atualizar a UI (totais)
        ui.atualizaTotais(dadosTotais)
    }

    let configuraOsListener = function() {
        let DOMStrings = ui.getDOMStrings();
        
        document.querySelector(DOMStrings.btnSalvar).addEventListener('click', function(){
            adicionarItem();
        });
        document.addEventListener('keyup', function(event){
            if(event.key === 'Enter') {
                adicionarItem();
                //console.log("O Enter foi clicado");
            }
        });

        let apagarX = function(id, tMovimento, elem) {
            //1. Remover Item
            data.removerItem(id, tMovimento)
            //2. RemoverTabela
            ui.removeTabela(elem)
            //ui.removeTabela(elemento)
        }

        document.querySelector(DOMStrings.secTables).addEventListener('click', function(event){
            if(event.target.nodeName === 'BUTTON') {
                let idCompleto = event.target.parentNode.id;
                let elem = event.target.parentNode.parentNode
                let splitId = idCompleto.split("-");
                let tMovimento = splitId[0];
                let id = splitId[1];
                console.log(splitId)
                //1. Apagar o item da estrutura de dados
                apagarX(id, tMovimento, elem)
                //2. Deletar o elemento da UI
                //3. Atualizar os totais
                atualizaTotais();
            };
        })
    }

    return {
        init: function() {
            console.log("Inicia o aplicação!");
            configuraOsListener();
            ui.descricaoFocus();
        }
    }
};

controller(ui_model, data_model).init();
