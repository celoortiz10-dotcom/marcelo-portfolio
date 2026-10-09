const telaInicial = document.getElementById("telaInicial");
const telaCadastro = document.getElementById("telaCadastro");
const telaConferencia = document.getElementById("telaConferencia");
const telaRebipagem = document.getElementById("telaRebipagem");
const telaDivergencia = document.getElementById("telaDivergencia");
const telaSucesso = document.getElementById("telaSucesso");
const campoNF = document.getElementById("numeroNF");
const listaNFs = document.getElementById("listaNFs");
const resumoNFs = document.getElementById("resumoNFs");
const tituloCarga = document.getElementById("tituloCarga");
const campoBipagemLote = document.getElementById("bipagemLote");
const listaBipados = document.getElementById("listaBipados");
const campoRebipagemLote = document.getElementById("rebipagemLote");
const listaBipadosRebipagem = document.getElementById("listaBipadosRebipagem");
const listaDivergenciaPreview = document.getElementById("listaDivergenciaPreview");
const listaDivergencia = document.getElementById("listaDivergencia");
const codigoDivergencia = document.getElementById("codigoDivergencia");
const codigoSucesso = document.getElementById("codigoSucesso");
const modalConfirm = document.getElementById("modalConfirm");
const btnCancelar = document.getElementById("btnCancelar");
const btnConfirmar = document.getElementById("btnConfirmar");

const notasFiscais = [];
let produtosEsperados = [];
let produtosBipados = [];
let codigoCarga = "";
let lotesDivergentes = [];

const baseNFs = {
    "100": [{ codigo: "655466", nome: "VID PB CRUZE 12/16 4P/5P VFA", lote: "000066989860", qtd: 1 },{ codigo: "326203", nome: "FAROL PRINC GM ASTRA 03/11", lote: "000063518144", qtd: 2 }],
    "101": [{ codigo: "2703149", nome: "VID PB VW POLO 18/ 5P VSF", lote: "000058449188", qtd: 1 },{ codigo: "659873", nome: "FAROL PRINC PALIO F1 01/08", lote: "000057879503", qtd: 1 }],
    "102": [{ codigo: "724279", nome: "LANT TOYOTA HILUX SW4 12/15", lote: "000059758053", qtd: 4 }],
    "123": [{ codigo: "655466", nome: "VID PB CRUZE 12/16", lote: "000066989860", qtd: 1 },{ codigo: "724279", nome: "LANT TOYOTA HILUX SW4", lote: "000059758053", qtd: 2 }]
};

function reconstruirProdutosEsperados() {
    produtosEsperados = [];
    notasFiscais.forEach(nf => {
        if (baseNFs[nf.numero]) {
            baseNFs[nf.numero].forEach(item => {
                const existe = produtosEsperados.find(p => p.lote === item.lote);
                if (!existe) produtosEsperados.push({...item }); else existe.qtd += item.qtd;
            });
        }
    });
}

document.getElementById("novaConferencia").addEventListener("click", () => { telaInicial.style.display="none"; telaCadastro.style.display="block"; campoNF.focus(); });
document.getElementById("voltar").addEventListener("click", () => { telaCadastro.style.display="none"; telaInicial.style.display="block"; });
document.getElementById("adicionarNF").addEventListener("click", () => {
    const numero = campoNF.value.trim();
    if (numero==="") return alert("Digite o número da NF!");
    if (notasFiscais.some(nf => nf.numero===numero)) return alert("Essa NF já foi adicionada!");
    if (!baseNFs[numero]) { alert("NF "+numero+" não cadastrada!"); campoNF.value=""; campoNF.focus(); return; }
    notasFiscais.push({ numero }); reconstruirProdutosEsperados(); atualizarLista(); campoNF.value=""; campoNF.focus();
});

