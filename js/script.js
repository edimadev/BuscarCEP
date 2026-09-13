(function () {
    "use strict";

    const API_VIACEP_URL = "https://viacep.com.br/ws";
    const API_BRASIL_URL = "https://brasilapi.com.br/api/cep/v2";
    const TEMPO_LIMITE = 10000;
    const CHAVE_TEMA = "buscaCEP-tema";

    const formulario = document.querySelector(".busca-cep");
    const campoCep = document.querySelector("#cep");
    const botaoBuscar = document.querySelector(".buscarcep");
    const botaoTema = document.querySelector(".tema");
    const painelResultado = document.querySelector(".resultado");
    const botaoCopiar = document.querySelector("#copiar-endereco");
    const dataConsulta = document.querySelector("#data-consulta");

    if (
        !formulario ||
        !campoCep ||
        !botaoBuscar ||
        !botaoTema ||
        !painelResultado ||
        !botaoCopiar ||
        !dataConsulta
    ) {
        console.error("BuscaCEP: não foi possível inicializar a página.");
        return;
    }

    const camposResultado = {
        cep: document.querySelector("#resultado-cep"),
        logradouro: document.querySelector("#resultado-log"),
        bairro: document.querySelector("#resultado-bairro"),
        cidade: document.querySelector("#resultado-cidade"),
        estado: document.querySelector("#resultado-estado"),
        ddd: document.querySelector("#resultado-ddd")
    };

    let enderecoAtual = null;
    let consultaAtual = null;
    let temporizadorCopia = null;
    let atualizacaoNavegacaoPendente = false;

    const mensagem = document.createElement("p");
    mensagem.className = "mensagem-cep";
    mensagem.id = "mensagem-cep";
    mensagem.hidden = true;
    mensagem.setAttribute("role", "alert");
    mensagem.setAttribute("aria-live", "assertive");
    formulario.appendChild(mensagem);

    campoCep.setAttribute("inputmode", "numeric");
    campoCep.setAttribute("autocomplete", "postal-code");
    campoCep.setAttribute("spellcheck", "false");
    campoCep.setAttribute("aria-describedby", mensagem.id);
    painelResultado.setAttribute("aria-live", "polite");
    painelResultado.setAttribute("aria-atomic", "true");
    formulario.noValidate = true;

    function somenteDigitos(valor) {
        return String(valor || "").replace(/\D/g, "").slice(0, 8);
    }

    function formatarCep(valor) {
        const numeros = somenteDigitos(valor);

        if (numeros.length <= 5) {
            return numeros;
        }

        return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
    }

    function alterarTextoBotao(botao, texto) {
        const noTexto = Array.from(botao.childNodes).find(
            (no) => no.nodeType === Node.TEXT_NODE && no.textContent.trim()
        );

        if (noTexto) {
            noTexto.textContent = `\n                    ${texto}\n                    `;
            return;
        }

        botao.prepend(document.createTextNode(texto));
    }

    function exibirMensagem(texto, tipo = "erro") {
        mensagem.textContent = texto;
        mensagem.className = `mensagem-cep ${tipo}`;
        mensagem.hidden = false;
        campoCep.classList.toggle("campo-invalido", tipo === "erro");
        campoCep.setAttribute("aria-invalid", tipo === "erro" ? "true" : "false");
    }

    function ocultarMensagem() {
        mensagem.hidden = true;
        mensagem.textContent = "";
        mensagem.className = "mensagem-cep";
        campoCep.classList.remove("campo-invalido");
        campoCep.setAttribute("aria-invalid", "false");
    }

    function definirCarregamento(carregando) {
        botaoBuscar.disabled = carregando;
        botaoBuscar.classList.toggle("carregando", carregando);
        botaoBuscar.setAttribute("aria-busy", String(carregando));
        alterarTextoBotao(botaoBuscar, carregando ? "Consultando..." : "Buscar CEP");
    }

    function valorOuPadrao(valor, padrao = "Não informado") {
        const texto = typeof valor === "string" ? valor.trim() : "";
        return texto || padrao;
    }

    function normalizarResposta(dados) {
        return {
            erro: Boolean(dados.erro || dados.errors),
            cep: dados.cep || "",
            logradouro: dados.logradouro || dados.street || "",
            bairro: dados.bairro || dados.neighborhood || "",
            localidade: dados.localidade || dados.cidade || dados.city || "",
            uf: dados.uf || dados.estado || dados.state || "",
            ddd: dados.ddd || ""
        };
    }

    async function requisitarJson(url, sinal) {
        const resposta = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: sinal
        });

        if (resposta.status === 404) {
            return { erro: true };
        }

        if (!resposta.ok) {
            throw new Error(`Falha HTTP ${resposta.status}`);
        }

        return resposta.json();
    }

    function mesclarEnderecos(principal, complementar) {
        return {
            erro: principal.erro && complementar.erro,
            cep: principal.cep || complementar.cep,
            logradouro: principal.logradouro || complementar.logradouro,
            bairro: principal.bairro || complementar.bairro,
            localidade: principal.localidade || complementar.localidade,
            uf: principal.uf || complementar.uf,
            ddd: principal.ddd || complementar.ddd
        };
    }

    async function buscarDadosCep(cep, sinal) {
        let dadosViaCep;

        try {
            const respostaViaCep = await requisitarJson(
                `${API_VIACEP_URL}/${cep}/json/`,
                sinal
            );
            dadosViaCep = normalizarResposta(respostaViaCep);
        } catch (erroViaCep) {
            try {
                const respostaBrasilApi = await requisitarJson(
                    `${API_BRASIL_URL}/${cep}`,
                    sinal
                );
                return normalizarResposta(respostaBrasilApi);
            } catch (_erroBrasilApi) {
                throw erroViaCep;
            }
        }

        const precisaComplemento =
            dadosViaCep.erro || !dadosViaCep.logradouro || !dadosViaCep.bairro;

        if (!precisaComplemento) {
            return dadosViaCep;
        }

        try {
            const respostaBrasilApi = await requisitarJson(
                `${API_BRASIL_URL}/${cep}`,
                sinal
            );
            const dadosBrasilApi = normalizarResposta(respostaBrasilApi);
            return mesclarEnderecos(dadosViaCep, dadosBrasilApi);
        } catch (_erroComplemento) {
            return dadosViaCep;
        }
    }

    function formatarDataConsulta(data) {
        const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(data);
        const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(data);

        return `Consulta realizada em ${dataFormatada} às ${horaFormatada}`;
    }

    function preencherResultado(dados) {
        const endereco = {
            cep: valorOuPadrao(dados.cep, formatarCep(campoCep.value)),
            logradouro: valorOuPadrao(dados.logradouro, "Não disponível para este CEP"),
            bairro: valorOuPadrao(dados.bairro, "Não disponível para este CEP"),
            cidade: valorOuPadrao(dados.localidade),
            estado: valorOuPadrao(dados.uf),
            ddd: valorOuPadrao(dados.ddd)
        };

        camposResultado.cep.textContent = endereco.cep;
        camposResultado.logradouro.textContent = endereco.logradouro;
        camposResultado.bairro.textContent = endereco.bairro;
        camposResultado.cidade.textContent = endereco.cidade;
        camposResultado.estado.textContent = endereco.estado;
        camposResultado.ddd.textContent = endereco.ddd;
        dataConsulta.textContent = formatarDataConsulta(new Date());

        enderecoAtual = endereco;
        painelResultado.hidden = false;
        ocultarMensagem();

        if (window.matchMedia("(max-width: 640px)").matches) {
            painelResultado.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    async function consultarCep(cep) {
        if (consultaAtual) {
            consultaAtual.abort("nova-consulta");
        }

        const controlador = new AbortController();
        consultaAtual = controlador;
        const tempoEsgotado = window.setTimeout(
            () => controlador.abort("tempo-esgotado"),
            TEMPO_LIMITE
        );

        definirCarregamento(true);
        ocultarMensagem();

        try {
            const dados = await buscarDadosCep(cep, controlador.signal);

            if (dados.erro) {
                painelResultado.hidden = true;
                enderecoAtual = null;
                exibirMensagem("CEP não encontrado. Confira os números e tente novamente.");
                campoCep.focus();
                return;
            }

            preencherResultado(dados);
        } catch (erro) {
            if (controlador.signal.reason === "nova-consulta") {
                return;
            }

            painelResultado.hidden = true;
            enderecoAtual = null;

            if (controlador.signal.reason === "tempo-esgotado") {
                exibirMensagem("A consulta demorou demais. Tente novamente em instantes.");
            } else {
                exibirMensagem("Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.");
            }

            console.error("BuscaCEP: erro durante a consulta.", erro);
        } finally {
            window.clearTimeout(tempoEsgotado);

            if (consultaAtual === controlador) {
                consultaAtual = null;
                definirCarregamento(false);
            }
        }
    }

    function montarEnderecoParaCopia() {
        if (!enderecoAtual) {
            return "";
        }

        const localidade = [enderecoAtual.cidade, enderecoAtual.estado]
            .filter((item) => item && item !== "Não informado")
            .join(" - ");

        return [
            enderecoAtual.logradouro,
            enderecoAtual.bairro,
            localidade,
            enderecoAtual.cep ? `CEP: ${enderecoAtual.cep}` : ""
        ]
            .filter((item) => item && item !== "Não informado")
            .join(", ");
    }

    function copiarComFallback(texto) {
        const areaTemporaria = document.createElement("textarea");
        areaTemporaria.value = texto;
        areaTemporaria.setAttribute("readonly", "");
        areaTemporaria.style.position = "fixed";
        areaTemporaria.style.opacity = "0";
        areaTemporaria.style.pointerEvents = "none";
        document.body.appendChild(areaTemporaria);
        areaTemporaria.select();

        const copiado = document.execCommand("copy");
        areaTemporaria.remove();

        if (!copiado) {
            throw new Error("O navegador recusou a cópia.");
        }
    }

    async function copiarEndereco() {
        const texto = montarEnderecoParaCopia();

        if (!texto) {
            return;
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(texto);
                } catch (_erroClipboard) {
                    copiarComFallback(texto);
                }
            } else {
                copiarComFallback(texto);
            }

            window.clearTimeout(temporizadorCopia);
            botaoCopiar.classList.add("copiado");
            alterarTextoBotao(botaoCopiar, "Endereço copiado!");

            temporizadorCopia = window.setTimeout(() => {
                botaoCopiar.classList.remove("copiado");
                alterarTextoBotao(botaoCopiar, "Copiar endereço");
            }, 2200);
        } catch (erro) {
            exibirMensagem("Não foi possível copiar automaticamente. Tente novamente.");
            console.error("BuscaCEP: erro ao copiar o endereço.", erro);
        }
    }

    function lerTemaSalvo() {
        try {
            return localStorage.getItem(CHAVE_TEMA);
        } catch (_erro) {
            return null;
        }
    }

    function salvarTema(tema) {
        try {
            localStorage.setItem(CHAVE_TEMA, tema);
        } catch (_erro) {
            // A página continua funcionando quando o armazenamento está indisponível.
        }
    }

    function aplicarTema(tema, persistir = true) {
        const escuro = tema === "escuro";
        document.body.classList.toggle("tema-escuro", escuro);
        document.documentElement.style.colorScheme = escuro ? "dark" : "light";
        botaoTema.setAttribute("aria-pressed", String(escuro));
        botaoTema.setAttribute(
            "aria-label",
            escuro ? "Ativar modo claro" : "Ativar modo escuro"
        );

        if (persistir) {
            salvarTema(escuro ? "escuro" : "claro");
        }
    }

    function atualizarNavegacao() {
        atualizacaoNavegacaoPendente = false;
        const links = Array.from(document.querySelectorAll("nav a"));
        const secaoSobre = document.querySelector("#sobre");

        if (!links.length || !secaoSobre) {
            return;
        }

        const sobreAtivo = window.scrollY >= Math.max(1, secaoSobre.offsetTop - 100);

        links.forEach((link) => {
            const ativo = sobreAtivo ? link.hash === "#sobre" : link.hash === "#inicio";
            link.classList.toggle("ativo", ativo);

            if (ativo) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const cep = somenteDigitos(campoCep.value);

        if (cep.length !== 8) {
            painelResultado.hidden = true;
            enderecoAtual = null;
            exibirMensagem("Digite um CEP válido com 8 números.");
            campoCep.focus();
            return;
        }

        campoCep.value = formatarCep(cep);
        consultarCep(cep);
    });

    campoCep.addEventListener("input", () => {
        const inicioSelecao = campoCep.selectionStart;
        const valorAnterior = campoCep.value;
        const valorFormatado = formatarCep(valorAnterior);
        campoCep.value = valorFormatado;
        ocultarMensagem();

        if (inicioSelecao !== null && valorFormatado.length > valorAnterior.length) {
            campoCep.setSelectionRange(inicioSelecao + 1, inicioSelecao + 1);
        }

        if (
            enderecoAtual &&
            somenteDigitos(enderecoAtual.cep) !== somenteDigitos(valorFormatado)
        ) {
            painelResultado.hidden = true;
            enderecoAtual = null;
        }
    });

    campoCep.addEventListener("blur", () => {
        campoCep.value = formatarCep(campoCep.value);
    });

    botaoCopiar.addEventListener("click", copiarEndereco);

    botaoTema.addEventListener("click", () => {
        aplicarTema(document.body.classList.contains("tema-escuro") ? "claro" : "escuro");
    });

    window.addEventListener("storage", (evento) => {
        if (evento.key === CHAVE_TEMA && (evento.newValue === "claro" || evento.newValue === "escuro")) {
            aplicarTema(evento.newValue, false);
        }
    });

    window.addEventListener(
        "scroll",
        () => {
            if (!atualizacaoNavegacaoPendente) {
                atualizacaoNavegacaoPendente = true;
                window.requestAnimationFrame(atualizarNavegacao);
            }
        },
        { passive: true }
    );

    window.addEventListener("resize", atualizarNavegacao);

    aplicarTema(lerTemaSalvo() === "escuro" ? "escuro" : "claro", false);
    atualizarNavegacao();
})();
