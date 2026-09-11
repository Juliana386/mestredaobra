// --- VARIÁVEIS DE CONTROLE DO JOGO ---
let estadoJogo = "TELA_INICIAL"; // TELA_INICIAL, JOGANDO, GAME_OVER, VENCEU
let nomeAluno = "";
let vidas = 3;
let nivelAtual = 1;
let maxNiveis = 10;
let pontuacao = 0;
let ranking = [
  { nome: "Marina", pontos: 950 },
  { nome: "Pedro", pontos: 820 },
  { nome: "Luiza", pontos: 640 }
];

// --- VARIÁVEIS DA FASE ---
let baseForma, alturaForma, ladoAzulejo, tipoForma, totalAzulejos;
let estadoResposta = "ESPERANDO"; // ESPERANDO, ACERTOU, ERROU
let mensagem = "";
let mensagemDica = "";
let nivelDica = 0;
let fatorEscala = 35; 
let deslocamentoParalelogramo = 60; 

// --- ELEMENTOS DE INTERFACE (HTML) ---
let inputNome, btnIniciar;
let inputResposta, btnResponder, btnDica, btnProximo;
let btnReiniciar;

// --- ANIMAÇÃO DE FUNDO ---
let formasFundo = [];

function setup() {
  createCanvas(600, 520);
  
  // 1. Injetando CSS para deixar tudo lindo
  let style = createElement('style');
  style.html(`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
    body { font-family: 'Montserrat', sans-serif; }
    
    .input-padrao {
      font-family: 'Montserrat', sans-serif; border-radius: 8px; border: 2px solid #ccc;
      padding: 10px; font-size: 16px; transition: 0.3s; text-align: center;
    }
    .input-padrao:focus { border-color: #0F4C81; outline: none; box-shadow: 0 0 8px rgba(15,76,129,0.4); }
    
    .btn {
      font-family: 'Montserrat', sans-serif; border-radius: 20px; border: none;
      padding: 10px 20px; font-weight: bold; font-size: 16px; color: white;
      cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }
    .btn:hover { transform: scale(1.05); }
    
    .btn-acao { background-color: #0F4C81; }
    .btn-responder { background-color: #17D7A0; }
    .btn-dica { background-color: #FFB000; color: #333; }
    .btn-proximo { background-color: #F05454; }
  `);
  
  // 2. Criando Formas Animadas para a Tela Inicial
  for(let i=0; i<10; i++) {
    formasFundo.push({
      x: random(width), y: random(height), 
      tamanho: random(20, 60), velY: random(0.5, 2),
      cor: color(random(100, 255), random(100, 200), random(200, 255), 150)
    });
  }
  
  // 3. Interface da Tela Inicial
  inputNome = createInput('');
  inputNome.addClass('input-padrao');
  inputNome.position(200, 250);
  inputNome.size(180);
  inputNome.elt.placeholder = 'Seu Nome';
  
  btnIniciar = createButton('COMEÇAR');
  btnIniciar.addClass('btn btn-acao');
  btnIniciar.position(235, 310);
  btnIniciar.mousePressed(iniciarJogo);
  
  // 4. Interface do Jogo (Oculta no início)
  inputResposta = createInput('');
  inputResposta.addClass('input-padrao');
  inputResposta.position(20, 460);
  inputResposta.size(80);
  inputResposta.hide();
  
  btnResponder = createButton('Responder');
  btnResponder.addClass('btn btn-responder');
  btnResponder.position(140, 460);
  btnResponder.mousePressed(verificarResposta);
  btnResponder.hide();
  
  btnDica = createButton('Preciso de Dica');
  btnDica.addClass('btn btn-dica');
  btnDica.position(270, 460);
  btnDica.mousePressed(mostrarDica);
  btnDica.hide();
  
  btnProximo = createButton('Próxima Fase');
  btnProximo.addClass('btn btn-proximo');
  btnProximo.position(430, 460);
  btnProximo.mousePressed(avancarFase);
  btnProximo.hide();
  
  // 5. Interface Fim de Jogo (Oculta no início)
  btnReiniciar = createButton('JOGAR NOVAMENTE');
  btnReiniciar.addClass('btn btn-acao');
  btnReiniciar.position(200, 450);
  btnReiniciar.mousePressed(resetarTudo);
  btnReiniciar.hide();
}

// --- CONTROLE DE FLUXO ---

function iniciarJogo() {
  nomeAluno = inputNome.value() || "Jogador";
  inputNome.hide();
  btnIniciar.hide();
  
  inputResposta.show();
  btnResponder.show();
  btnDica.show();
  
  estadoJogo = "JOGANDO";
  vidas = 3;
  pontuacao = 0;
  nivelAtual = 1;
  gerarDesafio();
}

