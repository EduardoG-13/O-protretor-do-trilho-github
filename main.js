// Configuração inicial do game utilizando o framwork do Phaser, local onde se configura as dimensões, resources extras como física e as cenas.

// Importamos as classes responsáveis nas quais são configuradas as cenas para chamá-las no parâmetro 'scene' em config
import TelaInicial from './scenes/tela-inicial.js';
import SelecaoPersonagem from './scenes/selecao-personagem.js';
import Bilheteria from './scenes/bilheteria.js';
import Escada from './scenes/escada.js';
import FaixaAmarela from './scenes/faixa-amarela.js';
import EstacaoLuz from './scenes/estacaoluz.js';
import Cidadania from './scenes/cidadania.js';
import EstacaoSe from './scenes/estacaose.js';
import ComercioIlegal from './scenes/comercio-ilegal.js';
import EstacaoLiberdade from './scenes/estacaoliberdade.js';
import Conhecimento from './scenes/conhecimento.js';

// Configuração básica Phaser
var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: 1280, // Configura a largura do jogo para ocupar toda a largura da janela do navegador
        height: 720
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }, // Gravidade para o jogo de plataforma
            debug: false // Ativa o modo de depuração para visualizar as caixas de colisão e outros elementos de física, útil para desenvolvimento, mas deve ser desativado para produção.
        }
    },

    render: {
        pixelArt: true // Importante para os  sprites não ficarem borrados
    },

    dom: {
        createContainer: true
    },

    // Definição das cenas
    scene: [TelaInicial, SelecaoPersonagem, Bilheteria, Escada, FaixaAmarela, Cidadania, EstacaoLuz, EstacaoSe, ComercioIlegal, EstacaoLiberdade, Conhecimento]
};

// Cria uma nova instância do jogo usando a classe do framework Phaser, além de utilizar o objeto config como parâmetro do game. Essa linha inicializa o jogo.
// Instância é gerenciada internamente pelo framework, sem necessidade de ser referenciada
var game = new Phaser.Game(config);
