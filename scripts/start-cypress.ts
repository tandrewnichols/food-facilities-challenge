(async () => {
  const { execa } = await import('execa');

  execa('npm', ['run', 'serve'], { stdio: 'inherit' })
    .catch((e) => console.log('Error:', e));

  await execa('./node_modules/.bin/wait-on', ['http://localhost:3000']);

  await execa('./node_modules/.bin/cypress', ['run'], { stdio: 'inherit' });

  process.exit();
})();
