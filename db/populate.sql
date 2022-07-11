USE zef;

INSERT INTO user (username, password, salt, role) VALUES ('admin', '5f7e11125e1547d217a2c11acecb0ce94ce9bdffb95fa7495eb2f040dbfbc0992d528c78bcbdb9c0c86699ed178b41ad223ea0a069be71503de9072504a1fdd2', '51ca4befb7cb5bd2', 'admin');
INSERT INTO user (username, password, salt, role) VALUES ('member1', '848fdcd00fcc259072d8f2e3807e88ca8b1da9a8d88e195b7af521a133d993e0a58b4f8f428a8b4d5d1a14caffd5a9144a7499b1f853683f492bdc367283e3a6', 'd4ac91aa2d6031ca09e25e6cbfa1c0fa', 'member');
INSERT INTO user (username, password, salt, role) VALUES ('member2', '848fdcd00fcc259072d8f2e3807e88ca8b1da9a8d88e195b7af521a133d993e0a58b4f8f428a8b4d5d1a14caffd5a9144a7499b1f853683f492bdc367283e3a6', 'd4ac91aa2d6031ca09e25e6cbfa1c0fa', 'member');
INSERT INTO user (username, password, salt, role) VALUES ('member3', '848fdcd00fcc259072d8f2e3807e88ca8b1da9a8d88e195b7af521a133d993e0a58b4f8f428a8b4d5d1a14caffd5a9144a7499b1f853683f492bdc367283e3a6', 'd4ac91aa2d6031ca09e25e6cbfa1c0fa', 'member');

INSERT INTO member (name, email, zkn_balance, user_id) VALUES ('Member One', 'memb1@test.com', 7, 2);
INSERT INTO member (name, email, zkn_balance, user_id) VALUES ('Member Two', 'memb2@test.com', 100000, 3);
INSERT INTO member (name, email, zkn_balance, user_id) VALUES ('Member Three', 'memb3@test.com', 70000, 4);

INSERT INTO project (name, currency, exchange_rate, owner_id, supply, cap) VALUES ('Cinamon Coin', 'CIN', 7, 1, 600, 700);
INSERT INTO project (name, currency, exchange_rate, owner_id, supply, cap) VALUES ('Mint Coin', 'MINT', 14, 2, 13000, 14000);

INSERT INTO currency (name, kuna_ratio) VALUES ('USD', 7);
INSERT INTO currency (name, kuna_ratio) VALUES ('KUNA', 1);

INSERT INTO investment (member_id, project_id, amount) VALUES (3, 1, 100);
INSERT INTO investment (member_id, project_id, amount) VALUES (3, 2, 1000);