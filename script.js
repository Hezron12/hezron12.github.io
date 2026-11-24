// Landing da Samara: entradas das seções e botão fixo do celular.
(() => {
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Entradas: título, depois texto, depois imagem, uma vez por seção ----
  const blocos = document.querySelectorAll('main > section:not(.abertura), .rodape');
  if ('IntersectionObserver' in window && !calmo) {
    blocos.forEach((s) => {
      const partes = s.querySelectorAll('h2, h3, p, li, .botao, .carta-moldura, details, .inclui, .prazo__opcao');
      let i = 0;
      partes.forEach((p) => {
        if (p.closest('.inclui') && p !== p.closest('.inclui')) return; // o bloco entra inteiro
        if (p.closest('.prazo__opcao') && p !== p.closest('.prazo__opcao')) return;
        if (p.closest('li') && p !== p.closest('li')) return;
        if (p.closest('details') && p !== p.closest('details')) return;
        p.classList.add('entra');
        p.style.setProperty('--atraso', `${Math.min(i++, 8) * 70}ms`);
      });
    });
    const io = new IntersectionObserver((itens) => {
      for (const it of itens) if (it.isIntersecting) { it.target.classList.add('dentro'); io.unobserve(it.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.entra').forEach((e) => io.observe(e));
    // um salto de rolagem (âncora do menu) pode pular a seção: o que já passou também entra
    let pendente = false;
    addEventListener('scroll', () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => {
        for (const e of document.querySelectorAll('.entra:not(.dentro)')) {
          if (e.getBoundingClientRect().top < innerHeight) { e.classList.add('dentro'); io.unobserve(e); }
        }
        pendente = false;
      });
    }, { passive: true });
  }

  // ---- O Louco da abertura acompanha a rolagem, devagar ----
  const louco = document.querySelector('.abertura .carta');
  if (louco && !calmo) {
    let pedido = false;
    addEventListener('scroll', () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, innerHeight);
        louco.style.translate = `0 ${(y * 0.12).toFixed(1)}px`;
        louco.style.rotate = `${(y * 0.004).toFixed(2)}deg`;
        pedido = false;
      });
    }, { passive: true });
  }

  // ---- Botão fixo do celular: aparece depois do botão da abertura, some perto de outro botão ----
  const fixo = document.querySelector('.cta-fixo');
  const primeiro = document.querySelector('.abertura .botao');
  if (fixo && primeiro && 'IntersectionObserver' in window) {
    fixo.classList.add('escondido');
    const visiveis = new Set();
    let passou = false;
    let descendo = false, ultimo = scrollY;
    addEventListener('scroll', () => { const y = scrollY; if (Math.abs(y - ultimo) > 6) { descendo = y > ultimo; ultimo = y; atualizar(); } }, { passive: true });
    const atualizar = () => fixo.classList.toggle('escondido', !passou || descendo || visiveis.size > 0);
    new IntersectionObserver(([i]) => { passou = !i.isIntersecting && i.boundingClientRect.top < 0; atualizar(); }).observe(primeiro);
    const io = new IntersectionObserver((itens) => {
      for (const i of itens) i.isIntersecting ? visiveis.add(i.target) : visiveis.delete(i.target);
      atualizar();
    });
    document.querySelectorAll('main .botao').forEach((a) => io.observe(a));
  }
})();

// Botões cujo texto quebra em duas linhas: o navegador deixa a caixa na largura toda.
// Aqui a caixa é ajustada à linha mais longa, para o botão ficar do tamanho do texto.
(() => {
  const ajustar = () => {
    document.querySelectorAll('.botao span').forEach((s) => {
      s.style.width = '';
      const linhas = [...document.createRange && (() => { const r = document.createRange(); r.selectNodeContents(s); return r.getClientRects(); })()];
      if (linhas.length < 2) return;
      const largura = Math.max(...linhas.map((l) => l.width));
      s.style.width = Math.ceil(largura) + 1 + 'px';
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar); else ajustar();
  addEventListener('resize', ajustar);
})();
