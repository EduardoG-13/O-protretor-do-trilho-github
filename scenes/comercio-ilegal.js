/*
ComercioIlegal.js - Terceiro minigame do jogo. Objetivo: O jogador deve desviar de itens de comércio ilegal que deslizam pelo vagão, pressionando o botão de pulo no momento certo. 
O jogo é dividido em dois estágios com velocidade e frequência de obstáculos crescentes.
*/

import BaseScene from "./base-scene.js";

// Constantes da barra de progresso
const larguraFrameBarra = 384;   // largura de cada um dos 3 frames (pixels)
const alturaFrameBarra = 192;   // altura do frame (pixels)

// Frames da spritesheet
const frameSemEstrela = 0;   // sem estrela colorida
const framePrimeiraEstrela = 1;   // primeira estrela acesa
const frameFaseCompleta = 2;   // ambas as estrelas acesas
// ─────────────────────────────────────────────────────────────────────────────

class ComercioIlegal extends BaseScene {
    constructor() {
        super('ComercioIlegal');
        this.instrucoes = "Desvie dos itens no vagão!\n\nClique no botão de pular\npara desviar dos objetos!";
    }

    preload() {
        super.preload();

        this.load.image('vagao1', './assets/Cenario/vagao.png');
        this.load.image('vagao2', './assets/Cenario/vagao2.png');

        this.load.image('btnPular', './assets/Botoes/btnPulo.png');

        this.load.spritesheet('pularMasc', './assets/Player/pularMasc.png', {
            frameWidth: 64,
            frameHeight:75
        });

        this.load.spritesheet('pularFem', './assets/Player/pularFem.png', {
            frameWidth: 64,
            frameHeight: 70
        });

        this.load.image('amendoim', './assets/Object/amendoim.png');
        this.load.image('bala1', './assets/Object/bala1.png');
        this.load.image('bala2', './assets/Object/bala2.png');
        this.load.image('bala3', './assets/Object/bala3.png');
        this.load.image('capinha1', './assets/Object/capinha1.png');
        this.load.image('capinha2', './assets/Object/capinha2.png');
        this.load.image('capinha3', './assets/Object/capinha3.png');
        this.load.image('fone1', './assets/Object/fone1.png');
        this.load.image('fone2', './assets/Object/fone2.png');
        this.load.image('fone3', './assets/Object/fone3.png');

        // Barra externa de progresso
        this.load.spritesheet('barraProgresso', './assets/Object/timeBarMetroNova.png', {
            frameWidth:  larguraFrameBarra,
            frameHeight: alturaFrameBarra
        });

        this.load.audio('trilhaFundoComercio', './assets/Sons/cmilegal.mp3');  
        this.load.audio('pulo', './assets/Sons/soundpulo.mp3');  
        this.load.audio('click', './assets/Sons/click.wav');  
    }

