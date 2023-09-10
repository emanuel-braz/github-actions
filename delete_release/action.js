require('child_process')
    .execSync(
        'npm install @actions/core @actions/github conventional-changelog-cli mime',
        { cwd: __dirname }
    );

const core = require('@actions/core');
const github = require('@actions/github');
const {Logger} = require('../utils/logger.js');

(async () => {

    const api = github.getOctokit(core.getInput('token'));
    const tag = core.getInput('tag');
    const verbose = core.getInput('verbose') == 'true';
    const useLatestPreRelease = core.getInput('use_latest_pre_release') == 'true';
    const useLatestPublishedRelease = core.getInput('use_latest_published_release') == 'true';
    const useLatestDraft = core.getInput('use_latest_draft') == 'true';

    const logger = new Logger(verbose, core);

    try {
        
        let release = null;

        try {

            var paramCounter = 0;
            if (tag) paramCounter++;
            if (useLatestPreRelease) paramCounter++;
            if (useLatestPublishedRelease) paramCounter++;
            if (useLatestDraft) paramCounter++;
            if (paramCounter == 0) throw new Error('No param specified.');
            if (paramCounter > 1) throw new Error('Many params specified. Please specify only one param.');

            if (tag) {
                logger.log(`Getting release by tag [${tag}] ...`);

                result = await api.repos.getReleaseByTag({
                    ...github.context.repo,
                    tag: tag
                });

                release = result.data;
                if (!release) throw new Error('Release not found.');

                logger.log('Deleting release...');
                await api.repos.deleteRelease({
                    ...github.context.repo,
                    release_id: release.id
                });

            } else if (useLatestPreRelease) {

                var releases = await api.repos.listReleases({
                    ...github.context.repo
                });

                const preReleases = releases.data.filter(release => release.prerelease);
                const latestPreRelease = preReleases[0];

                release = latestPreRelease;
                if (!release) throw new Error('Release not found.');

                logger.log('Deleting release...');
                await api.repos.deleteRelease({
                    ...github.context.repo,
                    release_id: release.id
                });

            } else if (useLatestPublishedRelease) {

                var releases = await api.repos.listReleases({
                    ...github.context.repo
                });

                const latestReleases = releases.data.filter(release => release.prerelease == false && release.draft == false);
                const latestRelease = latestReleases[0];

                release = latestRelease;
                if (!release) throw new Error('Release not found.');

                logger.log('Deleting release...');
                await api.repos.deleteRelease({
                    ...github.context.repo,
                    release_id: release.id
                });

            } else if (useLatestDraft) {
                var releases = await api.repos.listReleases({
                    ...github.context.repo
                });

                const latestDrafts = releases.data.filter(release => release.draft);
                const latestDraft = latestDrafts[0];

                release = latestDraft;
                if (!release) throw new Error('Release not found.');

                logger.log('Deleting release...');
                await api.repos.deleteRelease({
                    ...github.context.repo,
                    release_id: release.id
                });
            
            } else {
                throw new Error('No tag or latest release/pre-release/draft specified.');
            }

        } catch (error) {
            if (error.name != 'HttpError' || error.status != 404) {
                throw error;
            }

            logger.log('Release does not exists.');
            core.setFailed('Release does not exists.');
        }

        core.info('Done!')

    } catch (error) {
        logger.log(error);
        core.error(error);
        core.setFailed(error.message);
    }
})();