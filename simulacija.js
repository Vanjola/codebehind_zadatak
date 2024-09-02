console.log("Početak simulacije turnira...");
console.log("//////////////////////////////");

// Tim class
class Tim {
  constructor(ime, ISOCode, rank) {
    this.ime = ime;
    this.ISOCode = ISOCode;
    this.rank = rank;
    this.pobede = 0;
    this.porazi = 0;
    this.poeniDati = 0;
    this.poeniPrimljeni = 0;
    this.bodovi = 0;
    this.predaja = false;
    this.forma = 0;
  }
  toString() {
    return this.ime;
  }
}

class BodGrupa {
  constructor(bodovi) {
    this.bodovi = bodovi;
    this.brojac = 0;
    this.timovi = [];
  }

  dodajTim(tim) {
    this.brojac += 1;
    this.timovi.push(tim);
  }
}
class Rezultati {
  constructor() {
    this.rezultati = [];
  }

  dodajUtakmicu(tim1, tim2, pobednik, poeni1, poeni2) {
    this.rezultati.push({ tim1, tim2, pobednik, poeni1, poeni2 });
  }

  pronadjiRezultat(tim1, tim2) {
    return this.rezultati.find(
      (r) =>
        (r.tim1 === tim1 && r.tim2 === tim2) ||
        (r.tim1 === tim2 && r.tim2 === tim1)
    );
  }
}
const rezultati = new Rezultati();
// Grupa class
class Grupa {
  constructor(ime, timovi) {
    this.ime = ime;
    this.timovi = timovi;
    this.paroviPoKolima = this.definisiParovePoKolima();
    this.rezultati = rezultati;
    this.bodGrupe = {
      3: new BodGrupa(3),
      4: new BodGrupa(4),
      5: new BodGrupa(5),
      6: new BodGrupa(6),
    };
  }

  definisiParovePoKolima() {
    return {
      1: [
        [this.timovi[0], this.timovi[1]],
        [this.timovi[2], this.timovi[3]],
      ],
      2: [
        [this.timovi[0], this.timovi[2]],
        [this.timovi[1], this.timovi[3]],
      ],
      3: [
        [this.timovi[0], this.timovi[3]],
        [this.timovi[1], this.timovi[2]],
      ],
    };
  }

  simulirajKolo(kolo) {
    const parovi = this.paroviPoKolima[kolo];

    console.log(`Grupa - ${this.ime} - Kolo ${kolo}:`);

    parovi.forEach(([tim1, tim2]) => {
      const { pobednik, poeni1, poeni2 } = utakmicaFn(tim1, tim2);
      console.log(`${tim1.ime} - ${tim2.ime} (${poeni1}:${poeni2})`);
      this.rezultati.dodajUtakmicu(tim1, tim2, pobednik, poeni1, poeni2);
    });
  }

  punjenjeBodova() {
    this.timovi.forEach((tim) => {
      const bodGrupa = this.bodGrupe[tim.bodovi];
      if (bodGrupa) bodGrupa.dodajTim(tim);
    });
  }

  resiDvaTima(timovi) {
    const [tim1, tim2] = timovi;
    const index1 = this.timovi.indexOf(tim1);
    const index2 = this.timovi.indexOf(tim2);

    const boljiIndex = Math.min(index1, index2);
    const goriIndex = Math.max(index1, index2);

    const rezultat = this.rezultati.pronadjiRezultat(tim1, tim2);

    const pobednik = rezultat.pobednik === tim1 ? tim1 : tim2;

    if (pobednik === tim1) {
      console.log(
        `Izjednačenje između ${tim1.ime} i ${tim2.ime}. Pobednik: ${tim1.ime}`
      );
      this.zameniTimove(tim1, this.timovi[boljiIndex]);
      this.zameniTimove(tim2, this.timovi[goriIndex]);
    } else {
      console.log(
        `Izjednačenje između ${tim1.ime} i ${tim2.ime}. Pobednik: ${tim2.ime}`
      );
      this.zameniTimove(tim2, this.timovi[boljiIndex]);
      this.zameniTimove(tim1, this.timovi[goriIndex]);
    }
  }

