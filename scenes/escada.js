/*
Escada.js - Primeiro minigame do jogo da Fase de segurança
Objetivo: O objetivo do minigame é fazer com que o agente consiga descer a escada rolante sem obstáculos, mantendo a faixa esquerda livre, como é a regra de circulação no metrô. 
Para isso, o jogador deve organizar os NPCs, movendo-os para o lado direito da escada dentro do tempo limite, garantindo a passagem segura do agente.
*/
import BaseScene from './base-scene.js';

class Escada extends BaseScene {

    constructor() {
        super('Escada');
        this.instrucoes = "Mantenha o lado esquerdo livre!\n\nArraste os NPCS para a direita\npara liberar o caminho.";
    }

    preload() {

        super.preload();

        // imagem do cenário
        this.load.spritesheet('escada', './assets/Cenario/escadaRolante-sheet.png', {frameWidth: 1280, frameHeight: 640});

        // NPCs - Figurantes
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

        this.load.audio('trilhaFundoEscada', './assets/Sons/escadarolantee.mp3');  
        this.load.audio('click', './assets/Sons/click.wav');   

    }

    create() {

        super.create();

        this.largura = this.scale.width;
        this.altura = this.scale.height;
        
        this.criarTutorial();
        this.pausaFundo = true;
        
        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        this.musicaFundoEscada = this.sound.add('trilhaFundoEscada', {
            volume: volMusicaAtual,
            loop: true
        });

        this.musicaFundoEscada.play();

        const centroX = this.cameras.main.centerX;
        const centroY = this.cameras.main.centerY;

        this.alturaDegrau = 150

       // Posição da barra dentro do medidor de tempo
        const posicaoXBarraTexto = this.largura * 0.088;
        const posicaoYPenalidade = this.altura * 0.77;

        // Altura total da barra
        this.alturaBarra = 380;

        // Barra vertical de tempo: encolhe de baixo para cima conforme o tempo avança
        this.barraVerde = this.add.rectangle(
            posicaoXBarraTexto,
            posicaoYPenalidade,
            55,
            this.alturaBarra,
            0x08c108
        ).setDepth(100);

        // Define a origem da barra para que ela cresça e diminua a partir da base
        this.barraVerde.setOrigin(0.5, 1);

        this.tempoTotal = 28000;

        this.tempoAtual = 0;

        this.escada = this.add.sprite(centroX, centroY,'escada')
        .setDepth(0);
        this.escada.setDisplaySize(this.largura, this.altura);

        this.escadaMovendo = this.anims.create({
            key: 'escadaMovendo',
            frames: this.anims.generateFrameNumbers('escada', { start: 0, end: 7 }),
            frameRate: 6,
            repeat: -1
        });

        // CONFIGURAÇÕES DO JOGO

        this.velocidadeEscada = 1;
        this.velocidadeAgente = 2.0;
        
        this.linhaLimite = this.altura + 100;

        // lista onde guardamos todos NPCs
        this.npcs = [];

        // contadores para controlar spawn
        this.contadorEsquerda = 0;
        this.ciclos = 0;
        this.npcsCriadosAntesAgente = 0;
        this.totalNpcsAntesAgente = 13;
        this.jogoAtivo = false;

        // controle do agente
        this.agenteApareceu = false;

        // esconde o personagem padrão da BaseScene
        if (this.jogador) {
            this.jogador.setVisible(false);
        }

        // desativa joystick
        this.toggleControls(false);

        this.agente = this.physics.add.sprite(this.largura * 0.38, -120, this.chaveSpriteFrente)
            .setScale(6); // Remoção depth fixo

        this.agente.body.setAllowGravity(false);

        // agente começa invisível
        this.agente.setVisible(false);   

        // Timer para detectar se o agente ficou parado demais (falha)
        this.tempoParado = 0;  // Contador em segundos
        this.limiteParado = 3;  // Tempo limite antes de reiniciar (ajuste conforme necessário)

        // SISTEMA DE ARRASTAR NPC
        this.input.on('drag', (pointer, gameObject, posXArrastadoEscada, posYArrastadoEscada) => {

            if (gameObject.travado) return;

            gameObject.x = Phaser.Math.Clamp(posXArrastadoEscada, this.largura * 0.35, this.largura * 0.63);

        });

        this.input.on('dragend', (pointer, gameObject) => {
            
            if (gameObject.jaPontuou) return;

            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });

            if (gameObject.x > this.largura * 0.5) {
                
                gameObject.jaPontuou = true;

                this.tempoAtual -= 1000;

                if (this.tempoAtual < 0) {
                    this.tempoAtual = 0;
                }

                const estiloTextoBonus = { 
                    fontFamily: 'Pixel', 
                    fontSize: '32px', 
                    fill: '#00ff00', 
                    align: 'center',
                    stroke: '#000000', 
                    strokeThickness: 4,
                    fontWeight: 'bold'
                };

                let textoBonus = this.add.text(posicaoXBarraTexto, posicaoYPenalidade*0.4, '+1s', estiloTextoBonus);
                textoBonus.setOrigin(0.5).setDepth(2000); 

                this.tweens.add({
                    targets: textoBonus, 
                    y: gameObject.y - 10,     
                    alpha: 0,                 
                    duration: 1000,       
                    ease: 'Cubic.easeOut', 
                    onComplete: () => {
                        textoBonus.destroy(); 
                    }
                });
                this.input.setDraggable(gameObject, false);
            }
        });    

        // SPAWN CONTÍNUO DE NPC
        this.pixelsPorFrameY = 14; 

        // Escuta cada mudança de frame da escada
        this.escada.on('animationupdate', (animacao, frame) => {
            
            // 1. Move todo mundo
            if (this.jogoAtivo) {
                this.moverPersonagensComEscada();
            }

            if ((frame.index === 1 || frame.index === 3 || frame.index === 5 || frame.index === 7) && this.jogoAtivo) {
                this.spawnNpcTopo();
            }
        });
        this.btnFecharTutorial.on('pointerdown', () => {
            this.escada.play('escadaMovendo');
        })
    }

    update(time, delta) {
        if (!this.jogoAtivo ||  this.pausaFundo){ 
            if (this.escada.anims.isPlaying) this.escada.anims.pause();
            return;
        }

        super.update();

        // ATUALIZA TEMPORIZADOR DA BARRA

        if (!this.agenteApareceu) {
            this.tempoAtual += delta;
        }

        let porcentagem = 1 - (this.tempoAtual / this.tempoTotal);

        if(porcentagem < 0) {
            porcentagem = 0;
        }

        // barra diminui suavemente
        this.barraVerde.scaleY = porcentagem;

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

        // SE O TEMPO ACABAR → REINICIA A FASE
        if (this.tempoAtual >= this.tempoTotal){
            this.mostrarGameOver();
        }
        
        if (this.pausaFundo) {
            this.escada.anims.pause();
        } else {
            this.escada.anims.resume();
        }
       
    }
    
    // Exibe a tela de game over, pausa a física e oferece opção de reinício
    mostrarGameOver() {
        if (!this.jogoAtivo) return;
        this.jogoAtivo = false;

        if (this.physics.world) this.physics.pause();
        if (this.escada && this.escada.anims) this.escada.anims.pause();

        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.7
        ).setDepth(5000).setScrollFactor(0);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'VOCE FALHOU!', {
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
        btnTentarNovamente.on('pointerdown', () =>  { 
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual }); 
            this.musicaFundoEscada.destroy();
            this.scene.restart()
        });
    }

    moverPersonagensComEscada() {

        for (let i = this.npcs.length - 1; i >= 0; i--) {
            let npc = this.npcs[i];

            if (!npc.travado) {
                npc.y += this.pixelsPorFrameY; 
            }

            // Garante que os NPCs fiquem SEMPRE na frente da escada (Depth positivo alto)
            npc.setDepth(1000 + npc.y);

            // Se NPC da esquerda chegar no final → jogador perde tempo 
            if (npc.y > this.linhaLimite && npc.x < this.largura * 0.5) {
                const posicaoXBarraTexto = this.largura * 0.088;
                const posicaoYPenalidade = this.altura * 0.2;
                this.tempoAtual += 2000; 
                this.barraVerde.setFillStyle(0xff0000);
                this.time.delayedCall(200, () => {
                    if (this.barraVerde) this.barraVerde.setFillStyle(0x08c108);
                });
                const estiloTexto = { fontFamily: 'Pixel', fontSize: '32px', fill: '#ff0000', align: 'center', stroke: '#000000', strokeThickness: 4, fontWeight: 'bold' };
                let textoPontos = this.add.text(posicaoXBarraTexto, posicaoYPenalidade, '-2s', estiloTexto).setOrigin(0.5).setDepth(2000); 
                this.tweens.add({ targets: textoPontos, y: posicaoYPenalidade - 100, alpha: 0, duration: 1200, ease: 'Cubic.easeOut', onComplete: () => { textoPontos.destroy(); }});
            }

            // Remove NPCs que passaram da linha
            if (npc.y > this.linhaLimite) {
                npc.destroy();
                // Iteração reversa garante que o splice não altere os índices dos elementos ainda não processados
                this.npcs.splice(i, 1);
            }
        }

        if (this.agenteApareceu) {
            
            let npcNaFrente = false;

            for (let npc of this.npcs) {
                if (npc.x < this.largura * 0.5) {
                    if (npc.y > this.agente.y && npc.y - this.agente.y < 200) {
                        npcNaFrente = true;
                        break;
                    }
                }
            }

            if (npcNaFrente) {
                this.framesParado = (this.framesParado || 0) + 1; 
                if (this.framesParado > 12) { // 24 frames = aprox 3 segundos se a escada rodar a 8fps
                    this.mostrarGameOver();
                }
            } else {
                // Caminho livre → agente desce mais rapido que os NPCs
                this.agente.y += this.pixelsPorFrameY * this.velocidadeAgente;
                this.framesParado = 0;
            }

            this.agente.setDepth(1000);

            if (this.agente.y > this.altura + 100) {
                this.jogoAtivo = false;
                this.time.delayedCall(300, () => {
                    this.musicaFundoEscada.destroy();
                    this.scene.start('faixaAmarela');
                });
            }
        }
    }

    // Método para verificar se o topo da escada está livre para spawnar um novo NPC
    espacoLivreTopo() {
        for (let npc of this.npcs) {
            // Quanto mais proximo de zero esse limite, maior a distancia vertical
            // exigida antes de outro NPC nascer no topo.
            if (npc.y < -40) {
                return false;
            }
        }
        return true;
    }

    // Método para spawnar um NPC no topo da escada
    spawnNpcTopo() {

        if (!this.espacoLivreTopo()) return;

        const listaSpritesNpc = [
            'figurante',
            'figurante2',
            'figurante3',
            'figurante4',
            'figurante5',
            'figurante6',
            'figurante7',
            'figurante8',
            'figurante9',
            'figurante10',
        ];

        const spritesAtivos = this.npcs
            .filter(npc => npc && npc.active)
            .map(npc => npc.texture.key);

        let spritesDisponiveis = listaSpritesNpc.filter(sprite => !spritesAtivos.includes(sprite));
        if (spritesDisponiveis.length === 0) {
            spritesDisponiveis = listaSpritesNpc;
        }

        const spriteEscolhido = Phaser.Utils.Array.GetRandom(spritesDisponiveis);

        let x;

        // Contador de Ciclos e spawn do agente
        if (this.agenteApareceu) {
            
            x = this.largura * 0.60 + Phaser.Math.Between(-20, 20);
            
        } else {
            if (this.contadorEsquerda < 4) {

                x = this.largura * 0.40 + Phaser.Math.Between(-20, 20);
                this.contadorEsquerda++;

            } else {

                x = this.largura * 0.60 + Phaser.Math.Between(-20, 20);
                this.contadorEsquerda = 0;
                this.ciclos++;

            }
        }

        // POSIÇÃO INICIAL: nasce acima da tela para entrar descendo pela escada.
        let yInicial = -150;

        // ALINHA O NPC COM O DEGRAU sem puxar o spawn de volta para dentro da tela.
        yInicial = Math.round(yInicial / this.alturaDegrau) * this.alturaDegrau;

        let npc = this.physics.add.sprite(x, yInicial, spriteEscolhido).setScale(1.2);

        npc.body.setAllowGravity(false);

        npc.setInteractive({ draggable: true });

        this.input.setDraggable(npc);

        npc.travado = false;

        this.npcs.push(npc);

        if (!this.agenteApareceu) {
            this.npcsCriadosAntesAgente++;

            if (this.npcsCriadosAntesAgente >= this.totalNpcsAntesAgente) {
                this.spawnAgente();
            }
        }

    }
    
    // ATIVA O AGENTE

    spawnAgente() {

        this.agente.setVisible(true);

        this.agente.y = 0;

        this.agenteApareceu = true;

    }

}

export default Escada;