function finalizarJogo(ganhou) {
  estadoJogo = ganhou ? "VENCEU" : "GAME_OVER";
  
  // Esconde interface do jogo
  inputResposta.hide();
  btnResponder.hide();
  btnDica.hide();
  btnProximo.hide();
  
  // Atualiza Ranking
  ranking.push({ nome: nomeAluno, pontos: pontuacao });
  ranking.sort((a, b) => b.pontos - a.pontos); // Ordena do maior pro menor
  
  btnReiniciar.show();
}

function resetarTudo() {
  btnReiniciar.hide();
  inputNome.show();
  btnIniciar.show();
  inputNome.value('');
  estadoJogo = "TELA_INICIAL";
}

function avancarFase() {
  if (nivelAtual >= maxNiveis) {
    finalizarJogo(true); // Venceu o jogo!
  } else {
    nivelAtual++;
    gerarDesafio();
  }
}

// --- LÓGICA DA FASE ---

function gerarDesafio() {
  tipoForma = random(['RETANGULO', 'PARALELOGRAMO']);
  baseForma = floor(random(4, 10));
  alturaForma = floor(random(3, 6));
  ladoAzulejo = random([0.5, 1]); // 50cm ou 100cm
  
  totalAzulejos = (baseForma * alturaForma) / (ladoAzulejo * ladoAzulejo);
  
  estadoResposta = "ESPERANDO";
  mensagem = "";
  mensagemDica = "";
  nivelDica = 0;
  
  inputResposta.value('');
  btnProximo.hide();
  btnResponder.show();
  btnDica.show();
}

function mostrarDica() {
  nivelDica++;
  if (nivelDica === 1) mensagemDica = "Dica 1: Calcule a área total do espaço (base x altura).";
  else if (nivelDica === 2) mensagemDica = `Dica 2: A área é ${baseForma * alturaForma}m². Transforme o lado do azulejo (${ladoAzulejo*100}cm) para metros.`;
  else if (nivelDica >= 3) {
    mensagemDica = "Dica 3: Calcule a área de UM azulejo. Depois divida a área do espaço pela área do azulejo.";
    btnDica.hide();
  }
}

function verificarResposta() {
  let resposta = parseInt(inputResposta.value());
  
  if (resposta === totalAzulejos) {
    estadoResposta = "ACERTOU";
    mensagem = "¡Boa! Obra concluída.";
    // Pontuação: 100 pontos menos 20 por dica usada
    pontuacao += max(20, 100 - (nivelDica * 20)); 
    btnProximo.show();
    btnResponder.hide();
    btnDica.hide();
    mensagemDica = "";
  } else {
    estadoResposta = "ERROU";
    vidas--;
    if (vidas <= 0) {
      finalizarJogo(false);
    } else {
      mensagem = "Conta errada! Você perdeu uma vida 💔";
    }
  }
}

// --- LOOP DE DESENHO PRINCIPAL ---

function draw() {
  if (estadoJogo === "TELA_INICIAL") drawTelaInicial();
  else if (estadoJogo === "JOGANDO") drawJogando();
  else if (estadoJogo === "GAME_OVER") drawGameOver();
  else if (estadoJogo === "VENCEU") drawVenceu();
}

// --- TELAS INDIVIDUAIS ---

function drawTelaInicial() {
  background(240);
  
  // Desenha fundo animado
  noStroke();
  for(let f of formasFundo) {
    fill(f.cor);
    rect(f.x, f.y, f.tamanho, f.tamanho, 5);
    f.y += f.velY;
    if(f.y > height) f.y = -50;
  }
  
  textAlign(CENTER);
  fill('#0F4C81');
  textStyle(BOLD);
  textSize(45);
  text("MESTRE DA OBRA", width/2, 120);
  
  textSize(18);
  fill(50);
  textStyle(NORMAL);
  text("Calcule rápido, compre os azulejos e não perca dinheiro!", width/2, 160);
  
  textSize(16);
  fill('#F05454');
  textStyle(BOLD);
  text("Digite seu nome para começar:", width/2, 230);
  textAlign(LEFT); // Reseta
}

