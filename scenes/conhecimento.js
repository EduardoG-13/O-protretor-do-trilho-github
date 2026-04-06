/*
 * conhecimento.js - MINIJOGO DA FASE 4 (ACESSO AO CCO)
 * OBJETIVO: Validar o conhecimento do jogador sobre o sistema metroviário.
 * REGRA: 8 questões totais, aproveitamento mínimo de 75% (6 acertos).
 * RESULTADO: Liberação de acesso ao Centro de Controle Operacional (CCO).
 */

import BaseScene from "./base-scene.js";

class Conhecimento extends BaseScene {
    constructor() {
        super('Conhecimento');
        
        // --- ESTADO INICIAL E CONTROLE DO QUIZ ---
        this.perguntaAtual = 0;
        this.acertos = 0; // Contador de respostas corretas para validação de pontuação
        this.eventosAtivos = []; // Gerenciamento de temporizadores para limpeza de memória
        this.quizAtivo = false;

        // --- BANCO DE DADOS DAS QUESTÕES ---
        // Estrutura contendo o texto da pergunta, lista de opções e índice da resposta correta
        this.quizDados = [
            { pergunta: " SE ALGO CAIR NA VIA DO TREM,\nO QUE VOCÊ DEVE FAZER?", respostas: ["DESCER PARA PEGAR", "PEDIR AJUDA A UM FUNCIONÁRIO", "JOGAR OUTRA COISA", "PULAR NOS TRILHOS"], correta: 1 },
            { pergunta: " APROXIMADAMENTE QUANTAS PESSOAS\nUSAM O METRÔ POR DIA EM SÃO PAULO?", respostas: ["10 MIL", "200 MIL", "3 MILHÕES", "20 MILHÕES"], correta: 2 },
            { pergunta: " POR QUE O METRÔ É CONSIDERADO UM\nTRANSPORTE DE ALTA CAPACIDADE?", respostas: ["TRENS MUITO GRANDES", "TRANSPORTA MUITAS PESSOAS\nAO MESMO TEMPO", "É MUITO RÁPIDO", "ANDA EMBAIXO DA TERRA"], correta: 1 },
            { pergunta: " O QUE SIGNIFICA A SIGLA CCO NO METRÔ?", respostas: ["CENTRO DE COMUNICAÇÃO OPERACIONAL", "CENTRO DE CONTROLE OPERACIONAL", "CENTRAL DE CONTROLE DE ÔNIBUS", "CENTRO DE COMANDO ONLINE"], correta: 1 },
            { pergunta: " QUAL É O PERFIL PREDOMINANTE DE GÊNERO\nDOS PASSAGEIROS DO METRÔ SP?", respostas: ["58% HOMENS", "58% MULHERES", "50% HOMENS E 50% MULHERES", "65% MULHERES"], correta: 1 },
            { pergunta: " PARA QUAL FINALIDADE A MAIORIA DOS\nPASSAGEIROS UTILIZA O METRÔ?", respostas: ["LAZER E TURISMO", "COMPRAS", "IR AO TRABALHO", "ESTUDOS"], correta: 2 },
            { pergunta: " QUAL É A FAIXA ETÁRIA PREDOMINANTE\nENTRE OS PASSAGEIROS DO METRÔ SP?", respostas: ["15 A 24 ANOS", "25 A 44 ANOS", "45 A 60 ANOS", "ACIMA DE 60 ANOS"], correta: 1 },
            { pergunta: " QUAL É O COMPORTAMENTO CORRETO\nRECOMENDADO PARA PREVENIR ACIDENTES?", respostas: ["CORRER PARA NÃO PERDER O TREM", "ANDAR, NÃO CORRER", "USAR ESCADA ROLANTE EM\nSENTIDO CONTRÁRIO", "APOIAR-SE NAS PORTAS DO TREM"], correta: 1 }
        ];
    }