  resiTriTima(timovi) {
    const relevantniRezultati = this.rezultati.rezultati.filter(
      (resultat) =>
        timovi.includes(resultat.tim1) && timovi.includes(resultat.tim2)
    );

    const kosRazlika = timovi.map((tim) => {
      const razlika = relevantniRezultati
        .filter((r) => r.tim1 === tim || r.tim2 === tim)
        .reduce((sum, r) => {
          if (r.tim1 === tim) {
            return sum + (r.poeni1 - r.poeni2);
          } else {
            return sum + (r.poeni2 - r.poeni1);
          }
        }, 0);
      return { tim, kosRazlika: razlika };
    });

    const sviTimovi = this.timovi;
    const preostaliTim = sviTimovi.find((tim) => !timovi.includes(tim));

    if (preostaliTim) {
      this.timovi.splice(sviTimovi.indexOf(preostaliTim), 1);
    }

    if (preostaliTim && preostaliTim.bodovi == 6) {
      this.timovi.unshift(preostaliTim);
    }

    if (preostaliTim && preostaliTim.bodovi == 3) {
      this.timovi.push(preostaliTim);
    }

    kosRazlika.sort((a, b) => b.kosRazlika - a.kosRazlika);

    for (let i = 0; i < timovi.length; i++) {
      const tim = kosRazlika[i].tim;
      const index = this.timovi.indexOf(tim);
      if (index > -1) {
        this.timovi.splice(index, 1);
        this.timovi.splice(
          i + (preostaliTim && preostaliTim.bodovi == 6 ? 1 : 0),
          0,
          tim
        );
      }
    }

    console.log("Tri tima sa istim brojem bodova. Kos Razlike:");
    kosRazlika.forEach((item) =>
      console.log(`${item.tim.ime}: ${item.kosRazlika}`)
    );
  }

  resiIzjednacenja() {
    const sortiraneGrupe = Object.values(this.bodGrupe).sort(
      (a, b) => b.brojac - a.brojac
    );

    sortiraneGrupe.forEach((bodGrupa) => {
      if (bodGrupa.brojac == 2) {
        this.resiDvaTima(bodGrupa.timovi);
      } else if (bodGrupa.brojac == 3) {
        this.resiTriTima(bodGrupa.timovi);
      }
    });
  }

  sortiraj() {
    this.timovi.sort((a, b) => {
      if (b.bodovi !== a.bodovi) return b.bodovi - a.bodovi;

      const kosRazlikaA = this.rezultati.rezultati
        .filter((r) => r.tim1 === a || r.tim2 === a)
        .reduce(
          (sum, r) =>
            sum + (r.tim1 === a ? r.poeni1 - r.poeni2 : r.poeni2 - r.poeni1),
          0
        );

      const kosRazlikaB = this.rezultati.rezultati
        .filter((r) => r.tim1 === b || r.tim2 === b)
        .reduce(
          (sum, r) =>
            sum + (r.tim1 === b ? r.poeni1 - r.poeni2 : r.poeni2 - r.poeni1),
          0
        );

      return kosRazlikaB - kosRazlikaA;
    });
  }

  generisiFinalnuTabelu() {
    this.sortiraj();
    this.resiIzjednacenja();

    let tabela = this.timovi.slice();

    const header =
      "Pozicija | Tim                | Bodovi | Pobede | Porazi | PoeniDati | PoeniPrimljeni | RazlikaPoena";
    const separator =
      "---------|---------------------|--------|--------|--------|-----------|----------------|---------------";
    const rows = tabela
      .map(
        (tim, index) =>
          `${(index + 1).toString().padEnd(8)}| ${tim.ime.padEnd(
            20
          )}| ${tim.bodovi.toString().padStart(6)} | ${tim.pobede
            .toString()
            .padStart(6)} | ${tim.porazi
            .toString()
            .padStart(6)} | ${tim.poeniDati
            .toString()
            .padStart(9)} | ${tim.poeniPrimljeni.toString().padStart(14)} | ${(
            tim.poeniDati - tim.poeniPrimljeni
          )
            .toString()
            .padStart(13)}`
      )
      .join("\n");

    console.log(`Tabela za grupu ${this.ime}:`);
    console.log(header);
    console.log(separator);
    console.log(rows);
    console.log("\n");
  }

