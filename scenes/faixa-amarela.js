/*
Faixa-amarela.js - Segundo minigame do jogo da Fase de segurança
Objetivo:O objetivo do minigame é fazer com que o jogador posicione corretamente os NPCs atrás da faixa amarela, respeitando a área de segurança da plataforma. 
Para isso, o jogador deve arrastar os personagens até a linha limite dentro do tempo disponível, garantindo que todos fiquem em uma posição segura antes da chegada do trem.
*/

import BaseScene from "./base-scene.js";

class FaixaAmarela extends BaseScene {

    constructor() {
        super('faixaAmarela');
        this.instrucoes = "Mantenha as pessoas atrás da faixa amarela!\n\nArraste os NPCS para cima\npara deixá-los seguros.";

    }

    preload() {
        super.preload();

        this.load.image('faixaAmarela', './assets/Cenario/faixaamarela.png');

        this.load.image('metro', './assets/Object/trem-inicial.png');

        this.load.image('figurante', './assets/Npc/figurante.png');
        this.load.image('figurante2', './assets/Npc/figurante2.png');
        this.load.image('figurante3', './assets/Npc/figurante3.png');
        this.load.image('figurante4', './assets/Npc/figurante4.png');
        this.load.image('figurante5', './assets/Npc/figurante5.png');
        this.load.image('figurante6', './assets/Npc/figurante6.png');
        this.load.image('figurante7', './assets/Npc/figurante7.png');
        this.load.image('figurante8', './assets/Npc/figurante8.png');
        this.load.image('figurante9', './assets/Npc/figurante9.png');
        this.load.image('figurante10', './assets/Npc/figurante10.png');
        this.load.image('temporizador', './assets/Object/timeBarMetro.png');

        this.load.audio('trilhaFundoFaixaAmarela', './assets/Sons/faixamarela.mp3'); 
        this.load.audio('click', './assets/Sons/click.wav');   

    }

    create() {

        super.create();

        let largura = this.scale.width;
        let altura = this.scale.height;

        this.criarTutorial();

        const centroX = this.cameras.main.centerX;
        const centroY = this.cameras.main.centerY;

        this.btnAbrirTutorial.setOrigin(largura*0.0004,altura*0.0002);

        this.jogoAtivo = false;

        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        this.musicaFundoFaixaAmarela = this.sound.add('trilhaFundoFaixaAmarela', {
            volume: volMusicaAtual,
            loop: true
        });

        this.musicaFundoFaixaAmarela.play();

        this.faixa = this.add.image(centroX, centroY, 'faixaAmarela')
            .setScale(0.67)
            .setDepth(0);

        const alturaDaFaixa = centroY*1.458;
        this.faixaAmarelaB = this.add.rectangle(centroX, alturaDaFaixa, largura * 3, altura * 0.084, 0x00ff00, 0);
        this.physics.add.existing(this.faixaAmarelaB);
        this.faixaAmarelaB.body.setAllowGravity(false);
        this.chao.destroy();

        // Trem que aparece ao fim do minigame para embarcar os NPCs
        this.metro = this.add.image(-500, this.altura * 0.70, 'metro')
            .setScale(0.2)
            .setDepth(5);

        this.metroChegou = false;

        this.linhaLimite = this.altura * 0.35;
        this.limiteArrasto = this.altura * 0.28;

        // Desativa controles herdados da BaseScene para evitar que o jogador se movimente durante o minigame
        this.toggleControls(false);

        // Remove o jogador herdado da BaseScene, pois este minigame não utiliza personagem controlável
        if (this.jogador) {
            this.jogador.destroy();
        }

        // Configurações do temporizador regressivo: o jogador deve posicionar todos os NPCs antes do tempo acabar
        this.tempoTotal = 40;
        this.tempo = 40;

        this.larguraBarra = 270;

        this.barraVerde = this.add.rectangle(
            this.largura*0.088,
            this.altura*0.079,
            this.larguraBarra,
            48,
            0x08c108
        ).setDepth(100);
        this.barraVerde.setOrigin(0, 0.5);

        this.temporizador = this.add.image(this.largura*0.17, this.altura*0.075, "temporizador").setScale(3).setDepth(101);

        this.contadorTempo =this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.jogoAtivo) return;