    create() {
        super.create();

        this.criarTutorial();
        this.anims.pauseAll();
        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        this.musicaFundoComercio = this.sound.add('trilhaFundoComercio', {
            volume: volMusicaAtual,
            loop: true
        });

        this.musicaFundoComercio.play();

        // Lista de sprites dos itens de comércio ilegal que serão spawnados como obstáculos
        this.itens = ['amendoim','bala1', 'bala2', 'bala3','capinha1', 'capinha2', 'capinha3','fone1', 'fone2', 'fone3'];

        // Variáveis que armazenam as distâncias e velocidades do jogo
        this.distanciaEstagio1 = 7200; 
        this.distanciaEstagio2 = 9000;

        // Duração em segundos de cada estágio, usada para calcular a velocidade de deslocamento
        this.tempoEstagio = 18;

        // velocidade definida a partir do tempo de duração do estagio e seu tamanho
        this.velocidadeEstagio1 = this.distanciaEstagio1/this.tempoEstagio; // fórmula MU ---> Velocidade = distância/tempo.
        this.spawnMinEstagio1 = 80;
        this.spawnMaxEstagio1 = 150;

        // velocidade definida a partir do tempo de duração da estagio e seu tamanho
        this.velocidadeEstagio2 = this.distanciaEstagio2/this.tempoEstagio; // fórmula MU ---> Velocidade = distância/tempo.
        this.spawnMinEstagio2 = 85;
        this.spawnMaxEstagio2 = 100;
        this.delaySpawnEstagio2Ms = 1800;

        this.fatorHitboxItem = 0.45;
        this.gravidadePulo = 900;
        this.deltaH = 200; // Altura máxima desejada para o pulo, usada na fórmula de cálculo da força inicial
        this.tempoPulo = 2;
        this.forcaPulo = (this.deltaH - 0.5 * this.gravidadePulo * this.tempoPulo**2)/this.tempoPulo;

        this.jogador.setScale(5.5);
        this.jogador.setX(this.jogador.x + this.largura * 0.03);
        this.jogador.body.setSize(20, 60, true); // Redimensão do hitbox do personagem para melhor encaixe com os obstáculos

        // Animação de pulo diferenciada para cada um dos dois personagens principais
        this.spritePuloJogador = (this.genero === 'jogador masculino') ? 'pularMasc' : 'pularFem';

        this.anims.create({
            key: 'pular',
            frames: this.anims.generateFrameNumbers(this.spritePuloJogador, { start: 0, end: 6 }),
            frameRate: 7,
            repeat: -1
        });

        // Configurações do estágio inicial do jogo
        this.estagioAtual = 1;
        this.distancia = 0;
        this.jogoAtivo = false;
        this.tickProxSpawn = 0; // “Marcador” de quando o próximo obstáculo deve nascer
        this.estaPulando = false;

        // Configurações da física do jogo
        this.jogador.setGravityY(this.gravidadePulo);
        this.cameras.main.fadeIn(1500, 0, 0, 0);

        this.chao.destroy(); // Necessário pois as dimensões do background desta cena é diferente das anteriores
        this.alturaChaoComercioIlegal = (this.altura / 2) * 1.9;
        this.chaoComercioIlegal = this.add.rectangle(this.largura / 2, this.alturaChaoComercioIlegal, this.largura * 3, this.altura * 0.08, 0x00ff00, 0);
        this.physics.add.existing(this.chaoComercioIlegal, true);
        this.physics.add.collider(this.jogador, this.chaoComercioIlegal);

        // Fundo (vagões), lógica de esteira infinita
        this.proximoFundo = 'vagao1'; // Primeiro fundo a ser usado
        const texturaVagaoBase = this.textures.get('vagao1').getSourceImage(); // Pega a textura base da imagem para calcular a escala correta, pois os vagões tem tamanhos diferentes um dos outros
        this.escalaVagao  = this.altura / texturaVagaoBase.height; // Calcula a escala para o vagão ocupar a largura da tela

        // Cria os dois fundos iniciais, um ao lado do outro, para criar o efeito de esteira infinita
        this.fundoA = this.add.image(0, 0, this.obterProximoFundo())
            .setScale(this.escalaVagao).setOrigin(0, 0);
        this.fundoB = this.add.image(this.fundoA.displayWidth, 6, this.obterProximoFundo()) // Display utilizado para "grudar" as cenas umas nas outras
            .setScale(this.escalaVagao).setOrigin(0, 0);

        // Configurações do personagem principal
        this.toggleControls(false);
        this.jogador.setFlipX(false);
        this.jogador.anims.play('andar', true);

        this.btnPular = this.add.image(this.largura * 0.87, this.altura * 0.8, 'btnPular')
            .setScale(this.largura / 2500)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(50);

        this.btnPular.on('pointerdown', () => {
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('pulo', { volume: volEfeitosAtual });
            this.pular()});

        // Obstáculos e lógica de colisão entre jogador e itens
        this.obstaculos = this.physics.add.staticGroup();
        this.physics.add.overlap(this.jogador, this.obstaculos, this.colidiu, null, this);

        // Chama a função que configura o background inicial e varíavel de distância para o primeiro spawn
        this.agendarSpawn();

        this.criarBarraProgresso();
    }