  zameniTimove(tim1, tim2) {
    const index1 = this.timovi.indexOf(tim1);
    const index2 = this.timovi.indexOf(tim2);
    if (index1 !== -1 && index2 !== -1) {
      [this.timovi[index1], this.timovi[index2]] = [
        this.timovi[index2],
        this.timovi[index1],
      ];
    }
  }
}
class RangLista {
  constructor() {
    this.prvoplasirani = [];
    this.drugoplasirani = [];
    this.treceplasirani = [];
    this.koncnaRangLista = [];
    this.sesiri = {
      D: new Sesir("D"),
      E: new Sesir("E"),
      F: new Sesir("F"),
      G: new Sesir("G"),
    };
    this.paroviGrupa = [];
    this.paroviCetvrtfinala = [];
  }

  dodajTimove(grupa) {
    this.prvoplasirani.push(grupa.timovi[0]);
    this.drugoplasirani.push(grupa.timovi[1]);
    this.treceplasirani.push(grupa.timovi[2]);
  }

  rangirajTimove(timovi) {
    return timovi.sort((a, b) => {
      if (b.bodovi !== a.bodovi) return b.bodovi - a.bodovi;
      const kosRazlikaA = a.poeniDati - a.poeniPrimljeni;
      const kosRazlikaB = b.poeniDati - b.poeniPrimljeni;
      if (kosRazlikaB !== kosRazlikaA) return kosRazlikaB - kosRazlikaA;
      return b.poeniDati - a.poeniDati;
    });
  }

  prikazi() {
    const rangiraniPrvoplasirani = this.rangirajTimove(this.prvoplasirani);
    const rangiraniDrugoplasirani = this.rangirajTimove(this.drugoplasirani);
    const rangiraniTreceplasirani = this.rangirajTimove(this.treceplasirani);

    this.koncnaRangLista = [
      ...rangiraniPrvoplasirani,
      ...rangiraniDrugoplasirani,
      ...rangiraniTreceplasirani,
    ];

    if (this.koncnaRangLista.length > 8) {
      console.log(
        "Tim",
        this.koncnaRangLista[8].ime,
        "je rangiran na 9. poziciji i nece nastaviti takmicenje"
      );
      this.koncnaRangLista.splice(8, 1);
    }

    console.log("Konacna rang lista:");
    let rang = 1;
    this.koncnaRangLista.forEach((tim) => {
      console.log(
        `${rang}. ${tim.ime} (${tim.bodovi} bodova, Koš razlika: ${
          tim.poeniDati - tim.poeniPrimljeni
        }, Postignuti koševi: ${tim.poeniDati})`
      );
      rang++;
    });

    console.log("\nPodela preostalih timova u sesire:");
    let sesirIndex = 0;
    for (let i = 0; i < this.koncnaRangLista.length; i += 2) {
      const sesirKey = Object.keys(this.sesiri)[sesirIndex];
      const sesir = this.sesiri[sesirKey];
      sesir.dodajTim(this.koncnaRangLista[i]);
      if (i + 1 < this.koncnaRangLista.length) {
        sesir.dodajTim(this.koncnaRangLista[i + 1]);
      }
      sesirIndex = (sesirIndex + 1) % Object.keys(this.sesiri).length;
    }

    Object.values(this.sesiri).forEach((sesir) => sesir.prikaziTimove());
  }
}

class Sesir {
  constructor(naziv) {
    this.naziv = naziv;
    this.timovi = [];
  }

