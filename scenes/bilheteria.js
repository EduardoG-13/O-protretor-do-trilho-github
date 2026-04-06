/*
Bilheteria.js - Cena da Bilheteria / Introdução do Game.
Objetivo: Permitir interação com o NPC bilheteiro através de diálogos, apresentar o mapa das linhas com os minigames e objetivos do jogo, e orientar sobre o caminho até o Centro de Controle Operacional.
Entradas e saídas: Recebe o jogador configurado, armazena dados de progresso nos diálogos (indiceDialogo, contadorFalasBt), gerencia visibilidade de elementos interativos.
Gatilhos de transição: Transição para próxima cena será acionada após passar pelo mapa, em um determinado point na cena.
*/

import BaseScene from './base-scene.js';

class Bilheteria extends BaseScene {
    constructor() {
        super('Bilheteria');
    }

    preload() {
        super.preload(); 

        this.load.image('bilheteria', './assets/Cenario/Bilheteria.png');
        this.load.image('bilheteria2', './assets/Cenario/Bilheteria2.png'); // Extensão da cena da bilheteria, apoia o deslocamento horizontal da cena
        this.load.spritesheet('bilheteiro', './assets/Npc/Bilheteiro.png', { frameWidth: 256, frameHeight: 128 });
        this.load.image('interacao', './assets/Botoes/interact.png'); // ícone de diálogo
        this.load.image('mapaBK', './assets/Object/mapaBK.png'); // elemento do mapa no background
        this.load.image('mapa', './assets/Cenario/mapa.png'); // tela mapa
        this.load.image('tremMapa', './assets/Object/trem-mapa.png'); // trem que se movimenta no mapa
        this.load.audio('npc_dialogo', './assets/Sons/npc-dialog.mp3');

        this.load.audio('trilhaFundoBilheteria', './assets/Sons/bilheteriaEtransições.mp3');  
        this.load.audio('click', './assets/Sons/click.wav');    
    }

