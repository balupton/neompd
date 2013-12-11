# DocPad Configuration File
# http://docpad.org/docs/config

# Define the DocPad Configuration
docpadConfig = {
    # ...

    databaseCache: true

    templateData:
        site:
            styles: [
                "/styles/main.css"
            ]

            scripts: [
                "/scripts/main.js"
            ]

    collections:
        data: ->
            @getCollection("html").findAllLive({
                relativeOutDirPath: $in: ['people','posts']
                unlisted: $ne: true
            }).setComparator((a, b) ->
                if a.get('priority')
                    (if b.get('priority') then b.get('priority') - a.get('priority') else -1)
                else if b.get('priority')
                    1
                else
                    b.get('date').getTime() - a.get('date').getTime()
            )

        people: ->
            @getCollection('data').findAllLive(
                relativeOutDirPath: 'people'
            )

        posts: ->
            @getCollection('data').findAllLive(
                relativeOutDirPath: 'posts'
            )

        tags: ->
            @getCollection("documents").findAllLive(
                relativeOutDirPath: 'tags'
            )

    skipUnsupportedPlugins: false

    enabledPlugins:
        eco: true
        marked: true
        less: true
        sunny: true
        grunt: true

    plugins:
        eco: {}
        less: {}
        marked: {}
        sunny:
            cloudConfigs: [
                acl: "public-read"
                container: process.env.DOCPAD_SUNNY_CONTAINER
                sunny:
                    provider: "aws"
                    retryLimit: -1
                    authUrl: "s3-#{process.env.DOCPAD_SUNNY_CONTAINER_REGION}.amazonaws.com"
                    account: process.env.DOCPAD_SUNNY_ACCOUNT
                    secretKey: process.env.DOCPAD_SUNNY_SECRETKEY
            ]

    environments:
        development:
            plugins:
                grunt:
                    # Run the production environment Grunt tasks.
                    writeAfter: false
                    populateCollectionsBefore: ["development"]
        production:
            plugins:
                grunt:
                    # Run the production environment Grunt tasks.
                    writeAfter: false
                    populateCollectionsBefore: ["production"]
}
# Export the DocPad Configuration
module.exports = docpadConfig
