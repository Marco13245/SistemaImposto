window.addEventListener('load', function() {
    var retangulo = document.getElementById('RetanguloLogin2');
    retangulo.classList.remove('movendo'); // Remove a classe que movimenta o retângulo para sua posição original
    retangulo.classList.add('visible'); // Adiciona a classe que torna o retângulo visível gradualmente
    
    // Torna os elementos dentro do retângulo gradualmente visíveis
    var elementos = retangulo.querySelectorAll('#H1Entrar, #linha, #foto, #login, #inp1, #inp2, .btn, #npc');
    elementos.forEach(function(elemento) {
        elemento.style.animation = 'fadeIn 1s forwards';
    });
});
