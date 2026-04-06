/*
Minigame da fase de cidadania. Objetivo: O jogador deve liberar assentos preferenciais clicando nos NPCs comuns que os ocupam. O jogo ocorre em dois vagões consecutivos, cada um com sua própria pontuação-alvo. 
Clicar em NPCs prioritários penaliza o jogador; inatividade também penaliza.
*/

import BaseScene from "./base-scene.js";

// Constantes da barra de progresso
const larguraFrameBarra = 384;   // largura de cada um dos 3 frames (pixels)
const alturaFrameBarra = 192;   // altura do frame (pixels) 

// Cor e opacidade do preenchimento
const corPreenchimentoBarra   = 0x0000FF;  // azul
const alfaPreenchimentoBarra   = 1.0;

// Frames da spritesheet
const framSemEstrela = 0;   // sem estrela colorida
const frameComEstrela = 1;   // primeira estrela acesa
const frameFaseConcluida    = 2;   // ambas as estrelas acesas

class Cidadania extends BaseScene {
    constructor() {
        super('Cidadania')
        this.instrucoes = "Libera os assentos preferenciais!\n\nClique nos NPCs com um indicador verde\npara liberar os assentos.";
    }

    preload() {
        super.preload(); 

        this.load.image('vagao', './assets/Cenario/vagao.png')
        this.load.image('vagao2', './assets/Cenario/vagao2.png')
        this.load.image('assentoComum', './assets/Object/assento.png')
        this.load.image('assentoPref', './assets/Object/assento-pref.png')
        this.load.image('player1', './assets/Npc/figurante_sent.png')
        this.load.image('player2', './assets/Npc/figurante2_sent.png')
        this.load.image('player3', './assets/Npc/figurante3_sent.png')
        this.load.image('player4', './assets/Npc/figurante4_sent.png')
        this.load.image('player5', './assets/Npc/figurante5_sent.png')
        this.load.image('player6', './assets/Npc/figurante6_sent.png')
        this.load.image('player7', './assets/Npc/figurante7_sent.png')
        this.load.image('player8', './assets/Npc/figurante8_sent.png')
        this.load.image('player9', './assets/Npc/figurante9_sent.png')
        this.load.image('player10', './assets/Npc/figurante10_sent.png')
        this.load.image('temporizadorCid', './assets/Object/timeCidMetro.png');
        this.load.spritesheet('barraProgresso', './assets/Object/timeBarMetroNova.png', {
            frameWidth:  larguraFrameBarra,
            frameHeight: alturaFrameBarra
        });
        this.load.audio('trilhaFundoCidadania', './assets/Sons/cidadania.mp3');  
        this.load.audio('click', './assets/Sons/click.wav'); 
    }