function atualizarLista() {
    listaNFs.innerHTML="";
    notasFiscais.forEach((nf, i) => {
        const li=document.createElement("li"); const span=document.createElement("span"); const btn=document.createElement("button");
        span.textContent="NF: "+nf.numero; btn.textContent="Remover";
        btn.addEventListener("click", ()=>{ notasFiscais.splice(i,1); reconstruirProdutosEsperados(); atualizarLista(); });
        li.appendChild(span); li.appendChild(btn); listaNFs.appendChild(li);
    });
}

document.getElementById("iniciarConferencia").addEventListener("click", () => {
    if (notasFiscais.length===0) return alert("Adicione pelo menos uma NF!");
    const data=new Date(); codigoCarga="CARGA-"+data.getHours()+data.getMinutes()+data.getSeconds();
    produtosBipados=[]; resumoNFs.innerHTML=""; tituloCarga.textContent=codigoCarga+" ("+notasFiscais.length+" NFs agrupadas)";
    document.getElementById("contadorNFs").textContent=notasFiscais.length+" NF(s) na carga";
    notasFiscais.forEach(nf=>{ const li=document.createElement("li"); li.textContent="NF: "+nf.numero; resumoNFs.appendChild(li); });
    atualizarBipados(); telaCadastro.style.display="none"; telaConferencia.style.display="block"; setTimeout(()=>campoBipagemLote.focus(),100);
});
document.getElementById("voltarNFs").addEventListener("click", ()=>{ telaConferencia.style.display="none"; telaCadastro.style.display="block"; });

function adicionarBipagemPorLote(loteInput) {
    if (!loteInput) return; loteInput=loteInput.trim(); if (loteInput==="") return;
    let esperado=produtosEsperados.find(p=>p.lote===loteInput);
    if (!esperado) { for (let k in baseNFs){ const a=baseNFs[k].find(p=>p.lote===loteInput); if(a){ esperado=a; break; } } }
    let cod,nome,loteReal;
    if (esperado){ cod=esperado.codigo; nome=esperado.nome; loteReal=esperado.lote; } else { cod="NÃO PREVISTO"; nome="Lote: "+loteInput; loteReal=loteInput; }
    const ex=produtosBipados.find(p=>p.lote===loteReal); if (ex) ex.qtd+=1; else produtosBipados.push({ codigo:cod, nome, lote:loteReal, qtd:1 });
    atualizarBipados(); atualizarBipadosRebipagem();
}

function setupBipagem(inputEl, isRebip) {
    if (!inputEl) return;
    inputEl.addEventListener("keydown", (e)=>{ if(e.key==="Enter"){ e.preventDefault(); const v=inputEl.value.trim(); if(v==="") return; adicionarBipagemPorLote(v); if(isRebip) mostrarPreviewSemInduzir(); inputEl.value=""; inputEl.focus(); } });
}
setupBipagem(campoBipagemLote,false); setupBipagem(campoRebipagemLote,true);

function atualizarBipados(){ listaBipados.innerHTML=""; produtosBipados.forEach(p=>{ const li=document.createElement("li"); li.textContent=p.codigo+" | LOTE: "+p.lote+" - Bipado: "+p.qtd; listaBipados.appendChild(li); }); }
function atualizarBipadosRebipagem(){ listaBipadosRebipagem.innerHTML=""; produtosBipados.forEach(p=>{ const li=document.createElement("li"); li.textContent=p.codigo+" | LOTE: "+p.lote+" - Bipado: "+p.qtd; listaBipadosRebipagem.appendChild(li); }); }

document.getElementById("finalizar").addEventListener("click", ()=>{ if(produtosBipados.length===0) return alert("Bipe pelo menos um lote!"); modalConfirm.style.display="flex"; });
btnCancelar.addEventListener("click", ()=> modalConfirm.style.display="none");
btnConfirmar.addEventListener("click", ()=>{ modalConfirm.style.display="none"; executarPrimeiraChecagem(); });

