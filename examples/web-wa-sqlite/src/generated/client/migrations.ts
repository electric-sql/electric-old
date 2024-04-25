export default [
  {
    "statements": [
      "CREATE TABLE \"tetrominoes\" (\n  \"id\" TEXT NOT NULL,\n  \"shape\" TEXT NOT NULL,\n  \"colour\" TEXT NOT NULL,\n  \"angle\" INTEGER,\n  CONSTRAINT \"tetrominoes_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "INSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.tetrominoes', 1);",
      "DROP TRIGGER IF EXISTS update_ensure_main_tetrominoes_primarykey;",
      "CREATE TRIGGER update_ensure_main_tetrominoes_primarykey\n  BEFORE UPDATE ON \"main\".\"tetrominoes\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "DROP TRIGGER IF EXISTS insert_main_tetrominoes_into_oplog;",
      "CREATE TRIGGER insert_main_tetrominoes_into_oplog\n   AFTER INSERT ON \"main\".\"tetrominoes\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.tetrominoes')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'tetrominoes', 'INSERT', json_object('id', new.\"id\"), json_object('angle', new.\"angle\", 'colour', new.\"colour\", 'id', new.\"id\", 'shape', new.\"shape\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_tetrominoes_into_oplog;",
      "CREATE TRIGGER update_main_tetrominoes_into_oplog\n   AFTER UPDATE ON \"main\".\"tetrominoes\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.tetrominoes')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'tetrominoes', 'UPDATE', json_object('id', new.\"id\"), json_object('angle', new.\"angle\", 'colour', new.\"colour\", 'id', new.\"id\", 'shape', new.\"shape\"), json_object('angle', old.\"angle\", 'colour', old.\"colour\", 'id', old.\"id\", 'shape', old.\"shape\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_tetrominoes_into_oplog;",
      "CREATE TRIGGER delete_main_tetrominoes_into_oplog\n   AFTER DELETE ON \"main\".\"tetrominoes\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.tetrominoes')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'tetrominoes', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('angle', old.\"angle\", 'colour', old.\"colour\", 'id', old.\"id\", 'shape', old.\"shape\"), NULL);\nEND;"
    ],
    "version": "1"
  }
]