CREATE TYPE tetromino AS ENUM (
  'straight',
  'square',
  'skew',
  'T_shaped',
  'L_shaped'
);

CREATE TYPE colour AS ENUM (
  'red',
  'yellow',
  'purple',
  'cyan',
  'green'
);

CREATE TABLE tetrominoes (
  id uuid PRIMARY KEY,
  shape tetromino NOT NULL,
  colour colour NOT NULL,
  angle integer
);

ALTER TABLE tetrominoes ENABLE ELECTRIC;
