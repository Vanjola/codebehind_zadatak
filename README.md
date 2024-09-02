# Projekat Simulacije Utakmica

Ovaj projekat simulira rezultate utakmica između sportskih timova korišćenjem sledeće formule:

### Simulacija Utakmica

Za simulaciju utakmica, koristi se sledeća formula:

1. **Početni Poeni:** Svaka ekipa dobija početni broj poena nasumično izabran iz raspona 60-80.
2. **Rank Koeficijent:** Početni poeni se množe sa koeficijentom koji zavisi od ranga ekipe na FIBA rang listi. Ekipe sa boljim rangom imaju viši koeficijent, što odražava njihov očekivani kvalitet.

3. **Forma:** Na dobijeni rezultat dodaje se vrednost forme. Forma se ažurira nakon svake utakmice:

   - Za prijateljske mečeve pre turnira, forma se menja za ±0.0125 po pobedi ili porazu.
   - Tokom turnira, forma se menja za ±0.5 ako ekipa pobedi bolju ekipu na FIBA rang listi, ili ±0.25 ako pobedi slabiju ekipu.

     Na pravom olimpijskom turniru su ekipe davale priblizno 170p po utakmici tako da smo ovako uracunali nasumicno kakav im je suterski dan ali se to poveca ili smanji u odnosu na kvalitet ekipe

     Ova formula omogućava dinamičku simulaciju rezultata koja uzima u obzir trenutnu formu ekipa, kao i njihov rang na globalnoj FIBA rang listi.
