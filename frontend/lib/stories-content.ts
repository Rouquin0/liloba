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
  // ============================================================
  // Histoires 9 à 20
  // ============================================================
  {
    slug: "jonas-seconde-chance",
    title: "Jonas et la seconde chance",
    reference: "Jonas 1–4",
    referenceDetail: "Livre de Jonas, chapitres 1 à 4",
    theme: "Obéissance",
    age: "6+",
    durationMin: 7,
    gradient: "from-cyan-600 via-blue-700 to-slate-900",
    emoji: "🐋",
    image: "/images/stories/jonas.jpg",
    unsplash:
      "https://unsplash.com/s/photos/ocean-waves-storm (océan agité sous un ciel d'orage)",
    excerpt:
      "Dieu lui demande d'aller parler à ses ennemis ; Jonas prend le premier bateau dans l'autre direction. Au fond de la mer, dans le ventre d'un grand poisson, il découvre que Dieu ne lâche jamais personne.",
    paragraphs: [
      "Jonas était prophète, et un matin, Dieu lui parla clairement : « Lève-toi, va à Ninive, la grande ville, et annonce-leur que leur méchanceté est montée jusqu'à moi. » Ninive était la capitale des Assyriens, un peuple puissant et cruel qui terrorisait Israël. Aller leur parler ? Jonas n'en avait aucune envie. Alors, au lieu de partir vers l'est, il descendit au port de Joppé, paya son billet et embarqua sur un bateau qui filait dans la direction exactement opposée : Tarsis, au bout du monde connu. Il pensait ainsi échapper à Dieu. Puis, épuisé, il descendit dans la cale et s'endormit.",
      "Mais on ne s'échappe pas de Dieu. L'Éternel lança un vent violent sur la mer, et la tempête devint si terrible que le bateau menaçait de se briser. Les marins, terrifiés, jetaient la cargaison par-dessus bord et priaient chacun leur dieu. Le capitaine secoua Jonas : « Comment peux-tu dormir ? Lève-toi et prie ! » Quand le sort désigna Jonas comme responsable de ce malheur, il avoua tout : « Je fuis mon Dieu. Jetez-moi à la mer, et la tempête s'apaisera. » Les marins ramèrent d'abord de toutes leurs forces pour l'épargner. Puis, en suppliant Dieu de leur pardonner, ils le jetèrent dans les flots. Aussitôt, la mer se calma.",
      "Jonas coula. Mais Dieu avait préparé un grand poisson, qui l'avala tout entier. Pendant trois jours et trois nuits, dans le noir et le silence, Jonas eut tout le temps de réfléchir. Alors il pria du fond de sa détresse : « Dans mon angoisse, j'ai crié vers l'Éternel, et il m'a répondu. » Dieu parla au poisson, qui rejeta Jonas sur la plage, vivant. Une seconde fois, Dieu lui dit : « Lève-toi, va à Ninive. » Cette fois, Jonas obéit. Il traversa l'immense ville en criant : « Dans quarante jours, Ninive sera détruite ! »",
      "Ce qui se passa ensuite dépassa tout ce que Jonas imaginait. Les habitants crurent le message de Dieu. Du plus grand au plus petit, ils jeûnèrent et se couvrirent de vêtements de deuil, et même le roi descendit de son trône pour s'asseoir dans la cendre. Dieu vit qu'ils changeaient vraiment de vie, et il renonça à punir la ville. Jonas, lui, fut furieux : il aurait voulu voir Ninive détruite ! Dieu fit pousser une plante pour lui donner de l'ombre, puis la fit faner, et lui demanda : « Tu as pitié de cette plante… et moi, je n'aurais pas pitié de Ninive, cette grande ville ? » Dieu est plus patient et plus tendre que nous : il offre à tous une seconde chance.",
    ],
    lesson: {
      title: "Dieu donne toujours une seconde chance",
      text: "Jonas a fui, et Dieu ne l'a pas abandonné. Ninive avait mal agi, et Dieu a pardonné. Quand tu as raté quelque chose, désobéi ou fui une tâche difficile, la porte n'est pas fermée : Dieu te redit « Lève-toi ». Et la seconde chance que tu reçois, tu es invité à la donner aussi aux autres, même à ceux que tu trouves difficiles à aimer.",
      action:
        "Pense à une chose que tu repousses, ou à quelqu'un à qui tu refuses de redonner sa chance. Fais le premier pas aujourd'hui.",
    },
    keyVerse: {
      text: "Et moi, je n'aurais pas pitié de Ninive, cette grande ville ?",
      ref: "Jonas 4,11",
    },
  },
  {
    slug: "abraham-confiance",
    title: "Abraham et les étoiles",
    reference: "Genèse 12–21",
    referenceDetail: "Livre de la Genèse, chapitres 12 à 21",
    theme: "Foi",
    age: "7+",
    durationMin: 8,
    gradient: "from-indigo-500 via-violet-700 to-slate-900",
    emoji: "⭐",
    image: "/images/stories/abraham.jpg",
    unsplash:
      "https://unsplash.com/s/photos/starry-night-desert (ciel étoilé au-dessus du désert)",
    excerpt:
      "Partir sans connaître la destination, attendre vingt-cinq ans une promesse impossible… Abraham a compté les étoiles et a choisi de croire que Dieu tient parole.",
    paragraphs: [
      "Abram avait soixante-quinze ans, une famille, des troupeaux, une maison à Harân. Une vie tranquille. Un jour, Dieu lui dit : « Quitte ton pays, ta famille et la maison de ton père, et va vers le pays que je te montrerai. Je ferai de toi une grande nation. » Quel pays ? Dieu ne donna ni nom, ni carte. Abram n'avait qu'une promesse. Il plia donc ses tentes, rassembla sa femme Saraï, son neveu Lot, ses serviteurs et ses bêtes, et se mit en marche. Il partit sans savoir où il allait, simplement parce que Dieu l'avait demandé.",
      "Les années passèrent dans le pays de Canaan, et la promesse tardait. Abram et Saraï n'avaient toujours pas d'enfant. Un soir, il laissa éclater sa peine : « Seigneur, que peux-tu me donner ? Je m'en vais sans enfant. » Alors Dieu le fit sortir de sa tente, en pleine nuit. Au-dessus de lui, le ciel du désert, sans lune, brillait de milliers d'étoiles. « Regarde le ciel, dit Dieu, et compte les étoiles, si tu le peux. Telle sera ta descendance. » Abram leva la tête, regarda longtemps, et il crut Dieu. Rien n'avait encore changé, mais il lui faisait confiance.",
      "Il fallut encore attendre longtemps. Abram avait quatre-vingt-dix-neuf ans quand Dieu lui renouvela sa promesse et lui donna un nouveau nom : Abraham, « père d'une multitude ». Peu après, trois visiteurs s'arrêtèrent devant sa tente, au chêne de Mamré. Abraham leur offrit l'eau, le pain et un veau tendre. L'un d'eux annonça : « L'an prochain, Sara aura un fils. » Derrière la tente, Sara, qui avait quatre-vingt-dix ans, éclata de rire. Mais la réponse fut douce : « Y a-t-il quelque chose de trop difficile pour l'Éternel ? »",
      "Un an plus tard, dans la tente d'Abraham, un bébé pleurait. Abraham avait cent ans. Il l'appela Isaac, ce qui veut dire « il rit », et Sara dit, émerveillée : « Dieu m'a fait rire, et tous ceux qui l'apprendront riront avec moi ! » Vingt-cinq ans après l'appel, la promesse devenait un enfant dans ses bras. Abraham n'avait jamais eu de preuve : il avait eu la parole de Dieu. Et c'est elle qui a tenu.",
    ],
    lesson: {
      title: "Faire confiance à Dieu, même quand on ne voit pas encore",
      text: "Abraham n'a pas reçu de plan détaillé : il a reçu une promesse, et il a avancé. La foi, ce n'est pas tout comprendre à l'avance, c'est faire le prochain pas en croyant que Dieu est fiable. Il y a des choses que tu attends : une amitié, une réponse, une guérison, un rêve. L'attente n'est pas du temps perdu quand on la vit en confiance.",
      action:
        "Écris une chose que tu attends de Dieu, et prie chaque soir cette semaine : « Je te fais confiance, même si je ne vois pas encore. »",
    },
    keyVerse: {
      text: "Abraham crut à l'Éternel, et cela lui fut compté comme justice.",
      ref: "Genèse 15,6",
    },
  },
  {
    slug: "moise-mer-rouge",
    title: "Moïse et la traversée de la mer Rouge",
    reference: "Exode 3–14",
    referenceDetail: "Livre de l'Exode, chapitres 3 à 14",
    theme: "Courage",
    age: "8+",
    durationMin: 9,
    gradient: "from-sky-400 via-blue-700 to-slate-900",
    emoji: "🌊",
    image: "/images/stories/moise.jpg",
    unsplash:
      "https://unsplash.com/s/photos/red-sea-water (mer d'un bleu profond au lever du jour)",
    excerpt:
      "Un berger de quatre-vingts ans, un buisson qui brûle sans se consumer, et une mer qui s'ouvre devant un peuple en fuite. Moïse a eu peur, lui aussi, mais il a avancé.",
    paragraphs: [
      "Pendant des siècles, les Hébreux furent esclaves en Égypte. Ils fabriquaient des briques sous les coups de fouet, et leurs cris montaient vers Dieu. Moïse, lui, était devenu berger dans le désert de Madian, après avoir fui l'Égypte. Un jour, il vit un buisson qui brûlait sans jamais se consumer. Il s'approcha, et une voix l'appela : « Moïse ! Retire tes sandales, car le lieu où tu te tiens est saint. J'ai vu la souffrance de mon peuple. Je t'envoie vers le pharaon pour libérer les Hébreux. » Moïse eut peur : « Qui suis-je ? Je n'ai pas la parole facile ! » Dieu répondit : « Je serai avec toi. »",
      "Avec son frère Aaron, Moïse se présenta devant le pharaon, le plus puissant des hommes : « Laisse partir mon peuple. » Le roi refusa, encore et encore. Dix fléaux s'abattirent alors sur l'Égypte, jusqu'à ce que le pharaon cède. Dans la nuit de la Pâque, chaque famille hébreue mangea le repas, vêtue pour le voyage, et au matin, des milliers d'hommes, de femmes et d'enfants quittèrent l'Égypte, avec leurs troupeaux, derrière Moïse. Après des siècles d'esclavage, ils marchaient enfin libres.",
      "Mais le pharaon changea d'avis. Avec ses chars, ses cavaliers et toute son armée, il se lança à leur poursuite. Les Hébreux se retrouvèrent coincés entre le désert et la mer Rouge, avec l'armée égyptienne dans leur dos. La panique éclata : « Nous aurions mieux fait de rester esclaves ! » Moïse, pourtant tremblant lui aussi, leva la voix : « N'ayez pas peur ! Tenez bon, et vous verrez comment l'Éternel vous délivrera aujourd'hui. L'Éternel combattra pour vous ; vous, gardez le calme. »",
      "Alors Moïse étendit son bâton sur la mer. Pendant toute la nuit, un vent puissant souffla, et les eaux se fendirent : un mur d'eau à droite, un mur d'eau à gauche, et au milieu un chemin sec. Le peuple s'engagea, l'enfant par la main, le vieillard sur le dos. À l'aube, quand les Égyptiens s'élancèrent derrière eux, Moïse étendit de nouveau la main : la mer reprit sa place. De l'autre côté, les Hébreux regardaient, stupéfaits et libres. Ils chantèrent à Dieu, et Myriam, la sœur de Moïse, prit son tambourin et dansa.",
    ],
    lesson: {
      title: "Le courage, c'est avancer même avec la peur",
      text: "Moïse n'était ni sûr de lui, ni éloquent, ni confiant : il a répondu « je ne peux pas » plusieurs fois. Et pourtant il a obéi, un pas après l'autre. Devant la mer, personne ne voyait de chemin. Le chemin s'est ouvert quand le peuple a marché. Parfois, la solution n'apparaît que lorsqu'on commence à avancer.",
      action:
        "Qu'est-ce qui te fait peur en ce moment ? Fais aujourd'hui un tout petit pas dans cette direction, puis demande à Dieu d'être avec toi.",
    },
    keyVerse: {
      text: "L'Éternel combattra pour vous ; gardez le calme.",
      ref: "Exode 14,14",
    },
  },
  {
    slug: "salomon-sagesse",
    title: "Salomon et le choix de la sagesse",
    reference: "1 Rois 3",
    referenceDetail: "Premier livre des Rois, chapitre 3",
    theme: "Sagesse",
    age: "8+",
    durationMin: 7,
    gradient: "from-yellow-400 via-amber-600 to-yellow-900",
    emoji: "⚖️",
    image: "/images/stories/salomon.jpg",
    unsplash:
      "https://unsplash.com/s/photos/golden-light-palace (lumière dorée sur une architecture ancienne)",
    excerpt:
      "Dieu lui offre n'importe quoi : richesse, gloire, longue vie. Le jeune roi Salomon demande autre chose. Et sa réponse change tout, jusqu'au jour où deux mères viennent réclamer le même bébé.",
    paragraphs: [
      "À la mort de son père David, Salomon devint roi d'Israël. Il était très jeune, et le peuple était nombreux comme le sable de la mer. Une nuit, à Gabaon, après avoir offert un sacrifice, il fit un rêve : Dieu lui apparut et lui dit : « Demande ce que tu veux que je te donne. » Imagine la proposition : des trésors, une armée invincible, une vie très longue ! Salomon réfléchit, puis répondit humblement : « Seigneur, je suis un tout jeune homme, je ne sais pas comment me conduire. Donne-moi un cœur plein de discernement pour juger ton peuple et distinguer le bien du mal. »",
      "Cette réponse fit plaisir à Dieu. « Puisque tu n'as demandé ni de longs jours, ni la richesse, ni la mort de tes ennemis, mais la sagesse pour rendre la justice, je te donne un cœur sage et intelligent, comme il n'y en a jamais eu avant toi. Et ce que tu n'as pas demandé, je te le donne aussi : la richesse et la gloire. » Salomon se réveilla, retourna à Jérusalem et offrit un grand repas à tous ses serviteurs pour remercier Dieu.",
      "Peu après, deux femmes se présentèrent devant lui, la voix tremblante de colère. « Mon seigneur, nous habitons la même maison. Nous avons eu chacune un bébé à trois jours d'intervalle. Cette nuit, son enfant est mort, et elle a pris le mien pendant que je dormais ! » « Non ! Le vivant est à moi ! » cria l'autre. Elles se disputaient devant le roi, sans témoin ni preuve. Salomon écouta, puis dit : « Apportez-moi une épée. Coupez l'enfant vivant en deux, et donnez une moitié à chacune. »",
      "Un silence glacé tomba. L'une des femmes, le cœur brisé, s'écria : « Non, mon seigneur ! Donnez-lui l'enfant vivant, mais ne le tuez pas ! » L'autre déclara froidement : « Il ne sera ni à moi ni à toi. Qu'on le partage ! » Salomon sourit : « Donnez l'enfant à la première. C'est elle, la vraie mère. » Tout Israël apprit le jugement, et les gens comprirent que Dieu avait donné à leur roi une sagesse extraordinaire. Il avait demandé le bon trésor, et le reste était venu avec.",
    ],
    lesson: {
      title: "Demander d'abord ce qui compte vraiment",
      text: "Salomon avait le droit de tout demander, et il a choisi la sagesse : savoir bien écouter, bien juger, bien aimer. La sagesse, ce n'est pas être le plus intelligent, c'est savoir ce qui est important et agir en conséquence. Cela s'apprend en demandant à Dieu, en écoutant les autres, et en prenant le temps de réfléchir avant de réagir.",
      action:
        "Avant ta prochaine décision importante, prends cinq minutes pour prier : « Seigneur, donne-moi un cœur sage. » Puis écoute avant de répondre.",
    },
    keyVerse: {
      text: "Donne à ton serviteur un cœur plein de discernement.",
      ref: "1 Rois 3,9",
    },
  },
  {
    slug: "jesus-tempete",
    title: "Jésus calme la tempête",
    reference: "Marc 4,35–41",
    referenceDetail: "Évangile selon Marc, chapitre 4, versets 35 à 41",
    theme: "Foi",
    age: "6+",
    durationMin: 6,
    gradient: "from-slate-500 via-blue-700 to-indigo-900",
    emoji: "⛵",
    image: "/images/stories/tempete.jpg",
    unsplash:
      "https://unsplash.com/s/photos/boat-storm-lake (barque sur un lac sous un ciel d'orage)",
    excerpt:
      "Une barque, un lac qui se déchaîne, des pêcheurs expérimentés qui paniquent… et Jésus qui dort. Quand la tempête devient trop grande, une seule parole suffit.",
    paragraphs: [
      "La journée avait été longue. Jésus avait enseigné la foule au bord du lac de Galilée, assis dans une barque pour que tout le monde l'entende. Le soir venu, il dit à ses disciples : « Passons sur l'autre rive. » Ils quittèrent la foule et partirent. Plusieurs d'entre eux étaient pêcheurs, ils connaissaient ce lac comme leur poche. Jésus, épuisé, s'allongea à l'arrière de la barque, la tête sur un coussin, et s'endormit presque aussitôt.",
      "Soudain, un vent furieux se leva. Le lac de Galilée est connu pour ses tempêtes brutales, qui descendent des collines en quelques minutes. Les vagues se jetaient contre la barque et l'eau y entrait de partout. Les pêcheurs ramaient, écopaient, criaient des ordres. Mais plus ils luttaient, plus la barque se remplissait. Et Jésus, à l'arrière, dormait toujours. La peur gagna les disciples. Ils le secouèrent : « Maître, cela ne te fait rien que nous soyons en train de mourir ? »",
      "Jésus se réveilla. Il se leva, regarda le vent et la mer, et dit simplement : « Silence ! Tais-toi ! » Aussitôt, le vent tomba. Le lac, une seconde plus tôt déchaîné, devint lisse comme un miroir. Dans la barque, plus un bruit. Seul le clapotis de l'eau contre la coque brisait le calme, et les disciples n'en croyaient pas leurs yeux.",
      "Jésus se tourna vers eux, sans colère mais avec douceur : « Pourquoi avez-vous si peur ? N'avez-vous pas encore de foi ? » Les disciples, stupéfaits, se murmuraient : « Qui est donc cet homme, pour que même le vent et la mer lui obéissent ? » Ils avaient découvert que Jésus était dans la barque avec eux, et qu'avec lui, aucune tempête n'a le dernier mot.",
    ],
    lesson: {
      title: "Dans la tempête, Jésus est dans la barque avec toi",
      text: "Les disciples avaient cru que Jésus ne se souciait pas d'eux, parce qu'il dormait. Mais il était là, et il avait le pouvoir de calmer la tempête. Dans les moments où tout va mal (une dispute, une mauvaise note, une peur, un deuil), tu n'es pas seul dans la barque. Tu peux l'appeler, comme eux, même si ta prière tient en une phrase.",
      action:
        "La prochaine fois que tu auras peur, respire et dis simplement : « Jésus, aide-moi. » Puis raconte-lui ce qui t'inquiète.",
    },
    keyVerse: {
      text: "Pourquoi avez-vous si peur ? N'avez-vous pas encore de foi ?",
      ref: "Marc 4,40",
    },
  },
  {
    slug: "zachee-sycomore",
    title: "Zachée, l'homme dans l'arbre",
    reference: "Luc 19,1–10",
    referenceDetail: "Évangile selon Luc, chapitre 19, versets 1 à 10",
    theme: "Pardon de Dieu",
    age: "6+",
    durationMin: 6,
    gradient: "from-lime-500 via-green-600 to-emerald-800",
    emoji: "🌳",
    image: "/images/stories/zachee.jpg",
    unsplash:
      "https://unsplash.com/s/photos/old-tree-sunlight (grand arbre dans la lumière du matin)",
    excerpt:
      "Petit de taille, riche, détesté de tous… Zachée est monté dans un arbre pour voir Jésus de loin. Il ne s'attendait pas à ce que Jésus s'arrête juste en dessous et l'appelle par son nom.",
    paragraphs: [
      "Dans la ville de Jéricho vivait un homme que tout le monde connaissait, et que presque personne n'aimait : Zachée. Il était chef des collecteurs d'impôts, un métier détesté, car ces hommes travaillaient pour les Romains et prenaient souvent plus d'argent que nécessaire. Zachée était devenu très riche, mais il était seul. Quand il passait dans la rue, les gens détournaient le regard. Et ce jour-là, la ville entière était dehors : Jésus de Nazareth traversait Jéricho.",
      "Zachée voulait voir qui était Jésus, mais il était tout petit, et la foule formait un mur devant lui. Sauter ne servait à rien. Alors, sans se soucier du ridicule, cet homme important courut en avant et grimpa dans un sycomore, un grand arbre au bord du chemin, pour voir passer Jésus de loin. Les passants ricanèrent peut-être en voyant le grand chef des impôts perché dans les branches comme un enfant. Mais lui ne pensait qu'à une chose : voir Jésus.",
      "Quand Jésus arriva sous l'arbre, il s'arrêta. Il leva les yeux, croisa le regard de Zachée et dit : « Zachée, descends vite, car aujourd'hui il faut que je demeure chez toi. » Zachée faillit tomber de l'arbre ! Il descendit en hâte, le cœur plein de joie. Dans la foule, des voix murmurèrent : « Il va loger chez un homme malhonnête ! » Mais Jésus ne regardait pas la réputation de Zachée : il regardait Zachée.",
      "À table, quelque chose se brisa en Zachée. Il se leva et dit : « Seigneur, je donne la moitié de mes biens aux pauvres, et si j'ai pris trop à quelqu'un, je lui rends quatre fois plus. » Personne ne le lui avait demandé : l'accueil de Jésus avait suffi à changer son cœur. Jésus sourit : « Aujourd'hui, le salut est entré dans cette maison. Car le Fils de l'homme est venu chercher et sauver ce qui était perdu. »",
    ],
    lesson: {
      title: "Jésus nous voit tels que nous sommes, et il nous aime déjà",
      text: "Zachée avait mal agi, et tout le monde le savait. Pourtant, c'est lui que Jésus a choisi d'appeler par son nom. Le changement n'est pas venu de reproches, mais d'un accueil. Quand quelqu'un nous accepte tel que nous sommes, on a envie de devenir meilleur. Jésus te regarde comme il a regardé Zachée, avec un regard qui relève, et il peut aussi t'apprendre à regarder les autres ainsi.",
      action:
        "Pense à quelqu'un que tout le monde met de côté. Sois la personne qui lui parle ou qui l'invite aujourd'hui.",
    },
    keyVerse: {
      text: "Le Fils de l'homme est venu chercher et sauver ce qui était perdu.",
      ref: "Luc 19,10",
    },
  },
  {
    slug: "cinq-pains-deux-poissons",
    title: "Le petit garçon et les cinq pains",
    reference: "Jean 6,1–13",
    referenceDetail: "Évangile selon Jean, chapitre 6, versets 1 à 13",
    theme: "Amour du prochain",
    age: "6+",
    durationMin: 6,
    gradient: "from-orange-400 via-amber-600 to-yellow-800",
    emoji: "🍞",
    image: "/images/stories/cinq-pains.jpg",
    unsplash:
      "https://unsplash.com/s/photos/bread-basket-fish (panier de pain et de poissons sur une table simple)",
    excerpt:
      "Cinq mille hommes, des femmes, des enfants, et presque rien à manger. Mais un petit garçon avait un panier de provisions, et il a accepté de le donner.",
    paragraphs: [
      "Des foules entières suivaient Jésus. Ce jour-là, elles l'avaient suivi de l'autre côté du lac de Galilée, jusque sur une colline couverte d'herbe. Plus de cinq mille hommes étaient là, sans compter les femmes et les enfants. Le soir approchait, et personne n'avait rien mangé. Jésus regarda la foule, puis se tourna vers son disciple Philippe : « Où pourrions-nous acheter du pain pour tous ces gens ? » Il savait déjà ce qu'il allait faire, mais il voulait voir ce que Philippe répondrait.",
      "Philippe fit un calcul rapide : « Même avec deux cents pièces d'argent, il n'y aurait pas assez de pain pour que chacun en ait un petit morceau ! » Les disciples cherchèrent partout. Seul André trouva quelque chose : « Il y a ici un garçon qui a cinq pains d'orge et deux poissons. Mais qu'est-ce que c'est pour tant de monde ? » C'était le repas d'un enfant, très simple, du pain d'orge, le pain des pauvres. Mais le garçon, lui, n'avait pas dit non. Il avait accepté de le donner.",
      "Jésus dit : « Faites asseoir tout le monde. » Les gens s'installèrent sur l'herbe, par groupes. Jésus prit les pains, remercia Dieu, et commença à les distribuer. Puis il fit de même avec les poissons. Les disciples passaient de rang en rang, et à chaque fois qu'ils revenaient, le panier était encore plein. Tout le monde mangea à sa faim, jusqu'au dernier. Personne ne comprit comment, mais personne ne repartit le ventre vide.",
      "Quand tout le monde fut rassasié, Jésus dit : « Ramassez les morceaux qui restent, afin que rien ne soit perdu. » Les disciples remplirent douze paniers de morceaux de pain. Avec le repas d'un seul enfant, Jésus avait nourri des milliers de personnes et il en restait encore. Le garçon est reparti avec une histoire qu'il n'oublierait jamais : ce qu'on donne à Jésus, même petit, peut devenir beaucoup.",
    ],
    lesson: {
      title: "Ce que tu donnes, même petit, peut devenir grand",
      text: "Le garçon n'avait pas beaucoup, et il aurait pu garder son repas pour lui. Mais il l'a donné, et Dieu a fait le reste. Tu n'as pas besoin d'être riche, fort ou important pour aider : ton goûter, ton temps, un sourire, une prière peuvent devenir une grande bénédiction quand ils sont offerts avec un cœur généreux.",
      action:
        "Donne aujourd'hui quelque chose de simple (ton goûter, une heure, un mot gentil) à quelqu'un qui en a besoin, sans rien attendre en retour.",
    },
    keyVerse: {
      text: "Il y a ici un garçon qui a cinq pains d'orge et deux poissons.",
      ref: "Jean 6,9",
    },
  },
  {
    slug: "veuve-offrande",
    title: "La veuve et ses deux petites pièces",
    reference: "Marc 12,41–44",
    referenceDetail: "Évangile selon Marc, chapitre 12, versets 41 à 44",
    theme: "Générosité",
    age: "6+",
    durationMin: 5,
    gradient: "from-stone-500 via-amber-700 to-yellow-900",
    emoji: "🪙",
    image: "/images/stories/veuve.jpg",
    unsplash:
      "https://unsplash.com/s/photos/old-coins-hands (deux petites pièces dans une main)",
    excerpt:
      "Des riches donnent beaucoup, avec bruit et fierté. Une pauvre veuve glisse deux minuscules pièces, sans un mot. Jésus, lui, a tout vu, et il a dit que c'était elle qui avait donné le plus.",
    paragraphs: [
      "Jésus était assis dans le Temple de Jérusalem, face à la salle du trésor où l'on déposait les offrandes. Des troncs en forme de trompette recevaient les pièces, et plus la somme était grosse, plus le bruit était fort. Jésus observait la foule. De riches personnages passaient, l'un après l'autre, et laissaient tomber de grosses sommes d'argent dans un grand fracas. Tout le monde les regardait avec admiration. Ils donnaient beaucoup, c'était vrai, mais seulement une petite partie de leur fortune.",
      "Puis une femme arriva, discrète, vêtue de façon très simple. C'était une veuve pauvre, sans mari pour la protéger, sans revenus. Elle s'approcha d'un des troncs, sortit de sa main deux toutes petites pièces de cuivre, les plus petites qui existaient, qui valaient presque rien, et les laissa tomber. Clic, clic. Pas un bruit. Personne ne se retourna. Elle repartit aussi silencieusement qu'elle était venue.",
      "Jésus appela alors ses disciples et leur dit : « Je vous le dis, cette pauvre veuve a mis plus que tous les autres. Eux ont donné de leur superflu. Elle, dans sa pauvreté, a donné tout ce qu'elle avait pour vivre. » Les disciples la regardèrent partir. Pour Dieu, la valeur d'un don ne se mesure pas à son montant, mais à l'amour et à la confiance qu'il y a dedans. Cette femme avait donné tout son avenir entre les mains de Dieu.",
    ],
    lesson: {
      title: "Dieu regarde le cœur, pas la taille du don",
      text: "Tu n'as peut-être pas grand-chose à donner, mais Dieu ne compare pas. Ce qui compte pour lui, c'est la sincérité, et ce que le don te coûte vraiment. Un petit geste fait de tout son cœur, comme aider un camarade, partager du temps ou prier pour quelqu'un, vaut plus qu'un grand geste fait pour être vu.",
      action:
        "Fais aujourd'hui un geste généreux que personne ne verra : un service rendu en cachette, une pièce donnée, un mot d'encouragement.",
    },
    keyVerse: {
      text: "Cette pauvre veuve a mis plus que tous les autres.",
      ref: "Marc 12,43",
    },
  },
  {
    slug: "samuel-ecoute",
    title: "Samuel entend son nom dans la nuit",
    reference: "1 Samuel 3",
    referenceDetail: "Premier livre de Samuel, chapitre 3",
    theme: "Prière",
    age: "6+",
    durationMin: 6,
    gradient: "from-violet-500 via-purple-700 to-indigo-900",
    emoji: "🕯️",
    image: "/images/stories/samuel.jpg",
    unsplash:
      "https://unsplash.com/s/photos/candle-night-dark (petite flamme dans la nuit)",
    excerpt:
      "Trois fois, un enfant se lève en pleine nuit, convaincu que son maître l'appelle. Il faudra l'aide d'un vieil homme pour comprendre que c'est Dieu qui lui parle.",
    paragraphs: [
      "Le petit Samuel vivait à Silo, dans le sanctuaire de Dieu, auprès du vieux prêtre Éli. Sa mère Anne l'avait confié à Dieu quand il était tout petit, et chaque jour il rendait de petits services : ouvrir les portes, allumer les lampes, aider Éli, dont la vue baissait. À cette époque, il était rare que Dieu parle. Presque personne n'écoutait vraiment. Une nuit, Samuel dormait près du coffre de l'alliance, quand il entendit une voix l'appeler : « Samuel ! »",
      "« Me voici ! » répondit-il, et il courut chez Éli. « Tu m'as appelé ? » « Non, mon enfant, je ne t'ai pas appelé. Retourne te coucher. » Samuel retourna se coucher. Quelques instants plus tard : « Samuel ! » Il se releva et courut encore : « Me voici, tu m'as bien appelé ! » « Non, mon fils, retourne dormir. » Samuel ne savait pas encore que cette voix venait de Dieu. À la troisième fois, il courut de nouveau chez Éli, tout essoufflé.",
      "Cette fois, Éli comprit. Il dit à Samuel : « Va te coucher. Et si on t'appelle encore, tu répondras : Parle, Éternel, car ton serviteur écoute. » Samuel retourna s'étendre, le cœur battant. Et Dieu l'appela de nouveau : « Samuel ! Samuel ! » Samuel répondit exactement comme Éli le lui avait appris : « Parle, car ton serviteur écoute. » Alors Dieu lui confia un message difficile, mais important pour tout le peuple.",
      "Le lendemain matin, Samuel avait peur de répéter ce qu'il avait entendu. Mais Éli l'appela : « Samuel, mon fils, ne me cache rien. » Alors Samuel dit toute la vérité, sans rien omettre. Éli répondit avec humilité : « C'est l'Éternel. Qu'il fasse ce qui lui semblera bon. » Samuel grandit, Dieu était avec lui, et aucune de ses paroles ne tomba à terre. De Dan à Beer-Schéba, tout Israël sut qu'il avait un vrai messager de Dieu, cet enfant que Dieu avait appelé par son nom.",
    ],
    lesson: {
      title: "Dieu parle à ceux qui écoutent, même aux plus jeunes",
      text: "Samuel était un enfant, et c'est lui que Dieu a appelé. Mais il fallait un adulte, Éli, pour l'aider à reconnaître la voix. Prier, ce n'est pas seulement parler : c'est aussi se taire pour écouter. Et quand on ne sait pas comment faire, on peut demander de l'aide à quelqu'un de plus expérimenté dans la foi.",
      action:
        "Ce soir, avant de dormir, prends deux minutes de silence et dis : « Parle, Seigneur, ton serviteur écoute. » Puis écoute, sans rien demander.",
    },
    keyVerse: {
      text: "Parle, car ton serviteur écoute.",
      ref: "1 Samuel 3,10",
    },
  },
  {
    slug: "dix-lepreux",
    title: "Les dix lépreux et le seul qui est revenu",
    reference: "Luc 17,11–19",
    referenceDetail: "Évangile selon Luc, chapitre 17, versets 11 à 19",
    theme: "Gratitude",
    age: "7+",
    durationMin: 6,
    gradient: "from-emerald-400 via-teal-600 to-cyan-800",
    emoji: "🙏",
    image: "/images/stories/lepreux.jpg",
    unsplash:
      "https://unsplash.com/s/photos/road-village-sunrise (chemin de village au lever du soleil)",
    excerpt:
      "Dix hommes exclus de tous, un cri vers Jésus, dix guérisons… et un seul qui fait demi-tour pour dire merci. Et c'était l'étranger.",
    paragraphs: [
      "Jésus marchait vers Jérusalem, entre la Samarie et la Galilée. À l'entrée d'un village, dix hommes l'attendaient, tout au bord du chemin, à distance. Ils étaient lépreux. À cette époque, cette maladie de la peau rendait « impur » : on devait vivre loin des autres, ne toucher personne, et crier « Impur ! » en passant. Les dix vivaient seuls, loin de leur famille, loin de leurs amis, sans rien pouvoir espérer. Mais ils avaient entendu parler de Jésus.",
      "Dès qu'ils le virent approcher, ils élevèrent la voix tous ensemble : « Jésus, maître, aie pitié de nous ! » Jésus les regarda et dit simplement : « Allez vous montrer aux prêtres. » Selon la loi, seul un prêtre pouvait déclarer quelqu'un guéri. Pourtant, ils n'étaient pas encore guéris ! Mais les dix obéirent et se mirent en route. Et en chemin, leur peau devint nette. Imagine leur joie : plus de taches, plus de douleur, plus d'exclusion !",
      "Neuf d'entre eux continuèrent de courir vers les prêtres, vers leurs familles, vers leur nouvelle vie. Un seul s'arrêta. C'était un Samaritain, un étranger que beaucoup de gens méprisaient. Il fit demi-tour en courant, louant Dieu à pleine voix, et se jeta aux pieds de Jésus pour le remercier. Le visage contre terre, il ne trouvait pas assez de mots pour dire sa joie.",
      "Jésus regarda autour de lui et demanda : « Les dix n'ont-ils pas été guéris ? Où sont les neuf autres ? Il n'y a que cet étranger qui soit revenu pour rendre gloire à Dieu ? » Puis il dit à l'homme : « Lève-toi et va. Ta foi t'a sauvé. » Les neuf avaient reçu un cadeau. Le dixième avait reçu bien plus : une rencontre avec celui qui l'avait guéri, et un cœur guéri avec son corps.",
    ],
    lesson: {
      title: "Un simple merci change un cadeau en rencontre",
      text: "On oublie facilement de remercier, surtout quand les choses vont bien. Les neuf n'étaient pas méchants, ils étaient simplement pressés d'en profiter. Le Samaritain, lui, a pris le temps de revenir. Dire merci, c'est reconnaître que ce qu'on a est un don, et cela rend le cœur plus heureux, à Dieu comme aux personnes qui nous ont aidés.",
      action:
        "Écris ou dis merci à trois personnes aujourd'hui, et remercie Dieu pour trois choses précises de ta journée.",
    },
    keyVerse: {
      text: "Les dix n'ont-ils pas été guéris ? Où sont les neuf autres ?",
      ref: "Luc 17,17",
    },
  },
  {
    slug: "nehemie-muraille",
    title: "Néhémie rebâtit la muraille",
    reference: "Néhémie 1–6",
    referenceDetail: "Livre de Néhémie, chapitres 1 à 6",
    theme: "Persévérance",
    age: "9+",
    durationMin: 9,
    gradient: "from-stone-500 via-orange-700 to-red-900",
    emoji: "🧱",
    image: "/images/stories/nehemie.jpg",
    unsplash:
      "https://unsplash.com/s/photos/ancient-stone-wall-jerusalem (ancienne muraille de pierre au soleil couchant)",
    excerpt:
      "Une ville en ruines, des moqueries, des menaces… et un échanson du roi de Perse qui répond : « Je fais un grand travail, je ne peux pas descendre. » En cinquante-deux jours, la muraille était debout.",
    paragraphs: [
      "Néhémie était un Juif exilé en Perse, devenu l'échanson du roi Artaxerxès, celui qui goûtait et servait le vin du roi. Un jour, son frère arriva de Jérusalem avec de mauvaises nouvelles : « Les habitants vivent dans la détresse. Les murailles de la ville sont en ruine, et ses portes ont été brûlées. » Néhémie s'assit et pleura. Pendant plusieurs jours, il jeûna et pria : « Seigneur, accorde-moi la faveur du roi. » Il ne pouvait pas oublier sa ville détruite.",
      "Quelques mois plus tard, le roi remarqua son visage triste, ce qui était dangereux devant un roi : « Pourquoi as-tu mauvaise mine ? » Néhémie, terrifié, murmura une courte prière au Dieu du ciel, puis répondit : « Ma ville natale est en ruine. Permets-moi d'aller la rebâtir. » Contre toute attente, le roi accepta ! Il lui donna des lettres de protection et du bois pour les portes. Néhémie partit pour Jérusalem, où il inspecta les murailles de nuit, en secret, avant de parler au peuple : « Venez, rebâtissons la muraille ! »",
      "Tout le monde se mit au travail : prêtres, marchands, orfèvres, familles entières, chacun réparait la portion devant sa maison. Mais les ennemis arrivèrent. Sanballat et Tobiya se moquèrent : « Que font ces pauvres Juifs ? Si un renard monte sur leur muraille, il la fera tomber ! » Puis ils menacèrent d'attaquer. Néhémie organisa le chantier autrement : la moitié des hommes bâtissait, l'autre moitié montait la garde, la lance à la main. Même les maçons travaillaient avec une épée à la ceinture.",
      "Les ennemis tentèrent un dernier piège : « Viens nous rencontrer dans la plaine. » C'était une ruse pour lui faire du mal. Néhémie répondit : « Je fais un grand travail, je ne peux pas descendre. » Quatre fois ils insistèrent, quatre fois il refusa. Et la muraille fut terminée en cinquante-deux jours. Ses ennemis, voyant cela, perdirent courage : ils comprirent que ce travail avait été accompli avec l'aide de Dieu.",
    ],
    lesson: {
      title: "On avance mieux quand on ne lâche pas, même sous les moqueries",
      text: "Néhémie a prié, puis il s'est mis au travail. Quand on se moquait de lui, il n'a pas répondu à chaque insulte : il a continué à bâtir. Quand il était menacé, il a prévu des gardes sans arrêter le chantier. La persévérance, ce n'est pas ne jamais avoir peur, c'est refuser de se laisser détourner de ce qu'on sait être bon.",
      action:
        "Choisis un projet que tu as laissé tomber, et travaille-y quinze minutes aujourd'hui. Réponds aux découragements par : « Je fais un grand travail. »",
    },
    keyVerse: {
      text: "Levons-nous et bâtissons !",
      ref: "Néhémie 2,18",
    },
  },
  {
    slug: "anne-priere",
    title: "Anne et la prière exaucée",
    reference: "1 Samuel 1–2",
    referenceDetail: "Premier livre de Samuel, chapitres 1 et 2",
    theme: "Prière",
    age: "8+",
    durationMin: 7,
    gradient: "from-pink-500 via-rose-600 to-fuchsia-800",
    emoji: "🕊️",
    image: "/images/stories/anne.jpg",
    unsplash:
      "https://unsplash.com/s/photos/woman-praying-light (silhouette en prière dans la lumière douce)",
    excerpt:
      "Elle pleurait tant que le prêtre l'a prise pour une femme ivre. Mais Anne ne faisait que parler à Dieu du fond du cœur. Et Dieu l'a entendue.",
    paragraphs: [
      "Chaque année, Anne montait avec son mari Elkana au sanctuaire de Silo pour adorer Dieu. Mais ce voyage lui faisait mal : elle n'avait pas d'enfant, alors que l'autre épouse d'Elkana, Peninna, en avait plusieurs, et ne manquait pas une occasion de se moquer d'elle. Anne pleurait au point de ne plus pouvoir manger. Elkana essayait de la consoler : « Anne, pourquoi pleures-tu ? Ne suis-je pas pour toi mieux que dix fils ? » Mais son cœur restait lourd.",
      "Un jour, après le repas, Anne se leva et alla dans le sanctuaire. Là, le cœur brisé, elle pria Dieu en pleurant : « Seigneur, regarde ma détresse. Si tu me donnes un fils, je te le donnerai pour toute sa vie. » Elle priait en silence, seules ses lèvres bougeaient. Le prêtre Éli, qui l'observait, crut qu'elle était ivre : « Jusqu'à quand resteras-tu dans cet état ? » Anne répondit avec douceur : « Non, mon seigneur, je suis une femme qui souffre. Je répandais mon cœur devant l'Éternel. »",
      "Éli comprit son erreur. Il lui dit avec bonté : « Va en paix, et que le Dieu d'Israël t'accorde ce que tu lui as demandé. » Anne repartit, mangea, et son visage n'était plus le même. Elle n'avait pas encore reçu de réponse visible, mais elle avait déposé son fardeau. Quelque temps plus tard, elle donna naissance à un fils. Elle l'appela Samuel, ce qui évoque « Dieu a entendu », parce que, disait-elle, « je l'ai demandé à l'Éternel ».",
      "Anne tint sa promesse. Quand Samuel eut quelques années, elle l'amena à Silo auprès d'Éli : « C'est pour cet enfant que je priais, et l'Éternel m'a accordé ce que je lui demandais. À mon tour, je le donne à l'Éternel. » Puis elle chanta, le cœur débordant de joie : « Mon cœur se réjouit en l'Éternel ! » Et Dieu continua de bénir Anne : elle eut encore trois fils et deux filles. Elle avait prié du fond de sa douleur, et Dieu avait changé ses larmes en chant.",
    ],
    lesson: {
      title: "Tu peux tout dire à Dieu, même quand tu n'as pas de mots",
      text: "Anne a prié avec ses larmes, sans phrases parfaites, et Dieu l'a entendue. Il n'y a pas de mauvaise façon de prier : tu peux lui parler de ta tristesse, de ta colère, de ce que tu désires. Et Anne nous montre aussi que ce qu'on reçoit de Dieu ne s'accapare pas : elle a donné à Dieu ce qu'elle avait de plus précieux.",
      action:
        "Prends dix minutes ce soir pour raconter à Dieu ce que tu as sur le cœur, avec tes propres mots, sans te retenir.",
    },
    keyVerse: {
      text: "C'est pour cet enfant que je priais, et l'Éternel m'a accordé ma demande.",
      ref: "1 Samuel 1,27",
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
