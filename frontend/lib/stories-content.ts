// ============================================================
// LILOBA — Histoires Bibliques : données
// ============================================================
// Chaque histoire :
//  - image  : chemin local simple → /images/stories/<slug>.jpg
//             (place un fichier .jpg ici, sinon le dégradé + SVG s'affiche)
//  - unsplash : URL libre de droits suggérée pour remplacer le placeholder
// ============================================================

export interface LifeLesson {
  title: string; // ex : "Même petit, on peut surmonter d'immenses défis"
  text: string; // la morale expliquée simplement
  action: string; // un défi concret pour aujourd'hui
}

export interface BibleStory {
  slug: string;
  title: string;
  reference: string; // affiché discrètement, ex : "1 Samuel 17"
  referenceDetail: string; // ex : "Premier livre de Samuel, chapitre 17"
  theme: string; // ex : "Courage"
  age: string; // ex : "7+"
  durationMin: number;
  gradient: string; // classes Tailwind du fallback visuel
  emoji: string; // fallback + icône carte
  image: string; // chemin local : /images/stories/<slug>.jpg
  unsplash: string; // image libre de droits suggérée (Unsplash)
  excerpt: string;
  paragraphs: string[];
  lesson: LifeLesson;
  keyVerse: { text: string; ref: string };
}