  dodajTim(tim) {
    this.timovi.push(tim);
  }

  prikaziTimove() {
    console.log(`Sesir ${this.naziv}:`);
    this.timovi.forEach((tim) => {
      console.log(`- ${tim.ime} `);
    });
  }
}

class Nokaut {
  constructor(rangLista) {
    this.rezultati = rezultati;
    this.sesiri = rangLista.sesiri;
    this.cetvrtfinaleDG = [];
    this.cetvrtfinaleEF = [];
  }
  nasumicnoIzaberiTimove(timovi) {
    const izabraniTimovi = [];
    while (izabraniTimovi.length < 2) {
      const index = Math.floor(Math.random() * timovi.length);
      const tim = timovi[index];
      if (!izabraniTimovi.includes(tim)) {
        izabraniTimovi.push(tim);
      }
    }
    return izabraniTimovi;
  }

  timoviIgrali(u, v) {
    return this.rezultati.rezultati.some(
      (r) => (r.tim1 === u && r.tim2 === v) || (r.tim1 === v && r.tim2 === u)
    );
  }
  formirajParove(sesir1, sesir2, cetvrtfinale) {
    const timovi1 = sesir1.timovi;
    const timovi2 = sesir2.timovi;

    while (cetvrtfinale.length < 2) {
      const [tim1, tim2] = this.nasumicnoIzaberiTimove(timovi1);
      const [tim3, tim4] = this.nasumicnoIzaberiTimove(timovi2);

      if (!this.timoviIgrali(tim1, tim2)) {
        cetvrtfinale.push([tim1, tim2]);
      }

      if (!this.timoviIgrali(tim3, tim4)) {
        cetvrtfinale.push([tim3, tim4]);
      }
    }
  }

  formirajCetvrtfinale() {
    this.formirajParove(
      this.sesiri["D"],
      this.sesiri["G"],
      this.cetvrtfinaleDG
    );
    this.formirajParove(
      this.sesiri["E"],
      this.sesiri["F"],
      this.cetvrtfinaleEF
    );
  }

  ispisiCetvrtfinale() {
    console.log("Četvrtfinale (D vs G):");
    this.cetvrtfinaleDG.forEach((par, index) => {
      console.log(`Par ${index + 1}: ${par[0].ime} vs ${par[1].ime}`);
    });

    console.log("Četvrtfinale (E vs F):");
    this.cetvrtfinaleEF.forEach((par, index) => {
      console.log(`Par ${index + 1}: ${par[0].ime} vs ${par[1].ime}`);
    });
  }

  spojiZaPolufinale() {
    const sviParovi = [];
    const paroviDG = [...this.cetvrtfinaleDG];
    const paroviEF = [...this.cetvrtfinaleEF];

    while (paroviDG.length > 0 && paroviEF.length > 0) {
      const par1 = paroviDG.splice(
        Math.floor(Math.random() * paroviDG.length),
        1
      )[0];
      const par2 = paroviEF.splice(
        Math.floor(Math.random() * paroviEF.length),
        1
      )[0];
      sviParovi.push([par1, par2]);
    }
    return sviParovi;
  }

  ispisiPolufinalneParove() {
    const polufinalniParovi = this.spojiZaPolufinale();

    console.log("Polufinalni parovi:");
    polufinalniParovi.forEach((par, index) => {
      console.log(`Polufinale ${index + 1}:`);
      console.log(`  Par 1: ${par[0][0].ime} vs ${par[0][1].ime}`);
      console.log(`  Par 2: ${par[1][0].ime} vs ${par[1][1].ime}`);
      console.log("");
    });
    return polufinalniParovi;
  }

