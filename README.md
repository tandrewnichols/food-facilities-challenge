# Food Facilities Challenge

### Considerations

1. npm packages - There are probably more than strictly necessary, but I scaffolded this from my common setup, so some common dependencies may be represented here even if they aren't used.
2. createGlobPatternsForDependencies - I'm disabling the nx utility createGlobPatternsForDependencies within my tailwind config because on hot reload it warns "The `content` option in your Tailwind CSS configuration is missing or empty." This is an error I've seen in other repos and for which there are existing issues on the nx repo. It's not a configuration problem, but a bug somewhere in their dependency graph logic.
3. auth - I'm bascially giving this no consideration since the requirements are unclear on the use case for this, but an ideal web app would have authentication - possibly through a 3rd party like Clerk or Auth0 - as well a robust role and permission model/RBAC to limit who can and cannot perform particular actions using the tool.