export const STORIES: BibleStory[] = [
  {
    slug: "david-goliath",
    title: "Le courage de David face à Goliath",
    reference: "1 Samuel 17",
    referenceDetail: "Premier livre de Samuel, chapitre 17",
    theme: "Courage",
    age: "7+",
    durationMin: 8,
    gradient: "from-amber-500 via-orange-600 to-red-800",
    emoji: "🪨",
    image: "/images/stories/david.jpg",
    unsplash:
      "https://images.unsplash.com/photo-1591123120675-6f7f5ae41d5b?w=1200&q=80 (vallée désertique au lever du soleil)",
    excerpt:
      "Un jeune berger, une fronde, cinq pierres lisses… et un géant qui terrorise toute une armée. David n'était pas le plus fort, mais il savait en qui il croyait.",
    paragraphs: [
      "Israël tremblait. Chaque matin et chaque soir, depuis quarante jours, un géant nommé Goliath sortait des rangs des Philistins. Il mesurait près de trois mètres, portait une armure de bronze de cinquante kilos, et sa voix couvrait la vallée d'Éla comme le tonnerre. « Choisissez un homme qui vienne se battre contre moi ! » criait-il. Et dans le camp d'Israël, personne ne bougeait. Même le roi Saül, le plus grand de tous, restait paralysé.",
      "David n'était pas un soldat. C'était un adolescent aux cheveux roux, berger des brebis de son père à Bethléem. Ce jour-là, son père Jessé l'avait simplement envoyé apporter du pain et du fromage à ses trois grands frères partis à la guerre. David arriva au moment où Goliath lançait son défi quotidien. Il entendit les insultes contre Dieu, et son sang ne fit qu'un tour : « Qui est ce Philistin pour insulter l'armée du Dieu vivant ? » Autour de lui, les soldats baissèrent les yeux. Son frère aîné Eliab se moqua de lui : « Retourne garder tes moutons ! » Mais David ne recula pas.",
      "La nouvelle parvint jusqu'au roi. Saül fit venir le garçon et voulut le décourager : « Tu ne peux pas l'affronter, tu n'es qu'un enfant. » Alors David raconta ce que personne ne savait : seul dans les collines, il avait déjà arraché un agneau de la gueule d'un lion, puis d'un ours. « Le Seigneur qui m'a délivré du lion et de l'ours me délivrera aussi de ce Philistin », dit-il calmement. Saül, impressionné, lui prêta sa propre armure. Mais David ne pouvait même pas marcher avec : le casque glissait, l'épée traînait par terre. Il retira tout et reprit son bâton de berger.",
      "David descendit vers le torrent et choisit cinq pierres lisses, rondes, parfaites pour sa fronde. Il les glissa dans sa besace, prit sa fronde en main, et marcha vers le géant. Goliath éclata de rire : « Suis-je un chien pour que tu viennes à moi avec des bâtons ? » Il maudit David par ses dieux. Mais le garçon répondit d'une voix claire qui traversa toute la vallée : « Tu viens à moi avec l'épée et la lance, moi je viens à toi au nom du Seigneur. Aujourd'hui, tout le monde saura qu'Israël a un Dieu — car la victoire n'appartient ni à l'épée ni à la lance. »",
      "Puis David courut. Oui, il courut vers le géant pendant que Goliath s'avançait lourdement. À quelques mètres, David plongea la main dans sa besace, plaça une pierre dans sa fronde et la fit tournoyer une fois, deux fois — puis lâcha. La pierre fendit l'air et s'enfonça dans le front du géant, au seul endroit que son casque ne protégeait pas. Goliath s'effondra face contre terre, et un silence stupéfait tomba sur les deux armées. Le petit berger venait de terrasser le champion des Philistins. L'armée ennemie s'enfuit, Israël poussa un cri de victoire, et ce jour-là, un berger devint le héros d'une nation.",
    ],
    lesson: {
      title: "Même petit, on peut surmonter d'immenses défis avec foi et courage",
      text: "David n'a pas gagné parce qu'il était le plus fort, mais parce qu'il a refusé de laisser la peur décider à sa place. Tes « Goliath » à toi s'appellent peut-être un exposé devant la classe, une dispute, une tentation ou un rêve qui paraît trop grand. Comme David, prépare-toi dans le secret (travaille, prie, entraîne-toi), puis avance.",
      action:
        "Cette semaine, affronte un petit « Goliath » : lève la main en classe, demande pardon le premier, ou commence ce projet qui te fait peur.",
    },
    keyVerse: {
      text: "La victoire appartient au Seigneur.",
      ref: "1 Samuel 17,47",
    },
  },
  {
    slug: "joseph-pardon",
    title: "Joseph et le pardon",
    reference: "Genèse 37–50",
    referenceDetail: "Livre de la Genèse, chapitres 37 à 50",
    theme: "Pardon",
    age: "8+",
    durationMin: 10,
    gradient: "from-yellow-500 via-amber-600 to-orange-800",
    emoji: "🌾",
    image: "/images/stories/joseph.jpg",
    unsplash:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80 (champ de blé doré au coucher du soleil)",
    excerpt:
      "Vendu par ses propres frères, jeté en prison pour un crime qu'il n'a pas commis… Joseph avait toutes les raisons de se venger. Il a choisi le pardon — et cela a sauvé tout un peuple.",
    paragraphs: [
      "Joseph avait dix-sept ans et une tunique magnifique, offerte par son père Jacob qui l'aimait plus que ses dix grands frères. Joseph faisait aussi des rêves étranges : des gerbes de blé qui s'inclinaient devant lui, le soleil, la lune et onze étoiles qui se prosternaient. Quand il raconta ses rêves, ses frères le détestèrent encore plus. « Tu veux donc régner sur nous ? » ricanèrent-ils. La jalousie grandissait comme une mauvaise herbe.",
      "Un jour, Jacob envoya Joseph prendre des nouvelles de ses frères qui gardaient les troupeaux à Dotân. De loin, ils le virent arriver avec sa tunique colorée. « Voilà le rêveur ! », dirent-ils. Ils le jetèrent dans une citerne vide, puis, à l'arrivée d'une caravane d'Ismaélites en route pour l'Égypte, ils le vendirent pour vingt pièces d'argent. Pour faire croire à leur père qu'une bête sauvage l'avait dévoré, ils trempèrent sa tunique dans du sang de bouc. Jacob pleura son fils pendant des jours. Joseph, lui, enchaîné, marchait vers l'inconnu.",
      "En Égypte, Joseph servit chez Potiphar, un officier du pharaon. Tout ce qu'il touchait réussissait, car Dieu était avec lui. Mais la femme de Potiphar l'accusa faussement, et Joseph fut jeté en prison. Treize années passèrent entre la citerne et le cachot. Pourtant, même en prison, Joseph continua de faire le bien : il interpréta les rêves de deux serviteurs du pharaon, avec exactitude. L'un d'eux, rétabli dans ses fonctions, l'oublia pendant deux ans. Imagine la solitude, l'injustice, la tentation de haïr.",
      "Puis le pharaon fit à son tour des rêves troublants : sept vaches grasses dévorées par sept vaches maigres, sept beaux épis avalés par sept épis desséchés. Personne ne pouvait les expliquer. Le serviteur se souvint enfin de Joseph. Rasé, habillé proprement, le jeune Hébreu se présenta devant le roi le plus puissant du monde et dit : « Ce n'est pas moi, c'est Dieu qui expliquera. » Il annonça sept années d'abondance suivies de sept années de famine terrible, et proposa un plan : stocker le blé pendant les bonnes années. Ébloui, le pharaon le nomma gouverneur de toute l'Égypte. À trente ans, l'esclave devenu prisonnier était le deuxième homme du royaume.",
      "Quand la famine frappa, les frères de Joseph vinrent en Égypte acheter du blé. Ils ne le reconnurent pas. Joseph les reconnut, lui — et son cœur se serra. Il les testa, les fit revenir avec leur vieux père et le petit Benjamin, puis ne put se contenir : il éclata en sanglots et dit : « Je suis Joseph, votre frère, que vous avez vendu ! » Terrifiés, ils reculèrent. Mais Joseph les serra dans ses bras et prononça les paroles les plus belles de toute l'histoire : « Ne vous affligez pas. Vous aviez projeté de me faire du mal, mais Dieu a changé ce mal en bien, pour sauver la vie d'un grand nombre. » Le pardon de Joseph nourrit sa famille, donna naissance au peuple d'Israël, et répara ce que la jalousie avait brisé.",
    ],
    lesson: {
      title: "Le pardon libère plus que la vengeance",
      text: "Joseph aurait pu faire jeter ses frères en prison — il en avait le pouvoir. Mais il a compris que garder rancune, c'est comme boire du poison en espérant que l'autre tombe malade. Pardonner ne veut pas dire « ce n'était pas grave », cela veut dire « je refuse que ton mal décide de ma vie ». Le pardon a transformé une famille brisée en une nation.",
      action:
        "Pense à quelqu'un qui t'a blessé. Écris-lui (ou dis-lui) : « Je te pardonne », ou prie pour lui aujourd'hui.",
    },
    keyVerse: {
      text: "Vous aviez projeté de me faire du mal, Dieu l'a changé en bien.",
      ref: "Genèse 50,20",
    },
  },
  {
    slug: "noe-obeissance",
    title: "Noé et l'obéissance",
    reference: "Genèse 6–9",
    referenceDetail: "Livre de la Genèse, chapitres 6 à 9",
    theme: "Obéissance",
    age: "6+",
    durationMin: 7,
    gradient: "from-sky-500 via-blue-600 to-indigo-800",
    emoji: "🌈",
    image: "/images/stories/noe.jpg",
    unsplash:
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80 (océan et vagues immenses)",
    excerpt:
      "Construire un bateau géant en plein désert, alors qu'il n'a jamais plu ? Pendant des années, tout le monde s'est moqué de Noé. Mais Noé a continué, planche après planche.",
    paragraphs: [
      "À l'époque de Noé, le monde était devenu violent et corrompu. Les gens se volaient, se battaient, et avaient oublié Dieu. Mais Noé était différent : il marchait avec Dieu, comme un ami. Un jour, Dieu lui confia une mission folle : « Construis un bateau immense — une arche de cent cinquante mètres de long — car je vais purifier la terre par un déluge. » Le problème ? Noé vivait loin de la mer, et personne n'avait jamais vu une pluie pareille. Imagine la tête des voisins.",
      "Noé obéit, sans tout comprendre. Avec ses trois fils, Sem, Cham et Japhet, il coupa des arbres, tailla des poutres, assembla la coque, goudronna chaque joint. Le chantier dura des dizaines d'années. Chaque jour, les passants riaient : « Hé Noé, tu attends la mer ? Elle est à des centaines de kilomètres ! » D'autres l'insultaient. Noé aurait pu abandonner mille fois. Mais chaque planche enfoncée était un acte de confiance : Dieu a dit, donc je fais.",
      "Puis vint le jour où Dieu dit : « Entre dans l'arche, toi et ta famille. » Et les animaux arrivèrent — par deux, par sept selon les espèces : lions et agneaux, éléphants et oiseaux, dans une procession que Noé n'aurait jamais pu organiser seul. Dieu lui-même ferma la porte derrière eux. Sept jours plus tard, le ciel s'ouvrit. La pluie tomba quarante jours et quarante nuits, les sources souterraines explosèrent, et l'eau recouvrit même les plus hautes montagnes. Pendant que le monde sombrait, l'arche flottait, portée par Dieu.",
      "Après cent cinquante jours, l'eau baissa. Noé envoya un corbeau, puis une colombe. La deuxième fois, la colombe revint avec une feuille d'olivier fraîche dans le bec : la vie recommençait ! Quand ils sortirent enfin, Noé construisit un autel pour remercier Dieu. Alors Dieu déploya dans le ciel le tout premier arc-en-ciel et promit : « Plus jamais je ne détruirai la terre par un déluge. » Chaque arc-en-ciel depuis ce jour est un rappel : Dieu garde ses promesses, et il honore ceux qui lui obéissent même quand tout le monde se moque.",
    ],
    lesson: {
      title: "Faire le bien même quand tout le monde se moque de nous",
      text: "Obéir, ce n'est pas attendre de tout comprendre : c'est faire confiance à celui qui voit plus loin que nous. À l'école ou entre amis, choisir l'honnêteté, refuser de tricher ou de se moquer peut te faire passer pour « bizarre ». Noé nous rappelle que la fidélité discrète d'aujourd'hui devient le sauvetage de demain.",
      action:
        "Aujourd'hui, fais le bon choix même si personne ne regarde — et même si on se moque : dis la vérité, aide quelqu'un, refuse une moquerie.",
    },
    keyVerse: {
      text: "Noé fit tout ce que Dieu lui avait ordonné.",
      ref: "Genèse 6,22",
    },
  },
  {
    slug: "ruth-loyaute",
    title: "Ruth et la loyauté",
    reference: "Livre de Ruth",
    referenceDetail: "Livre de Ruth (4 chapitres)",
    theme: "Loyauté",
    age: "8+",
    durationMin: 8,
    gradient: "from-emerald-500 via-green-600 to-teal-800",
    emoji: "🌾",
    image: "/images/stories/ruth.jpg",
    unsplash:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80 (champ de blé et moisson)",
    excerpt:
      "Veuve, étrangère, sans argent : Ruth aurait pu rentrer chez elle. Elle a choisi de rester aux côtés de sa belle-mère Naomi. Sa fidélité a changé sa vie — et l'histoire du monde.",
    paragraphs: [
      "L'histoire commence dans la tristesse. À cause d'une famine, une famille de Bethléem — Élimélek, sa femme Naomi et leurs deux fils — part vivre au pays de Moab. Là-bas, les fils épousent deux jeunes Moabites, Orpa et Ruth. Puis le malheur frappe trois fois : Élimélek meurt, puis ses deux fils. Restent trois veuves, sans mari, sans enfant, sans protection. Quand Naomi apprend que la famine est finie en Israël, elle décide de rentrer chez elle.",
      "Sur la route, Naomi supplie ses belles-filles : « Retournez chez vos mères, refaites votre vie. Moi, je n'ai plus rien à vous offrir. » Orpa, en larmes, finit par repartir. Mais Ruth s'accroche à Naomi et prononce l'une des plus belles déclarations d'amour de la Bible : « Où tu iras, j'irai. Où tu vivras, je vivrai. Ton peuple sera mon peuple, et ton Dieu sera mon Dieu. » Ruth abandonne son pays, ses dieux, son avenir confortable — pour une vieille femme sans ressources. C'est cela, la loyauté : rester quand partir serait plus facile.",
      "Arrivées à Bethléem, les deux femmes sont pauvres. Alors Ruth va glaner dans les champs — ramasser les épis oubliés derrière les moissonneurs, comme la loi de Dieu le permettait pour les pauvres. Elle travaille dur, du matin au soir, sous le soleil. Le champ où elle « tombe par hasard » appartient à Booz, un homme riche et bon, parent du défunt mari de Naomi. Booz remarque la jeune étrangère, apprend son histoire, et ordonne à ses serviteurs : « Laissez tomber des épis pour elle exprès. Ne lui faites aucun reproche. » Le soir, Ruth rentre avec vingt kilos d'orge. Naomi comprend : Dieu n'a pas abandonné.",
      "Naomi conseille alors à Ruth une démarche audacieuse selon la coutume : demander à Booz de devenir leur « rédempteur », celui qui rachète la famille. Booz, touché par la fidélité de Ruth, accepte avec joie et l'épouse. Leur premier enfant, Obed, fait danser Naomi de joie — elle qui était revenue « amère » repart avec un petit-fils sur les genoux. Et voici le plus beau : Obed deviendra le grand-père du roi David… et l'ancêtre de Jésus. La loyauté d'une simple étrangère a fleuri jusque dans la lignée du Sauveur. Dieu n'oublie jamais la bienveillance.",
    ],
    lesson: {
      title: "La fidélité et la bienveillance attirent la bénédiction",
      text: "Ruth n'a pas calculé : elle a aimé. Elle a pris soin de Naomi avant de penser à elle-même, elle a travaillé humblement sans se plaindre. Et Dieu a transformé sa fidélité en avenir. Dans tes amitiés, en famille, à l'école : sois celui ou celle sur qui on peut compter. La loyauté paraît petite, mais elle construit de grandes histoires.",
      action:
        "Fais cette semaine un acte de loyauté : aide un ami sans qu'on te le demande, appelle un grand-parent, défends quelqu'un qu'on critique.",
    },
    keyVerse: {
      text: "Où tu iras, j'irai ; ton Dieu sera mon Dieu.",
      ref: "Ruth 1,16",
    },
  },
  {
    slug: "daniel-lions",
    title: "Daniel dans la fosse aux lions",
    reference: "Daniel 6",
    referenceDetail: "Livre de Daniel, chapitre 6",
    theme: "Fidélité",
    age: "7+",
    durationMin: 7,
    gradient: "from-orange-500 via-amber-600 to-yellow-800",
    emoji: "🦁",
    image: "/images/stories/daniel.jpg",
    unsplash:
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1200&q=80 (lion majestueux)",
    excerpt:
      "Prier pouvait le tuer. Pendant trente jours, une loi l'interdisait. Daniel a ouvert sa fenêtre comme chaque jour, s'est agenouillé… et a passé une nuit entière au milieu des lions.",
    paragraphs: [
      "Daniel avait environ quatre-vingts ans quand l'histoire commence. Déporté à Babylone adolescent, il avait servi plusieurs rois sans jamais renier son Dieu. Le nouveau roi, Darius, l'appréciait tellement qu'il voulait le mettre à la tête de tout le royaume. Jaloux, les autres chefs cherchèrent une faute dans son travail — mais Daniel était honnête, ponctuel, irréprochable. « Nous ne trouverons rien contre lui, sauf dans sa religion », conclurent-ils. Et ils tendirent un piège.",
      "Ils firent signer au roi un décret : pendant trente jours, personne ne devait prier un autre dieu ni un autre homme que le roi Darius — sous peine d'être jeté dans la fosse aux lions. Flatté, le roi signa sans réfléchir. Quand Daniel apprit la nouvelle, il monta dans sa chambre, ouvrit la fenêtre qui donnait vers Jérusalem — comme il le faisait trois fois par jour depuis des années — s'agenouilla et pria. Il n'a pas fermé les volets. Il n'a pas chuchoté. Sa fidélité n'était pas une honte à cacher, mais une habitude à garder.",
      "Ses ennemis le dénoncèrent aussitôt. Le roi comprit trop tard qu'il avait été manipulé, et passa la journée à chercher un moyen de sauver Daniel — en vain. Au coucher du soleil, on amena le vieil homme vers la fosse. Darius lui dit, la voix brisée : « Que ton Dieu, que tu sers avec fidélité, te délivre ! » On roula une pierre sur l'ouverture, le roi rentra au palais, refusa de manger, refusa la musique, et ne dormit pas de la nuit.",
      "À l'aube, Darius courut à la fosse et cria d'une voix angoissée : « Daniel ! Ton Dieu a-t-il pu te délivrer ? » Et du fond du trou monta une voix calme : « Ô roi, vis éternellement ! Mon Dieu a envoyé son ange, qui a fermé la gueule des lions. » On remonta Daniel, sain et sauf, sans une égratignure. Fou de joie, Darius fit jeter les accusateurs dans la fosse et écrivit à tous les peuples de son empire : « Le Dieu de Daniel est le Dieu vivant ! » Une fenêtre ouverte, une prière fidèle — et tout un empire entendit parler de Dieu.",
    ],
    lesson: {
      title: "Rester fidèle à ses convictions, même au péril de sa vie",
      text: "Daniel n'a pas attendu la crise pour être courageux : son courage venait d'une habitude. Trois fois par jour, depuis des années, il priait. Quand la pression est venue — moqueries, loi injuste, lions — il n'a eu qu'à continuer ce qu'il faisait déjà. Si tu veux tenir bon le jour difficile, entraîne-toi les jours faciles : prie, lis, obéis dans les petites choses.",
      action:
        "Choisis une habitude fidèle cette semaine : prier chaque soir, lire un verset par jour, dire merci avant de manger — même quand tes amis te regardent.",
    },
    keyVerse: {
      text: "Mon Dieu a envoyé son ange et a fermé la gueule des lions.",
      ref: "Daniel 6,23",
    },
  },
  {
    slug: "esther-courage",
    title: "Esther, la reine courageuse",
    reference: "Livre d'Esther",
    referenceDetail: "Livre d'Esther (10 chapitres)",
    theme: "Courage",
    age: "9+",
    durationMin: 8,
    gradient: "from-purple-500 via-fuchsia-600 to-pink-800",
    emoji: "👑",
    image: "/images/stories/esther.jpg",
    unsplash:
      "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1200&q=80 (portrait de reine, voile doré)",
    excerpt:
      "Une jeune orpheline devenue reine de Perse. Un décret qui condamne tout son peuple. Se présenter au roi sans y être invitée, c'était risquer la mort. Esther l'a fait quand même.",
    paragraphs: [
      "Esther s'appelait en hébreu Hadassa, « myrte ». Orpheline, élevée par son cousin Mardochée, elle vivait discrètement dans la capitale perse de Suse. Un jour, le roi Assuérus, furieux contre la reine Vasthi, chercha une nouvelle reine. Esther fut emmenée au palais avec des centaines de jeunes filles. Par sa beauté, mais surtout par sa grâce et sa douceur, elle gagna le cœur du roi et devint reine. Personne, sauf Mardochée, ne savait qu'elle était juive.",
      "Alors le drame éclata. Haman, le favori du roi, plein d'orgueil, exigeait que tout le monde se prosterne devant lui. Mardochée refusa — il ne s'inclinait que devant Dieu. Fou de rage, Haman obtint du roi un décret terrible : à une date fixée, tous les Juifs de l'empire seraient exterminés. Dans tout le pays, les Juifs pleurèrent, jeûnèrent, se couvrirent de cendre. Mardochée envoya un message à Esther : « Tu dois intervenir auprès du roi ! »",
      "Mais il y avait un problème mortel : personne ne pouvait entrer chez le roi sans y être invité, sous peine de mort — sauf si le roi tendait son sceptre d'or. Et le roi n'avait pas appelé Esther depuis trente jours. La jeune reine eut peur. Alors Mardochée lui répondit avec les mots les plus célèbres du livre : « Qui sait si ce n'est pas pour un moment comme celui-ci que tu es devenue reine ? » Esther comprit : sa couronne n'était pas un confort, c'était une mission.",
      "Elle demanda à tous les Juifs de jeûner trois jours pour elle, puis, vêtue de ses habits royaux, elle s'avança vers la salle du trône. Chaque pas pouvait être le dernier. Le roi la vit, et — miracle — tendit son sceptre d'or. « Que veux-tu, reine Esther ? Jusqu'à la moitié du royaume, je te le donnerai. » Avec une sagesse remarquable, Esther invita le roi et Haman à deux banquets, puis révéla tout : « On veut exterminer mon peuple ! » Haman fut pendu au poteau qu'il avait préparé pour Mardochée, un nouveau décret sauva les Juifs, et la fête de Pourim célèbre encore aujourd'hui ce retournement. Une jeune fille effacée avait sauvé tout un peuple — parce qu'elle a accepté d'être courageuse au bon moment.",
    ],
    lesson: {
      title: "Dieu peut te placer là où tu es pour une mission précise",
      text: "Esther avait peur, et c'est normal. Le courage, ce n'est pas l'absence de peur : c'est d'avancer malgré la peur, parce que d'autres comptent sur toi. Ta classe, ton équipe, ta famille : et si tu étais là « pour un moment comme celui-ci » — pour défendre quelqu'un, dire la vérité, encourager ?",
      action:
        "Repère une situation où tu peux agir cette semaine : défendre un camarade isolé, dire non à une injustice, encourager quelqu'un de découragé.",
    },
    keyVerse: {
      text: "Qui sait si ce n'est pas pour un moment comme celui-ci que tu es devenue reine ?",
      ref: "Esther 4,14",
    },
  },
  {
    slug: "fils-perdu",
    title: "Le fils perdu et retrouvé",
    reference: "Luc 15,11–32",
    referenceDetail: "Évangile selon Luc, chapitre 15, versets 11 à 32",
    theme: "Pardon de Dieu",
    age: "6+",
    durationMin: 6,
    gradient: "from-teal-500 via-cyan-600 to-sky-800",
    emoji: "🏠",
    image: "/images/stories/fils-perdu.jpg",
    unsplash:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80 (chemin vers une maison au soleil couchant)",
    excerpt:
      "Il a réclamé l'héritage, tout gaspillé, fini avec les cochons. Sur le chemin du retour, honteux, il préparait son discours… mais son père courait déjà vers lui, les bras ouverts.",
    paragraphs: [
      "Jésus raconta un jour l'histoire d'un père qui avait deux fils. Le plus jeune vint le voir et dit : « Père, donne-moi ma part d'héritage. » C'était comme dire : « J'aimerais que tu sois déjà mort. » Le père, le cœur brisé, partagea ses biens. Quelques jours plus tard, le fils partit pour un pays lointain avec tout son argent.",
      "Là-bas, il dépensa tout : fêtes, amis intéressés, plaisirs sans fin. Puis une grande famine frappa le pays, ses faux amis disparurent, et il se retrouva à garder des cochons — lui, un Juif pour qui ces animaux étaient impurs ! Il avait si faim qu'il enviait leur nourriture. Un soir, au fond de la porcherie, il se dit : « Même les ouvriers de mon père mangent à leur faim, et moi je meurs de faim. Je vais retourner vers mon père et lui dire : j'ai péché, traite-moi comme un ouvrier. »",
      "Il se mit en route, sale, maigre, honteux, répétant son discours. Mais pendant qu'il était encore loin, son père le vit. Ce père qui, depuis des mois, scrutait l'horizon chaque soir. Et au lieu d'attendre dignement, le vieil homme releva sa tunique et courut — un père honorable ne courait jamais en public ! Il se jeta au cou de son fils, le couvrit de baisers, et ne le laissa même pas finir sa phrase. « Vite, apportez la plus belle robe, mettez-lui un anneau au doigt, tuez le veau gras : mon fils était mort, et il est revenu à la vie ! » La fête commença.",
      "Mais le fils aîné, qui avait toujours obéi, refusa d'entrer. « Moi je t'ai toujours servi, et tu ne m'as jamais fait de fête ! » Le père sortit le supplier : « Mon enfant, tout ce qui est à moi est à toi. Mais il fallait faire la fête : ton frère était perdu, et il est retrouvé. » Jésus termina l'histoire sans dire si l'aîné entra. Car la question s'adressait à ses auditeurs — et à nous : accepteras-tu d'entrer dans la joie du Père, que tu sois le rebelle ou le « sage » qui juge ?",
    ],
    lesson: {
      title: "Dieu pardonne toujours à celui qui revient vers lui",
      text: "Peu importe ce que tu as fait, où tu es tombé, depuis combien de temps tu t'es éloigné : le Père guette ton retour et court à ta rencontre. Tu n'as pas besoin de « mériter » son pardon en devenant parfait d'abord. Reviens tel que tu es — la robe, l'anneau et la fête, c'est lui qui les offre.",
      action:
        "Si tu t'es éloigné de Dieu, reviens aujourd'hui par une prière simple : « Père, pardonne-moi. » Et si quelqu'un revient vers toi, accueille-le comme le Père.",
    },
    keyVerse: {
      text: "Mon fils était mort, et il est revenu à la vie ; il était perdu, et il est retrouvé.",
      ref: "Luc 15,24",
    },
  },
  {
    slug: "bon-samaritain",
    title: "Le bon Samaritain",
    reference: "Luc 10,25–37",
    referenceDetail: "Évangile selon Luc, chapitre 10, versets 25 à 37",
    theme: "Amour du prochain",
    age: "6+",
    durationMin: 6,
    gradient: "from-rose-500 via-red-600 to-orange-800",
    emoji: "❤️",
    image: "/images/stories/samaritain.jpg",
    unsplash:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80 (route désertique de Judée)",
    excerpt:
      "Roué de coups au bord de la route, un voyageur voit passer un prêtre, puis un religieux… qui changent de trottoir. Celui qui s'arrête est le dernier qu'on attendait.",
    paragraphs: [
      "Un expert de la loi demanda un jour à Jésus : « Qui est mon prochain ? » Pour répondre, Jésus raconta une histoire. Un homme descendait de Jérusalem à Jéricho — une route dangereuse, pleine de ravins où se cachaient les brigands. Ils l'attaquèrent, le dépouillèrent, le rouèrent de coups et le laissèrent à moitié mort au bord du chemin.",
      "Par « hasard », un prêtre passa par là. Il vit l'homme… et passa de l'autre côté de la route. Puis un lévite, un employé du temple, fit la même chose : il s'approcha, regarda, et s'éloigna. Ils avaient sûrement leurs raisons : être en retard au culte, ne pas se rendre impurs en touchant un mort, la peur des brigands. Mais leurs raisons ne soignèrent personne.",
      "Alors arriva un Samaritain. Or, Juifs et Samaritains se détestaient depuis des siècles — ils ne se parlaient pas, ne mangeaient pas ensemble. C'était le dernier homme dont le blessé aurait attendu du secours. Mais en le voyant, le Samaritain « fut rempli de compassion ». Il s'arrêta, versa de l'huile et du vin sur ses plaies, le hissa sur sa propre monture, le conduisit à une auberge et veilla sur lui toute la nuit. Le lendemain, il donna deux pièces d'argent à l'aubergiste : « Prends soin de lui, et ce que tu dépenseras en plus, je te le rembourserai à mon retour. »",
      "Jésus demanda alors : « Lequel des trois a été le prochain de l'homme attaqué ? » L'expert dut admettre : « Celui qui a eu pitié de lui. » Et Jésus conclut : « Va, et toi aussi, fais de même. » Ton prochain, ce n'est pas seulement celui qui te ressemble ou qui t'aime : c'est celui que Dieu place sur ta route, même s'il est différent, même si personne ne regarde, même si cela te coûte du temps et de l'argent.",
    ],
    lesson: {
      title: "Aimer, c'est agir — même pour ceux qui sont différents",
      text: "Le prêtre et le lévite avaient les bons discours mais les mains vides. Le Samaritain a eu les mains pleines : huile, vin, temps, argent. L'amour vrai se voit dans les gestes concrets. Ne demande pas « est-il des miens ? » mais « a-t-il besoin de moi ? »",
      action:
        "Cette semaine, sois un « bon Samaritain » : aide un camarade nouveau ou isolé, partage ton goûter, console quelqu'un de triste.",
    },
    keyVerse: {
      text: "Va, et toi aussi, fais de même.",
      ref: "Luc 10,37",
    },
  },
];

export function getStory(slug: string): BibleStory | undefined {
  return STORIES.find((s) => s.slug === slug);
}

export function getRelatedStories(slug: string, count = 3): BibleStory[] {
  const current = getStory(slug);
  if (!current) return STORIES.slice(0, count);
  const sameTheme = STORIES.filter(
    (s) => s.slug !== slug && s.theme === current.theme
  );
  const others = STORIES.filter(
    (s) => s.slug !== slug && s.theme !== current.theme
  );
  return [...sameTheme, ...others].slice(0, count);
}
