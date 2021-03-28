Je code leesbaar houden is erg belangrijk. In het geval van open-source projecten is het namelijk handig als andere ook nog chocola kunnen maken van jouw geweldige code.

Voor die leesbaarheid is het handig om _regels_ op te stellen voor mezelf, zodat de code regelmatig, clean en zo duidelijk mogelijk is.

### Mijn coding standards:

* Duidelijke beschrijving van git commits, functies en variabelen.
```js
    function toggleFavorite() {
        const starUnfilled;
    }
```
* Variabelen in camelCase => fijn in leesbaarheid
```js
    const bodyParser = require('body-parser');
```

* Code laten inspringen met _tab_
```html
    <html>
        <body>
            <header>
            </header>

            <main>
            </main>

            <footer>
            </footer>
        </body>
    </html>
```

* Comments toevoegen ter verduidelijking 

```js
    //Database Setup
    let db = null;
    async function connectDB() {
        const options = { useUnifiedTopology: true };
        const client = new MongoClient(uri, options);
        await client.connect();
        db = client.db(dbName);
    }
```

---

### Bron:
https://github.com/ryanmcdermott/clean-code-javascript#formatting