    create(data) {
        this.nomeAgente = data.nomeAgente;
        this.registry.set('desbloquearLuz', true);
        this.registry.set('bilheteria', true);

        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        this.musicaFundoBilheteria = this.sound.add('trilhaFundoBilheteria', {
            volume: volMusicaAtual,
            loop: true
        });

        this.musicaFundoBilheteria.play();


        // Efeito de transição de entrada na cena
        this.cameras.main.fadeIn(1500, 0, 0, 0);
        super.create(); // Inicializa jogador e controles da classe base

        this.dialogoRealizado = false;

        this.efeitoBip = this.sound.add('npc_dialogo', { volume: 0.1 });

        // --- Configuração do background ---
        // Amplia o mapa para duas vezes a largura, permitindo scroll horizontal
        const larguraTotalDoMapa = this.largura * 2;

        this.cameras.main.setBounds(0, 0, larguraTotalDoMapa, this.altura);
        this.physics.world.setBounds(0, 0, larguraTotalDoMapa, this.altura);

        // Config para câmera seguir o jogador
        this.cameras.main.startFollow(this.jogador, true, 0.05, 0.05);

        // --- Cenários ---
        // 1. Primeira imagem cobrindo a primeira metade do mapa
        this.backgroundBilheteria1 = this.add.image(this.largura * 0.5, this.altura * 0.5, 'bilheteria')
            .setDisplaySize(this.largura, this.altura)
            .setDepth(10); // Profundidade do fundo

        // 2. Segunda imagem colada à direita da primeira para criar continuidade
        this.backgroundBilheteria2 = this.add.image(this.largura * 1.5, this.altura * 0.5, 'bilheteria2')
            .setDisplaySize(this.largura, this.altura)
            .setDepth(10);

        // --- NPC da Bilheteria ---
        this.npc = this.physics.add.sprite(this.largura * 0.52, this.altura * 0.39, 'bilheteiro')
            .setScale(this.largura / 10000);

        this.npc.body.allowGravity = false; // NPC não sofre gravidade
        this.npc.setImmovable(true); // NPC não pode ser empurrado
        this.npc.body.moves = false; // Desabilita movimentação física
        this.npc.setDepth(1);
        this.npc.setOffset(this.largura * 1.5, this.altura * 3);

        // --- Interação ---
        // Ícone de interação com NPC
        this.iconeInteracao = this.add.image(0, 0, 'interacao')
            .setVisible(false)
            .setScale(this.largura / 1600)
            .setDepth(60);

        // Ícone interação com mapa
        this.iconeInteracaoMapa = this.add.image(0, 0, 'interacao')
            .setVisible(false)
            .setScale(this.largura / 1600)
            .setDepth(60);

        // --- Mapa ---
        this.map = this.add.image(this.largura * 1.5, this.altura * 0.33, 'mapaBK')
            .setScale(this.largura / 10000);

        this.map.setDepth(1);

        // Cria os dialogos do bilheteiro
        this.dialogosBT = [
            { texto: `${this.nomeAgente}, ainda bem que chegou! Sinto muito por interromper suas férias, mas o Metrô virou um caos!`, nome: "João" },
            { texto: "Ocorreu um desajuste que derrubou a rede. Até o autoatendimento parou! Tive que abrir o SSO manual para conter a emergência.", nome: "João" },
            { texto: "Aqui está o seu crachá de Agente. Ele vai liberar o seu acesso direto às plataformas!", nome: "João" },
            { texto: "(Suspiro)... Lá se vai minha água de coco. Tudo bem, João. O dever chama, vamos consertar isso", nome: this.nomeAgente },
            { texto: "Dê uma olhada no mapa das linhas à sua direita. Siga pelas estações até chegar ao CCOx. Boa sorte, Agente!", nome: "João" },
        ];

        this.indiceDialogo = 0; 
        this.estaEscrevendo = false; 
        this.textoCompleto = ""; 
        this.eventoEscrita = null; 

        // --- Diálogos Após a Interação com o Bilheteiro

        this.dialogosBtCompleto = [
            { texto: "Agente, siga até o mapa para conferir seu caminho até o CCO!", nome: "João" },
            { texto: "Seja rápido! O metrô precisa da sua ajuda imediatamente.", nome: "João" },
            { texto: "O que você ainda está esperando? A cidade depende de você, Agente!", nome: "João" }
        ];

        this.contadorFalasBt = -1;

        this.montarInterfaceDialogo(); 
        this.montarInterfaceMapa(); 

        // Gerencia o fluxo de interação: exibe diálogos do NPC ou abre o mapa conforme o objeto próximo
        this.btnInteracao.on('pointerdown', () => { 

            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });

            // Pausa o jogo e esconde os controles
            this.physics.pause();
            this.toggleControls(false);
            this.iconeInteracao.setVisible(false);

            if (this.interacaoNpc === true){
                
                this.caixaDialogo.setVisible(true);

                if (this.contadorFalasBt === -1){

                    this.listaAtual = this.dialogosBT;
                } 
                else {

                    let indiceFalaRepetida = Math.min(this.contadorFalasBt, this.dialogosBtCompleto.length - 1);  
                    this.listaAtual = [this.dialogosBtCompleto[indiceFalaRepetida]];
                }
                
                this.indiceDialogo = 0;
                this.avancarDialogo();

            } else if (this.interacaoMapa === true) {

                // Interação com mapa - exibir mapa de forma animada
                this.abrirMapa();
                this.musicaFundoBilheteria.destroy();
            }
        });
    }

    update() {
        super.update();

        // Calcula distância entre o jogador e o NPC
        let distanciaNpc = Phaser.Math.Distance.Between(this.jogador.x, this.jogador.y, this.npc.x, this.npc.y);

        // Calcula distância entre o jogador e o mapa
        let distanciaMapa = Phaser.Math.Distance.Between(this.jogador.x, this.jogador.y, this.map.x, this.map.y);
        
        // Interação NPC de acordo com proximidade
        if (distanciaNpc < this.largura * 0.15 && this.physics.world.isPaused === false) {

            this.iconeInteracao.setVisible(true);
            this.iconeInteracao.setPosition(this.npc.x + this.largura * 0.08, this.npc.y - this.altura * 0.15); 
            this.interacaoNpc = true;

        } 
        
        else {
            this.iconeInteracao.setVisible(false);
            this.interacaoNpc = false;
        }

        // Se o jogador está próximo do mapa e o jogo não está pausado, permitir interação
        if (distanciaMapa < this.largura * 0.25 && this.physics.world.isPaused === false) {
            this.iconeInteracaoMapa.setVisible(true);
            this.iconeInteracaoMapa.setPosition(this.map.x + this.largura * 0.08, this.map.y*0.75); 
            this.interacaoMapa = true;

        } else {

            this.iconeInteracaoMapa.setVisible(false);
            this.interacaoMapa = false;
        }

        // --- Visibilidade do Botão de Interação ---
        if (this.interacaoNpc === true || this.interacaoMapa) {
            this.btnInteracao.setVisible(true);
        } else {
            this.btnInteracao.setVisible(false);
        }
    }

    // --- MÉTODOS AUXILIARES ---

    // Função que constrói a interface da caixa de diálogo com retrato, nome do personagem e texto
    montarInterfaceDialogo() {

        let largura = this.scale.width;
        let altura = this.scale.height;
        let alturaCaixa = altura * 0.4;
        let margem = largura * 0.03;
        
        // Container que agrupa todos os elementos da caixa de diálogo
        this.caixaDialogo = this.add.container(0, 0).setDepth(999).setScrollFactor(0).setVisible(false);

        // Área clicável que ocupa toda a tela (invisível) para avançar o diálogo
        let retanguloAvancarDialogo = this.add.rectangle(largura/2, altura/2, largura, altura, 0x000000, 0).setInteractive();
        retanguloAvancarDialogo.on('pointerdown', () => this.avancarDialogo());

        this.retrato = this.add.sprite(largura * 0.9, altura - alturaCaixa - altura * 0.13, 'bilheteiro').setFlipX(true);

        // Animação de fala do bilheteiro (movimenta a boca)
        this.retrato.anims.create({
            key: 'falar',
            frames: this.anims.generateFrameNumbers('bilheteiro', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        })

        let graficoCaixaDialogo = this.add.graphics();
        graficoCaixaDialogo.fillStyle(0x002d42, 0.95);
        graficoCaixaDialogo.lineStyle(4, 0x00ffcc, 1);
        graficoCaixaDialogo.fillRoundedRect(margem, altura - alturaCaixa - margem, largura - (margem*2), alturaCaixa, 15);
        graficoCaixaDialogo.strokeRoundedRect(margem, altura - alturaCaixa - margem, largura - (margem*2), alturaCaixa, 15);

        // Fundo para o nome do personagem
        graficoCaixaDialogo.fillStyle(0x004d66, 1);
        graficoCaixaDialogo.fillRoundedRect(margem, altura - alturaCaixa - margem - altura * 0.04, largura * 0.2, altura * 0.06, 10);
        graficoCaixaDialogo.strokeRoundedRect(margem, altura - alturaCaixa - margem - altura * 0.04, largura * 0.2, altura * 0.06, 10);

        // Textos (guardados nas variáveis da classe)
        this.txtNome = this.add.text(margem + 20, altura - alturaCaixa - margem - 22, "", {
            fontSize: '28px', fontFamily: 'Pixel', fontStyle: 'bold', color: '#00ffcc'
        });

        // Fala do personagem com quebra de linha automática
        this.txtFala = this.add.text(margem + 40, altura - alturaCaixa, "", {
            fontSize: '48px', fontFamily: 'Pixel', color: '#ffffff',
            wordWrap: { width: largura - (margem*2) - largura * 0.2 }
        });
        
        // Adiciona todos os elementos ao container
        this.caixaDialogo.add([retanguloAvancarDialogo, this.retrato, graficoCaixaDialogo, this.txtNome, this.txtFala]);
    }

    // Função principal que controla o fluxo da conversa a cada clique
    avancarDialogo() {

        let largura = this.scale.width;
        let altura = this.scale.height;
        let alturaCaixa = altura * 0.26;

        // Pula para texto completo do diálogo
        if (this.estaEscrevendo) {
            this.eventoEscrita.remove();
            this.txtFala.setText(this.textoCompleto);
            this.estaEscrevendo = false;
            this.efeitoBip.stop();
            this.retrato.anims.stop();
            return
        }

        // Verifica se há mais diálogos para exibir ---
        if (this.indiceDialogo < this.listaAtual.length) {

            // Define o nome do personagem que está falando
            const dialogoAtual = this.listaAtual[this.indiceDialogo];
            this.txtNome.setText(dialogoAtual.nome);          
            
            // Quando o jogador fala (índice 3), exibe retrato do jogador
            if (this.indiceDialogo === 3) {

                this.retrato.setTexture(this.genero).setFlipX(true);
                this.retrato.setPosition(largura * 0.85, altura - alturaCaixa - altura * 0.2);
                this.retrato.setScale(this.largura / 180);

            } 
            
            else {

                this.retrato.setTexture('bilheteiro');   
                this.retrato.setPosition(largura * 0.95, altura - alturaCaixa - altura * 0.3);
                this.retrato.setScale(this.largura / 500);
                this.retrato.anims.play('falar');
                this.retrato.setFlipX(true);

            }

            // Inicia a animação de digitação do texto
            this.exibirTextoAnimado(dialogoAtual.texto);

            // Avança para o próximo diálogo
            this.indiceDialogo++;

        }

        // --- Quando todos os diálogos foram exibidos ---
        else {

            this.caixaDialogo.setVisible(false);

            // Retoma o jogo
            this.physics.resume();

            // Reativa os controles do jogador
            this.toggleControls(true);

            // Verifica se é a primeira vez que completou a conversa principal
            if (this.dialogoRealizado === false) {

                this.dialogoRealizado = true;
                this.contadorFalasBt = 0;

            } 
            
            else {

                this.contadorFalasBt++; 

            }
        }
    }


    // Função que cria o efeito de digitação do texto com som de efeito
    exibirTextoAnimado(texto) {

        // Se havia um evento de escrita anterior, cancela ele
        if (this.eventoEscrita) {
            this.eventoEscrita.remove();
        }

        this.estaEscrevendo = true;
        this.textoCompleto = texto;
        this.txtFala.setText("");
        
        let i = 0;

        // Cria um temporizador que adiciona uma letra por vez (efeito de digitação)
        this.eventoEscrita = this.time.addEvent({
            delay: 35,
            callback: () => {

                this.txtFala.text += texto[i];

                // Toca o som de efeito a cada 3 letras
                if (texto[i] !== " " && i % 3 == 0) {
                    this.efeitoBip.play();
                }

                i++;
                
                // Quando termina de digitar, finaliza a animação
                if (i === texto.length) {
                    this.estaEscrevendo = false;
                    this.efeitoBip.stop();
                    this.retrato.anims.stop();
                }

            },

            repeat: texto.length - 1
        });
    }
}

export default Bilheteria;