  simulirajCetvrtfinale() {
    if (this.cetvrtfinaleDG.length === 0 || this.cetvrtfinaleEF.length === 0) {
      console.log("Nema parova za četvrtfinale DG ili EF.");
      return;
    }

    const paroviDG = [...this.cetvrtfinaleDG];
    const paroviEF = [...this.cetvrtfinaleEF];

    console.log("Simulacija četvrtfinalnih utakmica:");

    const pobedniciDG = [];
    paroviDG.forEach((par) => {
      const [tim1, tim2] = par;
      const { pobednik, poeni1, poeni2 } = utakmicaFn(tim1, tim2);
      console.log(`${tim1.ime} vs ${tim2.ime} (${poeni1}:${poeni2})`);
      pobedniciDG.push(pobednik);
    });

    const pobedniciEF = [];
    paroviEF.forEach((par) => {
      const [tim1, tim2] = par;
      const { pobednik, poeni1, poeni2 } = utakmicaFn(tim1, tim2);
      console.log(`${tim1.ime} vs ${tim2.ime} (${poeni1}:${poeni2})`);
      pobedniciEF.push(pobednik);
    });

    console.log("Pobednici četvrtfinala:");
    console.log("");
    console.log("DG Pobednici:", pobedniciDG.map((tim) => tim.ime).join(", "));
    console.log("");
    console.log("EF Pobednici:", pobedniciEF.map((tim) => tim.ime).join(", "));
    console.log("");
    return { pobedniciDG, pobedniciEF };
  }

  upisiPolufinalneParove(pobedniciDG, pobedniciEF) {
    const polufinalniParovi = [];
    if (pobedniciDG.length === 2 && pobedniciEF.length === 2) {
      polufinalniParovi.push([pobedniciDG[0], pobedniciEF[0]]);
      polufinalniParovi.push([pobedniciDG[1], pobedniciEF[1]]);
    } else {
      console.log("Nema dovoljno pobednika za kreiranje polufinalnih parova.");
    }
    return polufinalniParovi;
  }

  simulirajPolufinala() {
    const { pobedniciDG, pobedniciEF } = this.simulirajCetvrtfinale();

    const polufinalniParovi = this.upisiPolufinalneParove(
      pobedniciDG,
      pobedniciEF
    );

    console.log("Polufinalni parovi:");
    polufinalniParovi.forEach((par, index) => {
      console.log(`Polufinale ${index + 1}:`);
      console.log("");
      console.log(`  Par 1: ${par[0].ime} vs ${par[1].ime}`);
      console.log("");
    });

    const finalisti = [];
    const gubitniciPolufinala = [];

    polufinalniParovi.forEach((par) => {
      const [tim1, tim2] = par;
      const { pobednik, poeni1, poeni2 } = utakmicaFn(tim1, tim2);
      console.log(`${tim1.ime} vs ${tim2.ime} (${poeni1}:${poeni2})`);
      finalisti.push(pobednik);
      gubitniciPolufinala.push(tim1 === pobednik ? tim2 : tim1);
    });
    console.log("");
    console.log("Finalisti:");
    console.log("");
    console.log("Finalista 1:", finalisti[0].ime);
    console.log("");
    console.log("Finalista 2:", finalisti[1].ime);
    console.log("");
    console.log("Gubitnici polufinala (borba za 3. mesto):");
    console.log("");
    console.log("Gubitnik 1:", gubitniciPolufinala[0].ime);
    console.log("");
    console.log("Gubitnik 2:", gubitniciPolufinala[1].ime);
    console.log("");

    console.log("Simulacija finala:");
    const [finalista1, finalista2] = finalisti;
    const {
      pobednik: pobednikFinala,
      poeni1: poeniFinala1,
      poeni2: poeniFinala2,
    } = utakmicaFn(finalista1, finalista2);
    console.log(
      `${finalista1.ime} vs ${finalista2.ime} (${poeniFinala1}:${poeniFinala2})`
    );

    console.log("");

    console.log("Simulacija utakmice za 3. mesto:");
    const [gubitnik1, gubitnik2] = gubitniciPolufinala;
    const {
      pobednik: pobednik3Mesta,
      poeni1: poeni3Mesta1,
      poeni2: poeni3Mesta2,
    } = utakmicaFn(gubitnik1, gubitnik2);
    console.log(
      `${gubitnik1.ime} vs ${gubitnik2.ime} (${poeni3Mesta1}:${poeni3Mesta2})`
    );

    // Određivanje dobitnika medalja
    const srebro = pobednikFinala === finalista1 ? finalista2 : finalista1;
    console.log("");
    console.log("Medalje:");
    console.log("Zlato:", pobednikFinala.ime);
    console.log("Srebro:", srebro.ime);
    console.log("Bronza:", pobednik3Mesta.ime);
  }
}