                this.tempo--;
                
                if (this.tempo <= 0) {
                    this.mostrarGameOver();
                }
            },
            loop: true
        });

        // NPCs - figurantes que o jogador deve arrastar para trás da faixa amarela
        this.npc1 = this.physics.add.sprite(this.largura * 0.05, this.altura * 0.68, 'figurante').setScale(0.75);
        this.npc2 = this.physics.add.sprite(this.largura * 0.15, this.altura * 0.65, 'figurante2').setScale(0.75);
        this.npc3 = this.physics.add.sprite(this.largura * 0.25, this.altura * 0.70, 'figurante3').setScale(0.75);
        this.npc4 = this.physics.add.sprite(this.largura * 0.35, this.altura * 0.60, 'figurante4').setScale(0.75);
        this.npc5 = this.physics.add.sprite(this.largura * 0.45, this.altura * 0.63, 'figurante5').setScale(0.75);
        this.npc6 = this.physics.add.sprite(this.largura * 0.55, this.altura * 0.69, 'figurante6').setScale(0.75);
        this.npc7 = this.physics.add.sprite(this.largura * 0.65, this.altura * 0.62, 'figurante7').setScale(0.75);
        this.npc8 = this.physics.add.sprite(this.largura * 0.75, this.altura * 0.70, 'figurante8').setScale(0.75);
        this.npc9 = this.physics.add.sprite(this.largura * 0.85, this.altura * 0.58, 'figurante9').setScale(0.75);
        this.npc10 = this.physics.add.sprite(this.largura * 0.95, this.altura * 0.69, 'figurante10').setScale(0.75);


        this.npcs = [
            this.npc1, this.npc2, this.npc3, this.npc4, this.npc5,
            this.npc6, this.npc7, this.npc8, this.npc9, this.npc10];


        this.npcs.forEach(npc => {

            npc.body.setAllowGravity(false);

            // Ajuste da hitbox para melhor alinhamento com o sprite do NPC
            npc.body.setSize(118, 282); 
            
            // Centralizando a hitbox no desenho (ajuste os valores se ela ficar torta)
            npc.body.setOffset(0, 0);

            // Permite que o NPC seja arrastado
            npc.setInteractive({ draggable: true });
            this.input.setDraggable(npc);

            npc.travado = false;
            npc.posicaoOriginal = npc.y;
            npc.tentativasDeVoltar = 1;
            npc.podeArrastar = true;  // controla se pode arrastar ou não

        });


        // Evento de arrastar os NPCs
        this.input.on('drag', (pointer, npcArrastado, posXArrastadoAmarela, posYArrastadoAmarela) => {

            if (this.pausaFundo || !npcArrastado.podeArrastar) {
                return;
            }

            npcArrastado.x = npcArrastado.x;

            if (posYArrastadoAmarela < npcArrastado.y) {

                npcArrastado.y = Phaser.Math.Clamp(
                    posYArrastadoAmarela,
                    this.limiteArrasto,
                    this.altura
                );
            }
        });

        this.input.on('dragend', (pointer, npcArrastado) => {

            if (npcArrastado.travado || !npcArrastado.podeArrastar) return;

            // Pega a posição do pé do NPC (borda inferior da hitbox)
            let peDoNPC = npcArrastado.body.bottom;

            // Verifica se o pé do NPC está acima da borda de cima da faixa
            if (peDoNPC <= this.faixaAmarelaB.body.top) {

                npcArrastado.podeArrastar = false;

                if (npcArrastado.tentativasDeVoltar > 0) {

                    npcArrastado.tentativasDeVoltar--;

                    this.time.delayedCall(500, () => {

                        this.tweens.add({
                            targets: npcArrastado,
                            y: npcArrastado.posicaoOriginal,
                            duration: 300,
                            onComplete: () => {
                                npcArrastado.podeArrastar = true;
                            }
                        });

                    });

                } else {

                    npcArrastado.travado = true;
                    npcArrastado.disableInteractive();
                    this.verificarVitoria();

                }
            }

            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });
        });

    }

    npcsInteracao(ativo) {
                this.npcs.forEach(npc => {
                    npc.podeArrastar = ativo;

                    if (ativo) {
                        npc.setInteractive({ draggable: true});
                        this.input.setDraggable(npc);
                    } else {
                        npc.disableInteractive();
                    }
                });
            }

    update() {
        if (!this.jogoAtivo) return;

        // Calculando tamanho da barra de tempo
        let porcentagem = this.tempo / this.tempoTotal;
        
        if (porcentagem < 0) porcentagem = 0;

        if (!this.metroChegou){
            this.barraVerde.scaleX = porcentagem;
        } 
        
        // --- Mudando a cor da barra de tempo ---
        if (porcentagem > 0.5) {
            // Acima de 50%: Verde
            this.barraVerde.setFillStyle(0x08c108); 
        } else if (porcentagem > 0.2) {
            // Entre 50% e 20%: Amarelo
            this.barraVerde.setFillStyle(0xffd700); 
        } else {
            // Abaixo de 20%: Vermelho
            this.barraVerde.setFillStyle(0xff0000); 
        }
    }

    // Método para verificar se o jogador venceu o minigame 
    verificarVitoria() {

        let todosNpcsTravados = true;

        this.npcs.forEach(npc => {

            if (!npc.travado) {
                todosNpcsTravados = false;
            }

        });

        if (todosNpcsTravados && !this.metroChegou) {

            this.metroChegou = true;
            this.contadorTempo.remove();
            this.chamarMetro();
        }
    }

    // Método para iniciar a transição para a próxima fase
    chamarMetro() {
        this.tweens.add({
            targets: this.metro,
            x: this.largura * 0.5,
            duration: 4000,
            ease: 'Linear',
            onComplete: () => {
                this.embarcarNPCs();
            }

        });
    }

    // Método para embarcar os NPCs no metrô e iniciar a transição para a próxima fase
    embarcarNPCs() {
        this.npcs.forEach((npc, index) => {

            

            this.tweens.add({
                targets: npc,
                x: this.metro.x,
                y: this.metro.y,
                alpha: 0,
                delay: index * 200,
                duration: 800,
                onComplete: () => {
                    npc.destroy();
                }

            });

        });

        this.time.delayedCall(2000, () => {

            this.metroPartir();

        });

    }
    
    // Método para fazer o trem partir e iniciar a próxima fase
    metroPartir() {

        this.tweens.add({

            targets: this.metro,
            x: this.largura + 500,
            duration: 4500,
            ease: 'Linear',

            onComplete: () => {
                
                this.registry.set('desbloquearBadgeSeg', true);
                this.conquistaBadge();
                this.btnAbrirTutorial.setVisible(false);
                this.musicaFundoFaixaAmarela.destroy();
                this.temporizador.setVisible(false);
                this.barraVerde.setVisible(false);

            }

        });

    }

    mostrarGameOver() {
        if (!this.jogoAtivo) return;
        this.jogoAtivo = false;

        if (this.physics.world) this.physics.pause();

        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.7
        ).setDepth(5000).setScrollFactor(0);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'TEMPO ESGOTADO!', {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(5001).setScrollFactor(0);

        const btnTentarNovamente = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2 + 50,
            300,
            60,
            0xffd700
        ).setDepth(5001).setScrollFactor(0).setInteractive();

        this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, 'TENTAR NOVAMENTE', {
            fontSize: '24px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(5002).setScrollFactor(0);

        btnTentarNovamente.on('pointerover', () => btnTentarNovamente.setFillStyle(0xffffff));
        btnTentarNovamente.on('pointerout', () => btnTentarNovamente.setFillStyle(0xffd700));
        btnTentarNovamente.on('pointerdown', () => { 
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual }); 
            this.musicaFundoFaixaAmarela.destroy();
            this.scene.restart()});
    }
}

export default FaixaAmarela;