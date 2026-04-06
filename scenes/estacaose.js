/*
EstacaoSe.js - Cena de transição após o minigame de Cidadania. Objetivo: Animar a chegada do jogador à Estação da Sé, exibir o mapa de progresso e permitir 
o embarque no metrô rumo ao minigame de Comércio Ilegal.
*/


import BaseScene from './base-scene.js';

class EstacaoSe extends BaseScene {

    constructor() {
        super('EstacaoSe');
    }

    preload() {

        super.preload();

        this.load.image('estacaoLuz', './assets/Cenario/estacaoluz.png');
        this.load.image('interacao', './assets/Botoes/interact.png');
        this.load.image('mapa', './assets/Cenario/mapa.png');
        this.load.image('tremTrilho', './assets/Object/trem-inicial.png');
        this.load.image('tremMapa', './assets/Object/trem-mapa.png');

        this.load.audio('trilhaFundoSe', './assets/Sons/bilheteriaEtransicoes.mp3');  
        this.load.audio('click', './assets/Sons/click.wav');     

    }

    create() {
        super.create();
        
        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        this.musicaFundoSe = this.sound.add('trilhaFundoSe', {
            volume: volMusicaAtual,
            loop: true
        });

        this.musicaFundoSe.play();

        this.toggleControls(false);
        this.prepararAnimacaoProgressoMapa(1, 2);

        this.registry.set('desbloquearLuz', false);
        this.registry.set('desbloquearSe', false);
        this.registry.set('desbloquearLiberdade', true);

        this.montarInterfaceMapa();

        this.cameras.main.fadeIn(1500, 0, 0, 0);

        let largura = this.scale.width;
        let altura = this.scale.height;

        const centroX = this.cameras.main.centerX;
        const centroY = this.cameras.main.centerY;

        this.fundoEstacaoLuz = this.add.image(centroX, centroY, 'estacaoLuz')
            .setDepth(0);
        this.fundoEstacaoLuz.setDisplaySize(largura, altura);

        this.jogador.setPosition(
            this.largura * 0.10,
            this.altura * 0.45
        );

        this.jogador.anims.play('andar', true);

        this.tweens.add({
            targets: this.jogador,
            x: this.largura * 0.65,
            duration: 3000,
            ease: 'Linear',
            onComplete: () => {
                this.jogador.anims.play('parado', false);
            }
        });

        this.jogador.body.setAllowGravity(false);

        this.mapa = this.add.image(
            this.largura * 0.75,
            this.altura * 0.45,
            'mapa'
        ).setScale(this.largura / 10000).setVisible(false);

        this.mapa.setDepth(1);

        this.iconeInteracaoMapa = this.add.image(0, 40, 'interacao')
            .setVisible(false)
            .setScale(this.largura / 1600)
            .setDepth(60);

        this.btnPassarFaseTres.removeAllListeners('pointerdown');

        this.btnPassarFaseTres.on('pointerdown', () => {
            this.viajarNoMapa(3, () => {
                let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
                this.sound.play('click', { volume: volEfeitosAtual });
                this.chamarMetro();
            });
        });

        this.btnInteracao.on('pointerdown', () => {
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });

            if (this.interacaoMapa) {
                this.abrirMapa();
                this.containerMapa.setDepth(1000);
            }
        });

    }

    update() {

        // distancia jogador do mapa
        var distanciaMapa = Phaser.Math.Distance.Between(
            this.jogador.x,
            this.jogador.y,
            this.mapa.x,
            this.mapa.y
        );

        if (distanciaMapa < this.largura * 0.20 && this.physics.world.isPaused === false) {
            this.iconeInteracaoMapa.setVisible(true);
            this.iconeInteracaoMapa.setPosition(
                this.mapa.x + this.largura * 0.08,
                this.mapa.y - 220
            );
            this.interacaoMapa = true;
        }
        else {
            this.iconeInteracaoMapa.setVisible(false);
            this.interacaoMapa = false;
        }
        if (this.interacaoMapa) {
            this.btnInteracao.setVisible(true);
        }
        else {
            this.btnInteracao.setVisible(false);
        }

    }

    // Metodo para jogar o trem e fazer a transição para a próxima fase
    chamarMetro() {
        this.toggleControls(false);
        this.btnInteracao.destroy();
        this.iconeInteracaoMapa.destroy();
        this.metro = this.add.image(
            -500,
            this.altura * 0.6,
            'tremTrilho'
        ).setScale(0.25).setDepth(1000);

        this.tweens.add({
            targets: this.metro,
            x: this.largura * 0.45,
            duration: 4000,
            ease: "Linear",
            onComplete: () => {
                this.personagemEntrarMetro();
            }
        });

    }

    personagemEntrarMetro() {
        this.jogador.anims.play('andar', true);
        this.tweens.add({
            targets: this.jogador,
            y: this.metro.y * 1.2,
            alpha: 0,
            duration: 2000,
            ease: "Linear",
            onComplete: () => {
                this.jogador.anims.play('parado', true);
                this.jogador.setVisible(false);

                this.time.delayedCall(500, () => {
                    this.metroPartir();
                });
            }
        });

    }
    // Metodo para fazer o trem partir e iniciar a próxima fase
    metroPartir() {
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.musicaFundoSe.destroy();
        this.tweens.add({
            targets: this.metro,
            x: this.largura + 500,
            duration: 4500,
            ease: "Linear",
            onComplete: () => {
                this.scene.start("ComercioIlegal");
            }
        });

    }

}

export default EstacaoSe;
