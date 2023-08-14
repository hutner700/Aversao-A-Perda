
async function pegarQuestions(file) {
    try {
        const response = await fetch(file);
        const arrayBuffer = await response.arrayBuffer();

        // Converter de Windows-1252 para UTF-8
        const encoder = new TextEncoder();
        const utf8Array = encoder.encode(new TextDecoder('windows-1252').decode(arrayBuffer));
        const utf8TsvContent = new TextDecoder().decode(utf8Array);

        // Processar os dados do TSV
        const linhas = utf8TsvContent.split('\n');
        const cabecalho = linhas[0].split('\t');
        const dados = linhas.slice(1).map(linha => linha.split('\t'));

        // Criar o dicionário
        const dicionario = {};
        dados.forEach((linha, indice) => {
            const nome = indice + 1; // Usar o índice como nome do dicionário
            linha.forEach((valor, coluna) => {
                const questao = cabecalho[coluna];
                if (!dicionario[nome]) {
                    dicionario[nome] = {};
                }
                dicionario[nome][questao] = valor;
            });
        });

        return dicionario;
    } catch (error) {
        console.error('Ocorreu um erro:', error);
        return null;
    }
}