function drawJogando() {
  background(250);
  
  // HUD (Heads Up Display) - Topo da tela
  fill(30);
  noStroke();
  rect(0, 0, width, 40);
  
  fill(255);
  textSize(16);
  textStyle(BOLD);
  text(`Fase: ${nivelAtual}/${maxNiveis}`, 20, 25);
  text(`Pontuação: ${pontuacao}`, 240, 25);
  text(`Vidas: ${"❤️".repeat(vidas)}`, 480, 25);
  
  // Textos da Questão
  fill('#0F4C81'); 
  textSize(22);
  text(`Desafio da Obra!`, 20, 80);
  
  textStyle(NORMAL);
  textSize(18);
  fill(50); 
  let txtForma = tipoForma === 'RETANGULO' ? 'parede retangular' : 'quintal em paralelogramo';
  text(`Cubra a ${txtForma} (base ${baseForma}m, altura ${alturaForma}m).`, 20, 110);
  text(`Os azulejos têm ${ladoAzulejo * 100}cm de lado. Quantos serão necessários?`, 20, 135);
  
  // Palco da Forma Geométrica
  let inicioX = tipoForma === 'PARALELOGRAMO' ? 50 : 20; 
  let inicioY = 160;
  let largDesenho = baseForma * fatorEscala;
  let altDesenho = alturaForma * fatorEscala;
  
  stroke('#F05454'); 
  strokeWeight(4);
  fill(220); 
  
  drawingContext.save();
  beginShape();
  if (tipoForma === 'RETANGULO') {
    vertex(inicioX, inicioY);
    vertex(inicioX + largDesenho, inicioY);
    vertex(inicioX + largDesenho, inicioY + altDesenho);
    vertex(inicioX, inicioY + altDesenho);
  } else {
    vertex(inicioX + deslocamentoParalelogramo, inicioY);
    vertex(inicioX + deslocamentoParalelogramo + largDesenho, inicioY);
    vertex(inicioX + largDesenho, inicioY + altDesenho);
    vertex(inicioX, inicioY + altDesenho);
  }
  endShape(CLOSE);
  
  // Preenchimento de Acerto
  if (estadoResposta === "ACERTOU") {
    drawingContext.clip(); 
    let tamAzulejoDesenho = ladoAzulejo * fatorEscala;
    fill('#17D7A0'); 
    stroke(255); 
    strokeWeight(1);
    
    let limiteDir = inicioX + largDesenho + deslocamentoParalelogramo;
    for (let x = inicioX; x < limiteDir; x += tamAzulejoDesenho) {
      for (let y = inicioY; y < inicioY + altDesenho; y += tamAzulejoDesenho) {
        rect(x, y, tamAzulejoDesenho, tamAzulejoDesenho);
      }
    }
  }
  drawingContext.restore();
  
  // Mensagens de Feedback
  if (estadoResposta === "ACERTOU") {
    fill('#1A5F1A'); textStyle(BOLD); text(mensagem, 20, 380); textStyle(NORMAL);
  } else if (estadoResposta === "ERROU") {
    fill('#C70039'); textStyle(BOLD); text(mensagem, 20, 380); textStyle(NORMAL);
  }
  
  // Exibição da Dica
  if (mensagemDica !== "") {
    fill('#E59F00'); textSize(15); textStyle(ITALIC); textWrap(WORD);
    text(mensagemDica, 20, 405, 560); textStyle(NORMAL);
  }
}

function drawGameOver() {
  background(30);
  textAlign(CENTER);
  fill('#F05454');
  textStyle(BOLD);
  textSize(50);
  text("GAME OVER", width/2, 100);
  
  fill(255);
  textSize(20);
  textStyle(NORMAL);
  text("Suas empreiteiras faliram! Faltou azulejo.", width/2, 140);
  
  desenharRanking(200);
  textAlign(LEFT);
}

function drawVenceu() {
  background('#17D7A0');
  textAlign(CENTER);
  fill(255);
  textStyle(BOLD);
  textSize(45);
  text("🏆 VOCÊ VENCEU! 🏆", width/2, 100);
  
  textSize(20);
  textStyle(NORMAL);
  text("Todas as obras foram entregues com perfeição!", width/2, 140);
  
  desenharRanking(180);
  textAlign(LEFT);
}

function desenharRanking(yPos) {
  fill(255);
  noStroke();
  rectMode(CENTER);
  fill(0, 0, 0, 100); // Fundo escuro transparente pro ranking
  rect(width/2, yPos + 100, 400, 200, 10);
  rectMode(CORNER);
  
  fill(255);
  textStyle(BOLD);
  textSize(24);
  text(`Sua Pontuação: ${pontuacao}`, width/2, yPos + 40);
  
  textSize(20);
  text("--- TOP EMPREITEIRAS ---", width/2, yPos + 75);
  
  textStyle(NORMAL);
  textSize(18);
  // Desenha os 4 melhores
  for (let i = 0; i < min(4, ranking.length); i++) {
    let posicao = i + 1;
    let rankTexto = `${posicao}º - ${ranking[i].nome} : ${ranking[i].pontos} pts`;
    if (ranking[i].nome === nomeAluno && ranking[i].pontos === pontuacao) {
      fill('#FFB000'); // Destaca o jogador em amarelo
      textStyle(BOLD);
    } else {
      fill(255);
      textStyle(NORMAL);
    }
    text(rankTexto, width/2, yPos + 110 + (i * 25));
  }
}
