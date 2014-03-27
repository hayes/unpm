Contributing
============

## Checklist:
- New code is covered by new tests and documentation. 
- Tests pass
- [jsl](https://www.npmjs.org/package/jsl) returns `checked n; OK` when run on
  every changed file.
- `package.json` contains all new dependencies you introduced.
- Your PR includes a description of your changes.

## So you want to contribute...

In the [issue tracker](https://github.com/hayes/unpm/issues?state=open),
enhancement requests and known bugs are listed according to the order in which
they were reported. If you want to work on one of these, please leave a comment
so that others do not duplicate your effort.

If you are uncertain how to proceed, feel free to comment on the issue with a
development plan you intend to follow. The maintainers will review it and
provide guidance as requested or required. If there is a new feature you would
like to see, open a new issue, and describe the feature in English. Providing a
sample API for the new feature is also very helpful. 

Before you start coding against &mu;npm, ask yourself if the feature could live
as a stand alone library or script. If it can, create new repository for the
project. When you are ready, publish it to npm. Then submit a PR which updates
&mu;npm's package.json to include the new dependency, and update the
appropriate modules.

## You've written code to address the issue...

All contributions should made via [pull
request](https://help.github.com/articles/using-pull-requests) and review.
After a pull request is made other contributors will offer feedback. They will
approve your changes by leaving a +1 or an emoji as a comment on the PR. Once
you have two +1s from two different maintainers, your changes will be merged.

If you've never made a PR before, you'll need to create a GitHub account, and
read up on GitHub's instructions on
[forking](https://help.github.com/articles/fork-a-repo) and [pull
requests](https://help.github.com/articles/using-pull-requests). Reading up on
the [git source control management system](http://git-scm.com/book) could also
be helpful.

Pull requests should be targeted at &mu;npm's `master` branch. Before pushing
to your GitHub repo and issuing the pull request, please run the full test
suite with the `npm test` command. It is your responsibility to fix any test
failures *before* asking for review. If you introduce code without tests, be
prepared to justify why it does not or cannot be tested. 

If you have modified the API, make sure to update the documentation
accordingly. Make a note of the API in the PR description so the maintainers
can update the [semantic version](http://semver.org/) appropriately. 

We expect your code to pass our style guide, handily encoded by the javascript
library, [jsl](https://www.npmjs.org/package/jsl). So before submitting your
PR, `npm install -g jsl`, and then run `jsl` on all the files you have changed.
If it exits with a non-zero status code, expect the maintainers to correct your
style.

We will also review the substance of your code. Our criteria are roughly as
follows:

- [Keep it simple](http://www.infoq.com/presentations/Simple-Made-Easy).
- [Avoid more abstraction than necessary](https://www.youtube.com/watch?v=_ahvzDzKdB0).
- Keep it documented.
- Keep it tested.
- Don't repeat yourself.
- Keep it small.

## Conduct

We operate under the Speak Up! project's [code of
conduct](http://speakup.io/coc.html).

## Communication

There is an IRC channel on irc.freenode.net called #unpm. You're welcome to
drop in and ask questions, discuss bugs and possible feature development, or
just hang out <3