    create() {

        super.create();
        this.jogador.setVisible(false);
        this.toggleControls(false);

        this.criarTutorial();
        this.pausaFundo = true;

        this.btnAbrirTutorial.setOrigin(this.largura * 0.00025, this.altura * 0.0003)
        this.cameras.main.fadeIn(1500, 0, 0, 0);

        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        this.musicaFundoCidadania = this.sound.add('trilhaFundoCidadania', {
            volume: volMusicaAtual,
            loop: true
        });

        this.musicaFundoCidadania.play();

        // Configs de tamanho da tela
        let largura = this.scale.width;
        let altura = this.scale.height;
        var centroX = this.cameras.main.centerX;// Centraliza os elementos utilizando as dimensões da tela
        var centroY = this.cameras.main.centerY;

        // Fundo do primeiro vagão
        this.vagao = this.add.image(centroX, centroY, 'vagao');
        this.vagao.setDisplaySize(largura, altura);

        // O Fundo 2 (Fica escondido na direita)
        this.vagao2 = this.add.image(centroX + largura, centroY + 3.53, 'vagao2').setDepth(0);
        this.vagao2.setDisplaySize(largura, altura + 10);

        this.npcsComuns = ['player1', 'player2', 'player4', 'player5','player7', 'player8', 'player9', 'player10'];
        this.npcsPrioridade = ['player3', 'player6'];

        // Registra o sprite de NPC sentado em cada assento; string vazia indica assento livre
        this.pessoasSentadas = ["", "", "", "", "", "", "", ""];

        // Guarda os cronômetros individuais de cada assento
        this.timersAssentos = [null, null, null, null, null, null, null, null];

        // Guarda as imagens dos NPCs para a transição
        this.npcsAtivos = [null, null, null, null, null, null, null, null];


        // Variável para a regra de inatividade
        this.tempoSemClicar = 0;

        // Posições e tipos dos assentos do primeiro vagão (comum ou preferencial)
        this.posicoesAssentos = [
            { x: 100, y: 440, tipo: 'assentoComum' },
            { x: 233, y: 440, tipo: 'assentoComum' },
            { x: 366, y: 440, tipo: 'assentoPref' },
            { x: 915, y: 440, tipo: 'assentoPref' },
            { x: 1048, y: 440, tipo: 'assentoComum' },
            { x: 1181, y: 440, tipo: 'assentoComum' }
        ];

        // Posições para a Fase 2 (8 cadeiras no segundo vagão!)
        this.posicoesAssentosFase2 = [
            { x: largura + (largura * 0.10), y: 440, tipo: 'assentoComum' },
            { x: largura + (largura * 0.21), y: 440, tipo: 'assentoComum' },
            { x: largura + (largura * 0.32), y: 440, tipo: 'assentoPref' },
            { x: largura + (largura * 0.43), y: 440, tipo: 'assentoComum' },
            { x: largura + (largura * 0.57), y: 440, tipo: 'assentoComum' },
            { x: largura + (largura * 0.68), y: 440, tipo: 'assentoPref' },
            { x: largura + (largura * 0.79), y: 440, tipo: 'assentoComum' },
            { x: largura + (largura * 0.90), y: 440, tipo: 'assentoComum' }
        ];

        // Para cada 'posicao' dentro da nossa lista...
        this.posicoesAssentos.forEach(posicao => {
            // Desenha a imagem baseada no tipo definido (assentoComum ou assentoPref)
            let banco = this.add.image(posicao.x, posicao.y + 10, posicao.tipo);
            banco.setDisplaySize(132, 138);
        })

        // Desenha as cadeiras da Fase 2 para já ficarem prontas lá no outro vagão
        this.posicoesAssentosFase2.forEach(posicao => {
            let banco = this.add.image(posicao.x, posicao.y, posicao.tipo);
            banco.setDisplaySize(132, 138);
        });

        this.tempoTotal = 30; 
        this.tempo = this.tempoTotal;
        this.pontosAtuais = 0;
        this.pontosMostrados = 0; // Só cresce — garante que a barra nunca recue visualmente
        this.totalDePontos1 = 20;
        this.totalDePontos2 = 40;
        this.faseAtual = 1;

        this.jogoAtivo = false;

        // Barra verde que encolhe
        this.larguraBarra = 270;
        this.barraVerde = this.add.rectangle(largura * 0.094, altura * 0.079, this.larguraBarra, 58, 0x08c108).setDepth(100).setScrollFactor(0).setScale(0.8);
        this.barraVerde.setOrigin(0, 0.9);

        // Moldura do temporizadorCid
        this.molduratemporizadorCid = this.add.image(largura * 0.19, altura * 0.05, "temporizadorCid").setScale(2.8).setDepth(101).setScrollFactor(0).setScale(2.7);

        // ── Barra de progresso ────────────────────────────────────────────────
        this.criarBarraProgresso();

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.jogoAtivo || this.pausaFundo) return;

                this.tempo--;
                this.tempoSemClicar++; // Aumenta o tempo que o jogador está sem agir

                // Punição: Se passar de 3 segundos sem clicar
                if (this.tempoSemClicar >= 3) {
                    this.pontosAtuais -= 1; // Conta como se ele tivesse errado
                    this.tempoSemClicar = 0; // Zera para não punir infinitamente
                    this.atualizarPontos();
                }