function rankKoef(rank) {
  const maxRank = 34; // Maksimalan rank (najgora ekipa)
  const minKoeficijent = 0.95; // Najniži koeficijent (za najgore rangirane ekipe)
  const maxKoeficijent = 1.45; // Najviši koeficijent (za najbolje rangirane ekipe)

  return (
    maxKoeficijent -
    ((rank - 1) / (maxRank - 1)) * (maxKoeficijent - minKoeficijent)
  );
}

function utakmicaFn(tim1, tim2) {
  if (tim1.predaja) {
    console.log(`${tim1.ime} se predaje, ${tim2.ime} pobednik`);
    tim2.pobede += 1;
    tim1.porazi += 1;
    tim2.bodovi += 2;
    tim1.bodovi += 0;
  } else if (tim2.predaja) {
    console.log(`${tim2.ime} se predaje, ${tim1.ime} pobednik`);
    tim1.pobede += 1;
    tim2.porazi += 1;
    tim1.bodovi += 2;
    tim2.bodovi += 0;
  } else {
    let poeni1 = Math.floor(
      Math.random() * 21 + 60 * (tim1.forma + rankKoef(tim1.rank))
    );
    let poeni2 = Math.floor(
      Math.random() * 21 + 60 * (tim2.forma + rankKoef(tim2.rank))
    );
    let pobednik;

    tim1.poeniDati += poeni1;
    tim1.poeniPrimljeni += poeni2;
    tim2.poeniDati += poeni2;
    tim2.poeniPrimljeni += poeni1;

    if (poeni1 > poeni2) {
      pobednik = tim1;
      tim1.pobede += 1;
      tim2.porazi += 1;
      tim1.bodovi += 2;
      tim2.bodovi += 1;
      if (tim1.rank > tim2.rank) {
        tim1.forma += 0.025;
      } else {
        tim1.forma += 0.05;
      }
    } else if (poeni2 > poeni1) {
      pobednik = tim2;
      tim2.pobede += 1;
      tim1.porazi += 1;
      tim2.bodovi += 2;
      tim1.bodovi += 1;
      if (tim2.rank > tim1.rank) {
        tim2.forma += 0.025;
      } else {
        tim2.forma += 0.05;
      }
    } else {
      while (poeni1 === poeni2) {
        poeni1 += Math.floor(
          Math.random() * 11 + 5 * (tim1.forma + rankKoef(tim1.rank))
        );
        poeni2 += Math.floor(
          Math.random() * 11 + 5 * (tim2.forma + rankKoef(tim2.rank))
        );

        if (poeni1 > poeni2) {
          pobednik = tim1;
          tim1.pobede += 1;
          tim2.porazi += 1;
          tim1.bodovi += 2;
          tim2.bodovi += 1;
          if (tim1.rank > tim2.rank) {
            tim1.forma += 0.025;
          } else {
            tim1.forma += 0.05;
          }
        } else {
          pobednik = tim2;
          tim2.pobede += 1;
          tim1.porazi += 1;
          tim2.bodovi += 2;
          tim1.bodovi += 1;
          if (tim2.rank > tim1.rank) {
            tim2.forma += 0.025;
          } else {
            tim2.forma += 0.05;
          }
        }
      }
    }

    return { pobednik, poeni1, poeni2 };
  }
}
const timMapiranje = {
  GER: "GER", // Nemačka
  FRA: "FRA", // Francuska
  JPN: "JPN", // Japan
  USA: "USA", // Sjedinjene Države
  CAN: "CAN", // Kanada
  AUS: "AUS", // Australija
  SRB: "SRB", // Srbija
  PRI: "PRI", // Puerto Riko
  GRE: "GRE", // Grčka
  BRA: "BRA", // Brazil
  SSD: "SSD", // Južni Sudan
  ESP: "ESP", // Španija
};
// Create groups
const grupeTurnira = {
  A: [
    { Team: "Kanada", ISOCode: "CAN", FIBARanking: 7 },
    { Team: "Australija", ISOCode: "AUS", FIBARanking: 5 },
    { Team: "Grčka", ISOCode: "GRE", FIBARanking: 14 },
    { Team: "Španija", ISOCode: "ESP", FIBARanking: 2 },
  ],
  B: [
    { Team: "Nemačka", ISOCode: "GER", FIBARanking: 3 },
    { Team: "Francuska", ISOCode: "FRA", FIBARanking: 9 },
    { Team: "Brazil", ISOCode: "BRA", FIBARanking: 12 },
    { Team: "Japan", ISOCode: "JPN", FIBARanking: 26 },
  ],
  C: [
    { Team: "Sjedinjene Države", ISOCode: "USA", FIBARanking: 1 },
    { Team: "Srbija", ISOCode: "SRB", FIBARanking: 4 },
    { Team: "Južni Sudan", ISOCode: "SSD", FIBARanking: 34 },
    { Team: "Puerto Riko", ISOCode: "PRI", FIBARanking: 16 },
  ],
};