    update(tempo, delta) {
        if (!this.jogoAtivo) return;

        this.deltaSegundos = delta/1000;
        this.distanciaPercorridaNaEstagio1 = this.distanciaEstagio1 - (this.distanciaEstagio1 - this.distancia);
        this.distanciaPercorridaNaEstagio2 = this.distanciaEstagio2 - (this.distanciaEstagio2 - this.distancia);
        this.atualizarFundo();  

        // Detecta quando o jogador aterrissa para resetar o estado de pulo
        if ((this.jogador.body.blocked.down || this.jogador.body.touching.down) && this.estaPulando) {
            this.estaPulando = false;
            this.jogador.setTexture(this.genero, 0);
            this.jogador.body.setSize(20, 60, true);
        }

        // Estabelece a animação de andar no chão, mas não enquanto o personagem está pulando
        if ((this.jogador.body.blocked.down || this.jogador.body.touching.down) && !this.estaPulando) {
            this.jogador.anims.play('andar', true);
        }

        this.moverObstaculos();
        
        this.distancia += this.velocidadeAtual * this.deltaSegundos;

        if (this.distancia >= this.tickProxSpawn) {
            if (this.podeSpawnarItem()) {
                this.spawnarItem();
                this.agendarSpawn();
            } else {
                this.tickProxSpawn = this.distancia + 1;
            }
        }

        const distanciaEstagioAtual = this.estagioAtual === 1
            ? this.distanciaEstagio1
            : this.distanciaEstagio2;

        if (this.distancia >= distanciaEstagioAtual) {
            this.concluirEstagio();
        }

        // console.log parte do MU
        console.log(
            "[MU]",
            "v =", this.velocidadeAtual.toFixed(2),
            "s =", this.distancia.toFixed(2),        
            "t =", (this.distancia / this.velocidadeAtual).toFixed(2)
        );

        // console.log MUV, inicia quando o personagem pula 
        if (this.estaPulando) {
            const aceleracao = this.gravidadePulo;
            const velocidade = this.jogador.body.velocity.y;
            const posicao = this.jogador.y;

            console.log(
                "[MUV]",
                "a =", aceleracao.toFixed(2),
                "v =", velocidade.toFixed(2),
                "s =", posicao.toFixed(2)
            );
        }

        // Atualiza o graficoFillBar a cada frame
        this.atualizarBarraProgresso();
    }
    
    // Função para criar a barra de progresso no canto superior direito da tela.
    // graficoFillBar é o retângulo azul que cresce conforme o progresso no ointerior da spriteBarraProgresso, que é a moldura da barra (com as estrelas).
    criarBarraProgresso() {
        // Tamanho e posição 
        const escala    = (this.largura * 0.22) / larguraFrameBarra;
        const barW      = larguraFrameBarra * escala;
        const barH      = alturaFrameBarra * escala;
        const margemX   = this.largura  * 0.02;
        const margemY   = this.altura   * 0.02;

        // Âncora no canto superior direito
        const barX = this.largura  - barW / 2 - margemX;
        const barY = barH / 2 + margemY;

        // 1º Fill abaixo do sprite
        this.graficoFillBar = this.add.graphics()
            .setScrollFactor(0)
            .setDepth(58);

        // Sobreposição da spritesheet
        this.spriteBarraProgresso = this.add.sprite(barX, barY, 'barraProgresso', frameSemEstrela)
            .setScale(escala)
            .setScrollFactor(0)
            .setDepth(59);

        // Métricas do fill em pixels de tela
        this.barFillMetrics = {
            x:    barX - barW / 2 + barW * 0.03, //padding horizontal (cada lado)
            y:    barY - barH / 2 + barH * 0.32, //padding do topo
            maxW: barW * (0.91), //total - padding horizontal - padding horizontal direita
            h:    barH * 0.4 //altura do fill em relação à barra escalada
        };
    }

