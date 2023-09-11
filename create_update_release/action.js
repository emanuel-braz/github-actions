require('child_process')
    .execSync(
        'npm install @actions/core @actions/github conventional-changelog-cli mime',
        { cwd: __dirname }
    );

const core = require('@actions/core');
const github = require('@actions/github');
const Logger = require('../utils/logger.js');

(async () => {
    
    const api = github.getOctokit(core.getInput('token'));
    const tag = core.getInput('tag');
    const name = core.getInput('name');
    const body = core.getInput('body');
    const verbose = core.getInput('verbose') == 'true';
    const forceUpdatePublishedRelease = core.getInput('force_update_published_release') == 'true';
    const draft = core.getInput('draft') == 'true';
    const preRelease = core.getInput('pre_release') == 'true';
    const generateReleaseNotes = core.getInput('generate_release_notes') == 'true';
    const target = core.getInput('target');
    const useLatestPreRelease = core.getInput('use_latest_pre_release') == 'true';

    const logger = new Logger(verbose, core);

    try {

        let release = null;

        try {

            if (useLatestPreRelease) {

                var releases = await api.repos.listReleases({
                    ...github.context.repo
                });

                const preReleases = releases.data.filter(release => release.prerelease);
                const latestPreRelease = preReleases[0];
        
                release = latestPreRelease;
            } else {
                result = await api.repos.getReleaseByTag({
                    ...github.context.repo,
                    tag: tag
                });
    
                release = result.data;
            }
            
            if (release) {
                logger.log('Release already exists.', release);

                const isDraft = release.draft;
                const isPrerelease = release.prerelease;
                
                if (isDraft || isPrerelease) {
                    logger.log('The existing release with same tag will be updated.');
                } else {
                    if (forceUpdatePublishedRelease) {
                        logger.log('The existing release with same tag is published. We will update it.');
                    } else {
                        core.error('The existing release with same tag was released. We cannot update it.\n');
                        core.setFailed('If you want to update the release, please set force_update_published_release to true.');
                        return;
                    }
                }
            }

            
        } catch (error) {
            if (error.name != 'HttpError' || error.status != 404) {
                throw error;
            }

            logger.log('Release does not exists.');
        }

        // Define the options, these are almost same when creating new and updating existing.
        var releaseOptions = {
            ...github.context.repo,
            tag_name: tag,
            prerelease: preRelease,
            draft: draft,
            generate_release_notes: generateReleaseNotes
        };

        if (name != '') {
            releaseOptions.name = name;
        }

        if (body != '') {
            releaseOptions.body = body;
        }

        if (target != '') {
            releaseOptions.target_commitish = target;
        }

        // Create or update release
        if (release) {
            releaseOptions.release_id = release.id; // Must be part of the parameters.

            core.info(`Updating release for tag "${tag}".`);

            const result = await api.repos.updateRelease(releaseOptions);
            release = result.data; 
            isCreated = false;

        } else {
            core.info(`Creating release for tag "${tag}".`);

            const result = await api.repos.createRelease(releaseOptions);
            release = result.data;
            isCreated = true;
        }

        core.info('Done!')

    } catch (error) {
        logger.log(error);
        core.error(error);
        core.setFailed(error.message);
    }
})();