const grupe = Object.entries(grupeTurnira).map(([ime, timoviData]) => {
  const timovi = timoviData.map(
    (data) => new Tim(data.Team, data.ISOCode, data.FIBARanking)
  );
  return new Grupa(ime, timovi);
});

// Grupe
const [grupaA, grupaB, grupaC] = grupe;
const egzibicije = {
  GER: [
    {
      Date: "06/07/24",
      Opponent: "FRA",
      Result: "66-90",
    },
    {
      Date: "19/07/24",
      Opponent: "JPN",
      Result: "104-83",
    },
  ],
  FRA: [
    {
      Date: "12/07/24",
      Opponent: "SRB",
      Result: "67-79",
    },
    {
      Date: "19/07/24",
      Opponent: "CAN",
      Result: "73-85",
    },
  ],
  JPN: [
    {
      Date: "19/07/24",
      Opponent: "GER",
      Result: "83-104",
    },
    {
      Date: "21/07/24",
      Opponent: "SRB",
      Result: "100-119",
    },
  ],
  USA: [
    {
      Date: "20/07/24",
      Opponent: "SSD",
      Result: "101-100",
    },
    {
      Date: "22/07/24",
      Opponent: "GER",
      Result: "92-88",
    },
  ],
  CAN: [
    {
      Date: "11/07/24",
      Opponent: "USA",
      Result: "72-86",
    },
    {
      Date: "21/07/24",
      Opponent: "PRI",
      Result: "103-93",
    },
  ],
  AUS: [
    {
      Date: "15/07/24",
      Opponent: "USA",
      Result: "92-98",
    },
    {
      Date: "19/07/24",
      Opponent: "PRI",
      Result: "90-75",
    },
  ],
  SRB: [
    {
      Date: "21/07/24",
      Opponent: "JPN",
      Result: "119-100",
    },
    {
      Date: "22/07/24",
      Opponent: "GRE",
      Result: "94-72",
    },
  ],
  PRI: [
    {
      Date: "16/07/24",
      Opponent: "GRE",
      Result: "65-67",
    },
    {
      Date: "19/07/24",
      Opponent: "AUS",
      Result: "75-90",
    },
  ],
  GRE: [
    {
      Date: "16/07/24",
      Opponent: "PRI",
      Result: "67-65",
    },
    {
      Date: "22/07/24",
      Opponent: "SRB",
      Result: "72-94",
    },
  ],
  BRA: [
    {
      Date: "12/07/24",
      Opponent: "PRI",
      Result: "63-73",
    },
    {
      Date: "19/07/24",
      Opponent: "ESP",
      Result: "72-76",
    },
  ],
  SSD: [
    {
      Date: "15/07/24",
      Opponent: "BRA",
      Result: "72-81",
    },
    {
      Date: "20/07/24",
      Opponent: "USA",
      Result: "100-101",
    },
  ],
  ESP: [
    {
      Date: "19/07/24",
      Opponent: "BRA",
      Result: "76-72",
    },
    {
      Date: "23/07/24",
      Opponent: "PRI",
      Result: "107-84",
    },
  ],
};