    preload() {
        super.preload();
        
        // Carregamento de cenários, interfaces e botões
        this.load.image('rua', './assets/Cenario/Rua.png');
        this.load.image('tutorial', './assets/Cenario/tutorialQuiz.png');
        this.load.image('iniciarQuiz', './assets/Botoes/btnComecar.png');
        this.load.image('fundoQuiz', './assets/Cenario/backgroundPerguntas.png');
        this.load.image('caixaPerguntas', './assets/Object/caixaPerguntas.png');

        // Carregamento das imagens das caixas de resposta (retorno visual)
        for (let i = 1; i <= 4; i++) {
            this.load.image(`respostaAzul${i}`, `./assets/Object/respostaAzul${i}.png`);
            this.load.image(`respostaVerde${i}`, `./assets/Object/respostaVerde${i}.png`);
            this.load.image(`respostaVermelho${i}`, `./assets/Object/respostaVermelho${i}.png`);
        }

        // Carregamento das folhas de estilo de animação do Personagem do Jogo
        this.load.spritesheet('apresentadorFala', './assets/Npc/apresentadorFala.png', {frameWidth: 320, frameHeight: 320});
        this.load.spritesheet('apresentadorDuvida', './assets/Npc/apresentadorDuvida.png', {frameWidth: 640, frameHeight: 320});
        this.load.spritesheet('apresentadorRindo', './assets/Npc/apresentadorRindo.png', {frameWidth: 640, frameHeight: 320});

        this.load.image('interacao', './assets/Botoes/interact.png');

        this.load.audio('trilhaFundoConhecimento', './assets/Sons/musicafase4.mp3');  
        this.load.audio('click', './assets/Sons/click.wav');      
        this.load.audio('escrita', './assets/Sons/npc-dialog.mp3');   
    }

    create() {
        super.create();
        
        
        // Ajuste de posicionamento físico do cenário
        if(this.chao) {
            this.chao.y += 85;
            this.chao.body.updateFromGameObject();
        }

        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        this.musicaFundoConhecimento = this.sound.add('trilhaFundoConhecimento', {
            volume: volMusicaAtual,
            loop: true
        });

        this.musicaFundoConhecimento.play();

        let largura = this.scale.width;
        let altura = this.scale.height;

        // --- CONFIGURAÇÃO DA CENA E PERSONAGEM ---
        this.rua = this.add.image(largura/2, altura/2, 'rua').setDepth(0).setDisplaySize(largura, altura);
        this.jogador.setPosition(largura * 0.1, altura * 0.5);
        this.posicaoTotem = { x: largura * 0.50, y: altura * 0.80 };
        this.interacaoEmAndamento = false;

        this.iconeInteracao = this.add.image(0, 0, 'interacao')
            .setVisible(false)
            .setScale(this.largura / 1600)
            .setDepth(1);
        this.iconeInteracao.setPosition(this.posicaoTotem.x + this.largura * 0.06, this.posicaoTotem.y - this.altura * 0.24); 

        // --- INTERFACE DO QUIZ (PAINEL VISUAL) ---
        this.fundoQuizHUD = this.add.image(largura/2, altura/2, 'fundoQuiz')
        .setDepth(20)
        .setDisplaySize(largura, altura)
        .setVisible(false);

        this.apresentador = this.add.sprite(largura * 0.75, altura * 0.351, 'apresentadorFala')
        .setDepth(35)
        .setVisible(false);
        this.apresentador.setScale((altura * 0.25) / this.apresentador.height);
        
        this.criarAnimacoes();

        // Elementos visuais da área de perguntas
        this.caixaPergunta = this.add.image(largura * 0.27, altura * 0.23, 'caixaPerguntas')
        .setDepth(21)
        .setScale(1.25)
        .setVisible(false);

        this.textoPergunta = this.add.text(largura * 0.28, altura * 0.25, "", { 
            fontSize: '20px', fill: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: 400 } 
        }).setOrigin(0.5).setDepth(22).setVisible(false);

        // Painel superior para mostrar o progresso do jogador
        this.textoHUD = this.add.text(largura * 0.40, altura * 0.075, "", { 
            fontSize: '22px', fill: '#ffffff', fontStyle: 'bold' 
        }).setDepth(25)
        .setVisible(false);

        // Inicialização das listas de objetos para as respostas
        this.caixasResposta = [];
        this.textosResposta = [];
        const posicoesY = [0.45, 0.57, 0.69, 0.81];
        
        for (let i = 0; i < 4; i++) {
            let caixaRespostaImg = this.add.image(largura * 0.27, altura * posicoesY[i], `respostaAzul${i+1}`)
            .setDepth(21)
            .setScale(1.1)
            .setVisible(false);
            let textoOpcao = this.add.text(largura * 0.27, altura * posicoesY[i], "", { 
                fontSize: '16px', fill: '#ffffff', fontStyle: 'bold' 
            }).setOrigin(0.5)
            .setDepth(22)
            .setVisible(false);
            this.caixasResposta.push(caixaRespostaImg);
            this.textosResposta.push(textoOpcao);
        }

