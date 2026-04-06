/*
TelaInicial.js - Cena de abertura do jogo, onde é apresentada a logo da produtora e o menu principal.
objetivo: Apresentar a produtora do game (Blue Marble Studios), a logo, o (a) personagem principal e o botão de iniciar o game. Gatilho de transição se dá pelo clique do botão btnPlay
*/

import BaseScene from "./base-scene.js";

class TelaInicial extends BaseScene { 
 
    constructor() {
        super('TelaInicial');
    }

    preload() { 
        this.load.image('fundoMenuImage', './assets/Cenario/tela-inicial.jpeg');
        this.load.image('btnIniciar', './assets/Botoes/botaoiniciar.png');
        this.load.image('btnConfiguracoes', './assets/Botoes/botaosettings.png');
        this.load.image('layoutConfig', './assets/Object/configs.png');
        this.load.image('btnFecharConfig', './assets/Botoes/botaofechar.png');
        this.load.image('logoStudio', './assets/Logos/studio.png');
        this.load.audio('trilhaFundoMenu', './assets/Sons/menustart.mp3');  
        this.load.audio('click', './assets/Sons/click.wav');  
        this.load.image('btnVolume', './assets/Botoes/volume.png');     
    }

    create() { 
        
        let largura = this.scale.width;
        let altura = this.scale.height;
        const centroX = this.cameras.main.centerX;
        const centroY = this.cameras.main.centerY;

        // ESTADO GLOBAL: Recupera o volume salvo no 'registry' da BaseScene para 
        // garantir que a preferência do usuário persista entre as transições de tela.
        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        this.musicaFundoMenu = this.sound.add('trilhaFundoMenu', {
            volume: volMusicaAtual,
            loop: true
        });

        this.musicaFundoMenu.play();

        this.registry.events.on('changedata-volMusica', (parent, novoVolume) => {
            // Se a música existir e estiver tocando, atualiza o volume em tempo real
            if (this.musicaFundoMenu) {
                this.musicaFundoMenu.setVolume(novoVolume);
            }
        });

        // Configurações da logo da produtora
        this.studio = this.add.image(centroX, centroY, 'logoStudio');
        this.studio.setDisplaySize(largura, altura);
        this.studio.setDepth(100);
        this.studio.setVisible(false); 

        // Chama a função de transição entre telas na cena inicial
        this.iniciarIntroducao();  

        this.fundoMenuImage = this.add.image(largura / 2, altura / 2, 'fundoMenuImage');
        this.fundoMenuImage.setDisplaySize(largura, altura);
        
        this.btnIniciar = this.add.image(largura * 0.5, altura * 0.7, 'btnIniciar').setScale(0.2);
        this.btnConfig = this.add.image(largura * 0.95, altura * 0.085, 'btnConfiguracoes').setScale(0.1);

        this.btnIniciar.setInteractive();
        this.btnConfig.setInteractive();

        this.btnIniciar.on('pointerdown', () => {

            this.btnIniciar.disableInteractive();
            this.musicaFundoMenu.destroy();

            // FEEDBACK VISUAL (UX): Cria uma leve animação de pulso no botão para 
            // confirmar o clique do usuário antes de travar a tela e iniciar o fadeOut.
            this.tweens.add({
                targets: this.btnIniciar,
                scale: 0.28,
                duration: 100,
                yoyo: true,
                ease: 'Power2',
                onComplete: () => { 
                    this.cameras.main.fadeOut(1500, 0, 0, 0);
                 }
            });


            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });

            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('SelecaoPersonagem'); 
            });
        });

        this.btnConfig.on('pointerdown', () => {  

            this.btnConfig.disableInteractive();
            
            this.tweens.add({
                targets: this.btnConfig,
                scale: 0.15,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });

            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });

            this.chamarConfigs();
        });

        this.menuPrincipal = this.add.container(0, 0);

        // Adiciona todos os elementos do menu dentro da caixa de uma vez só:
        this.menuPrincipal.add([this.fundoMenuImage, this.btnIniciar, this.btnConfig]);

        this.menuPrincipal.setVisible(true);
    }

    update() {
        
    }

    // SEQUÊNCIA DE ABERTURA: Controla os tempos de fade in/out da logo da produtora 
    // (Splash Screen) para criar uma transição suave antes de revelar o menu principal.
    iniciarIntroducao(){
        this.cameras.main.fadeIn(3000, 0, 0, 0);
        this.studio.setVisible(true);

        this.cameras.main.once('camerafadeincomplete', () => {

            this.cameras.main.fadeOut(2000, 0, 0, 0);
        
            this.time.delayedCall(2000, () => {
                    this.cameras.main.fadeIn(2000, 0, 0, 0);
                    this.studio.setVisible(false);
                    this.menuPrincipal.setVisible(true);
            }, [], this); 

        });
    }   
}

export default TelaInicial;