const sviTimovi = {
  CAN: new Tim("Kanada", "CAN", 7),
  AUS: new Tim("Australija", "AUS", 5),
  GRE: new Tim("Grčka", "GRE", 14),
  ESP: new Tim("Španija", "ESP", 2),
  GER: new Tim("Nemačka", "GER", 3),
  FRA: new Tim("Francuska", "FRA", 9),
  BRA: new Tim("Brazil", "BRA", 12),
  JPN: new Tim("Japan", "JPN", 26),
  USA: new Tim("Sjedinjene Države", "USA", 1),
  SRB: new Tim("Srbija", "SRB", 4),
  SSD: new Tim("Južni Sudan", "SSD", 34),
  PRI: new Tim("Puerto Riko", "PRI", 16),
};

function azurirajFormu() {
  for (const [timIme, utakmice] of Object.entries(egzibicije)) {
    const isoCode = timMapiranje[timIme];
    const tim = sviTimovi[isoCode];

    utakmice.forEach((utakmica) => {
      const [poeniTim, poeniProtivnik] = utakmica.Result.split("-").map(Number);
      const protivnikCode = utakmica.Opponent;
      const protivnikISOCode = timMapiranje[protivnikCode];
      const protivnik = sviTimovi[protivnikISOCode];

      if (protivnik) {
        if (poeniTim > poeniProtivnik) {
          tim.forma += 0.125;
        } else if (poeniProtivnik > poeniTim) {
          tim.forma -= 0.125;
        } else {
          console.warn(
            `Protivnik ${protivnikCode} sa ISOCode ${protivnikISOCode} nije pronađen u sviTimovi`
          );
        }
      }
    });
  }

  [grupaA, grupaB, grupaC].forEach((grupa) => {
    grupa.timovi.forEach((tim) => {
      const timUFormi = sviTimovi[tim.ISOCode];
      if (timUFormi) {
        tim.forma = timUFormi.forma;
      }
    });
  });
}
azurirajFormu();

function ispisiFormuTimova(grupe) {
  grupe.forEach((grupa) => {
    console.log(`Grupa ${grupa.ime}:`);
    grupa.timovi.forEach((tim) => {
      console.log(`${tim.ime} : Forma = ${tim.forma}`);
    });
  });
}
ispisiFormuTimova([grupaA, grupaB, grupaC]);

for (let kolo = 1; kolo <= 3; kolo++) {
  grupaA.simulirajKolo(kolo);
  grupaB.simulirajKolo(kolo);
  grupaC.simulirajKolo(kolo);
}

[grupaA, grupaB, grupaC].forEach((grupa) => {
  grupa.punjenjeBodova();
  grupa.generisiFinalnuTabelu();
});
const rangLista = new RangLista();
[grupaA, grupaB, grupaC].forEach((grupa) => rangLista.dodajTimove(grupa));
rangLista.prikazi();
const nokaut = new Nokaut(rangLista);
nokaut.formirajCetvrtfinale();
nokaut.ispisiCetvrtfinale();
nokaut.ispisiPolufinalneParove();
nokaut.simulirajCetvrtfinale();
nokaut.simulirajPolufinala();