    atualizarBarraProgresso() {
        // Evita da função tentar desenhar algo que ainda nem foi criado, tratamento de bugs
        if (!this.graficoFillBar || !this.barFillMetrics) return;

        // Cálculo do progresso conforme os estagios avançam
        let progresso;
        if (this.estagioAtual === 1) {
            // Estagio 1 → preenche de 0% a 50%,
            progresso = Math.min(this.distancia / this.distanciaEstagio1, 1) * 0.5;
        } else {
            //Estagio 2 → preenche de 50% a 100%
            progresso = 0.5 + Math.min(this.distancia / this.distanciaEstagio2, 1) * 0.5;
        }

        // Antecipa o frame final quando a barra se aproxima do fim
        if (progresso >= 0.98) {
            this.spriteBarraProgresso?.setFrame(frameFaseCompleta);
        }

        const { x, y, maxW, h } = this.barFillMetrics;
        this.graficoFillBar.clear();
        this.graficoFillBar.fillStyle(0x0000FF, 1); // Cor azul na barra
        this.graficoFillBar.fillRect(x, y, maxW * progresso, h);
    }

    pular() {
        if (this.jogador.body.blocked.down || this.jogador.body.touching.down) {
            this.estaPulando = true;
            this.jogador.setVelocityY(this.forcaPulo);
            this.jogador.anims.stop();

            this.jogador.anims.play('pular', true);

            // Linha para corrigir o hitbox do personagem durante o pulo, melhorando a interação com os obstáculos
            this.jogador.body.setSize(20, 60, true);
        }
    }

    // Movimenta os fundos criando efeito de esteira infinita e alterna entre os dois vagões conforme a velocidade do estágio atual
    // além de permitir a dificuldade personalizada do jogo através da velocidade
    atualizarFundo() {
        this.velocidadeAtual = this.estagioAtual === 1 ? this.velocidadeEstagio1 : this.velocidadeEstagio2;

        
        this.fundoA.x -= this.velocidadeAtual * this.deltaSegundos;
        this.fundoB.x -= this.velocidadeAtual * this.deltaSegundos;

        if (this.fundoA.x + this.fundoA.displayWidth <= 0) {
            this.fundoA.x = this.fundoB.x + this.fundoB.displayWidth;
            this.fundoA.setTexture(this.obterProximoFundo());
        }

        if (this.fundoB.x + this.fundoB.displayWidth <= 0) {
            this.fundoB.x = this.fundoA.x + this.fundoA.displayWidth;
            this.fundoB.setTexture(this.obterProximoFundo());
        }
    }

    obterProximoFundo() {
        const fundoAtual  = this.proximoFundo;
        this.proximoFundo = this.proximoFundo === 'vagao1' ? 'vagao2' : 'vagao1';
        return fundoAtual;
    }

    // Define quando o próximo obstáculo deve nascer
    agendarSpawn() {
        const intervaloMinSpawn = this.estagioAtual === 1 ? this.spawnMinEstagio1 : this.spawnMinEstagio2;
        const intervaloMaxSpawn = this.estagioAtual === 1 ? this.spawnMaxEstagio1 : this.spawnMaxEstagio2;
        this.tickProxSpawn = this.distancia + Phaser.Math.Between(intervaloMinSpawn, intervaloMaxSpawn);
    }

    // Cria um novo obstáculo na cena, escolhendo aleatoriamente um item da lista de itens
    spawnarItem() {
        const itemSorteado = Phaser.Utils.Array.GetRandom(this.itens);
        const item = this.obstaculos.create(this.largura + 60, this.alturaChaoComercioIlegal - 60, itemSorteado);
        
        item.setDisplaySize(150, 150);
        item.refreshBody();
        this.ajustarHitboxItem(item);
    }

    // Compara a distância entre o ponto de spwan e o último item para evitar que fiquem colados
    // Retorna true se for possível, e é usado em update();
    podeSpawnarItem() {
        const itensAtivos = this.obstaculos.getChildren();
        if (itensAtivos.length === 0) return true;

        const ultimoItem = itensAtivos.reduce((maisADireita, itemAtual) =>
            itemAtual.x > maisADireita.x ? itemAtual : maisADireita
        );

        const velocidadeAtual  = this.estagioAtual === 1 ? this.velocidadeEstagio1  : this.velocidadeEstagio2;
        const spawnMinAtual    = this.estagioAtual === 1 ? this.spawnMinEstagio1    : this.spawnMinEstagio2;
        const distanciaMinPx   = Math.max(180, spawnMinAtual * velocidadeAtual);
        const xDeSpawn         = this.largura + 60;

        return (xDeSpawn - ultimoItem.x) >= distanciaMinPx;
    }

