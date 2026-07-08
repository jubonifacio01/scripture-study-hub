import type { Journey } from "./journeys";

export const JOURNEYS: Journey[] = [
  {
    id: "davi",
    title: "A Vida de Davi",
    description: "Do pastoreio de ovelhas ao trono de Israel.",
    accent: "#8B9A6B",
    chapters: [
      {
        id: "davi-pastor",
        title: "Pastor",
        sessions: [
          {
            id: "davi-pastor-1",
            title: "O jovem entre as ovelhas",
            intro:
              "Antes de enfrentar Golias, Davi já demonstrava profunda confiança em Jeová enquanto cuidava das ovelhas. No silêncio dos campos, aprendeu que o Senhor era seu pastor.",
            texts: [
              {
                id: "davi-pastor-1-t1",
                title: "O Senhor é meu pastor",
                book: "Salmos",
                chapter: 23,
                verse: "1",
                text: "O Senhor é o meu pastor, nada me faltará.",
                category: "Confiança",
                tags: ["confiança", "provisão"],
              },
            ],
            characters: ["Davi"],
            events: ["Pastoreio das ovelhas"],
            references: ["Salmos 23:1"],
            memorized: "O Senhor é o meu pastor, nada me faltará.",
          },
        ],
      },
      {
        id: "davi-samuel",
        title: "Samuel",
        sessions: [
          {
            id: "davi-samuel-1",
            title: "A unção de Davi",
            intro:
              "Deus não olha o que o homem olha. Enquanto Samuel avaliava os irmãos mais velhos, Jeová escolheu o caçula — um segundo após o coração.",
            texts: [
              {
                id: "davi-samuel-1-t1",
                title: "Deus vê o coração",
                book: "1 Samuel",
                chapter: 16,
                verse: "7",
                text: "O homem vê o que está diante dos olhos, porém Jeová vê o coração.",
                category: "Escolha",
                tags: ["coração", "unção"],
              },
            ],
            characters: ["Davi", "Samuel"],
            events: ["Unção de Davi"],
            references: ["1 Samuel 16:7"],
            memorized: "O homem vê o que está diante dos olhos, porém Jeová vê o coração.",
          },
        ],
      },
      {
        id: "davi-golias",
        title: "Golias",
        sessions: [
          {
            id: "davi-golias-1",
            title: "O desafio do gigante",
            intro:
              "Quarenta dias. Foi o tempo que Golias desafiou Israel. Nenhum soldado se apresentou. Mas um jovem que trazia pão aos irmãos ouviu, e não suportou a afronta.",
            texts: [
              {
                id: "davi-golias-1-t1",
                title: "Em nome de Jeová",
                book: "1 Samuel",
                chapter: 17,
                verse: "45",
                text: "Tu vens a mim com espada e lança, mas eu venho a ti em nome de Jeová dos Exércitos.",
                category: "Coragem",
                tags: ["coragem", "fé"],
              },
            ],
            characters: ["Davi", "Golias"],
            events: ["Confronto com Golias"],
            references: ["1 Samuel 17:45"],
            memorized: "Tu vens a mim com espada e lança, mas eu venho a ti em nome de Jeová dos Exércitos.",
          },
        ],
      },
      {
        id: "davi-saul",
        title: "Saul",
        sessions: [
          {
            id: "davi-saul-1",
            title: "Poupando o perseguidor",
            intro:
              "Saul perseguia Davi com ciúme. Mas quando Davi teve a chance de matá-lo numa caverna, escolheu poupar-lhe a vida. Respeito pelo ungido de Deus.",
            texts: [
              {
                id: "davi-saul-1-t1",
                title: "Não estenderei a mão",
                book: "1 Samuel",
                chapter: 24,
                verse: "6",
                text: "Não estenderei a mão contra o meu senhor, pois é o ungido de Jeová.",
                category: "Respeito",
                tags: ["respeito", "misericórdia"],
              },
            ],
            characters: ["Davi", "Saul"],
            events: ["Davi poupa Saul na caverna"],
            references: ["1 Samuel 24:6"],
            memorized: "Não estenderei a mão contra o meu senhor, pois é o ungido de Jeová.",
          },
        ],
      },
      {
        id: "davi-deserto",
        title: "Deserto",
        sessions: [
          {
            id: "davi-deserto-1",
            title: "Refúgio nas cavernas",
            intro:
              "No deserto, Davi encontrou força que não vinha de armas nem de homens. Encontrou em Jeová o seu refúgio e a sua fortaleza.",
            texts: [
              {
                id: "davi-deserto-1-t1",
                title: "Jeová é meu refúgio",
                book: "Salmos",
                chapter: 18,
                verse: "2",
                text: "Jeová é a minha rocha, a minha fortaleza e o meu libertador.",
                category: "Refúgio",
                tags: ["refúgio", "força"],
              },
            ],
            characters: ["Davi"],
            events: ["Fuga no deserto"],
            references: ["Salmos 18:2"],
            memorized: "Jeová é a minha rocha, a minha fortaleza e o meu libertador.",
          },
        ],
      },
      {
        id: "davi-rei",
        title: "Rei",
        sessions: [
          {
            id: "davi-rei-1",
            title: "Sobre o trono",
            intro:
              "Após anos de espera, Davi finalmente assumiu o trono. Mas sabia que a verdadeira casa não era de pedras — era o coração que desejava construir para Deus.",
            texts: [
              {
                id: "davi-rei-1-t1",
                title: "Casa para Deus",
                book: "2 Samuel",
                chapter: 7,
                verse: "2",
                text: "Veja, eu moro em casa de cedro, enquanto a arca de Deus permanece numa tenda.",
                category: "Propósito",
                tags: ["casa", "propósito"],
              },
            ],
            characters: ["Davi", "Natã"],
            events: ["Davi deseja construir o templo"],
            references: ["2 Samuel 7:2"],
            memorized: "Veja, eu moro em casa de cedro, enquanto a arca de Deus permanece numa tenda.",
          },
        ],
      },
      {
        id: "davi-ultimos",
        title: "Últimos anos",
        sessions: [
          {
            id: "davi-ultimos-1",
            title: "Coração arrependido",
            intro:
              "Mesmo nos últimos anos, Davi cometeu erros graves. Mas soube reconhecer, arrepender-se e voltar. Seu coração sempre pôde voltar para Deus.",
            texts: [
              {
                id: "davi-ultimos-1-t1",
                title: "Cria em mim um coração puro",
                book: "Salmos",
                chapter: 51,
                verse: "10",
                text: "Cria em mim, ó Deus, um coração puro, e renova dentro de mim um espírito reto.",
                category: "Arrependimento",
                tags: ["arrependimento", "coração"],
              },
            ],
            characters: ["Davi"],
            events: ["Arrependimento de Davi"],
            references: ["Salmos 51:10"],
            memorized: "Cria em mim, ó Deus, um coração puro, e renova dentro de mim um espírito reto.",
          },
        ],
      },
    ],
  },
  {
    id: "jose",
    title: "A Vida de José",
    description: "Da cisterna ao palácio, a providência em cada passo.",
    accent: "#C89B3C",
    chapters: [
      {
        id: "jose-sonhos",
        title: "Sonhos",
        sessions: [
          {
            id: "jose-sonhos-1",
            title: "O sonho do jovem",
            intro:
              "José sonhou com feixes e estrelas. Os irmãos não entenderam — ou entenderam demais. O ciúme começou a crescer.",
            texts: [
              {
                id: "jose-sonhos-1-t1",
                title: "Os feixes se curvam",
                book: "Gênesis",
                chapter: 37,
                verse: "7",
                text: "Eis que os feixes se curvavam diante do meu feixe, que estava de pé.",
                category: "Sonhos",
                tags: ["sonhos", "ciúme"],
              },
            ],
            characters: ["José", "Irmãos de José"],
            events: ["Sonhos de José"],
            references: ["Gênesis 37:7"],
            memorized: "Eis que os feixes se curvavam diante do meu feixe, que estava de pé.",
          },
        ],
      },
      {
        id: "jose-cisterna",
        title: "Cisterna",
        sessions: [
          {
            id: "jose-cisterna-1",
            title: "Traído pelos irmãos",
            intro:
              "A túnica colorida foi arrancada. A cisterna foi fria. Mas Deus não havia abandonado José — apenas começava a tecer a sua história.",
            texts: [
              {
                id: "jose-cisterna-1-t1",
                title: "Vendido pelos irmãos",
                book: "Gênesis",
                chapter: 37,
                verse: "28",
                text: "Passaram mercadores midianitas e tiraram José da cisterna, e o venderam por vinte peças de prata.",
                category: "Traição",
                tags: ["traição", "providência"],
              },
            ],
            characters: ["José", "Irmãos de José"],
            events: ["José é vendido"],
            references: ["Gênesis 37:28"],
            memorized: "Passaram mercadores midianitas e tiraram José da cisterna, e o venderam por vinte peças de prata.",
          },
        ],
      },
      {
        id: "jose-egito",
        title: "Egito",
        sessions: [
          {
            id: "jose-egito-1",
            title: "Fiel na casa de Potifar",
            intro:
              "Longe de casa, José escolheu ser fiel. Mesmo quando a tentação veio, mesmo quando a prisão chegou, não abandonou seus princípios.",
            texts: [
              {
                id: "jose-egito-1-t1",
                title: "Como faria este grande mal?",
                book: "Gênesis",
                chapter: 39,
                verse: "9",
                text: "Como pois faria eu este grande mal, e pecaria contra Deus?",
                category: "Fidelidade",
                tags: ["fidelidade", "tentação"],
              },
            ],
            characters: ["José", "Potifar"],
            events: ["José na casa de Potifar"],
            references: ["Gênesis 39:9"],
            memorized: "Como pois faria eu este grande mal, e pecaria contra Deus?",
          },
        ],
      },
      {
        id: "jose-palacio",
        title: "Palácio",
        sessions: [
          {
            id: "jose-palacio-1",
            title: "Governador do Egito",
            intro:
              "Da prisão ao palácio. Os sonhos do faraó foram interpretados, e José — esquecido por todos — foi lembrado por Deus.",
            texts: [
              {
                id: "jose-palacio-1-t1",
                title: "Deus me fez pai do faraó",
                book: "Gênesis",
                chapter: 45,
                verse: "8",
                text: "Deus me fez pai do faraó, senhor de toda a sua casa e governador de todo o Egito.",
                category: "Providência",
                tags: ["providência", "exaltação"],
              },
            ],
            characters: ["José", "Faraó"],
            events: ["José governa o Egito"],
            references: ["Gênesis 45:8"],
            memorized: "Deus me fez pai do faraó, senhor de toda a sua casa e governador de todo o Egito.",
          },
        ],
      },
    ],
  },
  {
    id: "moises",
    title: "A Vida de Moisés",
    description: "Da sarça ardente à Terra Prometida.",
    accent: "#4A7A8C",
    chapters: [
      {
        id: "moises-sarça",
        title: "Sarça",
        sessions: [
          {
            id: "moises-sarca-1",
            title: "O fogo que não consumia",
            intro:
              "Quarenta anos no deserto apascentando ovelhas. Mas uma sarça ardente mudou tudo. Deus chamou pelo nome.",
            texts: [
              {
                id: "moises-sarca-1-t1",
                title: "Tira as sandálias",
                book: "Êxodo",
                chapter: 3,
                verse: "5",
                text: "Não te aproximes. Tira as sandálias dos pés, porque o lugar em que estás é terra santa.",
                category: "Chamado",
                tags: ["chamado", "santidade"],
              },
            ],
            characters: ["Moisés"],
            events: ["Sarça ardente"],
            references: ["Êxodo 3:5"],
            memorized: "Não te aproximes. Tira as sandálias dos pés, porque o lugar em que estás é terra santa.",
          },
        ],
      },
      {
        id: "moises-pragas",
        title: "Pragas",
        sessions: [
          {
            id: "moises-pragas-1",
            title: "Deixe o meu povo ir",
            intro:
              "Dez pragas. Dez oportunidades para Faraó ceder. A última foi a mais dura — mas foi a que abriu as portas.",
            texts: [
              {
                id: "moises-pragas-1-t1",
                title: "Deixa ir o meu povo",
                book: "Êxodo",
                chapter: 5,
                verse: "1",
                text: "Assim diz Jeová, o Deus de Israel: Deixa ir o meu povo.",
                category: "Libertação",
                tags: ["libertação", "obediência"],
              },
            ],
            characters: ["Moisés", "Faraó"],
            events: ["As dez pragas"],
            references: ["Êxodo 5:1"],
            memorized: "Assim diz Jeová, o Deus de Israel: Deixa ir o meu povo.",
          },
        ],
      },
      {
        id: "moises-mar",
        title: "Mar Vermelho",
        sessions: [
          {
            id: "moises-mar-1",
            title: "O mar se abre",
            intro:
              "O exército atrás. O mar à frente. Parecia o fim. Mas Deus abriu um caminho onde não havia caminho.",
            texts: [
              {
                id: "moises-mar-1-t1",
                title: "Permanecei firmes",
                book: "Êxodo",
                chapter: 14,
                verse: "13",
                text: "Não temais; permanecei firmes e vede a salvação que Jeová vos dará hoje.",
                category: "Fé",
                tags: ["fé", "salvação"],
              },
            ],
            characters: ["Moisés", "Israelitas"],
            events: ["Travessia do Mar Vermelho"],
            references: ["Êxodo 14:13"],
            memorized: "Não temais; permanecei firmes e vede a salvação que Jeová vos dará hoje.",
          },
        ],
      },
    ],
  },
  {
    id: "paulo",
    title: "A Vida de Paulo",
    description: "De perseguidor a apóstolo das nações.",
    accent: "#6B7280",
    chapters: [
      {
        id: "paulo-damasco",
        title: "Damasco",
        sessions: [
          {
            id: "paulo-damasco-1",
            title: "A luz no caminho",
            intro:
              "Perseguidor fervoroso. Mas uma luz no caminho de Damasco mudou tudo. O que ele perseguia era o que ele amaria para sempre.",
            texts: [
              {
                id: "paulo-damasco-1-t1",
                title: "Por que me persegues?",
                book: "Atos",
                chapter: 9,
                verse: "4",
                text: "Saulo, Saulo, por que me persegues?",
                category: "Conversão",
                tags: ["conversão", "chamado"],
              },
            ],
            characters: ["Paulo"],
            events: ["Conversão no caminho de Damasco"],
            references: ["Atos 9:4"],
            memorized: "Saulo, Saulo, por que me persegues?",
          },
        ],
      },
      {
        id: "paulo-viagens",
        title: "Viagens",
        sessions: [
          {
            id: "paulo-viagens-1",
            title: "O apóstolo das nações",
            intro:
              "Três grandes viagens. Cidades, sinagogas, prisões, tempestades. Paulo levou a mensagem para além de toda fronteira.",
            texts: [
              {
                id: "paulo-viagens-1-t1",
                title: "Tudo posso",
                book: "Filipenses",
                chapter: 4,
                verse: "13",
                text: "Posso todas as coisas naquele que me fortalece.",
                category: "Força",
                tags: ["força", "perseverança"],
              },
            ],
            characters: ["Paulo"],
            events: ["Viagens missionárias"],
            references: ["Filipenses 4:13"],
            memorized: "Posso todas as coisas naquele que me fortalece.",
          },
        ],
      },
    ],
  },
  {
    id: "jesus",
    title: "Jesus Cristo",
    description: "O Verbo que se fez carne e habitou entre nós.",
    accent: "#2563EB",
    chapters: [
      {
        id: "jesus-nascimento",
        title: "Nascimento",
        sessions: [
          {
            id: "jesus-nascimento-1",
            title: "A luz do mundo",
            intro:
              "Não nasceu num palácio. Nasceu num estábulo. Mas os céus se abriram e os anjos anunciaram: nasceu o Salvador.",
            texts: [
              {
                id: "jesus-nascimento-1-t1",
                title: "O Verbo se fez carne",
                book: "João",
                chapter: 1,
                verse: "14",
                text: "E o Verbo se fez carne, e habitou entre nós, e vimos a sua glória.",
                category: "Encarnação",
                tags: ["encarnação", "glória"],
              },
            ],
            characters: ["Jesus"],
            events: ["Nascimento de Jesus"],
            references: ["João 1:14"],
            memorized: "E o Verbo se fez carne, e habitou entre nós, e vimos a sua glória.",
          },
        ],
      },
      {
        id: "jesus-ministerio",
        title: "Ministério",
        sessions: [
          {
            id: "jesus-ministerio-1",
            title: "O sermão do monte",
            intro:
              "Subiu ao monte. Sentou-se. E começou a ensinar com autoridade. As palavras que saíram daquela boca mudaram o mundo para sempre.",
            texts: [
              {
                id: "jesus-ministerio-1-t1",
                title: "Bem-aventurados",
                book: "Mateus",
                chapter: 5,
                verse: "3",
                text: "Bem-aventurados os humildes de espírito, porque deles é o reino dos céus.",
                category: "Ensino",
                tags: ["bem-aventuranças", "reino"],
              },
            ],
            characters: ["Jesus", "Multidões"],
            events: ["Sermão do Monte"],
            references: ["Mateus 5:3"],
            memorized: "Bem-aventurados os humildes de espírito, porque deles é o reino dos céus.",
          },
        ],
      },
      {
        id: "jesus-cruz",
        title: "Cruz",
        sessions: [
          {
            id: "jesus-cruz-1",
            title: "O maior amor",
            intro:
              "Tão grande amor. Tão grande sacrifício. Na cruz, Jesus abriu o caminho para que todos pudessem voltar para Deus.",
            texts: [
              {
                id: "jesus-cruz-1-t1",
                title: "Deus amou o mundo",
                book: "João",
                chapter: 3,
                verse: "16",
                text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
                category: "Amor",
                tags: ["amor", "salvação", "eternidade"],
              },
            ],
            characters: ["Jesus"],
            events: ["Crucificação"],
            references: ["João 3:16"],
            memorized: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
          },
        ],
      },
    ],
  },
  {
    id: "daniel",
    title: "Daniel",
    description: "Fiel em terra estrangeira, do fosso dos leões ao palácio.",
    accent: "#A67B6B",
    chapters: [
      {
        id: "daniel-jovem",
        title: "Jovem",
        sessions: [
          {
            id: "daniel-jovem-1",
            title: "Resolvido no coração",
            intro:
              "Longe de casa, longe do templo. Mas Daniel decidiu: não se contaminaria. Mesmo na corte de um rei estrangeiro, escolheu ser fiel.",
            texts: [
              {
                id: "daniel-jovem-1-t1",
                title: "Daniel propôs no coração",
                book: "Daniel",
                chapter: 1,
                verse: "8",
                text: "Daniel propôs no coração não se contaminar com as iguarias do rei.",
                category: "Fidelidade",
                tags: ["fidelidade", "decisão"],
              },
            ],
            characters: ["Daniel"],
            events: ["Daniel na corte babilônica"],
            references: ["Daniel 1:8"],
            memorized: "Daniel propôs no coração não se contaminar com as iguarias do rei.",
          },
        ],
      },
      {
        id: "daniel-leoes",
        title: "Leões",
        sessions: [
          {
            id: "daniel-leoes-1",
            title: "O fosso dos leões",
            intro:
              "A lei foi assinada. A oração era proibida. Mas Daniel continuou orando três vezes ao dia — de janelas abertas. O fosso dos leões esperava.",
            texts: [
              {
                id: "daniel-leoes-1-t1",
                title: "Meu Deus enviou o seu anjo",
                book: "Daniel",
                chapter: 6,
                verse: "22",
                text: "O meu Deus enviou o seu anjo, e fechou a boca dos leões, e não me fizeram mal.",
                category: "Proteção",
                tags: ["proteção", "fé"],
              },
            ],
            characters: ["Daniel", "Rei Dario"],
            events: ["Daniel no fosso dos leões"],
            references: ["Daniel 6:22"],
            memorized: "O meu Deus enviou o seu anjo, e fechou a boca dos leões, e não me fizeram mal.",
          },
        ],
      },
    ],
  },
];

export function getJourneyById(id: string): Journey | undefined {
  return JOURNEYS.find((j) => j.id === id);
}
