--- load with 
--- sqlite3 database.db < schema.sql

-- DROP TABLE IF EXISTS appuser CASCADE;
-- DROP TABLE IF EXISTS scores CASCADE;


CREATE TABLE appuser (
	username varchar(20) primary key,
	password VARCHAR(20),
	numGamesPlayed INTEGER DEFAULT 0,
	email varchar(20),
	lastLogin DATE DEFAULT (DATETIME('now'))
);
insert into appuser(username, password,email) VALUES ('ww', 'ww', 'ww');
insert into appuser(username, password,email) VALUES ('wujiaxi5555', 'ww', 'ww');
-- insert into appuser values('ww', 'ww', 'ww');
-- insert into appuser values('wujiaxi5555', 'ww', 'ww');

create table scores (
	username varchar(20),
	score INTEGER DEFAULT 0,
	FOREIGN KEY (username) REFERENCES appuser (username) ON DELETE CASCADE,
	PRIMARY KEY(username,score)
	
);
insert into scores values('ww', 20);
insert into scores values('ww', 15);
insert into scores values('ww', 5);
insert into scores values('wujiaxi5555', 30);