const KEYS_EXPECTED_ORDER = ["SocioEconomics.QS1", "SocioEconomics.QS2A", "SocioEconomics.QS2B",
    "SocioEconomics.QS3A", "SocioEconomics.QS3B", "SocioEconomics.QS4", "SocioEconomics.QS5", "SocioEconomics.QS6",
    "SocioEconomics.QS7", "SocioEconomics.QS8", "RiskAverssion.SF1A", "RiskAverssion.SF1B", "RiskAverssion.SF2A",
    "RiskAverssion.SF2B", "RiskAverssion.SF2C", "RiskAverssion.RTFK2", "RiskAverssion.RTAT2", "RiskAverssion.RTAT1",
    "RiskAverssion.RTAT3", "RiskAverssion.RTFK3", "RiskAverssion.RTFK1", "RiskAverssion.RTFIN1", "RiskAverssion.RTFIN2",
    "Quiz.etapa1", "Quiz.etapa2", "Quiz.etapa3"]

const SPREADSHEET_ID = '15neVD2GpG7ozuTrtUV_668AyEENbV53M5XpJfNrukiM'
const SHEET_NAME = 'Dados Brutos'
const ID_COLUMN_REFERENCE = 1

function verificarSubChave(jsonObj, chaves){
    let have = jsonObj.hasOwnProperty(chaves[0])
    if (!have){
        throw Error("Nao tem Variavel")
    }

    if (chaves.length > 1){
        verificarSubChave(jsonObj[chaves[0]], chaves.slice(1))
    }
}


function verificarChaves(jsonObj) {
    const chavesPresentes = Object.keys(jsonObj);
    var chavesFaltando = KEYS_EXPECTED_ORDER.filter(chave => !chavesPresentes.includes(chave));
    var chavesEfetivamenteFaltando = []

    for (chaveFaltante of chavesFaltando){

        if (chaveFaltante.indexOf(".") == -1){
            chavesEfetivamenteFaltando.push(chaveFaltante)
        }
        let subChaves = chaveFaltante.split('.')
        try{

            verificarSubChave(jsonObj, subChaves)

        } catch (erro){
            chavesEfetivamenteFaltando.push(chaveFaltante)

        }

    }

    if (chavesEfetivamenteFaltando.length > 0) {
        throw new Error(`Chaves ausentes no JSON: ${chavesEfetivamenteFaltando.join(", ")}`);
    }
};

function acessarValorPorEndereco(objeto, endereco) {
    let valor = objeto;

    for (let parte of endereco) {
        if (valor.hasOwnProperty(parte)) {
            valor = valor[parte];
        } else {
            return null
        }
    }
    return valor;
}


function montar_linha(data){

    var listaValores = []
    for (let chave of KEYS_EXPECTED_ORDER){
        if (chave.indexOf(".") != -1){
            listaValores.push(acessarValorPorEndereco(data, chave.split('.')))
        } else {
            listaValores.push(data[chave])
        }
    }

    return listaValores

};


function json_to_row(data){

    verificarChaves(data)

    var row = montar_linha(data)

    return row

};

function encontrarValorNaColuna(page, valorProcurado) {
    var ultimaLinha = page.getLastRow();
    var valoresColuna = page.getRange(1, ID_COLUMN_REFERENCE, ultimaLinha, 1).getValues();

    for (var i = ultimaLinha - 1; i >= 0; i--) {
        if (String(valoresColuna[i][0]) === String(valorProcurado)) {
            // Encontrou o valor, faça algo aqui
            var linhaEncontrada = i + 1;  // Adiciona 1 para obter o número da linha real
            return linhaEncontrada;
        }
    }

    // Valor não encontrado, retorna a última linha
    return ultimaLinha + 1;
}




function doGet(e) {
    var postData = JSON.parse(e.parameter.data)
    console.log(postData)

    try{
        var row = json_to_row(postData)
    } catch (erro) {
        var resposta = {
            "Status":"Error",
            "Http-status":500,
            "Erro": erro.message
        };

        return ContentService.createTextOutput(JSON.stringify(resposta)).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var page = ss.getSheetByName(SHEET_NAME)
    var linha = encontrarValorNaColuna(page, row[ID_COLUMN_REFERENCE - 1])

    var range = page.getRange(linha, 1, 1, row.length);
    range.setValues([row]);

    return ContentService.createTextOutput(JSON.stringify({"Status":"Success", "Http-status":200})).setMimeType(ContentService.MimeType.JAVASCRIPT);
}


