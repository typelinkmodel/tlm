Type Link Model (TLM) Monorepo

https://type.link.model.tools/

Use
```bash
    bash script/bootstrap.sh
    bash script/setup.sh
    bash script/server.sh
    bash script/test.sh
```

Follow
> https://conventionalcommits.org/

with types:
* build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
* docs: Documentation only changes
* feat: A new feature
* fix: A bug fix
* perf: A code change that improves performance
* refactor: A code change that neither fixes a bug nor adds a feature
* revert: undoing (an)other commit(s)
* style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* test: Adding missing tests or correcting existing tests
* improvement: Improves code in some other way (that is not a feat or fix)
* chore: Changes that take care of some other kind of chore that doesn't impact the main code
(based on angular conventions https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)

See docs/.
