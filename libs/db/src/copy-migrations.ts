import * as path from 'path'
import fs from 'fs/promises';
import sortBy from 'lodash/sortBy';

const drizzleRoot = path.resolve(__dirname, '../drizzle');

/*
 * Drizzle generates migrations with random names (rather than prompting you for names or giving you way
 * to specify them programmatically), which makes it a pain to try to copy those into a docker image.
 * The idea here is to just read _all_ the migrations in and concatenate them into a single migration
 * file with a known name that can then be copied into the postgres image for initialization.
 */
(async () => {
  const files = (await fs.readdir(drizzleRoot, { withFileTypes: true }))
    .filter((desc) => desc.isFile());

  const contents = await Promise.all(
    sortBy(files, 'name').map((file) => fs.readFile(`${ drizzleRoot }/${ file.name }`, { encoding: 'utf8' }))
  )

  const finalSql = contents.join(';');

  await fs.writeFile(path.resolve(__dirname, '../scripts/run-migrations.sql'), finalSql, { encoding: 'utf8' });
})();
