# AUbum da Copa 2026 - Frontend

App Angular do AUbum da Copa, um album digital de figurinhas da Copa do Mundo
2026 com secao de repetidas, tema Brasil e o mascote AUbum (um golden retriever).
Segue o mesmo padrao do finanzze-front (Angular 19 + Material + Clean
Architecture com domain/infra/views + guards).

## Stack

- Angular 19
- Angular Material
- SCSS / animacoes customizadas
- Arquitetura: domain (dto/gateway) + infra (service) + guards + views + components

## Rotas

- `/` - home publica (login + cadastro com mascote animado)
- `/album` - grid interativo das figurinhas (clique = marcar, clique 2x = repetida, botao direito = reduzir)
- `/repetidas` - lista de figurinhas em excesso
- `/perfil` - dados do usuario, estatisticas e reset do album

## Variaveis de ambiente

Arquivo `src/environments/environment.ts`:

```
apiUrl: 'http://localhost:3000/api'
```

## Rodando

```
npm install
npm start     # http://localhost:4200
npm run build
```

## Tema Brasil

Paleta:

- verde `#009739`
- amarelo `#FFDF00`
- azul `#002776`
- branco

Animacoes globais: `aubumBounce`, `aubumWag`, `aubumGlow`, `aubumConfetti`,
`aubumStickerFlip`, `aubumPulse`, `aubumLettersDance`, `aubumGradientShift`.

## Mascote

A foto PNG do mascote (golden retriever) vive em `public/assets/aubum.png`. Ela
aparece em:

- Hero da home com balao de fala rotativo
- Loader (cachorro "saltitando")
- Navbar (logo animado)
- Album com balao de fala a cada interacao
- Repetidas
- Perfil