        // --- COMPONENTES DAS INSTRUÇÕES INICIAIS ---
        this.tutorialFundo = this.add.image(largura/2, altura/2, 'tutorial').setDepth(10).setDisplaySize(largura, altura).setVisible(false);
        this.tituloTutorial = this.add.text(largura/2, altura * 0.25, "ACESSO NEGADO", { 
            fontSize: '48px', fill: '#ff3b3b', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6 
        }).setOrigin(0.5).setDepth(11).setVisible(false);
        
        this.textoTutorial = this.add.text(largura/2, altura * 0.50, "", { 
            fontSize: '28px', fill: '#ffffff', align: 'center', wordWrap: { width: largura * 0.7 } 
        }).setOrigin(0.5).setDepth(11).setVisible(false);
        
        this.btnIniciarQuiz = this.add.image(largura/2, altura * 0.75, 'iniciarQuiz').setDepth(12).setScale(1.2).setVisible(false).setInteractive({ useHandCursor: true });

        // --- EVENTOS DE INTERAÇÃO (CLIQUES) ---
        // Aciona o início do quiz após as instruções
        this.btnIniciarQuiz.on('pointerdown', () => {
            this.quizAtivo = true;
            this.perguntaAtual = 0;
            this.acertos = 0; 
            this.iconeInteracao.setVisible(false);
            this.tutorialFundo.setVisible(false); 
            this.tituloTutorial.setVisible(false);
            this.textoTutorial.setVisible(false);
            this.btnIniciarQuiz.setVisible(false);
            this.fundoQuizHUD.setVisible(true);
            this.caixaPergunta.setVisible(true); 
            this.apresentador.setVisible(true); 
            this.textoHUD.setVisible(true);
            this.retanguloAvancarTutorial.destroy();
            // Embaralha o array para que o quiz seja diferente a cada tentativa
            Phaser.Utils.Array.Shuffle(this.quizDados);
            this.carregarQuestao();
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });
        });

        // Aciona as instruções ao interagir com o Totem no cenário
        this.btnInteracao.on('pointerdown', () => {
            this.esconderControles(); 
            this.tutorialFundo.setVisible(true); 
            this.tituloTutorial.setVisible(true);
            this.textoTutorial.setVisible(true).setText("");
            this.retanguloAvancarTutorial = this.add.rectangle(largura/2, altura/2, largura, altura, 0x000000, 0).setInteractive();

            let i = 0;
            const mensagemTutorial = "PARA LIBERAR O ACESSO AO SISTEMA DO METRÔ,\n\n VOCÊ PRECISA PROVAR SEU CONHECIMENTO.\n\nRESPONDA ÀS PERGUNTAS SOBRE O METRÔ\n\n PARA DESBLOQUEAR O ACESSO.";
            this.escritaTutorial = this.time.addEvent({
                delay: 40, repeat: mensagemTutorial.length - 1,
                callback: () => {
                    this.textoTutorial.text += mensagemTutorial[i]; i++;
                    if (i === mensagemTutorial.length) this.btnIniciarQuiz.setVisible(true);
                }
            });

            this.retanguloAvancarTutorial.once('pointerdown', () => {
                this.escritaTutorial.remove();
                this.textoTutorial.text = mensagemTutorial;
                this.btnIniciarQuiz.setVisible(true);
                this.retanguloAvancarTutorial.destroy();
            });

            this.physics.pause(); 
            this.jogador.setVisible(false); 
            this.btnInteracao.setVisible(false);
            
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });
        });
    }

    // Gerencia a ocultação dos controles de movimento na interface
    esconderControles() {
        const controleJoystick = this.joystick || (this.scene.get('HUD') && this.scene.get('HUD').joystick);
        if (controleJoystick && controleJoystick.setVisible) controleJoystick.setVisible(false);
        if (this.toggleControls) this.toggleControls(false);
    }

    // Inicialização das animações do personagem (falar, rir e dúvida)
    criarAnimacoes() {
        if (!this.anims.exists('falar')) {
            this.anims.create({
                key: 'falar', 
                frames: this.anims.generateFrameNumbers('apresentadorFala', { start: 0, end: 1 }),
                frameRate: 6, repeat: -1 
            });
        }
        if (!this.anims.exists('rir')) {
            this.anims.create({ 
                key: 'rir', 
                frames: this.anims.generateFrameNumbers('apresentadorRindo', { start: 0, end: 1 }), 
                frameRate: 6, repeat: -1 
            });
        }
        if (!this.anims.exists('duvida')) {
            this.anims.create({ 
                key: 'duvida', 
                frames: this.anims.generateFrameNumbers('apresentadorDuvida', { start: 0, end: 1 }), 
                frameRate: 6, repeat: -1 
            });
        }
    }

    // Função para interromper temporizadores ativos e evitar erros
    limparEventos() {
        this.eventosAtivos.forEach(evento => { if(evento) evento.remove(); });
        this.eventosAtivos = [];
    }

    // Prepara e exibe a pergunta atual com efeito de digitação automática
    carregarQuestao() {
        this.esconderControles();
        this.limparEventos();
        let largura = this.scale.width;
        let altura = this.scale.height;
        let retanguloAvancarPergunta = this.add.rectangle(largura/2, altura/2, largura, altura, 0x000000, 0).setInteractive();
        const dadosQuestao = this.quizDados[this.perguntaAtual];
        
        this.textoHUD.setText(`QUESTÃO: ${this.perguntaAtual + 1}/${this.quizDados.length} | ACERTOS: ${this.acertos}`);

        this.apresentador.setTexture('apresentadorFala');
        this.textoPergunta.setText("").setVisible(true);
        this.apresentador.play('falar');
        
        this.caixasResposta.forEach((caixaRespostaImg, i) => {
            caixaRespostaImg.setTexture(`respostaAzul${i+1}`).setVisible(false).disableInteractive();
            this.textosResposta[i].setVisible(false).setText("");
        });

        let i = 0;
        let eventoDigitacao = this.time.addEvent({
            delay: 40, repeat: dadosQuestao.pergunta.length - 1,
            callback: () => {
                this.textoPergunta.text += dadosQuestao.pergunta[i]; i++;
                if (i === dadosQuestao.pergunta.length) {
                    this.apresentador.stop(); 
                    this.apresentador.setFrame(0);
                    retanguloAvancarPergunta.destroy();
                    this.escreverRespostas(dadosQuestao.respostas);
                }
            }
        });

        this.pularQuestao = true;

        retanguloAvancarPergunta.once('pointerdown', () => {
            eventoDigitacao.remove();
            retanguloAvancarPergunta.destroy();
            this.textoPergunta.text = dadosQuestao.pergunta;
            if (this.pularQuestao === true){
                this.apresentador.stop(); 
                this.apresentador.setFrame(0);
                this.escreverRespostas(dadosQuestao.respostas);
            } 
            this.pularQuestao = false;
        });
        
        this.eventosAtivos.push(eventoDigitacao);
    }

    // Exibe as opções de resposta de forma sequencial na tela
    escreverRespostas(respostas) {
        let index = 0;
        let largura = this.scale.width;
        let altura = this.scale.height;
        let retanguloAvancarResposta = this.add.rectangle(largura/2, altura/2, largura, altura, 0x000000, 0).setInteractive();
        let eventoDigitacaoAtual; 
        let pularAnimacao = true;

        const finalizarAnimacao = () => {
            if (pularAnimacao === false) return;
            if (eventoDigitacaoAtual) eventoDigitacaoAtual.remove();
            for (let i = 0; i < respostas.length; i++) {
                if(this.caixasResposta[i]) this.caixasResposta[i].setVisible(true);
                if(this.textosResposta[i]) {
                    this.textosResposta[i].setVisible(true);
                    this.textosResposta[i].setText(respostas[i]); 
                }
            }
            if (this.apresentador) {
                this.apresentador.stop(); 
                this.apresentador.setFrame(0);
            }
            retanguloAvancarResposta.destroy();
            this.ativarCliques();
            pularAnimacao = false;
        };

        const proxima = () => {
            if (index >= respostas.length) { 
                finalizarAnimacao(); 
                return; 
            } 
            this.caixasResposta[index].setVisible(true);
            this.textosResposta[index].setVisible(true);
            
            let i = 0;
            eventoDigitacaoAtual = this.time.addEvent({
                delay: 20, 
                repeat: respostas[index].length - 1,
                callback: () => {
                    this.textosResposta[index].text += respostas[index][i]; 
                    i++;
                    
                    // Quando terminar de digitar a resposta atual, vai para a próxima
                    if (i === respostas[index].length) { 
                        index++; 
                        proxima(); 
                    }
                }
            });
            this.eventosAtivos.push(eventoDigitacaoAtual);
        };
        retanguloAvancarResposta.once('pointerdown', () => {
            finalizarAnimacao();
        });
        proxima();
    }

    // Habilita a interatividade das respostas e verifica a escolha do jogador
    ativarCliques() {
        const dadosQuestao = this.quizDados[this.perguntaAtual];
        this.caixasResposta.forEach((caixa, index) => {
            caixa.setInteractive({ useHandCursor: true });
            caixa.off('pointerdown');
            caixa.on('pointerdown', () => {
                let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
                this.sound.play('click', { volume: volEfeitosAtual });
                this.caixasResposta.forEach(c => c.disableInteractive());
                if (index === dadosQuestao.correta) {
                    this.acertos++; 
                    caixa.setTexture(`respostaVerde${index + 1}`);
                    this.reagir('rir');
                } else {
                    caixa.setTexture(`respostaVermelho${index + 1}`);
                    this.reagir('duvida');
                }
            });
        });
    }

    // Gerencia a reação do personagem e a mudança entre as perguntas
    reagir(chaveAnim) {
        this.apresentador.stop();
        this.apresentador.play(chaveAnim);

        this.time.delayedCall(500, () => {
            this.perguntaAtual++;

            if (this.perguntaAtual < this.quizDados.length) {
                this.carregarQuestao();
            } else {

                // Validação final da pontuação para aprovação (mínimo de 6 acertos)
                const aprovado = (this.acertos >= 6);

                if (aprovado) {
                    this.apresentador.stop();
                    this.apresentador.play("rir");
                    this.textoPergunta.setText(`APROVADO! ${this.acertos} ACERTOS.\nACESSO LIBERADO AO CCO.`);
                    this.textoHUD.setVisible(false);
                    this.musicaFundoConhecimento.destroy();
                    this.registry.set('desbloquearBadgeSeg', false);
                    this.registry.set('desbloquearBadgeCid', false);
                    this.registry.set('desbloquearBadgeOrd', false);
                    this.registry.set('desbloquearBadgeCon', true);
                    this.time.delayedCall(2000, () => {
                        // Esconde TODA a interface do minijogo para liberar a visão
                        this.fundoQuizHUD.setVisible(false);
                        this.caixaPergunta.setVisible(false);
                        this.textoPergunta.setVisible(false);
                        this.apresentador.setVisible(false);
                        this.caixasResposta.forEach(caixaRespostaImg => caixaRespostaImg.setVisible(false));
                        this.textosResposta.forEach(textoOpcao => textoOpcao.setVisible(false));
                        
                        // Agora sim, com a tela limpa, chamamos a Badge!
                        this.conquistaBadge();
                    });
                } else {
                    this.apresentador.stop();
                    this.apresentador.play("duvida");
                    this.textoPergunta.setText(`REPROVADO! ${this.acertos}/8 ACERTOS.\nVOCÊ PRECISA DE 75% (6 ACERTOS).\nREINICIANDO...`);
                    
                    this.time.delayedCall(3000, () => {
                        this.perguntaAtual = 0;
                        this.acertos = 0;
                        this.carregarQuestao();
                    });
                }
            }
        });
    }

    update() {
        super.update();
        
        // Mantém controles ocultos durante menus e o minijogo
        if (this.quizAtivo || this.tutorialFundo.visible) {
            this.esconderControles();
            return; 
        }

        // Sistema para detectar a distância e ativar a interação com o totem
        let distanciaTotem = Phaser.Math.Distance.Between(this.jogador.x, this.jogador.y, this.posicaoTotem.x, this.posicaoTotem.y);
        if (distanciaTotem < this.scale.width * 0.15) {
            if (!this.interacaoEmAndamento) {
                this.btnInteracao.setVisible(true);
                this.iconeInteracao.setVisible(true);
                this.interacaoEmAndamento = true; 
            }

        } else {
            if (this.interacaoEmAndamento) { 
                this.btnInteracao.setVisible(false); 
                this.iconeInteracao.setVisible(false);
                this.interacaoEmAndamento = false; 
            }
        }
    }
}

export default Conhecimento;