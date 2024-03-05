# Food Facilities Challenge

## Problem, solution, and reasoning

The food facilities challenge is a pretty straight forward "search and show results" problem, although searching by geolocation complicates it a bit. There are more sophisticated solutions probably than `ILIKE` and, given the geolocation requirement, in a real situation, I'd probably recommend OpenSearch for this because it supports geoboxing and has the "search-as-you-type" type for better (and indexed) ngram matching, but for the number of data points were working with (and especially not knowing any context of how the tool might be used), I opted to keep it simple. A postgres `ILIKE` query is more than sufficiently performant, even without proper indexing. If this were, for example, an admin tool used internal by food truck inspectors, where the expected load is never very high, I'd probably be tempted to leave it like that, in the spirit of not over-architecting.

The UI was an interesting aspect of the challenge as well because it's a very _data-heavy_ visualization. There are lot of fields, a lot of (presumably) various identifiers, and no information was given about the relationships between the fields. Google searching for "cnn" proved singular unhelpful, but I _am_ now, at least, caught up on the latest news. I don't think the result display is _amazing_; I'm sure a designer could probably improve it significantly, but I was largely just guessing at what fields might be relevant and trying not to clutter the interface by putting _everything_ on there. Again, for an internal tool, this would probably suffice. For a customer facing search portal, it needs a bit more organization and structure and most notably, interactivity.

Technically, the biggest challenge for me was docker, for two reasons: first, docker is not my strongest area, but more importantly, some of the tools I chose just do not get along with docker - nx/next and drizzle, but more on this shortly. Here's why I chose each piece of the stack that I chose:

**Frontend**
- React/next - my most comfortable frontend framework for sure, but it also resonates with me for being functional (so much noise in angular classes) and for allowing separation of concerns along domain lines, rather than technological lines. That is, vue and angular force you to separate out html and javascript into separate files - and I'm well aware that are lots of people that _prefer_ that kind of separation - but personally, I like knowing that everything for "feature X" is (or can be) in the same file. I don't need to look at two different files to get a complete picture, which incidentally is a development/organizational theme for me. I _highly_ emphasize readability in my code, specifically in making units small enough to fit on the screen at one time (but don't hold me to this too tightly, react components can grow very quickly).
- Tailwind - I _love_ tailwind. I find it very easy to use and the most enjoyable experience you can have doing css in a frontend framework. I didn't put _a ton_ of emphasis on "clean css" in this project, and I know one of the major complaints people have with tailwind is that there are _lots and lots_ of classes cluttering the interface, which can make it hard to read. I don't personally find a lot of weight in that claim, since syntax highlighting easily separates out strings from other data types, but there are also ways to reduce that noise. The main one that I would normally try to adhere to more strictly is the separation of presentational components from logical ones (the concept of smart and dumb components). I did keep the components in libs/components _mostly_ presentational, but I think in a real situation, I would've made a lot _more_ presentational components to abstract common stylings into reusable pieces and clean up the dom tree a bit.
- Typescript - I have a _meh_ relationship with typescript. It's not that I don't understand the value it can bring developers, it's just that I personally _really like_ javascript - specifically some of the dynamic things you can do that typescript makes much more difficult. And anecdotally, I find it annoying to have to convince typescript that something that I already know works fine does in fact work fine. But I also wanted to demonstrate that I'm capable and comfortable working typescript.
- nx - Not exactly a frontend thing per se, and I have no _strong_ allegiance to nx, but I do use it in my current job and have gotten used to it. I used to strongly dislike monorepos, but they've grown on me. I don't know that nx is the long-term answer (I hope it's not actually), but it's _decent_. I wish it was a bit simpler and easier to customize. But I mostly chose it so that I could demonstrate organizational principles: keeping reusable things in separate libs, putting like things together, separating concerns, but still sharing common code across frontend and backend. However, nx combined with next combined with docker was the single biggest source of pain for this project. To run next in a docker container, you have to generate it as a "standalone" server, but when combined with nx (and specifically it's "rootDir" property), the generated output has extra layers to it. Normally, building a next project, would create `.next/standalone/server.js`, but with nx, it becomes `.next/standalone/apps/frontend/server.js`. Additionally, you can tell nx to output to `./dist/` . . . and it does . . . but the build there, it seems, cannot be coerced to play nicely with docker. I ultimately ended up discovering it was _also_ building to `apps/frontend/.next` and that build worked. But building next as a standalone server requires manual copying of static assets to appropriate places (combined with nx making those appropriate places more convoluted). I think the RadAI favicon _still_ isn't loading when running with docker because the `public` folder isn't copied to the right place. *Heavy sigh*

**Backend**
- Express - Express is my goto routing framework. I know it's not the fastest, but it's _so easy to use_. I used fastify for a while at another job and while it is theoretically faster in some scenarios, I just find it abstracts the wrong things and in general makes it harder to reason about routing organization and the order in which pieces of code will execute. Of course, you can write bad code with any language or framework, but I do find that most of the standard express patterns are _very easy_ to understand at a glance.
- Postgres - I don't know why I love postgres so much, given that some other sql flavors are not that dissimilar, but given the choice, I will always choose postgres. It also made sense for this challenge because of the geolocation requirement which I knew could be done in postgres. Again, I did consider OpenSearch and would probably use that in a production setting (depending on the use case for the tool, the expected load, etc).
- Drizzle - Now we come to the first really interesting one because this was the most significant piece that I chose something _new_ for. That's primarily because I don't have a preferred ORM for node. I've used prisma and typeorm (in addition to no-sql flavors like mongoose), and they always leave me feeling underwhelmed. I think I feel about ORMs about the same way I feel about typescript. I know why people choose them; I just don't personally find those reasons compelling. Most of the time, I'd rather just write SQL directly, but the big trade off there is mess. It's easy for a very dynamic query to become unreadable very quickly. On a strong team with a lot of discipline, I think it can still work. Anyway, I was pretty equally underwhelmed with drizzle (which I've heard a lot of good things about) as I have been with other ORMs. It's got some nice flexiblity, and I prefer the builder functions (`like`, `ilike`, `and`, etc.) over the deeply nested object patterns that prisma uses. But it still didn't really solve the problem of expressing a dynamic query _simply_. That was the main reason I decided to break the search into multiple endpoints. I could have done it in one (I actually had working with the first two scenarios in tandem), but it was already _very complex_, so I decided to split it up for simplicity and readability. I'd rather be known as someone who writes really readable code than someone who writes really _smart_ or _clever_ code. I do think drizzle has potential. With some additional abstractions, I think it's workable (certainly no _less_ workable than prisma). The big problem was integrating it into docker. That's not really a drizzle-specific problem, I guess - lots of sql migrators would have that issue - but prepopulating the docker postgres image with the data set was a nuisance.
- Typescript - It only makes sense to use it on both backend and frontend if you're going to use it all.
- Zod - I only recently started using zod, but I already like it better than yup. I think it's more expressive and easier to read (maybe just some of the functions are named better).

## Critiques and considerations

1. **Npm packages** - There are probably more than strictly necessary, but I scaffolded this from my common setup, so some common dependencies may be represented here even if they aren't used.
2. **createGlobPatternsForDependencies** - I disabled the nx utility createGlobPatternsForDependencies within my tailwind config because on hot reload it warns "The `content` option in your Tailwind CSS configuration is missing or empty." This is an error I've seen in other repos and for which there are existing issues on the nx repo. It's not a configuration problem, but a bug somewhere in their dependency graph logic and the easy workaround is just not to use it.
3. **Auth** - I bascially gave this no consideration (except an inert "Sign In" button with no action behind it) since the requirements are unclear on the use case for this, but an ideal web app would have authentication - possibly through a 3rd party like Clerk or Auth0 - as well a robust role and permission model/RBAC to limit who can and cannot perform particular actions using the tool.
4. **Data normalization** - I'd normally normalize the data structure more (e.g. blocklot vs block + lot, latitdue + longitude vs location, etc.), but as the data structures already existed, I basically mapped them one to one. 
8. **Barrelling** - Nx loves barrelling. I get the appeal of it, but _in practice_, I've just seen more negatives than positives. When you import something with barrelling, you just _can't_ easily know what else you're now bundling with your application. For example, I've got backend and frontend stuff in one monorepo, and if I wasn't careful with barrelling, I could easily end up pulling database stuff into the frontend. It also bloats package sizes and tree shaking is not as straight-forward as people tend to think.
9. **Pagination** - I would _definitely_ add pagination to the search endpoint . . . I even started out with it in there (half baked), but as basically any search will return less than 100 records anyway, I simplified for time sake.
10. **Migrations** - I placed my emphasis on ease of setup here, so I generated the sql migration locally and just copied it into the sql scripts that get copied into the postgres docker image. Running migrations in a reasonable way is (IME) a devops headache in general, and it didn't seem worth the effort in this kind of isolated environment. It would be better to do that through _other infrastructure_ (e.g. ci/cd pipelines or kubernetes or whatever) rather than as part of the image build. But I am definitely not setting all that up for this project.
11. **Swagger** - I actually really wanted to implement this, but when docker took significantly longer than expected, I punted on it.


## Running stuff

Obviously, start by cloning the repo and installing dependencies with `npm install` (you'll also need `node` if you don't have it).

1. If you have a postgres server already (e.g. from homebrew or apt-get), you can run and use that directly. You'll need a `.env` (gitignored) in this shape:

```
IS_LOCAL=true
LOG_LEVEL=error | warn | info | debug
NEXT_PUBLIC_API_ENDPOINT=http://localhost:4000/api
EXPOSE_DEBUG_INFO=true
API_PORT=4000
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=radai
DB_PORT=5432
DB_HOST=localhost
```

With that in place, run the following steps:

```sh
brew services start postgres@14 # or similar

npm install -g nx # Not strictly necessary, but simplifies a lot (you can use `npx nx` instead of `nx` though)

nx initialize db # to create database and extensions

nx migrations db # to generate migrations from the schema files (sidebar: I would love to have called with `just nx migrate db` but nx has it's own "migrate" command)

nx seed db # to insert the data set into the database

npm run serve # to start the backend and frontend
```

The frontend is available on port 3000 (although next chooses dynamically so if you have something running on 3000, it will pick 3001, etc). The backend starts on port 4000 (unless you set it to something different in .env).

2. You can also run evreything with docker by running `npm run docker` (assuming postgres is _not_ running separately on your computer). The ports are the same.

3. You can run tests with `npm test`, linting with `npm run lint`, or both with `npm run ci`.

4. There are a number of different ways to run cypress tests. Besides `npx cypress open`, you can also 1) do `npm run e2e`, which will start up the backend and frontend and then run cypress tests headless, 2) do `npx cypress run` if you've already got the two servers running, or 3) run `nx e2e frontend` which uses a custom script to start the relevant tools. The con of 1 and 2 is you have to manually stop the node servers, which make them inappropriate for use in ci environments (_maybe_ . . . although many will kill lingering processes anyway). 3 will cleanly exit on its own, but the con is that the output from cypress is crazy. Something they're doing in the way they output stuff does not agree with the inherit option of `stdio` in child processes.
