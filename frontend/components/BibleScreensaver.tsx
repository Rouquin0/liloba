"use client";

import { useEffect, useState } from "react";

// 66 versets célèbres, un pour chaque livre de la Bible (LSG 1910)
const VERSETS = [
  { ref: "Genèse 1:1", text: "Au commencement, Dieu créa les cieux et la terre." },
  { ref: "Exode 14:14", text: "L'Éternel combattra pour vous ; et vous, gardez le silence." },
  { ref: "Lévitique 19:18", text: "Tu aimeras ton prochain comme toi-même." },
  { ref: "Nombres 6:24", text: "Que l'Éternel te bénisse, et qu'il te garde !" },
  { ref: "Deutéronome 6:5", text: "Tu aimeras l'Éternel, ton Dieu, de tout ton cœur, de toute ton âme et de toute ta force." },
  { ref: "Josué 1:9", text: "Fortifie-toi et prends courage. Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras." },
  { ref: "Juges 6:12", text: "L'ange de l'Éternel lui apparut, et lui dit : L'Éternel est avec toi, vaillant héros !" },
  { ref: "Ruth 1:16", text: "Où tu iras j'irai, où tu demeureras je demeurerai ; ton peuple sera mon peuple, et ton Dieu sera mon Dieu." },
  { ref: "1 Samuel 16:7", text: "L'homme regarde à ce qui frappe les yeux, mais l'Éternel regarde au cœur." },
  { ref: "2 Samuel 22:31", text: "Les voies de Dieu sont parfaites, la parole de l'Éternel est éprouvée." },
  { ref: "1 Rois 8:23", text: "Ô Éternel, Dieu d'Israël ! Il n'y a point de Dieu semblable à toi, ni dans les cieux en haut, ni sur la terre en bas." },
  { ref: "2 Rois 6:16", text: "Ne crains point, car ceux qui sont avec nous sont en plus grand nombre que ceux qui sont avec eux." },
  { ref: "1 Chroniques 16:11", text: "Cherchez l'Éternel et sa force, recherchez continuellement sa face !" },
  { ref: "2 Chroniques 7:14", text: "Si mon peuple s'humilie, prie, et cherche ma face, et s'il se détourne de ses mauvaises voies, je l'exaucerai des cieux." },
  { ref: "Esdras 8:22", text: "La main de notre Dieu est pour tous ceux qui le cherchent." },
  { ref: "Néhémie 8:10", text: "Ne soyez pas dans la tristesse, car la joie de l'Éternel sera votre force." },
  { ref: "Esther 4:14", text: "Qui sait si ce n'est pas pour un temps comme celui-ci que tu es parvenue à la royauté ?" },
  { ref: "Job 19:25", text: "Mais je sais que mon rédempteur est vivant." },
  { ref: "Psaumes 23:1", text: "L'Éternel est mon berger : je ne manquerai de rien." },
  { ref: "Proverbes 3:5", text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse." },
  { ref: "Ecclésiaste 3:1", text: "Il y a un temps pour tout, un temps pour toute chose sous les cieux." },
  { ref: "Cantique des Cantiques 8:7", text: "Les grandes eaux ne peuvent éteindre l'amour, et les fleuves ne le submergeraient pas." },
  { ref: "Ésaïe 40:31", text: "Ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles." },
  { ref: "Jérémie 29:11", text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance." },
  { ref: "Lamentations 3:22-23", text: "Les bontés de l'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin." },
  { ref: "Ézéchiel 36:26", text: "Je vous donnerai un cœur nouveau, et je mettrai en vous un esprit nouveau." },
  { ref: "Daniel 3:17", text: "Notre Dieu, que nous servons, peut nous délivrer de la fournaise ardente." },
  { ref: "Osée 6:3", text: "Connaissons, cherchons à connaître l'Éternel ; sa venue est aussi certaine que celle de l'aurore." },
  { ref: "Joël 2:25", text: "Je vous rendrai les années qu'ont mangées la sauterelle." },
  { ref: "Amos 5:24", text: "Que la justice coule comme une eau, et la droiture comme un torrent qui ne tarit jamais." },
  { ref: "Abdias 1:15", text: "Car le jour de l'Éternel est proche pour toutes les nations." },
  { ref: "Jonas 2:2", text: "Dans ma détresse, j'ai invoqué l'Éternel, et il m'a exaucé." },
  { ref: "Michée 6:8", text: "Ce que l'Éternel demande de toi : c'est que tu pratiques la justice, que tu aimes la miséricorde, et que tu marches humblement avec ton Dieu." },
  { ref: "Nahum 1:7", text: "L'Éternel est bon, il est un refuge au jour de la détresse." },
  { ref: "Habacuc 3:19", text: "L'Éternel, le Seigneur, est ma force ; il rend mes pieds semblables à ceux des biches." },
  { ref: "Sophonie 3:17", text: "L'Éternel, ton Dieu, est au milieu de toi, comme un héros qui sauve ; il fera de toi sa plus grande joie." },
  { ref: "Aggée 2:9", text: "La gloire de cette dernière maison sera plus grande que celle de la première, dit l'Éternel." },
  { ref: "Zacharie 4:6", text: "Ce n'est ni par la puissance ni par la force, mais c'est par mon esprit, dit l'Éternel des armées." },
  { ref: "Malachie 3:10", text: "Apportez à la maison du trésor toutes les dîmes, et vous verrez si je n'ouvre pas pour vous les écluses des cieux." },
  { ref: "Matthieu 11:28", text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos." },
  { ref: "Marc 11:24", text: "Tout ce que vous demanderez en priant, croyez que vous l'avez reçu, et vous le verrez s'accomplir." },
  { ref: "Luc 1:37", text: "Car rien n'est impossible à Dieu." },
  { ref: "Jean 3:16", text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle." },
  { ref: "Actes 1:8", text: "Vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins." },
  { ref: "Romains 8:28", text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu." },
  { ref: "1 Corinthiens 13:4", text: "L'amour est patient, il est plein de bonté ; l'amour n'est point envieux ; il ne se vante point, il ne s'enfle point d'orgueil." },
  { ref: "2 Corinthiens 5:17", text: "Si quelqu'un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées ; voici, toutes choses sont devenues nouvelles." },
  { ref: "Galates 5:22", text: "Le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité." },
  { ref: "Éphésiens 2:8", text: "C'est par la grâce que vous êtes sauvés, par le moyen de la foi." },
  { ref: "Philippiens 4:13", text: "Je puis tout par celui qui me fortifie." },
  { ref: "Colossiens 3:23", text: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes." },
  { ref: "1 Thessaloniciens 5:16-18", text: "Soyez toujours joyeux. Priez sans cesse. Rendez grâces en toutes choses." },
  { ref: "2 Thessaloniciens 3:3", text: "Le Seigneur est fidèle, il vous affermira et vous préservera du malin." },
  { ref: "1 Timothée 4:12", text: "Que personne ne méprise ta jeunesse ; mais sois un modèle pour les fidèles." },
  { ref: "2 Timothée 1:7", text: "Dieu ne nous a pas donné un esprit de timidité, mais un esprit de force, d'amour et de sagesse." },
  { ref: "Tite 3:5", text: "Il nous a sauvés, non à cause des œuvres de justice que nous aurions faites, mais selon sa miséricorde." },
  { ref: "Philémon 1:7", text: "J'ai eu une grande joie et de la consolation, à cause de ton amour." },
  { ref: "Hébreux 11:1", text: "Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit point." },
  { ref: "Jacques 1:5", text: "Si quelqu'un d'entre vous manque de sagesse, qu'il la demande à Dieu, qui donne à tous simplement." },
  { ref: "1 Pierre 5:7", text: "Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous." },
  { ref: "2 Pierre 3:9", text: "Le Seigneur use de patience envers vous, ne voulant pas qu'aucun périsse, mais voulant que tous arrivent à la repentance." },
  { ref: "1 Jean 4:8", text: "Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour." },
  { ref: "2 Jean 1:6", text: "Et l'amour consiste à marcher selon ses commandements." },
  { ref: "3 Jean 1:4", text: "Je n'ai pas de plus grande joie que d'apprendre que mes enfants marchent dans la vérité." },
  { ref: "Jude 1:24-25", text: "À celui qui peut vous préserver de toute chute et vous faire paraître devant sa gloire irrépréhensibles et dans l'allégresse, à Dieu seul notre Sauveur..." },
  { ref: "Apocalypse 21:4", text: "Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n'y aura plus ni deuil, ni cri, ni douleur." },
];

export default function BibleScreensaver() {
  const [isVisible, setIsVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // On ne l'active que sur desktop (écran > 768px)
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      if (isVisible) return; // Ne reset pas si déjà visible
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsVisible(true);
      }, 120000); // 2 minutes d'inactivité
    };

    const hideScreensaver = () => {
      if (isVisible) {
        setIsVisible(false);
        resetTimer();
      }
    };

    // Écoute les mouvements de souris et clavier
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("click", hideScreensaver);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("click", hideScreensaver);
    };
  }, [isVisible]);

  // Changement de verset toutes les 60 secondes
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % VERSETS.length);
    }, 60000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const current = VERSETS[index];

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--background)] p-8 md:p-16 text-center cursor-pointer"
      onClick={() => setIsVisible(false)}
    >
      <div className="max-w-5xl">
        <p
          className="text-2xl font-bold leading-relaxed text-[var(--color-primary)] md:text-4xl lg:text-5xl lg:leading-snug"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          « {current.text} »
        </p>
        <p className="mt-8 text-lg font-bold tracking-widest text-[var(--muted)] uppercase md:text-xl">
          {current.ref}
        </p>
      </div>
      <p className="absolute bottom-8 text-xs text-[var(--muted)] opacity-50">
        Cliquez ou bougez la souris pour continuer
      </p>
    </div>
  );
}
