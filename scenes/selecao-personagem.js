/*
SelecaoPersonagem.js - Cena de seleção de personagem
Objetivo: Permitir que o jogador escolha um nome e um avatar para seu personagem antes de iniciar o jogo
*/
import BaseScene from './base-scene.js'

class SelecaoPersonagem extends BaseScene {
    constructor() {
        super('SelecaoPersonagem');
    }

    preload() {
        this.load.image('molduraAvatar', './assets/Object/moldura-personagem.png');
        this.load.image('interfaceEscolha', './assets/Object/escolha-personagem.png');
        this.load.image('botaoCadastro', './assets/Botoes/botaocadastro.png');
        this.load.image('avatar1', './assets/Player/agenteFrenteM.png');
        this.load.image('avatar2', './assets/Player/agenteFrente.png');

        this.load.audio('trilhaFundoMenuPerso', './assets/Sons/menustart.mp3');  
        this.load.audio('click', './assets/Sons/click.wav');     
    }

    create() {
        // Inicializa variáveis para o teclado
        this.nomeAgente = ""; // Armazena o nome do jogador
        this.tecladoGrupo = this.add.container(0, 0).setDepth(1000); // Grupo para organizar as teclas
        this.tecladoAberto = false;
        this.avatarSelecionado = null;
        this.placeholderNome = "Inserir Nome do Agente";

        let volMusicaAtual = this.registry.get('volMusica') ?? 1;

        this.musicaFundoMenuPerso = this.sound.add('trilhaFundoMenuPerso', {
            volume: volMusicaAtual,
            loop: true
        });

        this.musicaFundoMenuPerso.play();

        this.cameras.main.fadeIn(1500, 0, 0, 0);

        // tamanhos da tela usados para responsividade
        let largura = this.scale.width;
        let altura = this.scale.height;
        let centroX = this.cameras.main.centerX; // Responsividade utilizando o centro da tela
        let centroY = this.cameras.main.centerY;

        this.fundoCor = this.add.rectangle(centroX, centroY, largura, altura, 0x1E90FF);
        this.fundoEscuro = this.add.rectangle(centroX, centroY, largura, altura, 0x000000, 0.4);

        this.add.image(largura / 2, altura / 2, 'interfaceEscolha').setScale(0.85);

        //Textos para registro do nome e escolha do avatar
        this.txtTitulo = this.add.text(centroX - 230, centroY - 210, "Registro de Novo Agente", { fontSize: '42px', fontFamily: 'Pixel', color: '#ffffff' });    
        this.txtNome = this.add.text(centroX - 170 , centroY - 130, "Inserir Nome do Agente", { fontSize: '32px', fontFamily: 'Pixel', color: '#000000' });
        this.txtAvatar = this.add.text(centroX  - 150 , centroY - 75, "Selecione seu Avatar:", { fontSize: '32px', fontFamily: 'Pixel', color: '#ffffff' });


        this.txtErro = this.add.text(
            centroX - 170,
            centroY + 245,
            "",
            {
                fontSize: '20px',
                fontFamily: 'Pixel',
                color: '#ff4d4d',
                backgroundColor: '#2b0000',
                padding: { x: 8, y: 6 }
            }
        ).setVisible(false);

        const larguraCampo = 420;
        const alturaCampo = 70;

        // Área invisível constante para abrir o teclado, independe do texto exibido.
        this.areaNome = this.add.rectangle(
            centroX + 10,
            centroY - 115,
            larguraCampo,
            alturaCampo,
            0x000000,
            0
        ).setInteractive();

        this.areaNome.on('pointerdown', () => {
            if (this.tecladoAberto) return;

            if (!this.nomeAgente) {
                this.txtNome.setText("");
            }

            this.limparErro();

            this.btnCad.disableInteractive();
            this.btnAvatar2.disableInteractive();
            this.btnAvatar1.disableInteractive();

            this.tecladoAberto = true;
            this.mostrarTeclado();
        });

        // Botões de seleção de avatar e cadastro
        this.moldura = this.add.image(centroX - 15, centroY + 30, 'molduraAvatar');
        this.btnAvatar1 = this.add.image(centroX - 135 , centroY + 55 , 'avatar1').setScale(2.2).setInteractive();
        this.btnAvatar2 = this.add.image(centroX + 160 , centroY + 50 , 'avatar2').setScale(2.2).setInteractive();
        this.btnCad = this.add.image(centroX + 15, centroY + 200 , "botaoCadastro").setScale(0.23).setInteractive();


        this.btnCad.on('pointerdown', () => {
            if (!this.validarFormulario()) {
                return;
            }

            this.tweens.add({
                targets: this.btnCad,
                scale: 0.3,
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
                this.scene.start('Bilheteria', {
                    nomeAgente: this.nomeAgente
                });
                this.musicaFundoMenuPerso.destroy();
            });
        });
        
        this.btnAvatar2.on('pointerdown', () => { 
            this.avatarSelecionado = 1;         
            this.registry.set('char_selection', 1);    
            
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });
            
            // Animação elástica de seleção: avatar escolhido aumenta, o outro retorna ao tamanho padrão.
            this.tweens.add({
                targets: this.btnAvatar2,
                scale: 2.8,              
                duration: 300,          
                ease: 'Back.out'         
            });

            this.tweens.add({
                targets: this.btnAvatar1,
                scale: 2.2,
                duration: 150,
                ease: 'Power2'
            });
        });

        this.btnAvatar1.on('pointerdown', () => {  
            this.avatarSelecionado = 0;        // Define o avatar selecionado
            this.registry.set('char_selection', 0);     // Registrar o valor "0" no char_selection
            
            let volEfeitosAtual = this.registry.get('volEfeitos') ?? 1;
            this.sound.play('click', { volume: volEfeitosAtual });

            // Anima o avatar 1 INCHANDO de forma elástica
            this.tweens.add({
                targets: this.btnAvatar1,
                scale: 2.8,
                duration: 300,
                ease: 'Back.out'
            });
            // Murcha o Avatar 2 de volta pro tamanho normal, perdendo "o destaque"
            this.tweens.add({
                targets: this.btnAvatar2,
                scale: 2.2,
                duration: 150,
                ease: 'Power2'
            });
        });
        
    }

    update() {
        
    }

    // Método para mostrar teclado 
    mostrarTeclado() {
        const letras = "QWERTYUIOPASDFGHJKLÇZXCVBNM".split("");
        const colunas = 10;

        // Centraliza horizontalmente
        const larguraTela = this.scale.width;
        const xInicial = (larguraTela - (colunas * 50)) / 2;

        // Posiciona embaixo da tela
        const yInicial = this.scale.height - 200;

        // Dimensões do teclado
        const larguraTeclado = colunas * 50; 
        const linhasTeclado = Math.ceil(letras.length / colunas); 
        const alturaTeclado = linhasTeclado * 50 + 50; 

        // Caixa azul escura atrás do teclado
        const retanguloFundoTeclado = this.add.rectangle(
            this.scale.width / 2,         
            yInicial + alturaTeclado / 2, 
            larguraTeclado + 20,          
            alturaTeclado,                
            0x0a2f5a                      
        ).setOrigin(0.5)
        .setDepth(100);                 
        this.tecladoGrupo.add(retanguloFundoTeclado); // adiciona ao grupo do teclado
        
        //Cria botões de letras em formato de teclado e adiciona a letra clicada ao nome do agente (até 10 caracteres).
        letras.forEach((letra, index) => {
            const linhaAtual = Math.floor(index / colunas);
            
            // Verifica quantas teclas existem nesta linha específica
            let teclasNestaLinha = colunas;
            if (linhaAtual === linhasTeclado - 1) { 
                teclasNestaLinha = letras.length % colunas;
                if (teclasNestaLinha === 0) teclasNestaLinha = colunas; 
            }

            const offsetCentralizacao = (larguraTeclado - (teclasNestaLinha * 50)) / 2;

            const x = xInicial + offsetCentralizacao + (index % colunas) * 50;
            const y = yInicial + linhaAtual * 50;

            const teclaDoTeclado = this.add.text(x, y + 3, letra, { 
                fontSize: '35px', 
                fontFamily: 'Pixel', 
                color: '#ffffff', 
                backgroundColor: '#1e80e1',
                padding: {
                    x: 6,
                    y: 3
                }
            })
            .setInteractive()
            .on('pointerdown', () => {
                if(this.nomeAgente.length < 10) {
                    this.nomeAgente += letra;
                    this.txtNome.setText(this.nomeAgente);
                }
            });

            this.tecladoGrupo.add(teclaDoTeclado);
        });

        const btnApagar = this.add.text(xInicial, yInicial + 155, "⌫", { 
            fontSize: '25px', 
            fontFamily: 'Pixel', 
            color: '#fff', 
            backgroundColor: 'rgb(30, 114, 183)' 
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.nomeAgente = this.nomeAgente.slice(0, -1);
            this.txtNome.setText(this.nomeAgente || "");
        });
        this.tecladoGrupo.add(btnApagar);

        const btnEnviarNome = this.add.text(xInicial + 410, yInicial + 155, "ENVIAR", { 
            fontSize: '25px', 
            fontFamily: 'Pixel', 
            color: '#fff', 
            backgroundColor: 'rgb(30, 114, 183)' 
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.esconderTeclado();
        });
        this.tecladoGrupo.add(btnEnviarNome);
    }

    //Método para esconder teclado 
    esconderTeclado() {
        if (this.tecladoGrupo) {
            this.tecladoGrupo.removeAll(true);
        }

        this.tecladoAberto = false;

        if (!this.nomeAgente.trim()) {
            this.txtNome.setText(this.placeholderNome);
        }

        this.btnCad.setInteractive();
        this.btnAvatar1.setInteractive();
        this.btnAvatar2.setInteractive();
    }

    validarFormulario() {
        const nomeLimpo = this.nomeAgente.trim();
        
        // SALVAGUARDA DE ENTRADA: 
        // Impede o avanço do jogo com estado incompleto. Garantimos que o jogador
        // possua um nome válido (mín. 3 letras) e um avatar selecionado explícito,
        // evitando falhas de renderização (null exceptions) nas cenas seguintes.
        if (!nomeLimpo) {
            this.mostrarErro("Digite o nome do agente.");
            return false;
        }

        if (nomeLimpo.length < 3) {
            this.mostrarErro("O nome deve ter ao menos 3 letras.");
            return false;
        }

        if (this.avatarSelecionado !== 0 && this.avatarSelecionado !== 1) {
            this.mostrarErro("Selecione um avatar antes de continuar.");
            return false;
        }

        this.nomeAgente = nomeLimpo;
        return true;
    }

    mostrarErro(mensagem) {
        this.txtErro.setText(mensagem);
        this.txtErro.setVisible(true);
    }

    limparErro() {
        this.txtErro.setVisible(false);
        this.txtErro.setText("");
    }
}

export default SelecaoPersonagem;
