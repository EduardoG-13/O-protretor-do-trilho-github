/*
BaseScene centraliza os recursos compartilhados entre todas as cenas do jogo: criação e controle do jogador, interface e animações do mapa do metrô, sistema de tutorial, 
configurações de áudio e exibição de badges de conquista.
*/

class BaseScene extends Phaser.Scene {
    constructor(key) {
        super({ key });
    }

    preload() {
        const joystickUrl = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';

        this.load.image('btnFecharMapa', './assets/Botoes/botaofechar.png');
        this.load.plugin('rexvirtualjoystickplugin', joystickUrl, true);

        this.load.spritesheet('jogador feminino', './assets/Player/persoFem.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('jogador masculino', './assets/Player/persoMasc.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('btnVolume', './assets/Botoes/volume.png');
        this.load.image('jogador masculino frente', './assets/Player/agenteFrente.png');
        this.load.image('jogador feminino frente', './assets/Player/agenteFrenteM.png');
        this.load.image('btnInteracao', './assets/Botoes/btn_interacao.png');
        this.load.image('cadeado', './assets/Object/cadeado.png');
        this.load.image('badgeSeg', './assets/Conquistas/conquistaBadgeSeg.png');
        this.load.image('badgeCid', './assets/Conquistas/conquistaBadgeCid.png');
        this.load.image('badgeOrd', './assets/Conquistas/conquistaBadgeOrd.png');
        this.load.image('badgeCon', './assets/Conquistas/connquistaBadgeCon.png');
        this.load.image('btnTutorial', './assets/Botoes/btnTutorial.png');
        this.load.image('checkFase', './assets/Object/check.png');
        this.load.image('layoutConfig', './assets/Object/configs.png');
        this.load.image('btnFecharConfig', './assets/Botoes/botaofechar.png');
        this.load.audio('click', './assets/Sons/click.wav');      
        this.load.audio('conquista', './assets/Sons/conqusitabadgesound.mp3'); 
                
    }

    create() {
        this.nomeAgente;
        this.itensDesbloqueados = [];

        this.largura = this.scale.width;
        this.altura = this.scale.height;

        const centroX = this.cameras.main.centerX;
        const centroY = this.cameras.main.centerY;
        const alturaDoChao = centroY * 1.6;

        // O "chao" e invisivel: ele serve so como base fisica para o jogador nas cenas de estacao.
        this.chao = this.add.rectangle(centroX, alturaDoChao, this.largura * 3, this.altura * 0.08, 0x00ff00, 0);
        this.physics.add.existing(this.chao, true);

        const escolha = this.registry.get('char_selection');
        this.genero = (escolha === 1) ? 'jogador masculino' : 'jogador feminino';
        this.chaveSpriteFrente = this.genero + ' frente';

        // O sprite do personagem e montado aqui uma vez; as cenas filhas so reposicionam ou escondem.
        this.jogador = this.physics.add.sprite(this.largura * 0.1, this.altura * 0.31, this.genero).setScale(4);
        this.jogador.setDepth(20);
        this.jogador.setCollideWorldBounds(true);
        this.physics.add.collider(this.jogador, this.chao);

        this.anims.create({
            key: 'andar',
            frames: this.anims.generateFrameNumbers(this.genero, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'parado',
            frames: this.anims.generateFrameNumbers(this.genero, { start: 2, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // O plugin externo vira um conjunto de cursorKeys para o restante do codigo tratar como seta normal.
        this.controleVirtual = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: this.largura * 0.1,
            y: this.altura * 0.77,
            radius: this.largura * 0.06,
            base: this.add.circle(0, 0, this.largura * 0.05, 0x888888).setAlpha(0.5).setDepth(50),
            thumb: this.add.circle(0, 0, this.largura * 0.025, 0xcccccc).setAlpha(0.8).setDepth(51),
        });

        this.cursorKeys = this.controleVirtual.createCursorKeys();
        this.estaInteragindo = false;

        this.btnInteracao = this.add.image(this.largura * 0.87, this.altura * 0.8, 'btnInteracao')
            .setScale(this.largura / 6500)
            .setVisible(false)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(50);

        this.btnFecharMapa = this.add.image(this.largura * 0.85, this.altura * 0.15, 'btnFecharMapa')
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(101)
            .setVisible(false)
            .setScale(this.largura / 8500);

        // Os botoes do mapa sao areas invisiveis sobre a imagem do metro.
        this.btnPassarFaseUm = this.add.rectangle(
            this.largura * 0.315,
            this.altura * 0.331,
            this.largura * 0.063,
            this.altura * 0.107,
            0x000000,
            0.5
        ).setInteractive().setDepth(100).setScrollFactor(0).setVisible(false);

        this.btnPassarFaseDois = this.add.rectangle(
            this.largura * 0.448,
            this.altura * 0.335,
            this.largura * 0.064,
            this.altura * 0.105,
            0x000000,
            0.5
        ).setInteractive().setDepth(100).setScrollFactor(0).setVisible(false);

        this.btnPassarFaseTres = this.add.rectangle(
            this.largura * 0.581,
            this.altura * 0.335,
            this.largura * 0.063,
            this.altura * 0.105,
            0x000000,
            0.5
        ).setInteractive().setDepth(100).setScrollFactor(0).setVisible(false);

        this.btnPassarFaseQuatro = this.add.rectangle(
            this.largura * 0.688,
            this.altura * 0.335,
            this.largura * 0.061,
            this.altura * 0.105,
            0x000000,
            0.5
        ).setInteractive().setDepth(100).setScrollFactor(0).setVisible(false);
        
        this.caixaTutorial = this.add.rectangle(
            centroX, 
            centroY, 
            this.largura * 0.6, 
            this.altura * 0.7, 
            0xffffff
        ).setVisible(false).setStrokeStyle(4, 0x000000).setDepth(3001);

        this.badgeSeguranca = this.add.rectangle(this.largura * 0.58, this.altura * 0.74, this.largura * 0.05, this.altura * 0.075, 0x000000, 1).setDepth(100).setScrollFactor(0).setVisible(false);
        this.badgeCidadania = this.add.rectangle(this.largura * 0.65, this.altura * 0.74, this.largura * 0.05, this.altura * 0.075, 0x000000, 1).setDepth(100).setScrollFactor(0).setVisible(false);
        this.badgeOrdem = this.add.rectangle(this.largura * 0.72, this.altura * 0.74, this.largura * 0.05, this.altura * 0.075, 0x000000, 1).setDepth(100).setScrollFactor(0).setVisible(false);
        this.badgeConhecimento = this.add.rectangle(this.largura * 0.782, this.altura * 0.735, this.largura * 0.05, this.altura * 0.075, 0x000000, 1).setDepth(100).setScrollFactor(0).setVisible(false);

        this.fundoTutorial = this.add.rectangle(0, 0, this.largura, this.altura, 0x000000, 0.2)
            .setScrollFactor(0, 0)
            .setOrigin(0)
            .setDepth(3000)
            .setVisible(false);

        const estiloTexto = {
            fontFamily: 'Pixel',
            fontSize: '55px',
            color: '#000000',
            align: 'center',
            wordWrap: {width : 520}
        }; 

        this.textoTutorial = this.add.text(
            this.largura/2,
            this.altura/2,
            this.instrucoes,
            estiloTexto
        )
        .setScrollFactor(0, 0)
        .setVisible(false)
        .setOrigin(0.5)
        .setDepth(3002); 

        this.btnFecharTutorial = this.add.image(this.largura * 0.82, this.altura * 0.15, "btnFecharMapa")
            .setScrollFactor(0, 0)
            .setScale(0.2)
            .setVisible(false)
            .setDepth(3002)
            .setInteractive(); 

        this.btnAbrirTutorial = this.add.image(this.largura * 0.07 , this.altura * 0.1, 'btnTutorial')
            .setScrollFactor(0, 0)
            .setDepth(2999)
            .setVisible(false)
            .setScale(0.17)
            .setInteractive();
    }

    update() {
        if (this.physics.world.isPaused) return;

        if (this.cursorKeys.left.isDown) {
            this.jogador.setVelocityX(-250);
            this.jogador.setFlipX(true);
            this.jogador.anims.play('andar', true);
        } else if (this.cursorKeys.right.isDown) {
            this.jogador.setVelocityX(250);
            this.jogador.setFlipX(false);
            this.jogador.anims.play('andar', true);
        } else {
            this.jogador.setVelocityX(0);
            this.jogador.anims.play('parado', true);
        }
    }

    // Inicializa e exibe o painel de tutorial com botões de abrir e fechar
    criarTutorial() {
        this.btnAbrirTutorial.setVisible(true);
        this.caixaTutorial.setVisible(true);
        this.textoTutorial.setVisible(true);
        this.fundoTutorial.setVisible(true);
        this.btnFecharTutorial.setVisible(true);
        this.btnAbrirTutorial.setInteractive(false);
 
        this.btnAbrirTutorial.on('pointerdown', () => {
            this.abrirTutorial();
            this.anims.pauseAll();
            this.pausaFundo = true;
            this.time.paused = true;
            this.jogoAtivo = false;
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });
        });
        
        this.btnFecharTutorial.on('pointerdown', () => {
            this.caixaTutorial.setVisible(false);
            this.fundoTutorial.setVisible(false);
            this.textoTutorial.setVisible(false);
            this.btnFecharTutorial.setVisible(false);
            this.pausaFundo = false;
            this.time.paused = false;
            this.jogoAtivo = true;
            this.anims.resumeAll();
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });
        });
    } 