                if (this.tempo <= 0) {

                    // Verifica se perdeu na Fase 1 OU se perdeu na Fase 2
                    if (this.faseAtual === 1 && this.pontosAtuais < this.totalDePontos1) {
                        this.perderFase();
                    } else if (this.faseAtual === 2 && this.pontosAtuais < this.totalDePontos2) {
                        this.perderFase();
                    }
                }

            },
            callbackScope: this,
            loop: true
        });
        this.btnFecharTutorial.on('pointerdown', () => {
            this.iniciarCicloNpcs();
        })
    }

    update() {   
        // Calcula o tamanho da barra de tempo
        let porcentagemTempo = this.tempo / this.tempoTotal;
        if (porcentagemTempo < 0) porcentagemTempo = 0;

        // Encolhe a barra
        this.barraVerde.scaleX = porcentagemTempo;

        // Muda a cor (Verde -> Amarelo -> Vermelho)
        if (porcentagemTempo > 0.5) {
            this.barraVerde.setFillStyle(0x08c108);
        } else if (porcentagemTempo > 0.2) {
            this.barraVerde.setFillStyle(0xffd700);
        } else {
            this.barraVerde.setFillStyle(0xff0000);
        }
    }

    iniciarCicloNpcs() {
        // Se já existem NPCs (timers preenchidos), não faz nada
        if (this.timersAssentos[0] !== null) return; 

        this.jogoAtivo = true;
        this.pausaFundo = false;

        for (let i = 0; i < this.posicoesAssentos.length; i++) {
            this.spawnNpcNoAssento(i);
        }
    }

    spawnNpcNoAssento(indiceAssento) {

        
        // Se o jogo acaba, para tudo
        if (!this.jogoAtivo || this.pausaFundo) return;

        // Limpa o crônometro anterior  
        if (this.timersAssentos[indiceAssento]) {
            this.timersAssentos[indiceAssento].remove();
        }

        // 1. Pegar a posição X e Y do assento baseado no 'indiceAssento' (que vai ser 0, 1, 2 ou 3)
        // Adaptado para pegar da lista certa dependendo da Fase!
        let posicao;
        if (this.faseAtual === 1) {
            posicao = this.posicoesAssentos[indiceAssento];
        } else {
            posicao = this.posicoesAssentosFase2[indiceAssento];
        }

        // 2. Sortear se vai nascer uma pessoa Comum ou Prioridade (50% de chance pra cada)
        // Phaser.Math.Between(0, 1) retorna 0 ou 1, determinando aleatoriamente se o NPC é prioritário
        let ehPrioridade = Phaser.Math.Between(0, 1) === 1;

        // --- TRAVA DE SEGURANÇA ---
        // Verifica se ainda existe algum NPC prioritário que não esteja sentado
        if (ehPrioridade) {
            let temPrioritarioLivre = this.npcsPrioridade.some(npc => !this.pessoasSentadas.includes(npc));
            if (!temPrioritarioLivre) {
                ehPrioridade = false; // Se não tem, forçamos a ser comum!
            }
        }

        // 3. Escolher de qual lista vamos tirar o NPC
        let listaEscolhida;
        if (ehPrioridade) {
            listaEscolhida = this.npcsPrioridade;

        } else {
            listaEscolhida = this.npcsComuns;
        }

        // 4. Pegar um nome aleatório de dentro da lista escolhida
        // IMPORTANTE: Limpa a cadeira ATUAL da memória antes de sortear para evitar loop infinito
        this.pessoasSentadas[indiceAssento] = "";
        
        let spriteSorteado = Phaser.Utils.Array.GetRandom(listaEscolhida);

        // Verifica se o sorteado JÁ ESTÁ em alguma OUTRA cadeira
        let limitadorSorteio = 0; // Trava de segurança extra
        while (this.pessoasSentadas.includes(spriteSorteado) && limitadorSorteio < 50) {
            spriteSorteado = Phaser.Utils.Array.GetRandom(listaEscolhida);
            limitadorSorteio++;
        }

        // Agora que temos certeza que o sprite sorteado não estava na tela, salvamos o nome dele na memória do assento correspondente
        this.pessoasSentadas[indiceAssento] = spriteSorteado;

        // 5. Agora sim, desenhar o NPC na tela usando o X e Y da 'posicao' e o 'spriteSorteado'
        let npc = this.add.image(posicao.x, posicao.y - 25, spriteSorteado);
        npc.setDisplaySize(123, 244);

        // Guarda a referência visual do NPC para a transição
        this.npcsAtivos[indiceAssento] = npc;

        // Transforma o NPC em algo clicavel e muda o cursor do mouse
        npc.setInteractive({ useHandCursor: true });

        // Preserva o tipo sorteado no NPC para ser verificado no momento do clique
        npc.isPrioridade = ehPrioridade;

        // --- DEIXAR O NPC COMUM MARCADO ---
        // Cria um marcador sutil "!" para o jogador identificar quem ele deve clicar
        let marcadorDica = null;
        if (!ehPrioridade) {
            marcadorDica = this.add.text(posicao.x, posicao.y - 120, '!', {
                fontSize: '32px',
                fontFamily: 'Pixel', 
                color: '#ffffff',
                backgroundColor: '#00cc66',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setDepth(250);

            // Animação sutil de flutuar
            this.tweens.add({
                targets: marcadorDica,
                y: posicao.y - 130, // sobe 10 pixels
                duration: 400, // suave
                yoyo: true, 
                repeat: -1 
            });
        }


        // O que acontece quando o jogador clica no NPC
        npc.on('pointerdown', () => {
            if (this.time.paused || !this.jogoAtivo) return;

            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });

            if (!this.jogoAtivo) return;

            this.tempoSemClicar = 0;

            if (npc.isPrioridade) {
                this.pontosAtuais -= 2;
                this.mostrarAvisoClique("PRIORITÁRIO", npc.x, npc.y - 100, '#ff4d4d');
            } else {
                this.pontosAtuais += 1;
                this.mostrarAvisoClique("ASSENTO LIBERADO", npc.x, npc.y - 100, '#00ff88');
            }

            this.atualizarPontos();

            if (marcadorDica) marcadorDica.destroy();
            npc.destroy();

            this.spawnNpcNoAssento(indiceAssento);
        });

        // Tempo de vida de um NPC (1 segundo)
        this.timersAssentos[indiceAssento] = this.time.addEvent({
            delay: 1000, // Ajuste do tempo de vida
            callback: () => {
                // Se o tempo acabar e o jogador n clicar
                if (marcadorDica) marcadorDica.destroy();
                npc.destroy();
                this.spawnNpcNoAssento(indiceAssento); // Nasce outro no lugar
            },
            callbackScope: this

        });
    }

    atualizarPontos() {
        if (!this.jogoAtivo) return;
        
        // Limita (clampeia) para não deixar os pontos irem abaixo de zero ou passarem do máximo.
        if (this.pontosAtuais < 0) this.pontosAtuais = 0;
        if (this.pontosAtuais > this.totalDePontos2) this.pontosAtuais = this.totalDePontos2;

        // Alteração: Antes os "pontosMostrados" só podiam crescer.
        // Agora, igualamos diretamente aos "pontosAtuais".
        // Com isso, se o jogador errar o clique ou ficar sem clicar (ociosidade),
        // ele perde ponto e essa variável também diminui, regredindo a barra visualmente.
        this.pontosMostrados = this.pontosAtuais;

        // === BARRA ÚNICA: mapeia pontosMostrados para calcular um valor de preenchimento (0 a 1) ===
        let preenchimento = this.pontosMostrados / this.totalDePontos2;
        if (preenchimento > 1) preenchimento = 1;

        if (this.barFillMetrics) {
            const { x, y, maxW, h } = this.barFillMetrics;

            // Cancela animação anterior para impedir que ela fique tremendo e conflitante
            // caso o jogador ganhe e perca ponto ao mesmo tempo rapidamente.
            this.tweens.killTweensOf(this.barFillMetrics);
            
            // Fazemos uma animação (tween) suave preenchendo ou esvaziando a barra azul de fato
            this.tweens.add({
                targets: this.barFillMetrics,
                currentW: maxW * preenchimento,
                duration: 200,
                onUpdate: () => {
                    this.graficoFillBar.clear();
                    this.graficoFillBar.fillStyle(corPreenchimentoBarra, alfaPreenchimentoBarra);
                    this.graficoFillBar.fillRect(x, y, this.barFillMetrics.currentW, h);
                }
            });
        }

        // --- Checagem de estrelas conquistadas ---
        
        // Se, por a barra regredir, a pontuação voltar pra menos que o necessário da fase 1,
        // a gente remove a primeira estrela também e volta pra barra zerada.
        if (this.pontosAtuais < this.totalDePontos1) {
            this.spriteBarraProgresso?.setFrame(framSemEstrela);
        } else if (this.pontosAtuais >= this.totalDePontos1 && this.pontosAtuais < this.totalDePontos2) {
            // Se já tem pontos para a fase 1, ganhamos a primeira estrela.
            this.spriteBarraProgresso?.setFrame(frameComEstrela);
            
            // Mas apenas passa de fase de fato se for a primeira vez completando a primeira fase.
            if (this.faseAtual === 1) {
                this.vencerFase();
            }
        } else if (this.pontosAtuais >= this.totalDePontos2 && this.faseAtual === 2) {
            // Se chegou no limite, ganha a segunda estrela e zera o jogo.
            this.spriteBarraProgresso?.setFrame(frameFaseConcluida);
            
            // Garante que o preenchimento azul termina em 100% cobrindo a barra inteira no final.
            if (this.barFillMetrics) {
                const { x, y, maxW, h } = this.barFillMetrics;
                this.tweens.killTweensOf(this.barFillMetrics);
                this.graficoFillBar.clear();
                this.graficoFillBar.fillStyle(corPreenchimentoBarra, alfaPreenchimentoBarra);
                this.graficoFillBar.fillRect(x, y, maxW, h);
            }

            this.jogoAtivo = false;

            this.musicaFundoCidadania.destroy();

            this.time.delayedCall(3000, () => {
                this.molduratemporizadorCid.destroy();
                this.barraVerde.destroy();
                this.spriteBarraProgresso.destroy();
                this.graficoFillBar.destroy();
                this.registry.set('desbloquearBadgeSeg', false);
                this.registry.set('desbloquearBadgeCid', true);
                this.btnAbrirTutorial.setVisible(false);
                this.conquistaBadge();
            });
        }
        
    }

    vencerFase() {
        this.jogoAtivo = false; // Trava o jogo para ninguém mais nascer

        // Vamos chamar a função que fará a animação do personagem!
        this.animarCutscene();
    }

    perderFase() {
        this.jogoAtivo = false; // Trava o jogo

        // Fundo escuro semitransparente
        let fundoEscuro = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.7)
            .setDepth(199).setScrollFactor(0);

        // Texto principal
        let textoDerrota = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'TEMPO ESGOTADO!', {
            fontSize: '64px', fill: '#ff0000', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

        // Botão de Tentar Novamente
        let btnTentarNovamente = this.add.rectangle(this.scale.width / 2, this.scale.height / 2 + 50, 300, 60, 0xffd700)
            .setDepth(200).setScrollFactor(0).setInteractive();
        
        let txtTentarNovamente = this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, 'TENTAR NOVAMENTE', {
            fontSize: '24px', fill: '#000000', fontStyle: 'bold' 
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        // Efeito de hover no botão
        btnTentarNovamente.on('pointerover', () => btnTentarNovamente.setFillStyle(0xffffff));
        btnTentarNovamente.on('pointerout', () => btnTentarNovamente.setFillStyle(0xffd700));

        // Reinicia a cena ao clicar
        btnTentarNovamente.on('pointerdown', () => {
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });

            this.scene.restart();
        });
    }

    animarCutscene() {
        let largura = this.scale.width;
        let centroX = this.cameras.main.centerX;

        // Limpa a memória das cadeiras para não travar num loop infinito
        this.pessoasSentadas = ["", "", "", "", "", "", "", ""];

        // 1. Limpa todos os NPCs que estavam na fase 1
        this.timersAssentos.forEach(timer => {
            if (timer) timer.remove();
        });

        // Apaga os NPCs antigos para não sobrecarregar
        this.npcsAtivos.forEach(npc => {
            if (npc && npc.active) npc.destroy();
        });
        this.npcsAtivos = [null, null, null, null, null, null, null, null];

        // 2. Mostra um aviso rápido na tela 
        let textoAviso = this.add.text(centroX, this.scale.height / 2, 'Avançando para o próximo vagão', {
            fontSize: '48px', fill: '#FFD700', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

        // 3. Espera 1,5 segundos e apaga o texto
        this.time.delayedCall(1500, () => {
            textoAviso.destroy();

            // O phaser faz a camera deslizar
            this.cameras.main.pan(centroX + largura, this.cameras.main.centerY, 2000, 'Power2');

            // 4. Leva dois segundos para ela andar
            this.time.delayedCall(2000, () => {
                this.faseAtual = 2;
                this.tempo = this.tempoTotal;
                this.jogoAtivo = true;

                for (let i = 0; i < this.posicoesAssentosFase2.length; i++) {
                    this.spawnNpcNoAssento(i);
                }
            });

        });


    }

    criarBarraProgresso() {
        // ── Tamanho e posição ─────────────────────────────────────────────────
        let largura = this.scale.width;
        let altura = this.scale.height;
        const escalaBarra    = (largura * 0.22) / larguraFrameBarra; // ~22% da largura da tela
        const larguraBarra      = larguraFrameBarra * escalaBarra;
        const alturaBarra      = alturaFrameBarra * escalaBarra;
        const margemXBarra   = largura  * 0.07;  // margem da borda direita
        const margemYBarra   = altura   * -0.05;  // margem do topo

        // Âncora no canto superior direito
        const posicaoXBarra = largura  - larguraBarra / 2 - margemXBarra;
        const posicaoYBarra = alturaBarra / 2 + margemYBarra;

        // 1. Fill (abaixo do sprite)
        this.graficoFillBar = this.add.graphics()
            .setScrollFactor(0)
            .setDepth(101);

        // 2. Overlay da spritesheet
        this.spriteBarraProgresso = this.add.sprite(posicaoXBarra, posicaoYBarra, 'barraProgresso', framSemEstrela)
            .setScale(escalaBarra)
            .setScrollFactor(0)
            .setDepth(102);

        // 3. Métricas do fill em pixels de tela
        this.barFillMetrics = {
            currentW: 0,
            x:    posicaoXBarra - larguraBarra / 2 + larguraBarra * 0.03, //padding horizontal (cada lado)
            y:    posicaoYBarra - alturaBarra / 2 + alturaBarra * 0.32, //padding do topo
            maxW: larguraBarra * (0.91), //total - padding horizontal - padding horizontal direita
            h:    alturaBarra * 0.4 //altura do fill em relação à barra escalada
        };
    }

    mostrarAvisoClique(texto, x, y, cor) {
        let aviso = this.add.text(x, y, texto, {
            fontSize: '24px',
            fontFamily: 'Pixel',
            color: cor,
            backgroundColor: '#000000',
            padding: {
                x: 6,
                y: 4
            }
        }).setOrigin(0.5).setDepth(300);

        this.tweens.add({
            targets: aviso,
            y: y - 50, // Sobe um pouquinho mais
            alpha: 0,
            duration: 1500, // Aumentado para o texto durar mais tempo (1.5s total)
            ease: 'Power2',
            onComplete: () => {
                aviso.destroy();
            }
        });
    }

}

export default Cidadania;