function calcularDivergencias(){
    const divergencias=[]; let temDiv=false; const lotesDiv=[];
    produtosEsperados.forEach(esp=>{ const bip=produtosBipados.find(b=>b.lote===esp.lote); const qtd=bip?bip.qtd:0; if(qtd!==esp.qtd){ temDiv=true; lotesDiv.push(esp.lote); if(qtd<esp.qtd) divergencias.push("FALTA: "+esp.codigo+" LOTE "+esp.lote+" - Esp: "+esp.qtd+" / Bip: "+qtd); else divergencias.push("SOBRA: "+esp.codigo+" LOTE "+esp.lote+" - Esp: "+esp.qtd+" / Bip: "+qtd); } });
    produtosBipados.forEach(bip=>{ const esp=produtosEsperados.find(e=>e.lote===bip.lote); if(!esp){ temDiv=true; lotesDiv.push(bip.lote); divergencias.push("SOBRA NÃO PREVISTA - LOTE: "+bip.lote+" - Qtd: "+bip.qtd); } });
    return { temDiv, divergencias, lotesDiv };
}

// AQUI QUE NÃO INDUZ - só mostra o LOTE divergente, sem falar se é falta/sobra/qtd
function mostrarPreviewSemInduzir(){
    const calc=calcularDivergencias();
    listaDivergenciaPreview.innerHTML="";
    if(!calc.temDiv){
        const li=document.createElement("li"); li.style.background="#f0fdf4"; li.style.borderColor="#bbf7d0"; li.style.color="#15803d"; li.textContent="✅ Tudo corrigido!"; listaDivergenciaPreview.appendChild(li);
    } else {
        calc.lotesDiv.forEach(lote=>{
            const li=document.createElement("li"); li.style.background="#fffbeb"; li.style.borderColor="#fde68a"; li.style.color="#92400e"; li.style.fontWeight="700";
            li.textContent="⚠️ Lote com divergência: "+lote+" - Rebipe corretamente";
            listaDivergenciaPreview.appendChild(li);
        });
    }
}

function executarPrimeiraChecagem(){
    const calc=calcularDivergencias();
    if(!calc.temDiv){
        codigoSucesso.textContent=codigoCarga+" | Conferida em "+new Date().toLocaleString();
        telaConferencia.style.display="none"; telaSucesso.style.display="block";
    } else {
        lotesDivergentes=calc.lotesDiv;
        produtosBipados=produtosBipados.filter(p=>!lotesDivergentes.includes(p.lote));
        mostrarPreviewSemInduzir(); atualizarBipadosRebipagem();
        telaConferencia.style.display="none"; telaRebipagem.style.display="block"; setTimeout(()=>campoRebipagemLote.focus(),100);
    }
}

document.getElementById("conferirNovamente").addEventListener("click", ()=>{
    const calc=calcularDivergencias();
    if(!calc.temDiv){
        codigoSucesso.textContent=codigoCarga+" | Conferida em "+new Date().toLocaleString()+" (corrigido na rebipagem)";
        telaRebipagem.style.display="none"; telaSucesso.style.display="block";
    } else {
        const divId="DIV-"+new Date().getTime().toString().slice(-4); codigoDivergencia.textContent=divId+" | "+codigoCarga; listaDivergencia.innerHTML="";
        calc.divergencias.forEach(txt=>{ const li=document.createElement("li"); li.textContent=txt; listaDivergencia.appendChild(li); });
        telaRebipagem.style.display="none"; telaDivergencia.style.display="block";
    }
});
document.getElementById("gerarDivergenciaForcado").addEventListener("click", ()=>{
    const calc=calcularDivergencias(); const divId="DIV-"+new Date().getTime().toString().slice(-4);
    codigoDivergencia.textContent=divId+" | "+codigoCarga; listaDivergencia.innerHTML="";
    calc.divergencias.forEach(txt=>{ const li=document.createElement("li"); li.textContent=txt; listaDivergencia.appendChild(li); });
    telaRebipagem.style.display="none"; telaDivergencia.style.display="block";
});
document.getElementById("voltarInicio").addEventListener("click", ()=> location.reload());
document.getElementById("voltarInicioSucesso").addEventListener("click", ()=> location.reload());