    abrirTutorial() {
        this.criarTutorial();
    }

    toggleControls(ligar) {
        if (this.controleVirtual) this.controleVirtual.setVisible(ligar);
        if (this.btnInteracao) this.btnInteracao.setVisible(ligar);

        if (!ligar && this.jogador) {
            this.jogador.setVelocityX(0);
            this.jogador.anims.play('parado', true);
        }
    }

    // Monta a interface visual do mapa e conecta cada "parada" a uma cena.
    // Estado importante:
    // faseTremMapa: posição persistida do trem ao abrir o mapa.
    // faseTremMapaPendente: destino a ser animado na próxima abertura.
    montarInterfaceMapa() {
        const largura = this.scale.width;
        const altura = this.scale.height;

        this.btnPassarFaseUm.setVisible(true);
        this.btnPassarFaseDois.setVisible(true);
        this.btnPassarFaseTres.setVisible(true);
        this.btnPassarFaseQuatro.setVisible(true);

        this.badgeSeguranca.setVisible(true);
        this.badgeCidadania.setVisible(true);
        this.badgeOrdem.setVisible(true);
        this.badgeConhecimento.setVisible(true);

        this.containerMapa = this.add.container(0, 0).setDepth(100).setScrollFactor(0).setVisible(false);

        const fundoEscuro = this.add.rectangle(largura * 0.5, altura * 0.5, largura, altura, 0x000000, 0.7);
        const mapaTela = this.add.image(largura * 0.5, altura * 0.5, 'mapa')
            .setScale(largura / 3840);

        // Cada indice representa uma parada da linha no mapa:
        // 0 = posicao inicial/progresso antes da primeira estacao
        // 1 = Luz
        // 2 = Se
        // 3 = Liberdade
        // 4 = Conhecimento/Vergueiro
        this.posicoesXTremMapa = [
            largura * 0.590,
            largura * 0.590,
            largura * 0.650,
            largura * 0.780,
            largura * 0.830
        ];

        let faseAnteriorIndice = this.registry.get('faseTremMapa');
        const destinoPendente = this.registry.get('faseTremMapaPendente');
        if (faseAnteriorIndice === undefined || faseAnteriorIndice === null) {
            faseAnteriorIndice = 0;
        }

        let faseMaximaLiberada = 0;

        if (this.registry.get('desbloquearLuz') === true) {
            faseMaximaLiberada = Math.max(faseMaximaLiberada, 1);
        }

        if (this.registry.get('desbloquearSe') === true) {
            faseMaximaLiberada = Math.max(faseMaximaLiberada, 2);
        }

        if (this.registry.get('desbloquearLiberdade') === true) {
            faseMaximaLiberada = Math.max(faseMaximaLiberada, 3);
        }

        if (this.registry.get('desbloquearConhecimento') === true) {
            faseMaximaLiberada = Math.max(faseMaximaLiberada, 4);
        }

        if (faseMaximaLiberada >= 2) {
            this.itensDesbloqueados.push(this.badgeSeguranca);
        }
        if (faseMaximaLiberada >= 3) {
            this.itensDesbloqueados.push(this.badgeCidadania);
        }
        if (faseMaximaLiberada >= 4) {
            this.itensDesbloqueados.push(this.badgeOrdem);
        }

        // O trem sempre nasce na ultima posicao persistida no registry.
        this.tremMapa = this.add.image(this.posicoesXTremMapa[faseAnteriorIndice], altura * 0.43, 'tremMapa')
            .setScale(largura / 2816);

        this.faseAtualTrem = faseAnteriorIndice;
        this.faseAnteriorTrem = faseAnteriorIndice;
        this.estaViajandoNoMapa = false;
        this.faseMaximaLiberada = faseMaximaLiberada;

        const cadeadoSe = this.add.image(largura * 0.448, altura * 0.336, 'cadeado').setScale(largura / 835);
        const cadeadoLib = this.add.image(largura * 0.581, altura * 0.336, 'cadeado').setScale(largura / 835);
        const cadeadoVer = this.add.image(largura * 0.688, altura * 0.336, 'cadeado').setScale(largura / 835);

        const faseLuzConcluida = this.add.image(largura * 0.31, altura * 0.34, 'checkFase').setScale(0.7).setVisible(false);
        const faseSeConcluida = this.add.image(largura * 0.444, altura * 0.34, 'checkFase').setScale(0.7).setVisible(false);
        const faseLibConcluida = this.add.image(largura * 0.579, altura * 0.34, 'checkFase').setScale(0.7).setVisible(false);

        const faseUmPisca = this.tweens.add({
            targets: this.btnPassarFaseUm, 
            alpha: 0,          
            duration: 500,     
            yoyo: true,        
            repeat: -1,        
            ease: 'Sine.easeInOut' 
        });

        if (this.registry.get('desbloquearSe') === true) {
            faseUmPisca.stop();
            cadeadoSe.setVisible(false);
            faseLuzConcluida.setVisible(true);
            this.tweens.add({
                targets: this.btnPassarFaseDois, 
                alpha: 0,          
                duration: 500,     
                yoyo: true,        
                repeat: -1,        
                ease: 'Sine.easeInOut' 
            });
        }
        if (this.registry.get('desbloquearLiberdade') === true) {
            faseUmPisca.stop();
            cadeadoLib.setVisible(false);
            cadeadoSe.setVisible(false);
            faseSeConcluida.setVisible(true);
            faseLuzConcluida.setVisible(true);
            this.tweens.add({
                targets: this.btnPassarFaseTres, 
                alpha: 0,          
                duration: 500,     
                yoyo: true,        
                repeat: -1,        
                ease: 'Sine.easeInOut' 
            });
        }
        if (this.registry.get('desbloquearConhecimento') === true) {
            faseUmPisca.stop();
            cadeadoLib.setVisible(false);
            cadeadoSe.setVisible(false);
            cadeadoVer.setVisible(false);
            faseSeConcluida.setVisible(true);
            faseLuzConcluida.setVisible(true)
            faseLibConcluida.setVisible(true);
            this.tweens.add({
                targets: this.btnPassarFaseQuatro, 
                alpha: 0,          
                duration: 500,     
                yoyo: true,        
                repeat: -1,        
                ease: 'Sine.easeInOut' 
            });
        }

        // Na Bilheteria o mapa pode abrir antes de qualquer progresso real.
        // Nesse caso o trem ainda nao existe visualmente: ele so aparece quando
        // houver uma posicao persistida no mapa ou uma animacao pendente a tocar.
        const tremJaFoiApresentadoNoMapa = faseAnteriorIndice > 0 || destinoPendente !== undefined && destinoPendente !== null;
        if (!tremJaFoiApresentadoNoMapa) {
            this.tremMapa.setVisible(false);
        }

        // Cada botao pede a viagem ate uma fase especifica. O metodo comum abaixo
        // cuida da animacao, da persistencia e do callback final.
        this.btnPassarFaseUm.removeAllListeners('pointerdown');
        this.btnPassarFaseUm.on('pointerdown', () => {
            if (this.faseMaximaLiberada === 1) { // Só permite jogar a fase 1 se ela for a fase atual/máxima
                this.viajarNoMapa(1, () => {
                    let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
                    this.sound.play('click', { volume: volEfeitosAtual });
                    this.scene.start('Escada');
                });
            }
        });

        this.btnPassarFaseDois.removeAllListeners('pointerdown');
        this.btnPassarFaseDois.on('pointerdown', () => {
            if (this.faseMaximaLiberada === 2 && !cadeadoSe.visible) { // Só permite jogar se a fase 2 for a atual
                this.viajarNoMapa(2, () => {
                    let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
                    this.sound.play('click', { volume: volEfeitosAtual });
                    this.scene.start('Cidadania');
                });
            }
        });

        this.btnPassarFaseTres.removeAllListeners('pointerdown');
        this.btnPassarFaseTres.on('pointerdown', () => {
            if (this.faseMaximaLiberada === 3 && !cadeadoLib.visible) { // Só permite jogar se a fase 3 for a atual
                this.viajarNoMapa(3, () => {
                    let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
                    this.sound.play('click', { volume: volEfeitosAtual });
                    this.scene.start('ComercioIlegal');
                });
            }
        });

        this.btnPassarFaseQuatro.removeAllListeners('pointerdown');
        this.btnPassarFaseQuatro.on('pointerdown', () => {
            if (this.faseMaximaLiberada === 4 && !cadeadoVer.visible) { // Só permite jogar se a fase 4 for a atual
                this.viajarNoMapa(4, () => {
                    let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
                    this.sound.play('click', { volume: volEfeitosAtual });
                    this.scene.start('Conhecimento');
                });
            }
        });

        this.containerMapa.add([
            fundoEscuro,
            mapaTela,
            this.btnFecharMapa,
            this.tremMapa,
            this.btnPassarFaseUm,
            this.btnPassarFaseDois,
            this.btnPassarFaseTres,
            this.btnPassarFaseQuatro,
            cadeadoSe,
            cadeadoLib,
            cadeadoVer,
            faseLuzConcluida,
            faseSeConcluida,
            faseLibConcluida,
            this.badgeSeguranca,
            this.badgeCidadania,
            this.badgeOrdem,
            this.badgeConhecimento,
        ]);

        this.btnFecharMapa.removeAllListeners('pointerdown');
        this.btnFecharMapa.on('pointerdown', () => {
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });
            this.fecharMapa();
        });
    }

    // Abrir o mapa nao muda de cena por si so; ele so revela a UI e, se houver,
    // toca a animacao de progresso pendente.
    abrirMapa() {
        if (this.containerMapa) this.containerMapa.setVisible(true);
        if (this.btnFecharMapa) this.btnFecharMapa.setVisible(true);

        this.animarProgressoPendenteNoMapa();

        this.tweens.add({
            targets: this.itensDesbloqueados, 
            alpha: 0,          
            duration: 1000,    
            delay: 1000,        
            onComplete: (tween, targets) => {
                targets.forEach(target => {
                    if (target) target.setVisible(false);
                });
            }
        });
    }

    // Registra um progresso pendente para a proxima vez que o mapa abrir.

    prepararAnimacaoProgressoMapa(indiceOrigem, indiceDestino) {
        const faseRegistrada = this.registry.get('faseTremMapa');
        const destinoPendente = this.registry.get('faseTremMapaPendente');

        if (
            faseRegistrada !== undefined &&
            faseRegistrada !== null &&
            faseRegistrada >= indiceDestino &&
            (destinoPendente === undefined || destinoPendente === null)
        ) {
            return;
        }

        this.registry.set('faseTremMapa', indiceOrigem);
        this.registry.set('faseTremMapaPendente', indiceDestino);
    }

    // Executa a animacao de progresso guardada no registry. Enquanto ela roda,
    // o jogador nao pode fechar o mapa nem iniciar outra viagem.
    animarProgressoPendenteNoMapa() {
        const destinoPendente = this.registry.get('faseTremMapaPendente');

        if (
            destinoPendente === undefined ||
            destinoPendente === null ||
            !this.tremMapa ||
            this.estaViajandoNoMapa
        ) {
            return;
        }

        if (this.faseAnteriorTrem === destinoPendente) {
            this.registry.set('faseTremMapaPendente', null);
            return;
        }

        this.estaViajandoNoMapa = true;
        this.btnFecharMapa.setVisible(false);

        // A primeira conquista do mapa nasce escondida e sai por um "portal" invisivel.
        if (this.faseAnteriorTrem === 0 && destinoPendente === 1) {
            this.animarSaidaDoPortalNoMapa(destinoPendente);
            return;
        }

        this.tweens.add({
            targets: this.tremMapa,
            x: this.posicoesXTremMapa[destinoPendente],
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.finalizarAnimacaoMapa(destinoPendente);
            }
        });
    }

    // A primeira conquista usa uma mascara para simular o trem saindo de um portal invisivel.
    // O sprite nasce escondido atras da borda esquerda e anda ate estacionar no ponto inicial.
    animarSaidaDoPortalNoMapa(indiceDestino) {
        const larguraTrem = this.tremMapa.displayWidth;
        const portalX = this.posicoesXTremMapa[0] - (larguraTrem / 2.9);
        const alturaPortal = this.tremMapa.displayHeight * 1.2;
        const inicioX = portalX - (larguraTrem / 2);

        const mascaraPortal = this.make.graphics({ x: 0, y: 0, add: false });
        mascaraPortal.fillStyle(0xffffff);
        mascaraPortal.fillRect(portalX, this.tremMapa.y - (alturaPortal / 2), this.largura - portalX, alturaPortal);

        this.tremMapa.setMask(mascaraPortal.createGeometryMask());
        this.tremMapa.setX(inicioX);

        this.tweens.add({
            targets: this.tremMapa,
            x: this.posicoesXTremMapa[indiceDestino],
            duration: 1800,
            ease: 'Power2',
            onComplete: () => {
                this.tremMapa.clearMask(true);
                mascaraPortal.destroy();
                this.finalizarAnimacaoMapa(indiceDestino);
            }
        });
    }

    // Este metodo concentra a atualizacao de estado depois da animacao visual do mapa.
    finalizarAnimacaoMapa(indiceDestino) {
        this.registry.set('faseTremMapa', indiceDestino);
        this.registry.set('faseTremMapaPendente', null);
        this.faseAtualTrem = indiceDestino;
        this.faseAnteriorTrem = indiceDestino;
        this.estaViajandoNoMapa = false;
        this.btnFecharMapa.setVisible(true);
    }

    // Usa a mesma malha do mapa para viagens "reais" entre fases.
    // Quando a tween termina, o callback decide o que acontece em seguida
    // (troca de cena direta ou cutscene com o metro).
    viajarNoMapa(indiceDestino, onComplete) {
        if (!this.tremMapa || this.estaViajandoNoMapa) return;

        const finalizarViagem = () => {
            this.registry.set('faseTremMapa', indiceDestino);
            this.registry.set('faseTremMapaPendente', null);
            this.faseAtualTrem = indiceDestino;
            this.faseAnteriorTrem = indiceDestino;
            this.estaViajandoNoMapa = false;
            this.fecharMapa();
            this.registry.set('bilheteria', false);

            if (onComplete) {
                this.time.delayedCall(50, onComplete);
            }
        };

        if (this.faseAnteriorTrem === indiceDestino) {
            finalizarViagem();
            return;
        }

        this.estaViajandoNoMapa = true;
        this.btnFecharMapa.setVisible(false);

        this.tweens.add({
            targets: this.tremMapa,
            x: this.posicoesXTremMapa[indiceDestino],
            duration: 2000,
            ease: 'Power2',
            onComplete: finalizarViagem
        });
    }

    fecharMapa() {
        if (this.estaViajandoNoMapa) return;
        this.btnAbrirTutorial.setVisible(false);
        if (this.containerMapa) this.containerMapa.setVisible(false);
        if (this.btnFecharMapa) this.btnFecharMapa.setVisible(false);
        this.physics.resume();
        if (this.registry.get('bilheteria') === true) {
            this.toggleControls(true);
        };
    }

    conquistaBadge() {
        this.selecionarBadge = null;
        this.proximaEstacao = null;

        if (this.registry.get('desbloquearBadgeSeg') === true) {
            this.selecionarBadge = "badgeSeg";
            this.proximaEstacao = "EstacaoLuz";
        } else if (this.registry.get('desbloquearBadgeCid') === true) {
            this.selecionarBadge = "badgeCid";
            this.proximaEstacao = "EstacaoSe";
        } else if (this.registry.get('desbloquearBadgeOrd') === true) {
            this.selecionarBadge = "badgeOrd";
            this.proximaEstacao = "EstacaoLiberdade";
        } else if (this.registry.get('desbloquearBadgeCon') === true)    {
            this.selecionarBadge = "badgeCon";
            this.proximaEstacao = "CCO";
        }

        if (this.selecionarBadge === null || this.proximaEstacao === null) {
            return;
        }

        let largura = this.scale.width;
        let altura = this.scale.height;

        this.containerBadge = this.add.container(0, 0).setDepth(100).setScrollFactor(0);

        var fundoEscuro = this.add.rectangle(largura * 0.5, altura * 0.5, largura, altura, 0x000000, 0.7);

        this.avisoPopUp = this.add.rectangle(largura * 0.5, altura * 0.9, 500, 100, 0x000000, 0.7)
        .setScale(0.1);

        let textoMensagem = "Toque na tela para continuar!";
        let textoAviso = this.add.text(largura * 0.5, altura * 0.90, textoMensagem, {
            fontFamily: 'Pixel', 
            fontSize: '30px',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5);

        textoAviso.setScale(0.1);

        this.layoutBadge = this.add.image(largura / 2, altura / 2, this.selecionarBadge)
        .setScale(0);

        this.containerBadge.add([fundoEscuro, this.layoutBadge, this.avisoPopUp, textoAviso,]);

        let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
        this.sound.play('conquista', { volume: volEfeitosAtual });

        this.tweens.add ({
            targets: this.layoutBadge,
            scale: 4,
            duration: 500,
            ease: 'Back.out',
        });
        
        this.tweens.add ({
            targets: [this.avisoPopUp, textoAviso],
            scale: 1,
            duration: 500,
            ease: 'Back.out',
        });

        this.input.once('pointerdown', () => {
            fundoEscuro.disableInteractive();
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });

            this.tweens.add ({
                targets: this.layoutBadge,
                scale: 0,
                duration: 500,
                ease: 'Back.in',
                onComplete: () => { 
                    this.cameras.main.fadeOut(1500, 0, 0, 0);
                    this.containerBadge.destroy();
                }
            });
            this.cameras.main.once('camerafadeoutcomplete', () => {
                if (this.proximaEstacao === "CCO") {
                    this.add.rectangle(largura / 2, altura / 2, largura, altura, 0x000000)
                        .setDepth(9998)
                        .setScrollFactor(0);

                    // Adiciona o seu texto de "Fim..."
                    this.add.text(largura / 2, altura / 2, "Fim...", {
                        fontFamily: 'Pixel', 
                        fontSize: '60px',
                        fill: '#ffffff',
                        align: 'center'
                    }).setOrigin(0.5).setDepth(9999).setScrollFactor(0);
                    
                    this.cameras.main.fadeIn(1500, 0, 0, 0);
                } else {
                    this.scene.start(this.proximaEstacao); 
                }
            });

            this.tweens.add ({
                targets: [this.avisoPopUp, textoAviso],
                scale: 0.1,
                duration: 500,
                ease: 'Back.in',
            });
        });
    }

    chamarConfigs() {
        let largura = this.scale.width;
        let altura = this.scale.height;

        if (this.physics.world) this.physics.world.pause();

        const centroX = this.scale.width / 2;
        const centroY = this.scale.height / 2;

        // 1. Cria o Container
        this.containerConfig = this.add.container(centroX, centroY).setDepth(9999);

        // 2. Fundo escuro
        const retanguloFundoEscuro = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
            .setInteractive(); 

        // 3. Painel
        const painel = this.add.image(0, 0, 'layoutConfig').setScale(4);

        // 4. Botão Fechar
        this.btnFecharConfig = this.add.image(320, -120, "btnFecharConfig")
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(101)  
            .setScale(0.15);
        
        this.btnFecharConfig.on('pointerdown', () => {
            this.containerConfig.destroy();
            this.btnConfig.setInteractive();
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });
            if (this.physics.world) this.physics.world.resume();
        });

        // 5. Configurações dos Sliders
        const inicioCaixaX = -132; 
        const fimCaixaX = 150;   
        const larguraCaixa = fimCaixaX - inicioCaixaX;

        const yEfeitos = -20;
        const yMusica = 113;

        let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        // Barras de preenchimento que crescem da esquerda para a direita conforme o volume é ajustado
        const barraVerdeEfeitos = this.add.rectangle(inicioCaixaX, yEfeitos, larguraCaixa * volEfeitosAtual, 56, 0x00FF00)
            .setOrigin(0, 0.5); 
            
        const barraVerdeMusica = this.add.rectangle(inicioCaixaX, yMusica, larguraCaixa * volMusicaAtual, 56, 0x00FF00)
            .setOrigin(0, 0.5);

        // 6. Pegadores (Handles)
        const controleEfeitos = this.add.image(inicioCaixaX + (larguraCaixa * volEfeitosAtual), yEfeitos, "btnVolume").setScale(0.68)
            .setInteractive({ draggable: true, useHandCursor: true });

        const controleMusica = this.add.image(inicioCaixaX + (larguraCaixa * volMusicaAtual), yMusica, "btnVolume").setScale(0.68)
            .setInteractive({ draggable: true, useHandCursor: true });


        // 7. Lógica de Arrastar com a Barra Verde Animada
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === controleEfeitos || gameObject === controleMusica) {

                // SALVAGUARDA DE INTERFACE:
                // O uso da função Clamp trava fisicamente o arraste do botão aos limites
                // da caixa (inicioCaixaX e fimCaixaX). Isso impede que o jogador arraste o
                // botão para fora da tela e gere valores de áudio negativos ou estourados.
                gameObject.x = Phaser.Math.Clamp(dragX, inicioCaixaX, fimCaixaX);
                gameObject.y = gameObject === controleEfeitos ? yEfeitos : yMusica;

                let porcentagemVolume = (gameObject.x - inicioCaixaX) / larguraCaixa;

                if (gameObject === controleEfeitos) {
                    this.registry.set('volEfeitos', porcentagemVolume);
                    // Atualiza a largura da barra verde junto com o botão
                    barraVerdeEfeitos.width = gameObject.x - inicioCaixaX;
                } else {
                    this.registry.set('volMusica', porcentagemVolume);
                    // Atualiza a largura da barra verde da música
                    barraVerdeMusica.width = gameObject.x - inicioCaixaX;

                    if (this.musicaFundo12) {
                        this.musicaFundo12.setVolume(porcentagemVolume);
                    }
                }
            }
        });

        // 8. Adiciona tudo pro Container! (A ordem dita quem fica por cima)
        this.containerConfig.add([
            retanguloFundoEscuro, 
            painel, 
            barraVerdeEfeitos,  // Fica atrás do handle branco
            barraVerdeMusica,   // Fica atrás do handle branco
            controleEfeitos, 
            controleMusica,
            this.btnFecharConfig
        ]);
    }
}

export default BaseScene;
