[README(1).md](https://github.com/user-attachments/files/32171129/README.1.md)
<div align="center">

# BuscaCEP

**Consulta de CEP e endereço com uma interface simples, limpa e intuitiva.**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

[Sobre](#sobre-o-projeto) • [Preview](#preview) • [Como executar](#como-executar) • [Limitações](#limitações-conhecidas) • [Autor](#autor)

</div>

## Sobre o projeto

O **BuscaCEP** é um projeto de consulta de endereços a partir de um CEP brasileiro, desenvolvido com **HTML, CSS e JavaScript** e integração com uma API de consulta de CEP.

Criado para compor meu portfólio e colocar em prática meus estudos de desenvolvimento front-end, o projeto combina a construção de uma interface visual com o consumo de dados externos.

O foco está em oferecer uma experiência direta: informar um CEP, realizar a busca e visualizar os dados disponíveis para aquele endereço.

## Preview

<!-- Caminho relativo à raiz do repositório. Ajuste a extensão caso a imagem não seja PNG. -->
![Interface do BuscaCEP com o resultado de uma consulta](../assets/icons/resultado.png)

## Funcionalidades

- Consulta de endereço a partir de um CEP brasileiro.
- Integração com uma API de consulta de CEP.
- Exibição das informações disponíveis no retorno da consulta.
- Interface com campo de pesquisa e área de resultado.

> A disponibilidade dos dados depende do retorno da API. Consulte as [limitações conhecidas](#limitações-conhecidas) antes de utilizar o projeto.

## Tecnologias utilizadas

| Tecnologia | Aplicação no projeto |
| --- | --- |
| **HTML5** | Estrutura e organização dos elementos da página. |
| **CSS3** | Estilização, composição visual e apresentação da interface. |
| **JavaScript** | Interação com a página, consulta à API e atualização dos resultados. |
| **API de CEP** | Fornecimento dos dados de endereço associados ao CEP consultado. |

## Como executar

### Pré-requisitos

- Um navegador atualizado.
- Acesso à internet para realizar as consultas à API.
- Git, caso prefira clonar o repositório.

### 1. Baixe o projeto

No terminal, execute:

```bash
git clone https://github.com/edimadev/BuscarCEP.git
cd BuscarCEP
```

Você também pode baixar o projeto pela opção **Code → Download ZIP** no GitHub e extrair os arquivos.

### 2. Abra a página

Abra o arquivo HTML principal do projeto no navegador. Para trabalhar no código com atualização da página durante o desenvolvimento, você também pode usar um servidor local, como o Live Server no Visual Studio Code.

### 3. Faça uma consulta

1. Digite um CEP brasileiro no campo de pesquisa.
2. Clique no botão de busca.
3. Aguarde a resposta e confira as informações exibidas.

## Limitações conhecidas

**Na versão atual, ao buscar um CEP, a API utilizada não está retornando os dados de logradouro e bairro nas consultas observadas no projeto.** Por esse motivo, essas informações podem ficar sem preenchimento na interface.

Os demais dados são exibidos conforme a resposta recebida. A ausência de logradouro e bairro não significa, por si só, que o CEP seja inválido.

Essa observação descreve o comportamento identificado no projeto; não significa que todos os CEPs ou todas as APIs apresentem a mesma limitação. A causa ainda precisa ser verificada, considerando o CEP consultado, os dados fornecidos pelo serviço e o tratamento da resposta na aplicação.

O funcionamento da consulta também depende de conexão com a internet e da disponibilidade do serviço externo.

## Aprendizados

O desenvolvimento deste projeto faz parte da minha evolução em front-end, com foco em:

- Construção de interfaces com HTML e CSS.
- Organização visual de campos, botões e resultados.
- Integração de JavaScript com serviços externos.
- Apresentação de dados na interface.
- Identificação de limitações no consumo de APIs.
- Versionamento e documentação de projetos com Git e GitHub.

## Possíveis melhorias

Os itens abaixo representam oportunidades de evolução, não funcionalidades garantidas na versão atual:

- [ ] Investigar a ausência de logradouro e bairro nas consultas.
- [ ] Aprimorar a validação e a formatação do CEP digitado.
- [ ] Melhorar as mensagens para CEP não encontrado e falhas de conexão.
- [ ] Revisar os estados de carregamento e os campos sem informação.
- [ ] Aprimorar a adaptação da interface a diferentes tamanhos de tela.
- [ ] Revisar a acessibilidade e a navegação por teclado.
- [ ] Adicionar uma opção para copiar o endereço consultado.

## Sugestões e contribuições

Encontrou um problema ou tem uma ideia de melhoria? Abra uma [issue no repositório](https://github.com/edimadev/BuscarCEP/issues), descrevendo o comportamento observado ou a sugestão.

Ao relatar um erro de consulta, informe o CEP utilizado, o resultado esperado e o que apareceu na tela, sem incluir dados pessoais desnecessários.

## Autor

Desenvolvido por **Edima Junior**, estudante de desenvolvimento web, como parte da construção do meu portfólio e da prática com HTML, CSS e JavaScript.

[![GitHub](https://img.shields.io/badge/GitHub-edimadev-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/edimadev)

**Projeto em evolução, sujeito a ajustes e melhorias conforme avanço nos estudos.**
