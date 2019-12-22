
client.query(`
CREATE TABLE users(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
CREATE TABLE items(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
CREATE TABLE quests(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
CREATE TABLE npcs(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
CREATE TABLE monsters(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
CREATE TABLE locations(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
`).on("end", () => {
    client.query('INSERT INTO items(type, subtype, json) values($1, $2)', [data.text, data.complete]);
    client.end();
});