    // Movimenta todos os obstáculos para a esquerda e destroi os que saíram da tela (-100 no eixo x)
    moverObstaculos() {
        const velocidadeItens = this.estagioAtual === 1 ? this.velocidadeEstagio1 : this.velocidadeEstagio2;

        this.obstaculos.getChildren().forEach(item => {
            item.x -= velocidadeItens * this.deltaSegundos;
            item.refreshBody();
            this.ajustarHitboxItem(item);
            if (item.x < -100) item.destroy();
        });
    }

    // Redimensiona e reposiciona a hitbox para ficar proporcional ao sprite
    // Calcula largura/altura da hitbox e aplcia fator de ajuste, centralizando os objetos
    ajustarHitboxItem(item) {
        const hitboxLargura = item.displayWidth  * this.fatorHitboxItem;
        const hitboxAltura  = item.displayHeight * this.fatorHitboxItem;
        item.body.setSize(hitboxLargura, hitboxAltura);
        item.body.position.x = item.x - hitboxLargura * 0.5;
        item.body.position.y = item.y - hitboxAltura  * 0.5;
    }

    colidiu() {
        this.mostrarGameOver();
    }

    // Gatilho para estágios, ao concluir o estágio 1, inicia o estágio 2, e ao concluir o estágio 2, finaliza o minigame
    concluirEstagio() {
        if (!this.jogoAtivo) return;
        this.jogoAtivo = false;

        if (this.physics.world) this.physics.pause();
        this.jogador.anims.stop();

        if (this.estagioAtual === 1) {
            this.cameras.main.fadeOut(800, 0, 0, 0);

            this.time.delayedCall(850, () => {
                this.iniciarEstagio2();
            });
        } else {
            this.finalizarMinigame();
        }
    }

    iniciarEstagio2() {
        // Reseta as constantes para o estagio 2
        this.estagioAtual = 2;
        this.distancia = 0;
        this.jogoAtivo = true;
        this.jogador.setGravityY(this.gravidadePulo);
        this.obstaculos.clear(true, true);
        if (this.physics.world) this.physics.resume();

        // Mostra que estagio 1 foi concluída
        this.spriteBarraProgresso?.setFrame(framePrimeiraEstrela);
        this.atualizarBarraProgresso();

        // Reseta o marcador de spawn para agendar o primeiro obstáculo do estágio 2 após um intervalo
        this.agendarSpawn();

        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    finalizarMinigame() {
        // Acende as duas estrelas e preenche 100% antes de sair da cena
        this.registry.set('desbloquearConhecimento', true);
        this.spriteBarraProgresso?.setFrame(frameFaseCompleta);
        this.atualizarBarraProgresso();

        this.registry.set('desbloquearBadgeSeg', false);
        this.registry.set('desbloquearBadgeCid', false);
        this.registry.set('desbloquearBadgeOrd', true);
        this.btnPular.destroy();
        this.graficoFillBar.destroy();
        this.spriteBarraProgresso.destroy();
        this.musicaFundoComercio.destroy();
        this.btnAbrirTutorial.setVisible(false);
        this.conquistaBadge();
    }

    mostrarGameOver() {
        if (!this.jogoAtivo) return;
        this.jogoAtivo = false;

        if (this.physics.world) this.physics.pause();
        this.jogador.anims.stop();

        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.7
        ).setDepth(5000).setScrollFactor(0);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'Evite os itens vendidos ilegalmente!', {
            fontSize: '45px',
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
        btnTentarNovamente.on('pointerdown', () => { let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual }); 
            this.musicaFundoComercio.destroy();
            this.scene.restart() });
    }
}

export default ComercioIlegal;